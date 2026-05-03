"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

interface ScratchBoxProps {
  label: string;
  value: string;
  animDelay?: number;
}

function ScratchBox({ label, value, animDelay = 0 }: ScratchBoxProps) {
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

      // Muted warm gold scratch surface
      ctx.fillStyle = "#d4b06a";
      ctx.fillRect(0, 0, w, h);

      // Subtle diagonal hatching for texture
      ctx.strokeStyle = "#c9a45a";
      ctx.lineWidth = 1;
      for (let i = -h; i < w + h; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }

      // Thin frame inside
      ctx.strokeStyle = "#e8c97044";
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, w - 10, h - 10);

      // Hint text
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

  const getCanvasPos = (
    e: React.TouchEvent | React.MouseEvent
  ): { x: number; y: number } => {
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

    // Check coverage every 4 strokes to avoid perf hit
    strokeCount.current++;
    if (strokeCount.current % 4 === 0) checkReveal();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDrawing.current = true;
    lastPos.current = null;
    const p = getCanvasPos(e);
    scratchAt(p.x, p.y);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const p = getCanvasPos(e);
    scratchAt(p.x, p.y);
  };
  const onMouseUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };
  const onTouchStart = (e: React.TouchEvent) => {
    lastPos.current = null;
    const p = getCanvasPos(e);
    scratchAt(p.x, p.y);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const p = getCanvasPos(e);
    scratchAt(p.x, p.y);
  };
  const onTouchEnd = () => {
    lastPos.current = null;
    checkReveal();
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: animDelay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Label above box */}
      <span className="text-[#8b7355]/60 text-[10px] uppercase tracking-[0.35em] font-light">
        {label}
      </span>

      {/* Scratch card box */}
      <div
        ref={containerRef}
        className="relative w-[130px] h-[130px] bg-[#fcf9f4] border border-[#c9a96e]/40 overflow-hidden flex items-center justify-center"
      >
        {/* Content revealed underneath */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
          <p
            className="font-serif text-[#8b6914] leading-none"
            style={{ fontSize: value.length > 4 ? "1.9rem" : "2.8rem" }}
          >
            {value}
          </p>
        </div>

        {/* Gold shimmer on full reveal */}
        {revealed && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(184,146,42,0.08) 0%, transparent 75%)",
            }}
          />
        )}

        {/* Scratch canvas overlay */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-10"
          />
        )}
      </div>
    </motion.div>
  );
}

export default function SaveTheDate() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center justify-center bg-[#fcf9f4] px-6 pt-20 pb-10 text-center overflow-hidden"
    >
      

    

      {/* Main title — Great Vibes script */}
      <motion.h2
        className="font-script text-[#2a1f0e] text-6xl mb-3"
        initial={{ opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        The Date
      </motion.h2>

      {/* Divider */}
      <motion.div
        className="w-12 h-px bg-[#c9a96e]/50 mb-3"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Subtitle — Cormorant Garamond */}
      <motion.p
        className="font-serif text-[#8b7355]/80 text-xl tracking-[0.12em] italic mb-7"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        ✦ &nbsp; Scratch to reveal the date &nbsp; ✦
      </motion.p>

      {/* Three scratch boxes */}
      <div className="flex items-start gap-5 sm:gap-7">
        <ScratchBox label="Day"   value="21"   animDelay={0.5} />
        <ScratchBox label="Month" value="June" animDelay={0.65} />
        <ScratchBox label="Year"  value="2026" animDelay={0.8} />
      </div>
    </section>
  );
}
