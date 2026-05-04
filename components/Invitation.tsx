"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const items = [
  { delay: 0 },    // glyph
  { delay: 0.3 },  // salutation
  { delay: 0.6 },  // body
  { delay: 0.9 },  // ornament rules
  { delay: 1.1 },  // closing detail
];

export default function Invitation() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "-60px" });

  // Rings rise up as the section scrolls into view
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const ringsY = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const ringsOpacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);

  const anim = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.2, ease: "easeOut", delay: items[i].delay },
  });

  return (
    <section
      ref={ref}
      className="bg-[#fcf9f4] px-8 pt-10 pb-24"
    >
      <div className="relative mx-auto max-w-2xl text-center">
        {/* Glyph */}
        <motion.span
          className="relative z-10 text-sm text-gold/60"
          {...anim(0)}
        >
          ✦
        </motion.span>

        {/* Salutation */}
        <motion.p
          className="relative z-10 mt-6 font-script text-6xl text-neutral-800 md:text-7xl"
          {...anim(1)}
        >
          You are invited
        </motion.p>

        {/* Rings — in flow, right above white card, bottom edge tucked behind it */}
        <motion.div
          className="pointer-events-none relative z-[5] mx-auto mt-4 w-[180px] -mb-14"
          style={{ y: ringsY, opacity: ringsOpacity }}
        >
          <img
            src="/images/Invitation/Invitation.png"
            alt=""
            className="w-full drop-shadow-lg"
          />
        </motion.div>

        {/* Body — white invite card sits in front of rings */}
        <motion.div
          className="relative z-20 mt-0 rounded-2xl bg-white px-10 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
          {...anim(2)}
        >
          <p className="font-serif text-xl font-light leading-[1.9] text-neutral-600">
            Together with their families, Thabang and Emihle joyfully request the
            honour of your presence as they exchange vows and begin their forever.
            Join us for an evening of love, laughter, and celebration beneath the
            Johannesburg sky.
          </p>
        </motion.div>

      
      </div>
    </section>
  );
}
