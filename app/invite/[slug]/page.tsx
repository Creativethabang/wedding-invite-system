import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Hero from "@/components/Hero";
import SaveTheDate from "@/components/SaveTheDate";
import Invitation from "@/components/Invitation";
import Story from "@/components/Story";
import Venue from "@/components/Venue";
import DressCode from "@/components/DressCode";
import RSVPForm from "./RSVPForm";
import InviteClient from "@/components/InviteClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: event, error } = await supabase
    .from("events")
    .select("id, slug, couple_names, date, venue, theme")
    .eq("slug", slug)
    .single();

  if (!event || error) notFound();

  return (
    <InviteClient>
      <Hero />
      <SaveTheDate />
      <Invitation />
      <Story />
      <Venue />
      <DressCode />
      <RSVPForm eventId={event.id} coupleNames={event.couple_names} />
    </InviteClient>
  );
}
