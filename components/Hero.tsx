"use client";

import { useEffect, useState } from "react";

const weddingDate = new Date("2026-06-21");

function getDaysUntil() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = weddingDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const cornerClasses = [
  "top-8 left-8 border-t border-l",
  "top-8 right-8 border-t border-r",
  "bottom-8 left-8 border-b border-l",
  "bottom-8 right-8 border-b border-r",
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const daysUntil = getDaysUntil();

  useEffect(() => {
    // small delay ensures it feels "already there" after envelope closes
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black">

      {/* 🎥 BACKGROUND VIDEO */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/images/hero/hero.webm"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* 🌫️ DARK OVERLAY (READABILITY + CINEMATIC DEPTH) */}
      <div className="absolute inset-0 bg-black/25" />

      {/* ✨ SOFT RADIAL GLOW */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.08)_0%,_transparent_70%)]" />

      {/* 🧱 CORNER ORNAMENTS (STATIC — NO ANIMATION DELAY STACK) */}
      {cornerClasses.map((cls, i) => (
        <div
          key={i}
          className={`absolute h-10 w-10 border-gold/20 ${cls}`}
        />
      ))}

      {/* 🧠 CONTENT */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center h-full text-center px-6 transition-opacity duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >

        <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#373100]">
          Together with their families
        </p>

        <h1 className="mt-4 font-script text-5xl text-beige md:text-7xl">
          Thabang &amp; Emihle
        </h1>

        {/* Divider */}
        <div className="my-8 flex items-center gap-3">
          <div className="h-px w-16 bg-gold/40" />
          <span className="text-[10px] text-gold/60">✦</span>
          <div className="h-px w-16 bg-gold/40" />
        </div>

        <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.4em] text-gold/40">
          {daysUntil} days away
        </p>

      </div>

      {/* ⬇️ BOTTOM GRADIENT — seamless blend into next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-b from-transparent to-[#fcf9f4]" />

      {/* ⬇️ SCROLL INDICATOR */}
      <div className="absolute bottom-10 z-20 flex flex-col items-center gap-1 opacity-60">
        <span className="mb-2 font-sans text-xs tracking-widest text-beige/30">
          scroll
        </span>

        {[0, 0.3].map((delay, i) => (
          <div
            key={i}
            className="h-2 w-2 rotate-45 border-b border-r border-gold/30 animate-pulse"
          />
        ))}
      </div>

    </section>
  );
}