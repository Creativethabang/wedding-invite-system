export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dns = require("dns") as typeof import("dns");

  // Detect broken getaddrinfo: on this machine, the artifact.local search
  // domain causes mDNSResponder to block for 5-30s before falling through to
  // real DNS. If a lookup hasn't resolved in 1 second, we apply the patch.
  const dnsIsBroken = await new Promise<boolean>((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(true); // took longer than 1s — DNS is broken
      }
    }, 1000);

    dns.lookup("github.com", { family: 4 }, (err: unknown) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(!!err);
      }
    });
  });

  if (!dnsIsBroken) return; // Vercel and other healthy environments exit here

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require("https") as typeof import("https");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const http = require("http") as typeof import("http");

  // Use dns.resolve4 for all lookups: bypasses getaddrinfo / mDNS entirely.
  // Handles both single-address (default) and all-address (all:true) forms.
  const customLookup = (
    hostname: string,
    opts: { all?: boolean } | unknown,
    cb: (
      err: NodeJS.ErrnoException | null,
      addr: string | Array<{ address: string; family: 4 }>,
      family?: 4
    ) => void
  ) => {
    dns.resolve4(hostname, (err, addrs) => {
      if (err || !addrs?.length) {
        (cb as (e: NodeJS.ErrnoException) => void)(
          err ?? Object.assign(new Error("No IPv4 for " + hostname), { code: "ENOTFOUND" })
        );
        return;
      }
      if ((opts as { all?: boolean })?.all) {
        (cb as (e: null, a: Array<{ address: string; family: 4 }>) => void)(
          null,
          addrs.map((a) => ({ address: a, family: 4 as const }))
        );
      } else {
        (cb as (e: null, a: string, f: 4) => void)(null, addrs[0], 4);
      }
    });
  };

  const httpsAgent = new https.Agent({ lookup: customLookup as any });
  const httpAgent = new http.Agent({ lookup: customLookup as any });

  const origFetch = globalThis.fetch;

  globalThis.fetch = async function fastFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    try {
      const urlStr =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.href
          : (input as Request).url;

      const url = new URL(urlStr);
      const isLocal =
        url.hostname === "localhost" ||
        url.hostname.startsWith("127.") ||
        url.hostname === "::1" ||
        url.hostname.endsWith(".local");

      if (isLocal) return origFetch(input, init);

      // Collect headers
      const headers: Record<string, string> = {};
      const srcHeaders =
        init?.headers ?? (input instanceof Request ? input.headers : null);
      if (srcHeaders instanceof Headers) {
        srcHeaders.forEach((v, k) => {
          headers[k] = v;
        });
      } else if (srcHeaders && typeof srcHeaders === "object") {
        for (const [k, v] of Object.entries(
          srcHeaders as Record<string, string>
        )) {
          headers[k] = v;
        }
      }

      // Collect body
      let bodyBuf: Buffer | undefined;
      const srcBody =
        init?.body ?? (input instanceof Request ? await input.text() : null);
      if (srcBody != null) {
        if (typeof srcBody === "string") {
          bodyBuf = Buffer.from(srcBody, "utf8");
        } else if (srcBody instanceof ArrayBuffer) {
          bodyBuf = Buffer.from(srcBody);
        } else if (ArrayBuffer.isView(srcBody)) {
          bodyBuf = Buffer.from(
            srcBody.buffer,
            srcBody.byteOffset,
            srcBody.byteLength
          );
        }
      }

      const isHttps = url.protocol === "https:";
      const mod = isHttps ? https : http;
      const port = url.port ? parseInt(url.port) : isHttps ? 443 : 80;
      const method = (
        init?.method ??
        (input instanceof Request ? (input as Request).method : "GET")
      ).toUpperCase();

      const { status, statusText, resHeaders, body } = await new Promise<{
        status: number;
        statusText: string;
        resHeaders: Record<string, string>;
        body: Buffer;
      }>((resolve, reject) => {
        const req = mod.request(
          {
            hostname: url.hostname,
            port,
            path: url.pathname + url.search,
            method,
            headers,
            agent: isHttps ? httpsAgent : httpAgent,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (c: Buffer) => chunks.push(c));
            res.on("end", () => {
              const resHeaders: Record<string, string> = {};
              for (const [k, v] of Object.entries(res.headers)) {
                if (v != null)
                  resHeaders[k] = Array.isArray(v) ? v.join(", ") : v;
              }
              resolve({
                status: res.statusCode ?? 200,
                statusText: res.statusMessage ?? "",
                resHeaders,
                body: Buffer.concat(chunks),
              });
            });
            res.on("error", reject);
          }
        );
        req.on("error", reject);
        if (bodyBuf) req.write(bodyBuf);
        req.end();
      });

      return new Response(body, {
        status,
        statusText,
        headers: resHeaders,
      });
    } catch {
      return origFetch(input, init);
    }
  };
}
