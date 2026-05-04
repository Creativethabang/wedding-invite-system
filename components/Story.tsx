"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const milestones = [
  {
    year: "2017",
    title: "First Hello",
    body: "She came to borrow a tin opener while I was visiting a friend…\nI knew I had to impress.",
  },
  {
    year: "2020",
    title: "The Journey Begins",
    body: "Road trips to the Blyde, apartment house parties,\nand the kind of laughter that leaves your stomach sore.\nThat's when we knew.",
  },
  {
    year: "2021",
    title: "I Asked",
    body: "She was carrying our first child…\nand I knew it was the right time to send abo Malume.",
  },
  {
    year: "2026",
    title: "Forever Starts",
    body: "Now, we invite our favourite people\nto witness the beginning of our forever.",
  },
];

// Stable confetti data — generated once at module load
const COLORS = ["#C9A84C", "#E8D5B0", "#F0E6D3", "#E8C5B5", "#D4B08C", "#B8A090"];
const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: (i * 2.9) % 100,
  size: 5 + (i % 5),
  delay: (i * 0.18) % 4,
  duration: 7 + (i % 5),
  color: COLORS[i % COLORS.length],
  initialRotate: (i * 37) % 360,
  drift: ((i % 7) - 3) * 18,
  isCircle: i % 3 === 0,
}));

function Milestone({
  item,
  index,
}: {
  item: (typeof milestones)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="flex gap-8"
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className="h-4 w-4 rounded-full bg-gold ring-4 ring-gold/10" />
        <div className="mt-1 flex-1 w-px bg-gold/20" />
      </div>

      <div className="pb-16">
        <p className="font-sans text-xs tracking-widest text-gold">{item.year}</p>
        <h3 className="mt-1 font-serif text-2xl font-light text-[#2c2c2c]">
          {item.title}
        </h3>
        <p className="mt-3 font-sans text-sm leading-relaxed text-[#5a5a5a] max-w-sm whitespace-pre-line">
          {item.body}
        </p>
      </div>
    </motion.div>
  );
}

export default function Story() {
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.05 });

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "-60px" });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#fcf9f4] px-6 pt-12 pb-8">
      {/* Confetti */}
      {CONFETTI.map((piece) => (
        <motion.div
          key={piece.id}
          className="pointer-events-none absolute top-0"
          style={{ left: `${piece.left}%` }}
          initial={{ y: -20, x: 0, rotate: piece.initialRotate, opacity: 0 }}
          animate={
            sectionInView
              ? {
                  y: "110vh",
                  x: piece.drift,
                  rotate: piece.initialRotate + 540,
                  opacity: [0, 0.85, 0.85, 0],
                }
              : {}
          }
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: piece.delay * 0.5,
          }}
        >
          <div
            style={{
              width: piece.size,
              height: piece.isCircle ? piece.size : piece.size * 1.6,
              backgroundColor: piece.color,
              borderRadius: piece.isCircle ? "50%" : "2px",
              opacity: 0.7,
            }}
          />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.div
          ref={headerRef}
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-gold">
            Our Story
          </p>
          <h2 className="mt-4 font-script text-6xl text-[#2c2c2c]">
            How we got here
          </h2>
        </motion.div>

        <div className="pl-2">
          {milestones.map((item, i) => (
            <Milestone key={item.year} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
