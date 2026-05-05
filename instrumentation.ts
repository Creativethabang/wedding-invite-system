export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dns = require("dns") as typeof import("dns");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require("https") as typeof import("https");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const http = require("http") as typeof import("http");

  // Custom lookup: use dns.resolve4 to bypass macOS getaddrinfo search-domain
  // timeouts (the artifact.local search domain causes 5-30s mDNS hangs before
  // falling through to real DNS). Handles both all:true and single-address
  // callback forms that Node.js agents use.
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
        // Resolve4 failed — pass error so the request fails fast
        (cb as (e: unknown) => void)(
          err ?? new Error("No IPv4 addresses for " + hostname)
        );
        return;
      }
      if ((opts as { all?: boolean })?.all) {
        // all:true — caller expects [{address, family}]
        (
          cb as (
            e: null,
            a: Array<{ address: string; family: 4 }>
          ) => void
        )(null, addrs.map((a) => ({ address: a, family: 4 as const })));
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
