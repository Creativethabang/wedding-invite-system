"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

type Client = {
  date?: string;
};

function ScratchBox({ label, value, animDelay = 0 }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const strokeCount = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setup = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (!w || !h) return;

      canvas.width = w;
      canvas.height = h;

      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = "#d4b06a";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "#c9a45a";
      ctx.lineWidth = 1;
      for (let i = -h; i < w + h; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }

      ctx.strokeStyle = "#e8c97044";
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, w - 10, h - 10);

      ctx.fillStyle = "#fff8e688";
      ctx.font = "600 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SCRATCH", w / 2, h / 2 - 5);
      ctx.fillStyle = "#fff8e655";
      ctx.font = "9px sans-serif";
      ctx.fillText("here", w / 2, h / 2 + 9);

      setReady(true);
    };

    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, []);

  const getCanvasPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const fireConfetti = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 90,
      spread: 65,
      origin: { x, y },
      colors: ["#c9a96e", "#e8c970", "#fcf9f4", "#d4a843", "#f0dca0"],
      startVelocity: 28,
      gravity: 0.85,
      scalar: 0.85,
      ticks: 180,
    });
  }, []);

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) cleared++;
    }

    if (cleared / (data.length / 4) > 0.5) {
      setRevealed(true);
      fireConfetti();
    }
  }, [fireConfetti]);

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed || !ready) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 48;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, 24, 0, Math.PI * 2);
    }

    ctx.stroke();

    lastPos.current = { x, y };

    strokeCount.current++;
    if (strokeCount.current % 4 === 0) checkReveal();
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: animDelay }}
    >
      <span className="text-[#8b7355]/60 text-[10px] uppercase tracking-[0.35em] font-light">
        {label}
      </span>

      <div
        ref={containerRef}
        className="relative w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] bg-[#fcf9f4] border border-[#c9a96e]/40 overflow-hidden flex items-center justify-center"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            className="font-serif text-[#8b6914]"
            style={{ fontSize: value.length > 4 ? "1.5rem" : "2.2rem" }}
          >
            {value}
          </p>
        </div>

        {!revealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-10 touch-none cursor-crosshair"
            onMouseDown={(e) => scratchAt(getCanvasPos(e).x, getCanvasPos(e).y)}
            onMouseMove={(e) => {
              if (!isDrawing.current) return;
              scratchAt(getCanvasPos(e).x, getCanvasPos(e).y);
            }}
            onMouseUp={() => (isDrawing.current = false)}
            onTouchStart={(e) => scratchAt(getCanvasPos(e).x, getCanvasPos(e).y)}
            onTouchMove={(e) => scratchAt(getCanvasPos(e).x, getCanvasPos(e).y)}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function SaveTheDate({ client }: any) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const safeClient = client ?? {};

  const date = safeClient.date
    ? new Date(safeClient.date)
    : new Date("2026-06-21");

  const day = date.getDate().toString();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear().toString();

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center justify-center bg-[#fcf9f4] px-4 pt-14 pb-10 text-center overflow-hidden sm:px-6 sm:pt-20"
    >
      <motion.h2 className="font-script text-[#2a1f0e] text-5xl mb-3 sm:text-6xl">
        The Date
      </motion.h2>

      <motion.div className="w-10 h-px bg-[#c9a96e]/50 mb-3" />

      <motion.p className="font-serif text-[#8b7355]/70 text-base italic mb-7">
        ✦ Scratch to reveal the date ✦
      </motion.p>

      <div className="flex items-start gap-4 sm:gap-7">
        <ScratchBox label="Day" value={day} animDelay={0.5} />
        <ScratchBox label="Month" value={month} animDelay={0.65} />
        <ScratchBox label="Year" value={year} animDelay={0.8} />
      </div>
    </section>
  );
}