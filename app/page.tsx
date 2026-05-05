import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

import InviteClient from "@/components/InviteClient";
import Hero from "@/components/Hero";
import SaveTheDate from "@/components/SaveTheDate";
import Invitation from "@/components/Invitation";
import Story from "@/components/Story";
import Venue from "@/components/Venue";
import DressCode from "@/components/DressCode";
import RSVPForm from "@/components/RSVPForm";
import CinematicCTA from "@/components/CinematicCTA";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event || error) notFound();

  // 🏭 FACTORY TRANSLATION LAYER (IMPORTANT)
  const client = {
    id: event.id,
    slug: event.slug,

    couple: event.couple_names,
    date: event.date,
    venue: event.venue,

    storyIntro: event.story_intro,
    invitationText: event.invitation_text,
    closingMessage: event.closing_message,

    heroVideo: event.hero_video,
    theme: event.theme,
  };

  return (
    <InviteClient>
      <Hero client={client} />
      <SaveTheDate client={client} />
      <Invitation client={client} />
      <Story client={client} />
      <Venue client={client} />
      <DressCode client={client} />

      <RSVPForm eventId={client.id} />
      <CinematicCTA />
    </InviteClient>
  );
}