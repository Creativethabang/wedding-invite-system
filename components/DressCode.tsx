"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const inspirationImages = [
  { src: "/images/DressCode/Babypink.JPG", alt: "Baby Pink" },
  { src: "/images/DressCode/Blue.JPG", alt: "Blue" },
  { src: "/images/DressCode/Pink.JPG", alt: "Pink" },
  { src: "/images/DressCode/brown.JPG", alt: "Brown" },
];

const paletteColors = [
  { hex: "#e79750", name: "Amber" },
  { hex: "#e2beb6", name: "Blush" },
  { hex: "#becbc5", name: "Sage" },
  { hex: "#a6c3e0", name: "Dusty Blue" },
  { hex: "#041c3e", name: "Navy" },
];

export default function DressCode() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "-60px" });

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "-60px" });

  const paletteRef = useRef(null);
  const paletteInView = useInView(paletteRef, { once: true, amount: 0.1, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#fcf9f4] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#041c3e]/50">
            Dress Code
          </p>
          <h2 className="mt-4 font-script text-6xl text-[#041c3e]">
            What to Wear
          </h2>
          <p className="mt-5 font-serif text-base font-light leading-relaxed text-[#041c3e]/70">
            We would be very happy if your outfit is in the colours of the wedding theme.
          </p>
        </motion.div>

        {/* Colour Palette */}
        <motion.div
          ref={paletteRef}
          className="mb-10 flex items-center justify-center gap-3 sm:gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={paletteInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          {paletteColors.map((color, i) => (
            <motion.div
              key={color.hex}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={paletteInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + i * 0.1 }}
            >
              <div
                className="h-10 w-10 sm:h-14 sm:w-14 rounded-full shadow-md"
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              />
              <span className="font-sans text-[8px] sm:text-[9px] uppercase tracking-widest text-[#041c3e]/50">
                {color.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Inspiration Gallery */}
        <motion.p
          className="mb-6 text-center font-sans text-[10px] uppercase tracking-[0.5em] text-[#041c3e]/50"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Inspiration to the Theme
        </motion.p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {inspirationImages.map((img, i) => (
            <motion.div
              key={img.src}
              className="relative aspect-[3/4] overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.15 }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
