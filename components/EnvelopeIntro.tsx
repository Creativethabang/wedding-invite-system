"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMusic } from "@/context/MusicContext";

export default function EnvelopeIntro({ onFinish }: { onFinish: () => void }) {
  const [open, setOpen] = useState(false);
  const [waxPhase, setWaxPhase] = useState<"enter" | "idle" | "exit">("enter");
  const { play } = useMusic();

  const handleOpen = () => {
    if (open || waxPhase === "exit") return;
    play();
    setWaxPhase("exit");

    setTimeout(() => {
      setOpen(true);
      setTimeout(onFinish, 1400);
    }, 1000);
  };

  return (
    <motion.div
      className="fixed inset-0 w-screen h-screen bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: open ? 0 : 1 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
    >
      {/* ENVELOPE */}
      <div className="absolute inset-0 flex items-center justify-center scale-125">
        <motion.img
          src="/images/envelope/top.png"
          className="absolute w-[120vw] max-w-none z-40"
          animate={open ? { y: -450, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
        />
        <motion.img
          src="/images/envelope/bottom.png"
          className="absolute w-[120vw] max-w-none z-30"
          animate={open ? { y: 60, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.img
          src="/images/envelope/left.png"
          className="absolute w-[120vw] max-w-none z-10"
          animate={open ? { x: -360, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.1, ease: "easeInOut" }}
        />
        <motion.img
          src="/images/envelope/right.png"
          className="absolute w-[120vw] max-w-none z-10"
          animate={open ? { x: 360, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.15, ease: "easeInOut" }}
        />
      </div>

      {/* WAX SEAL */}
      <div className="absolute inset-0 z-50">
        {/* Click layer */}
        <div
          onClick={handleOpen}
          className="absolute inset-0"
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="flex flex-col items-center"
            // Stamp entrance
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={
              waxPhase === "exit"
                ? { scale: 1.25, opacity: 0, y: -10 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            transition={
              waxPhase === "exit"
                ? { duration: 0.9, ease: [0.4, 0, 0.2, 1] }
                : { type: "spring", stiffness: 160, damping: 13, delay: 0.5 }
            }
            onAnimationComplete={() => {
              if (waxPhase === "enter") setWaxPhase("idle");
            }}
          >
            {/* Seal breathes gently while idle */}
            <motion.img
              src="/images/envelope/wax.png"
              className="w-[70vw] max-w-[520px] drop-shadow-2xl"
              animate={waxPhase === "idle" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Hint text */}
            <motion.p
              className="text-[#3e5167] text-base mt-6 tracking-wide"
              animate={{ opacity: waxPhase === "idle" ? 0.85 : 0 }}
              transition={{ duration: 0.8 }}
            >
              Click to open invitation
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
