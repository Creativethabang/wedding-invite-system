"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const weddingDate = new Date("2026-06-21");

function getDaysUntil() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = weddingDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const cornerClasses = [
  "top-6 left-6 border-t border-l sm:top-8 sm:left-8",
  "top-6 right-6 border-t border-r sm:top-8 sm:right-8",
  "bottom-6 left-6 border-b border-l sm:bottom-8 sm:left-8",
  "bottom-6 right-6 border-b border-r sm:bottom-8 sm:right-8",
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const daysUntil = getDaysUntil();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black">

      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/images/hero/Hero.webm"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.08)_0%,_transparent_70%)]" />

      {cornerClasses.map((cls, i) => (
        <div
          key={i}
          className={`absolute h-8 w-8 border-gold/25 sm:h-10 sm:w-10 ${cls}`}
        />
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.p
          className="font-sans text-[9px] uppercase tracking-[0.35em] text-beige/50"
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          Together with their families
        </motion.p>

        <motion.h1
          className="mt-4 font-script text-5xl text-beige sm:text-6xl md:text-7xl"
          initial={{ opacity: 0, y: 16 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
        >
          Thabang &amp; Emihle
        </motion.h1>

        <motion.div
          className="my-6 flex items-center gap-3 sm:my-8"
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={mounted ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
        >
          <div className="h-px w-12 bg-gold/40 sm:w-16" />
          <span className="text-[10px] text-gold/60">✦</span>
          <div className="h-px w-12 bg-gold/40 sm:w-16" />
        </motion.div>

        <motion.p
          className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold/50"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.85, ease: "easeOut" }}
        >
          {daysUntil} days away
        </motion.p>
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-b from-transparent to-[#fcf9f4]" />

      <div className="absolute bottom-10 z-20 flex flex-col items-center gap-1 left-1/2 -translate-x-1/2">
        <motion.span
          className="mb-2 font-sans text-[10px] uppercase tracking-widest text-beige/30"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.1 }}
        >
          scroll
        </motion.span>
        {[0, 0.3].map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rotate-45 border-b border-r border-gold/30 animate-pulse"
          />
        ))}
      </div>

    </section>
  );
}