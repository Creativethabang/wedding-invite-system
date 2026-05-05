# Project: Multi-Client Animated Wedding Invite Platform

## Overview
A premium, cinematic wedding invitation platform serving multiple couples. Each wedding is a fully isolated event identified by a unique `slug`. The `events` table in Supabase is the single source of truth — every page, every RSVP, and every data fetch is scoped to an `event_id`. Nothing in this system exists without an event context.

---

## CRITICAL SYSTEM RULES

> These rules override everything else. They apply to every conversation, every code change, and every Supabase operation. No exceptions.

### 1. The `events` table is the source of truth
- Every wedding is a row in the `events` table
- All other tables (`rsvps`, etc.) reference `event_id` as a foreign key
- There is no global or "default" wedding — context is always scoped to an event

### 2. Slug identifies every wedding page
- Every event has a unique `slug` (e.g. `thabang-and-emihle`)
- The multi-client route is `/invite/[slug]`
- The slug is used to look up the `event_id` at page load
- Slugs are lowercase, hyphen-separated, never contain spaces or special characters

### 3. Every RSVP insert must include `event_id`
- RSVPs without an `event_id` are **invalid** and must never be written
- `event_id` is a `NOT NULL` foreign key on the `rsvps` table
- `RSVPForm` receives `eventId` as a required prop — it cannot be rendered without it

### 4. Never generate or modify an event without explicit confirmation
- Before creating a new event row, a new slug, or modifying event details, **stop and ask for clarification**
- Ask: couple names, wedding date, venue, slug, and any custom content
- Do not infer or guess any of these values

### 5. Never allow RSVPs without an event context
- If `eventId` is undefined, null, or not yet loaded, the RSVP form must not render
- Show a loading state or an error — never a blank or broken form

---

## PRODUCTION SAFETY RULES

> These rules apply to all Supabase operations. A confirmed intent from the user in the current message is not enough — each mutation requires a **dedicated confirmation step** before execution.

### No database mutation without a user confirmation step
Before executing any of the following, stop, display exactly what will run, and wait for explicit approval:
- `INSERT` into any table
- `UPDATE` on any row
- `DELETE` or `TRUNCATE` on any table
- Any schema change (`ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`)
- Any RLS policy change

**Required confirmation format:**
```
Action:  INSERT into rsvps
Data:    { event_id: "...", name: "...", attending: true, ... }
Table:   rsvps
Risk:    Irreversible

Proceed? (yes / no)
```
Do not execute until the user replies with an explicit "yes" or equivalent.

### Never auto-create or change default events
- Every existing event row is **read-only** unless the user explicitly names the event and the field to change
- Never infer that "the current event" should be updated based on earlier conversation context
- Never silently update `slug`, `date`, `venue`, or any other event field as a side effect of another task

### Always confirm the slug before any event operation
- Before creating a new event: display the proposed slug and wait for confirmation
- Before updating an event: confirm which slug is being targeted
- Slug confirmation must be a standalone step — never bundled with code generation

### Treat the Thabang & Emihle event as read-only by default
- Slug: `thabang-and-emihle`
- This is a live production event. Never modify its row in `events` unless the user explicitly names the event and the specific field to change
- Do not use it as a template or staging target for other clients

### Always ask before modifying Supabase data
Even if the user's message implies a change (e.g. "fix the venue"), do not run an `UPDATE` — ask first:
1. Confirm the target event (by slug)
2. Show the current value and proposed new value
3. Wait for explicit approval

---

## AUTO DEPLOYMENT RULE (MANDATORY)

> This applies to every code change in this project, no exceptions. Never output a code change without the full Git + deployment block below.

### 1. Scope changes correctly
- Modify only the files required for the task
- Do not touch unrelated components or config

### 2. Always output Git instructions after any code change

```bash
git add <specific-changed-files>
git commit -m "type: clear description of what changed and why"
git push origin main
```

- Use specific file paths in `git add`, not `git add .`
- Commit message must be descriptive (e.g. `feat: add CinematicCTA WhatsApp button` not `update code`)

### 3. Always include this deployment reminder

> Vercel will auto-deploy this change after push. The live site updates within ~1 minute.

### 4. Always end with a verification block

```
Files changed:
  - components/CinematicCTA.tsx
  - app/page.tsx

Deployment: Vercel triggers automatically on push to main
Live URL:   https://wedding-invite-system.vercel.app
```

### 5. No exceptions
A code change response is incomplete without steps 2, 3, and 4. This applies to bug fixes, new components, schema changes, config edits — everything.

---

## Deployment Architecture

### Source of truth
**GitHub** — `git@github.com:Creativethabang/wedding-invite-system.git`

### CI/CD
- Branch `main` is connected to Vercel
- Every push to `main` triggers an automatic production deployment
- No manual deploy step required

### What is ignored (`.gitignore`)
```
node_modules
.next
.env
.env.local
.DS_Store
dist
build
```
Never commit `.env.local` — it contains Supabase keys.

### Live URLs
| Route | URL |
|---|---|
| Thabang & Emihle (root) | `https://wedding-invite-system.vercel.app` |
| Multi-client slug route | `https://wedding-invite-system.vercel.app/invite/[slug]` |

---

## Agent Flow — New Wedding Events

Every time a new wedding invite is requested, follow these steps in order. Do not skip or combine steps.

### Step 1 — Intake
Before writing any code or touching Supabase, collect:
- Couple's names (used as `couple_names` field)
- Wedding date (stored as `date`)
- Venue name and address (stored as `venue`)
- Preferred slug — propose one and confirm before anything else
- Theme / colour preferences
- Custom sections needed (schedule, gallery, etc.)
- Background video or images available?
- Music track?

### Step 2 — Planning
1. Confirm the slug and event details back to the user
2. Show the full `INSERT` that will be run — do not run it yet
3. Outline which components will be reused vs customised
4. Wait for explicit approval before touching any code

### Step 3 — Build
Only after explicit approval:
1. Run the confirmed `INSERT` into `events`
2. Capture the returned `id` as `event_id`
3. Scaffold `app/invite/[slug]/page.tsx`
4. Wire `RSVPForm` with `eventId` and `coupleNames` props
5. Confirm RSVP linkage and deliver the final summary

---

## Standard Operating Procedure: New Wedding Event

> Each gate must be explicitly cleared before the next begins. Never bundle gates.

### Gate 1 — Collect Required Inputs

| Field | Required | Maps to column |
|---|---|---|
| Couple names | Yes | `couple_names` |
| Wedding date | Yes | `date` |
| Venue | Yes | `venue` |
| Slug | Yes | `slug` — propose + confirm via Gate 2 |
| Theme / palette | Yes | `theme` (jsonb) |
| Custom sections | No | — |
| Video / images | No | — |
| Music track | No | — |

### Gate 2 — Confirm Slug

```
Proposed slug: firstname-and-lastname
             → /invite/firstname-and-lastname

Confirm or provide an alternative.
```

- Lowercase, hyphens only, no spaces or special characters
- Format: `partnera-and-partnerb` (matches existing pattern from `thabang-and-emihle`)
- Must be unique — never reuse or overwrite an existing slug

### Gate 3 — Show Full Event Summary

```
Event to be created
───────────────────────────────────────
slug:         firstname-and-lastname
couple_names: Partner A & Partner B
date:         YYYY-MM-DD
venue:        Venue Name, Address
theme:        { ... }
───────────────────────────────────────
Route:   /invite/firstname-and-lastname
Action:  INSERT into events (no existing rows modified)

Confirm to proceed?
```

### Gate 4 — Execute INSERT

```sql
insert into events (slug, couple_names, date, venue, theme)
values (
  'firstname-and-lastname',
  'Partner A & Partner B',
  'YYYY-MM-DD',
  'Venue Name, Address',
  '{"palette": [...]}'
)
returning id, slug;
```

**Safety:** If a row with the same slug already exists, stop. Do not upsert. Report the conflict and await instruction.

### Gate 5 — Scaffold the Route

Generate `app/invite/[slug]/page.tsx`:

```ts
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import InviteClient from "@/components/InviteClient";
import Hero from "@/components/Hero";
import SaveTheDate from "@/components/SaveTheDate";
import Invitation from "@/components/Invitation";
import Story from "@/components/Story";
import Venue from "@/components/Venue";
import DressCode from "@/components/DressCode";
import RSVPForm from "./RSVPForm";

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
```

### Gate 6 — Verify RSVP Linkage

- [ ] `RSVPForm` receives `eventId` (non-optional) and `coupleNames`
- [ ] The Supabase insert includes `event_id: eventId`
- [ ] `rsvps.event_id` is a `NOT NULL` FK referencing `events(id)`

### Gate 7 — Final Delivery Summary

```
Wedding invite created
───────────────────────────────────────
Couple:    Partner A & Partner B
Date:      Day Month Year
Venue:     Venue Name
Slug:      firstname-and-lastname
Event ID:  [uuid from Supabase]
Route:     /invite/firstname-and-lastname
Live URL:  https://wedding-invite-system.vercel.app/invite/firstname-and-lastname
───────────────────────────────────────
RSVP linkage: confirmed — all inserts include event_id
Existing events: not modified
```

### What This SOP Never Does
- Creates an event without Gate 3 approval
- Overwrites or modifies an existing event row
- Generates a slug without displaying and confirming it first
- Renders `RSVPForm` without `eventId`
- Bundles multiple gates into one response

---

## Data Architecture

### `events` Table — Actual Schema
```sql
create table events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  slug         text not null unique,
  couple_names text not null,
  date         date not null,
  venue        text,
  theme        jsonb
);
```

> Note: the columns are `couple_names`, `date`, and `venue` — not `partner_a/b`, `wedding_date`, or `venue_name`. Use these exact names in all queries and inserts.

### `rsvps` Table
```sql
create table rsvps (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  event_id   uuid not null references events(id) on delete cascade,
  name       text not null,
  attending  boolean not null,
  plus_one   boolean not null default false,
  message    text
);

create index rsvps_event_id_idx on rsvps(event_id);
```

### Row Level Security
```sql
alter table events enable row level security;
create policy "public read events"
  on events for select using (true);

alter table rsvps enable row level security;
create policy "public insert rsvps"
  on rsvps for insert with check (
    exists (select 1 from events where id = event_id)
  );
```

---

## Routing Architecture

Two routes exist in this project:

### Route 1 — Root `/` (Thabang & Emihle dedicated page)
**File:** `app/page.tsx`
- Server component — fetches event by hardcoded slug `thabang-and-emihle`
- Renders full invite + `CinematicCTA` (WhatsApp business CTA at the bottom)
- Uses `components/RSVPForm.tsx` (takes only `eventId`)

### Route 2 — `/invite/[slug]` (multi-client dynamic route)
**File:** `app/invite/[slug]/page.tsx`
- Server component — fetches event by slug from URL params
- Renders full invite without `CinematicCTA`
- Uses `app/invite/[slug]/RSVPForm.tsx` (takes `eventId` + `coupleNames`)
- Calls `notFound()` if slug doesn't match any event

Both routes wrap content in `InviteClient` which handles the envelope intro, music context, and floating player.

---

## Component Reference

### `InviteClient` (`components/InviteClient.tsx`)
- Client shell that wraps all page content
- Manages `introDone` state for the envelope overlay
- Provides `MusicProvider` context to all children
- Renders `EnvelopeIntro` (fixed z-50 overlay, removed after open) and `MusicPlayer`
- Also duplicated at `app/invite/[slug]/InviteClient.tsx` — both files are identical

### `EnvelopeIntro`
- Five layered PNGs (`top`, `bottom`, `left`, `right`, `wax`) from `/public/images/envelope/`
- Wax seal: spring entrance → breathing idle → exit on click
- On click: starts music, flies envelope apart, fades out, triggers `onFinish`

### `Hero`
- Looping `.webm` background: `/public/images/hero/Hero.webm`
- Couple names, live "X days away" countdown
- `mounted` flag prevents hydration mismatch on countdown

### `SaveTheDate`
- Three `<canvas>` scratch boxes: Day / Month / Year
- Gold hatching surface erased via `destination-out` composite operation
- At >50% cleared: `canvas-confetti` fires from element position

### `Invitation`
- Parallax rings image rises on scroll via `useScroll` + `useTransform`
- White card at `z-20` floats in front of rings
- Staggered fade-in: glyph → salutation → rings → body

### `Story`
- Animated confetti (36 stable pre-generated pieces)
- Four milestone cards with alternating left/right entrance
- Timeline spine: gold dot + vertical line

### `Venue`
- Venue name, address, Google Maps embed (16:9)
- Gold corner accents, "Get Directions →" external link

### `DressCode`
- Colour palette swatches (5 colours)
- Inspiration gallery: 2-col mobile / 4-col desktop from `/public/images/DressCode/`

### `RSVPForm`
Two versions exist:

**`components/RSVPForm.tsx`** — used by `app/page.tsx` (root route)
```ts
interface RSVPFormProps {
  eventId: string; // required, non-nullable
}
```

**`app/invite/[slug]/RSVPForm.tsx`** — used by the slug route
```ts
interface RSVPFormProps {
  eventId: string;    // required, non-nullable
  coupleNames: string; // used in confirmation message
}
```

Both insert `event_id` on every submit. Neither renders if `eventId` is falsy.

### `CinematicCTA` (`components/CinematicCTA.tsx`)
- WhatsApp business call-to-action rendered **only** at the bottom of `app/page.tsx`
- Pre-written message: "Hi, I just saw the wedding invite experience and I'd love one for my wedding 💍"
- Scroll-triggered fade-in, `whileHover` scale on the link
- Uses `text-gold` / `text-gold-dim` for the link colour

### `MusicPlayer`
- Appears only after `hasStarted` is true in `MusicContext`
- Fixed bottom-right, `z-200`, 48×48px circular button with pulsing ring while playing

### `MusicContext` (`context/MusicContext.tsx`)
- Lazy `<audio>` via `useRef`; file: `/public/audio/The Only Reason.mp3`, looping
- `play()`: starts + fades volume 0 → 0.65 over ~2.6s
- `toggle()`: pauses/resumes without fade

---

## Current Live Event: Thabang & Emihle

| Field | Value |
|---|---|
| Slug | `thabang-and-emihle` |
| Route | `app/page.tsx` (root `/`) |
| Wedding Date | 21 June 2026 |
| Venue | The Saxon Hotel, 36 Saxon Road, Sandhurst, Johannesburg, 2196 |
| Live URL | `https://wedding-invite-system.vercel.app` |

**This event is read-only.** Do not modify it without explicit instruction naming the slug and field.

### Page render order
```
InviteClient
  ├── Hero
  ├── SaveTheDate
  ├── Invitation
  ├── Story
  ├── Venue
  ├── DressCode
  ├── RSVPForm          — eventId only (no coupleNames)
  └── CinematicCTA      — WhatsApp CTA (root page only)
  [EnvelopeIntro overlay + MusicPlayer — managed by InviteClient]
```

**Commented out (built, currently disabled):**
- `Schedule` — `components/Schedule.tsx`
- `Gallery` — `components/Gallery.tsx`

---

## Design System

### Custom Tailwind Tokens (`tailwind.config.ts`)
| Token | Value | Usage |
|---|---|---|
| `gold` | `#C9A84C` | Accents, borders, labels |
| `gold-dim` | `#8a6e2f` | Hover/dimmed gold states |
| `beige` | `#F5F0E8` | Light text on dark backgrounds |
| `bg-warm` | `#0d0c0a` | Dark background base |

Custom animation: `shimmer` (3s linear).

### Typography
| CSS Variable | Font | Tailwind class |
|---|---|---|
| `--font-cormorant` | Cormorant Garamond (300/400/600) | `font-serif` |
| `--font-inter` | Inter | `font-sans` |
| `--font-great-vibes` | Great Vibes | `font-script` |

### Animation Rules
- All motion via Framer Motion — no raw CSS animations (except `animate-pulse`)
- Entry pattern: `opacity: 0 → 1`, `y: 20 → 0`, `duration: 1–1.2s`, `ease: "easeOut"`
- `useInView` with `{ once: true, margin: "-60px" }` — animate once on scroll
- Slow, cinematic pacing — no bouncy or aggressive motion

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| Backend | Supabase (Postgres) |
| Confetti | `canvas-confetti` |
| Fonts | Google Fonts via `next/font` |

---

## Folder Structure (Current)

```
/app
  page.tsx                        — root route, hardcoded to thabang-and-emihle
  layout.tsx                      — fonts, metadata, root HTML
  globals.css
  invite/
    [slug]/
      page.tsx                    — multi-client server component
      RSVPForm.tsx                — RSVPForm with eventId + coupleNames props
      InviteClient.tsx            — duplicate of components/InviteClient.tsx

/components
  InviteClient.tsx                — client shell: envelope, music, children
  EnvelopeIntro.tsx
  Hero.tsx
  SaveTheDate.tsx
  Invitation.tsx
  Story.tsx
  Venue.tsx
  DressCode.tsx
  RSVPForm.tsx                    — eventId only (used by root page)
  CinematicCTA.tsx                — WhatsApp CTA (root page only)
  MusicPlayer.tsx
  SectionDivider.tsx
  Schedule.tsx                    — built, currently disabled
  Gallery.tsx                     — built, currently disabled

/context
  MusicContext.tsx

/lib
  supabaseClient.ts

/public
  /audio                          — The Only Reason.mp3
  /images
    /envelope                     — top.png, bottom.png, left.png, right.png, wax.png
    /hero                         — Hero.webm
    /Invitation                   — Invitation.png
    /DressCode                    — Babypink.JPG, Blue.JPG, Pink.JPG, brown.JPG
```

---

## Supabase Setup

### Environment Variables (`.env.local` — never commit this file)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Client (`lib/supabaseClient.ts`)
```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## How to Restart the Project

```bash
npm install
cp .env.local.example .env.local
# → fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# → open http://localhost:3000
```

If Supabase tables don't exist, run the SQL in the Data Architecture section. Then insert the Thabang & Emihle event row with slug `thabang-and-emihle`.

---

## Coding Rules

- Functional React components only (`"use client"` where needed)
- Tailwind classes for all styling (no inline CSS unless value is dynamic)
- Framer Motion for all animations — no raw CSS keyframe animations
- `useInView` with `{ once: true }` for scroll-triggered animations
- No comments unless logic is genuinely non-obvious
- Never hardcode event data in components — always receive via props from the page loader

---

## Tone

Everything should feel:
- Elegant and intentional
- Cinematic and slow-paced
- Emotionally engaging

Avoid anything generic, overly flashy, or template-like.
