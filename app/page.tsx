"use client";

import { useState } from "react";

import { MusicProvider } from "@/context/MusicContext";
import MusicPlayer from "@/components/MusicPlayer";
import EnvelopeIntro from "@/components/EnvelopeIntro";

import Hero from "@/components/Hero";
import SaveTheDate from "@/components/SaveTheDate";
import Invitation from "@/components/Invitation";
import Story from "@/components/Story";
// import Schedule from "@/components/Schedule";
import Venue from "@/components/Venue";
import DressCode from "@/components/DressCode";
// import Gallery from "@/components/Gallery";
import RSVPForm from "@/components/RSVPForm";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <MusicProvider>
      <main className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">

        {/* SITE ALWAYS RENDERED */}
        <div className="relative z-0">
          <Hero />
          <SaveTheDate />
          <Invitation />
          <Story />
          {/* <Schedule /> */}
          <Venue />
          <DressCode />
          {/* <Gallery /> */}
          <RSVPForm />
        </div>

        {/* ENVELOPE OVERLAY */}
        {!introDone && (
          <div className="fixed inset-0 z-50">
            <EnvelopeIntro
              onFinish={() => {
                // small delay ensures fade completes BEFORE removal
                setTimeout(() => setIntroDone(true), 300);
              }}
            />
          </div>
        )}

        {/* FLOATING MUSIC PLAYER — persists across entire page */}
        <MusicPlayer />

      </main>
    </MusicProvider>
  );
}