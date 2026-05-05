import Hero from "@/components/Hero"
import SaveTheDate from "@/components/SaveTheDate"
import Invitation from "@/components/Invitation"
import DressCode from "@/components/DressCode"
import RSVPForm from "@/components/RSVPForm"
import CinematicCTA from "@/components/CinematicCTA"

type Props = {
  client: any
}

export default function WeddingTemplate({ client }: Props) {
  return (
    <main>
      <Hero />
      <SaveTheDate />
      <Invitation />
      <DressCode />
      <RSVPForm />
      <CinematicCTA />
    </main>
  )
}