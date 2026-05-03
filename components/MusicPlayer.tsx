"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "@/context/MusicContext";

export default function MusicPlayer() {
  const { isPlaying, hasStarted, toggle } = useMusic();

  return (
    <AnimatePresence>
      {hasStarted && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          onClick={toggle}
          aria-label={isPlaying ? "Pause music" : "Play music"}
          className="fixed bottom-6 right-6 z-[200] w-12 h-12 rounded-full flex items-center justify-center"
        >
          {/* Pulsing ring when playing */}
          {isPlaying && (
            <motion.span
              className="absolute inset-0 rounded-full border border-[#c8a96e]/40"
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          )}

          {/* Button face */}
          <span className="relative w-full h-full rounded-full border border-[#c8a96e]/60 bg-black/70 backdrop-blur-md flex items-center justify-center text-[#c8a96e] hover:border-[#c8a96e] hover:bg-black/90 transition-colors duration-300">
            {isPlaying ? (
              // Pause bars
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="3.5" height="12" rx="1" />
                <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              // Play triangle
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3 1.5l10 5.5-10 5.5V1.5z" />
              </svg>
            )}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
