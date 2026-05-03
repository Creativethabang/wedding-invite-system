"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface MusicContextType {
  isPlaying: boolean;
  hasStarted: boolean;
  play: () => void;
  toggle: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/The%20Only%20Reason.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
    }
    return audioRef.current;
  }, []);

  // Fade volume in smoothly from 0 → 0.65
  const fadeIn = useCallback((audio: HTMLAudioElement) => {
    const target = 0.65;
    const step = 0.01;
    const interval = setInterval(() => {
      if (audio.volume < target - step) {
        audio.volume = Math.min(audio.volume + step, target);
      } else {
        audio.volume = target;
        clearInterval(interval);
      }
    }, 40);
  }, []);

  const play = useCallback(() => {
    const audio = getAudio();
    audio.play();
    fadeIn(audio);
    setIsPlaying(true);
    setHasStarted(true);
  }, [getAudio, fadeIn]);

  const toggle = useCallback(() => {
    const audio = getAudio();
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [getAudio]);

  return (
    <MusicContext.Provider value={{ isPlaying, hasStarted, play, toggle }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
