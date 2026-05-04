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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", "thabang-and-emihle")
    .single();

  if (!event) notFound();

  return (
    <InviteClient>
      <Hero />
      <SaveTheDate />
      <Invitation />
      <Story />
      <Venue />
      <DressCode />
      <RSVPForm eventId={event.id} />
    </InviteClient>
  );
}
