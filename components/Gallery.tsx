"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryProps {
  images?: GalleryImage[];
}

const CELL_ASPECTS = [
  "aspect-[3/4]",
  "aspect-[3/4]",
  "aspect-[3/4]",
  "aspect-[3/4]",
  "aspect-[3/4]",
  "aspect-[3/4]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/3]",
];

export default function Gallery({ images }: GalleryProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "-60px" });

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, {
    once: true,
    amount: 0.1,
    margin: "-60px",
  });

  const hasImages = images && images.length > 0;

  return (
    <section ref={ref} className="bg-[#0a0a0a] px-6 py-32">
      {/* Header */}
      <motion.div
        ref={headerRef}
        className="mb-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold/50">
          A Glimpse
        </p>
        <h2 className="mt-4 font-script text-6xl text-beige">Moments</h2>
      </motion.div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl grid grid-cols-2 gap-1 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => {
          const isLastOnMobile = i === 8;
          const aspectClass = CELL_ASPECTS[i] ?? "aspect-[3/4]";

          return (
            /* Outer div handles entrance fade */
            <motion.div
              key={i}
              className={`overflow-hidden ${aspectClass} ${isLastOnMobile ? "col-span-2 md:col-span-1" : ""}`}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.08 }}
            >
              {/* Inner div handles hover scale, clipped by parent overflow-hidden */}
              <motion.div
                className="relative h-full w-full border border-gold/5 bg-[#111009]"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {hasImages && images[i] ? (
                  <Image
                    src={images[i].src}
                    alt={images[i].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center font-sans text-[9px] uppercase tracking-[0.5em] text-beige/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
