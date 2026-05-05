"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

type Client = {
  couple?: string;

  storyHook?: string;
  storyBody?: string;
  invitationMessage?: string;
  closingMessage?: string;

  tone?: "formal" | "modern" | "romantic";
};

const items = [
  { delay: 0 },
  { delay: 0.3 },
  { delay: 0.6 },
  { delay: 0.9 },
];

export default function Invitation({ client }: { client?: Client }) {
  const safeClient = client ?? {};

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const ringsY = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const ringsOpacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);

  const anim = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1, ease: "easeOut", delay: items[i].delay },
  });

  const couple = safeClient.couple || "Thabang & Emihle";

  const storyHook =
    safeClient.storyHook ||
    "A love story written in time, laughter, and quiet moments.";

  const storyBody =
    safeClient.storyBody ||
    `${couple} have walked a journey filled with growth, connection, and meaning.`;

  const invitationMessage =
    safeClient.invitationMessage ||
    "Together with their families, they joyfully invite you to witness their union.";

  const closingMessage =
    safeClient.closingMessage ||
    "Join us for an evening of love, celebration, and unforgettable memories.";

  const tone = safeClient.tone || "romantic";

  const toneStyle =
    tone === "formal"
      ? "uppercase tracking-widest text-sm"
      : tone === "modern"
      ? "tracking-wide text-base"
      : "font-serif italic text-lg leading-relaxed";

  return (
    <section ref={ref} className="bg-[#fcf9f4] px-8 pt-10 pb-24">
      <div className="relative mx-auto max-w-2xl text-center">

        {/* Ornament */}
        <motion.span className="text-gold text-sm" {...anim(0)}>
          ✦
        </motion.span>

        {/* Couple */}
        <motion.p
          className="mt-6 font-script text-6xl text-neutral-800"
          {...anim(1)}
        >
          {couple}
        </motion.p>

        {/* Story Hook */}
        <motion.p
          className="mt-4 text-neutral-600"
          {...anim(1)}
        >
          {storyHook}
        </motion.p>

        {/* Rings */}
        <motion.div
          className="mx-auto mt-6 w-[160px]"
          style={{ y: ringsY, opacity: ringsOpacity }}
        >
          <img
            src="/images/Invitation/Invitation.png"
            className="w-full drop-shadow-lg"
            alt=""
          />
        </motion.div>

        {/* Card */}
        <motion.div
          className="mt-6 rounded-2xl bg-white px-10 py-10 shadow-lg"
          {...anim(2)}
        >
          <p className={toneStyle}>
            {storyBody}
          </p>

          <p className="mt-6 font-serif text-neutral-600">
            {invitationMessage}
          </p>

          <p className="mt-6 text-sm text-neutral-500">
            {closingMessage}
          </p>
        </motion.div>

        {/* Signature */}
        <motion.p
          className="mt-10 text-xs uppercase tracking-[0.3em] text-gold/60"
          {...anim(3)}
        >
          With love · {couple}
        </motion.p>

      </div>
    </section>
  );
}