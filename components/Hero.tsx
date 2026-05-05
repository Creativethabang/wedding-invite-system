"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* =========================
   CLIENT TYPE
========================= */
type Client = {
  date?: string | null;
  couple_names?: string | null;
  hero_video?: string | null;

  // allow extra fields from Supabase
  [key: string]: any;
};

/* =========================
   HELPERS
========================= */
function getDaysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = date.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const cornerClasses = [
  "top-6 left-6 border-t border-l sm:top-8 sm:left-8",
  "top-6 right-6 border-t border-r sm:top-8 sm:right-8",
  "bottom-6 left-6 border-b border-l sm:bottom-8 sm:left-8",
  "bottom-6 right-6 border-b border-r sm:bottom-8 sm:right-8",
];

/* =========================
   COMPONENT
========================= */
export default function Hero({ client }: { client?: Client }) {
  const [mounted, setMounted] = useState(false);

  /* SAFE CLIENT */
  const safeClient = client ?? {};

  /* DYNAMIC DATA */
  const weddingDate = new Date(safeClient.date || "2026-06-21");
  const coupleNames = safeClient.couple_names || "Thabang & Emihle";
  const heroVideo = safeClient.hero_video || "/images/hero/Hero.webm";

  const daysUntil = getDaysUntil(weddingDate);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black">
      
      {/* VIDEO */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30" />

      {/* RADIAL GLOW */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.08)_0%,_transparent_70%)]" />

      {/* CORNERS */}
      {cornerClasses.map((cls, i) => (
        <div
          key={i}
          className={`absolute h-8 w-8 border-gold/25 sm:h-10 sm:w-10 ${cls}`}
        />
      ))}

      {/* CONTENT */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Subtitle */}
        <motion.p
          className="font-sans text-[9px] uppercase tracking-[0.35em] text-beige/50"
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Together with their families
        </motion.p>

        {/* Names */}
        <motion.h1
          className="mt-4 font-script text-5xl text-beige sm:text-6xl md:text-7xl"
          initial={{ opacity: 0, y: 16 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          {coupleNames}
        </motion.h1>

        {/* Divider */}
        <motion.div
          className="my-6 flex items-center gap-3 sm:my-8"
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={mounted ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.65 }}
        >
          <div className="h-px w-12 bg-gold/40 sm:w-16" />
          <span className="text-[10px] text-gold/60">✦</span>
          <div className="h-px w-12 bg-gold/40 sm:w-16" />
        </motion.div>

        {/* Countdown */}
        <motion.p
          className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold/50"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.85 }}
        >
          {daysUntil} days away
        </motion.p>
      </motion.div>

      {/* FADE TO NEXT SECTION */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-b from-transparent to-[#fcf9f4]" />

      {/* SCROLL INDICATOR */}
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