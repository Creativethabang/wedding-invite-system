"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type Client = {
  venueName?: string;
  venueLocation?: string;
  venueAddress?: string[];
  venueMapUrl?: string;
};

export default function Venue({ client }: any) {
  const safeClient: Client = client ?? {};

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#fcf9f4] px-6 pt-0 pb-14">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Text block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold/60">
            The Venue
          </p>

          <h2 className="mt-4 font-script text-5xl text-[#2c1a0e] md:text-6xl">
            {safeClient.venueName || "The Saxon Hotel"}
          </h2>

          <p className="mt-2 font-serif text-xl font-light text-[#2c1a0e]/50">
            {safeClient.venueLocation || "Sandhurst, Johannesburg"}
          </p>

          <div className="my-6 h-px w-12 bg-gold/40" />

          <address className="not-italic">
            {(safeClient.venueAddress || [
              "36 Saxon Road, Sandhurst",
              "Johannesburg, 2196",
              "South Africa",
            ]).map((line, i) => (
              <p
                key={i}
                className="font-sans text-sm leading-loose text-[#2c1a0e]/60"
              >
                {line}
              </p>
            ))}
          </address>

          <a
            href={
              safeClient.venueMapUrl ||
              "https://maps.app.goo.gl/wy6gsbmtJAFRFPAX8"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block border-b border-gold/40 pb-1 font-sans text-xs uppercase tracking-[0.35em] text-gold/80 transition-colors duration-500 hover:text-gold"
          >
            Get Directions →
          </a>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut", delay: 0.25 }}
          className="relative mt-10 w-full overflow-hidden border border-gold/20"
          style={{ aspectRatio: "16/9" }}
        >
          <div className="absolute left-0 top-0 z-10 h-5 w-5 border-l border-t border-gold/40" />
          <div className="absolute bottom-0 right-0 z-10 h-5 w-5 border-b border-r border-gold/40" />

          <iframe
            src={
              safeClient.venueMapUrl ||
              "https://maps.google.com/maps?q=36+Saxon+Road,+Sandhurst,+Johannesburg,+South+Africa&t=&z=15&ie=UTF8&iwloc=&output=embed"
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue Map"
          />
        </motion.div>
      </div>
    </section>
  );
}