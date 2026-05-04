# Project: Multi-Client Animated Wedding Invite Platform

## Overview
A premium, cinematic wedding invitation platform that serves multiple couples. Each wedding is a fully isolated event identified by a unique `slug`. The `events` table in Supabase is the single source of truth — every page, every RSVP, and every data fetch is scoped to an `event_id`. Nothing in this system exists without an event context.

---

## CRITICAL SYSTEM RULES

> These rules override everything else. They apply to every conversation, every code change, and every Supabase operation. No exceptions.

### 1. The `events` table is the source of truth
- Every wedding is a row in the `events` table
- All other tables (`rsvps`, etc.) reference `event_id` as a foreign key
- There is no global or "default" wedding — context is always scoped to an event

### 2. Slug identifies every wedding page
- Every event has a unique `slug` (e.g. `thabang-emihle-2026`)
- The Next.js route is `/[slug]` — never `/`
- The slug is used to look up the `event_id` at page load
- Slugs are lowercase, hyphen-separated, never contain spaces or special characters

### 3. Every RSVP insert must include `event_id`
- RSVPs without an `event_id` are **invalid** and must never be written
- `event_id` is a `NOT NULL` foreign key on the `rsvps` table
- The `RSVPForm` component receives `eventId` as a required prop — it cannot be rendered without it

### 4. Never generate or modify an event without explicit confirmation
- Before creating a new event row, a new slug, or modifying event details, **stop and ask for clarification**
- Ask: couple names, wedding date, venue, slug, and any custom content
- Do not infer or guess any of these values

### 5. Never allow RSVPs without an event context
- If `eventId` is undefined, null, or not yet loaded, the RSVP form must not render
- Show a loading state or an error — never a blank or broken form

---

## PRODUCTION SAFETY RULES

> These rules apply to all Supabase operations — reads that mutate, inserts, updates, and deletes. A confirmed intent from the user in the current message is not enough; the rule requires a **dedicated confirmation step** before execution.

### No database mutation without a user confirmation step
Before executing any of the following, stop and display exactly what will run, then wait for explicit approval:
- `INSERT` into any table
- `UPDATE` on any row
- `DELETE` or `TRUNCATE` on any table
- Any migration or schema change (`ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`)
- Any RLS policy change

**Required confirmation format** — show this before every mutation:
```
Action:  INSERT into rsvps
Data:    { event_id: "...", name: "...", attending: true, ... }
Table:   rsvps
Risk:    Irreversible

Proceed? (yes / no)
```
Do not execute until the user replies with an explicit "yes" or equivalent.

### Never auto-create or change default events
- "Default event" means the first or only event in the `events` table, or any event used as a fallback
- Treat every existing event row as **read-only** unless the user explicitly names the event and the field to change
- Never infer that "the current event" should be updated based on context from earlier in the conversation
- Never silently update `slug`, `wedding_date`, `venue_name`, or any other event field as a side effect of another task

### Always confirm the slug before any event operation
- Before creating a new event: display the proposed slug and wait for confirmation
- Before updating an event: confirm which slug (i.e. which event) is being targeted
- A slug confirmation must be a standalone step — it cannot be bundled with code generation or other output

### Treat the Thabang & Emihle event as read-only by default
- Slug: `thabang-emihle-2026`
- This is a live production event. Never modify its row in `events` unless the user explicitly says "update the Thabang & Emihle event" and names the specific field
- Do not use it as a template or staging target for other clients

### Always ask before modifying Supabase data
Even if the user's message implies a change (e.g. "fix the venue address"), do not execute a Supabase `UPDATE` — ask first:
1. Confirm the target event (by slug)
2. Show the current value and the proposed new value
3. Wait for explicit approval before running anything

---

## AUTO DEPLOYMENT RULE (MANDATORY)

> This applies to every code change in this project, no exceptions. Never output a code change without the full Git + deployment block below.

### 1. Scope changes correctly
- Modify only the files required for the task
- Do not touch unrelated components or config

### 2. Always output Git instructions after any code change

```bash
git add <changed-files>
git commit -m "describe what changed and why"
git push origin main
```

- Use specific file paths in `git add`, not `git add .`, so the user can review exactly what is staged
- Commit message must describe the change clearly (e.g. `fix: RSVPForm null guard on eventId` not `update code`)

### 3. Always include this deployment reminder

> Vercel will auto-deploy this change after push. The live site will update within ~1 minute of the push completing.

### 4. Always end with a verification block

After the Git instructions, output exactly this (filled in with real values):

```
Files changed:
  - components/RSVPForm.tsx
  - app/invite/[slug]/page.tsx

Deployment: Vercel will trigger automatically on push to main
Live URL:   https://wedding-invite-system.vercel.app/invite/[slug]
```

### 5. No exceptions
A code change response is incomplete without steps 2, 3, and 4 above. This applies to:
- Bug fixes
- New components
- Supabase schema changes
- Config or environment changes
- Any edit, however small

---

## Agent Flow — 3 Steps for Every New Wedding

Every time a new wedding invite is requested, follow these steps in order. Do not skip or combine steps.

### Step 1 — Intake (ask questions first)
Before writing any code or touching Supabase, ask the following:
- Couple's full names
- Wedding date (day, month, year)
- Venue name and address
- Preferred slug (or generate one from names + year and confirm)
- Colour palette / theme preferences
- Any custom sections needed (schedule, gallery, etc.)
- Background video or images available?
- Music track?

Do not proceed until all required fields are confirmed.

### Step 2 — Planning (define structure before building)
Once intake is complete:
1. Confirm the slug and event details back to the user
2. Write the Supabase `INSERT` for the new `events` row (do not run it yet)
3. Outline which components will be customised vs reused
4. Confirm the plan before touching any code

### Step 3 — Build (generate code + Supabase logic)
Only after explicit approval:
1. Run the Supabase `INSERT` to create the event
2. Scaffold the route at `app/[slug]/page.tsx`
3. Pass `eventId` and `event` data through to all components that need it
4. Wire up `RSVPForm` with the correct `eventId` prop
5. Confirm the page loads and RSVPs insert correctly

---

## Standard Operating Procedure: New Wedding Event

> Follow this exact sequence every time. Steps are gates — each one must be explicitly cleared before the next begins. Never bundle multiple steps into one response.

### Trigger
User provides any combination of: couple names, wedding date, venue, theme. This initiates the SOP regardless of how casually it is phrased.

---

### Gate 1 — Collect Required Inputs

If any of these are missing, ask for them before doing anything else:

| Field | Required | Notes |
|---|---|---|
| Partner A name | Yes | First name or full name |
| Partner B name | Yes | First name or full name |
| Wedding date | Yes | Must be a specific date, not a range |
| Venue name | Yes | |
| Venue address | Yes | Full address for map embed |
| Theme / colour palette | Yes | At least a mood or palette direction |
| Slug | Yes | Propose one, await confirmation — see Gate 2 |
| Custom sections | No | Schedule, gallery, story milestones, etc. |
| Background video/images | No | Note as pending if not provided |
| Music track | No | Note as pending if not provided |

Do not proceed to Gate 2 until all **required** fields are in hand.

---

### Gate 2 — Confirm Slug

Propose a slug derived from the couple's names and year. Display it clearly and wait for explicit approval before any other output.

**Format:**
```
Proposed slug: firstname-lastname-year
             → /invite/firstname-lastname-year

Does this look right? Confirm or provide an alternative.
```

Rules for slug generation:
- Lowercase only
- Hyphens between words — no underscores, no spaces
- Format: `partnera-partnerb-year` (e.g. `thabang-emihle-2026`)
- Must be unique — check against existing slugs if known
- Never reuse or overwrite an existing slug

Do not generate any code or SQL until the slug is confirmed.

---

### Gate 3 — Show Full Event Summary and Await Approval

Once the slug is confirmed, display the complete event record that will be inserted. Do not run anything yet.

**Format:**
```
Event to be created
───────────────────────────────────────
slug:          firstname-lastname-year
partner_a:     [name]
partner_b:     [name]
wedding_date:  YYYY-MM-DD
venue_name:    [venue]
venue_address: [address]
theme:         [palette / mood]
is_published:  false
───────────────────────────────────────
Route:   /invite/firstname-lastname-year
Action:  INSERT into events (no existing rows will be modified)

Confirm to proceed?
```

If the user says anything other than an explicit yes, stop and address their concern first.

---

### Gate 4 — Execute Supabase INSERT

Only after Gate 3 approval:

1. Run the `INSERT` into `events`:
```sql
insert into events (slug, partner_a, partner_b, wedding_date, venue_name, venue_address, theme, is_published)
values (
  'firstname-lastname-year',
  'Partner A',
  'Partner B',
  'YYYY-MM-DD',
  'Venue Name',
  'Full Address',
  '{"palette": [...]}',
  false
)
returning id, slug;
```

2. Capture the returned `id` — this is the `event_id` for all downstream operations.
3. Confirm the insert succeeded before writing any code.

**Safety check:** If a row with the same slug already exists, stop immediately. Do not upsert. Do not overwrite. Report the conflict to the user and await instruction.

---

### Gate 5 — Scaffold the Route

Generate `app/invite/[slug]/page.tsx` using the confirmed slug and returned `event_id`.

The page must:
- Fetch the event server-side using the slug
- Call `notFound()` if no published event matches
- Pass `event` and `event.id` as props to every component that needs them
- Render `<RSVPForm eventId={event.id} />` — never without the prop

**Template:**
```ts
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// import components...

export default async function WeddingPage({ params }: { params: { slug: string } }) {
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!event) notFound();

  return (
    // ... layout with event props passed down
    <RSVPForm eventId={event.id} />
  );
}
```

---

### Gate 6 — Verify RSVP Linkage

Before marking the event as ready, confirm RSVP linkage is correct:

- [ ] `RSVPForm` receives `eventId` as a non-optional prop
- [ ] The Supabase insert in `RSVPForm` includes `event_id: eventId`
- [ ] The `rsvps` table has `event_id` as a `NOT NULL` foreign key referencing `events(id)`
- [ ] A test RSVP insert (if run) returns the correct `event_id` in the response

If any check fails, fix it before proceeding.

---

### Gate 7 — Output Final Delivery Summary

Once all gates are cleared, output exactly this:

```
Wedding invite created
───────────────────────────────────────
Couple:    Partner A & Partner B
Date:      Day Month Year
Venue:     Venue Name
Slug:      firstname-lastname-year
Event ID:  [uuid from Supabase]
Route:     /invite/firstname-lastname-year
Published: false (set is_published = true when ready to go live)
───────────────────────────────────────
RSVP linkage: confirmed — all inserts include event_id
Existing events: not modified
```

To go live: run `update events set is_published = true where slug = 'firstname-lastname-year';` — this requires a separate confirmation step per the Production Safety Rules.

---

### What This SOP Never Does

- Creates an event without Gate 3 approval
- Overwrites or modifies an existing event row at any step
- Generates a slug without displaying and confirming it first
- Renders `RSVPForm` without `eventId`
- Marks `is_published = true` automatically
- Bundles multiple gates into a single response

---

## Data Architecture

### `events` Table — Source of Truth
```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  slug text not null unique,
  partner_a text not null,
  partner_b text not null,
  wedding_date date not null,
  venue_name text,
  venue_address text,
  venue_maps_url text,
  theme jsonb,
  is_published boolean not null default false
);
```

### `rsvps` Table — Always scoped to an event
```sql
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  attending boolean not null,
  plus_one boolean not null default false,
  message text
);

create index rsvps_event_id_idx on rsvps(event_id);
```

### Row Level Security
```sql
-- events: public read of published events only
alter table events enable row level security;
create policy "public read published events"
  on events for select using (is_published = true);

-- rsvps: public insert scoped to a valid event
alter table rsvps enable row level security;
create policy "public insert rsvps"
  on rsvps for insert with check (
    exists (select 1 from events where id = event_id and is_published = true)
  );
```

---

## Routing Architecture

```
app/
  [slug]/
    page.tsx        — fetches event by slug, passes event + eventId to all components
    not-found.tsx   — shown if slug doesn't match any published event
```

### Slug-based page loader (`app/[slug]/page.tsx`)
```ts
// Fetch event server-side; 404 if not found or not published
const { data: event } = await supabase
  .from("events")
  .select("*")
  .eq("slug", params.slug)
  .eq("is_published", true)
  .single();

if (!event) notFound();
```

All child components that need event data receive it as props — they do not fetch independently.

---

## Component Contract

### Components that receive `event` or `eventId` as props

| Component | Required props |
|---|---|
| `RSVPForm` | `eventId: string` (required, non-nullable) |
| `Hero` | `event: Event` |
| `SaveTheDate` | `weddingDate: string` |
| `Invitation` | `partnerA: string`, `partnerB: string` |
| `Venue` | `venueName: string`, `venueAddress: string`, `mapsUrl: string` |
| `Story` | `milestones: Milestone[]` (from event config or hardcoded per client) |

### RSVPForm prop contract
```ts
interface RSVPFormProps {
  eventId: string; // uuid — NEVER optional
}
```
The component must not render if `eventId` is falsy. Guard at the top:
```ts
if (!eventId) return null; // or a loading/error state
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, `"use client"` components) |
| Styling | Tailwind CSS v3 with custom token extensions |
| Animations | Framer Motion v11 |
| Backend / data | Supabase (Postgres + RLS) |
| Confetti | `canvas-confetti` |
| Fonts | Google Fonts via `next/font` |

---

## Design System

### Custom Tailwind Tokens (`tailwind.config.ts`)
| Token | Value | Usage |
|---|---|---|
| `gold` | `#C9A84C` | Accents, borders, labels |
| `gold-dim` | `#8a6e2f` | Dimmed gold states |
| `beige` | `#F5F0E8` | Light text on dark |
| `bg-warm` | `#0d0c0a` | Dark background base |

Custom animation: `shimmer` (3s linear).

### Typography (CSS variables set in `app/layout.tsx`)
| Variable | Font | Usage |
|---|---|---|
| `--font-cormorant` | Cormorant Garamond (300/400/600) | `font-serif` — headings, body |
| `--font-inter` | Inter | `font-sans` — labels, UI text |
| `--font-great-vibes` | Great Vibes | `font-script` — names, section titles |

### Animation Rules
- All motion via Framer Motion — no raw CSS animations (except `animate-pulse`)
- Entry animations: `opacity: 0 → 1`, `y: 20 → 0`, `duration: 1–1.2s`, `ease: "easeOut"`
- `useInView` with `{ once: true }` — animate once on scroll into view
- Slow, cinematic pacing — no bouncy or aggressive motion

---

## Current Live Event: Thabang & Emihle

**Slug:** `thabang-emihle-2026`  
**Wedding Date:** 21 June 2026  
**Venue:** The Saxon Hotel, 36 Saxon Road, Sandhurst, Johannesburg, 2196

### Page Structure
```
MusicProvider
  ├── Hero              — video bg, couple names, countdown
  ├── SaveTheDate       — scratch card date reveal
  ├── Invitation        — parallax rings + formal invite text
  ├── Story             — timeline + confetti (4 milestones: 2018, 2020, 2022, 2026)
  ├── Venue             — Saxon Hotel + Google Maps embed
  ├── DressCode         — colour palette + inspiration gallery
  ├── RSVPForm          — eventId prop required
  ├── EnvelopeIntro     — fixed overlay z-50, removed after open
  └── MusicPlayer       — fixed bottom-right z-200
```

**Commented out (built but disabled):**
- `Schedule` — `components/Schedule.tsx`
- `Gallery` — `components/Gallery.tsx`

---

## Component Reference

### `EnvelopeIntro`
- Fixed overlay (`z-50`) covering the full site on load
- Five layered PNGs: `top`, `bottom`, `left`, `right`, `wax` from `/public/images/envelope/`
- Wax seal: spring entrance → breathing idle loop → exit on click
- On click: music starts via `useMusic().play()`, envelope flies apart, fades out, unmounts
- Triggers `onFinish` → `page.tsx` sets `introDone = true` after 300ms

### `Hero`
- Looping `.webm` background: `/public/images/hero/Hero.webm`
- Couple names, "X days away" countdown to `weddingDate`
- `mounted` flag delays render to avoid hydration mismatch on countdown
- Corner ornament brackets, radial gold glow, scroll chevrons

### `SaveTheDate`
- Three `<canvas>` scratch boxes: Day / Month / Year
- Warm gold surface with hatching texture; `destination-out` composite erases to reveal value
- At >50% pixel coverage cleared, `canvas-confetti` fires from the element's viewport position
- `ScratchBox` is a self-contained sub-component

### `Invitation`
- Parallax wedding rings image rises on scroll using `useScroll` + `useTransform`
- White invite card at `z-20` floats in front of rings
- Staggered fade-in: glyph → salutation → rings → body

### `Story`
- Animated confetti (36 stable pre-generated pieces)
- Milestones array: year, title, body — alternating left/right entrance
- Timeline spine: gold dot + vertical line

### `Venue`
- Venue name, address, Google Maps embed (16:9)
- Corner gold accent lines on map frame
- "Get Directions →" external link

### `DressCode`
- Colour palette swatches: Amber, Blush, Sage, Dusty Blue, Navy
- Inspiration gallery: 2-col mobile / 4-col desktop from `/public/images/DressCode/`

### `RSVPForm`
- Required prop: `eventId: string`
- Fields: Full Name, Attending (yes/no), Plus One (conditional), Message (optional)
- Inserts to `rsvps` with `event_id` — **will not submit without it**
- Post-submit: `AnimatePresence` swaps form for personalised confirmation
- Error state inline below fields

### `MusicPlayer`
- Appears only after `hasStarted` is true (context flag)
- Fixed bottom-right, `z-200`, 48×48px circular button with pulsing ring when playing

### `MusicContext` (`context/MusicContext.tsx`)
- Lazy `<audio>` via `useRef`; file: `/public/audio/The Only Reason.mp3`, looping
- `play()`: starts + fades volume 0 → 0.65 over ~2.6s
- `toggle()`: pauses/resumes without fade

---

## Supabase Setup

### Environment Variables (`.env.local`)
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

## Folder Structure

```
/app
  [slug]/
    page.tsx          — fetches event by slug, passes data to components
    not-found.tsx     — 404 for unknown slugs
  layout.tsx          — fonts, metadata, root HTML
  globals.css         — base Tailwind + global resets

/components
  EnvelopeIntro.tsx
  Hero.tsx
  SaveTheDate.tsx
  Invitation.tsx
  Story.tsx
  Venue.tsx
  DressCode.tsx
  RSVPForm.tsx        — requires eventId prop
  MusicPlayer.tsx
  SectionDivider.tsx
  Schedule.tsx        — built, currently disabled
  Gallery.tsx         — built, currently disabled

/context
  MusicContext.tsx

/lib
  supabaseClient.ts

/public
  /audio              — The Only Reason.mp3
  /images
    /envelope         — top.png, bottom.png, left.png, right.png, wax.png
    /hero             — Hero.webm
    /Invitation       — Invitation.png
    /DressCode        — Babypink.JPG, Blue.JPG, Pink.JPG, brown.JPG
```

---

## How to Restart the Project

```bash
npm install
cp .env.local.example .env.local
# → fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# → open http://localhost:3000/thabang-emihle-2026
```

Run the SQL in the **Data Architecture** section above if the Supabase tables don't exist yet. Insert the Thabang & Emihle event row before testing.

---

## Coding Rules

- Functional React components only (`"use client"` where needed)
- Tailwind classes for all styling (no inline CSS unless for dynamic values)
- Framer Motion for all animations — no CSS keyframe animations
- `useInView` with `{ once: true }` for scroll-triggered animations
- No comments unless the logic is genuinely non-obvious
- Never hardcode event data — always pass via props from the slug-based page loader

---

## Tone

Everything should feel:
- Elegant and intentional
- Cinematic and slow-paced
- Emotionally engaging

Avoid anything generic, overly flashy, or template-like.
