"use client";

import { useState } from "react";
import { MusicProvider } from "@/context/MusicContext";
import MusicPlayer from "@/components/MusicPlayer";
import EnvelopeIntro from "@/components/EnvelopeIntro";

export default function InviteClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <MusicProvider>
      <main className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
        <div className="relative z-0">{children}</div>

        {!introDone && (
          <div className="fixed inset-0 z-50">
            <EnvelopeIntro
              onFinish={() => setTimeout(() => setIntroDone(true), 300)}
            />
          </div>
        )}

        <MusicPlayer />
      </main>
    </MusicProvider>
  );
}
