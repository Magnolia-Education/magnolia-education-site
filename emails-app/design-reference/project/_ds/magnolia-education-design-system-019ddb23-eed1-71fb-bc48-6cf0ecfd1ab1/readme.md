# Magnolia Education — Design System

The brand layer that students and parents *experience*. Magnolia Education is a premium online math tutoring company in Toronto — 100+ students, personalized 1-on-1 tutoring, run by founder **Rachit Chakerwarti**. Warm, editorial, boutique. The feeling to chase: *a handwritten note from a great teacher, elevated.*

Underneath sits the **Magnolia Math Suite**, a SaaS tutoring platform (whiteboard + student/tutor/parent hubs + AI tutor) that will eventually white-label to other companies. **This design system is not the SaaS chrome — it is the Magnolia Education brand skin** applied to everything a family touches: branded HTML emails (React Email + Resend), the student hub, and parent-facing communications. Parents don't buy software; they buy a trusted teacher for their kid. Nothing here should feel corporate or SaaS-templated.

> **Why a brand layer, separately?** The Math Suite repo ships a placeholder "Soft & Studious" palette (warm browns + gold) whose own CSS says *"swap for Rachit's exact brand kit later."* **This is that kit.** Navy + coral + beige, Cormorant + DM Sans. The Student Hub UI kit here shows the portal re-skinned in the real brand.

---

## Sources (for whoever maintains this)

You may not have access — these are recorded so you can go deeper if you do.

- **Marketing website** (primary brand source of truth): `Magnolia-Education/magnolia-education-site` — https://github.com/Magnolia-Education/magnolia-education-site . Single-file HTML pages; all copy + tutor data in `content.js`; image styling driven by `magnolia-image-config.json`. Worth exploring further to build accurate page recreations.
- **Math Suite (SaaS platform)**: `Magnolia-Education/magnolia-math-suite` — https://github.com/Magnolia-Education/magnolia-math-suite . Next.js + Tailwind 4 + Supabase. The `app/portal/*` routes (dashboard, schedule, boards, tutor) are what the Student Hub kit re-skins. Carries a *placeholder* palette — defer to the tokens here.
- **Brand assets reference**: `uploads/magnolia-brand-assets (1).html` (colors + type spec).
- **Illustrations & icons**: a mounted `images/` folder — copied into `assets/`.

---

## Content Fundamentals — how Magnolia writes

The voice is the product. It is **a real person (Rachit) talking to one family**, never a company addressing a market.

- **Person & address.** First person singular — *"I started Magnolia because…"*, *"I've struggled and I've triumphed."* The reader is *you* / your kid by name (*"Hi Sarah,"* *"Dylan had a strong month."*). Plural *we* only for the team and philosophy.
- **Warm, direct, a little vulnerable.** Admits the hard parts: *"Not always the student I wanted to be."* *"From 33% to 100%."* Confidence without bravado.
- **Always signed Rachit.** Emails and founder notes close with *"— Rachit"*, often with the pronunciation aside: ***(pronounced Rutch-it, like "Dutch" with an R)***. Use it on first contact; it's a signature charm, not a gimmick to repeat every time.
- **Casing.** Sentence case everywhere — headlines, buttons, nav. The one exception: testimonial author names in **CAPS** (`KRISTY FLETCHER`), and uppercase coral eyebrows (`WHAT WE OFFER`). The standing CTA text is **"Book a Consultation."**
- **Titles love an italic turn.** Display headlines pivot on an italic coral phrase: *"Better grades. **And a better way to get them.**"* · *"So glad your family is **here.**"*
- **Concrete over corporate.** Real numbers and real moments: *"a celebration cookie for every student,"* *"88% · up from 79%,"* *"a calming breath, then get to work."* No growth-speak, no "leverage," no "solutions."
- **Philosophy words** recur and are safe to lean on: *Seva* (selfless service), *Independence* ("tutors should make themselves unnecessary"), *Mindfulness*, *Beauty* (of math). Process Grade > final grade.
- **Emoji:** sparingly and purposefully — 🌸 (the magnolia, brand signature in footer fun-facts), ⏰ on deadlines, 📅 on dates, 🍪 the celebration cookie. Never a wall of emoji; one accent at a time.

---

## Visual Foundations

**The mood:** generous whitespace, soft edges, warm paper. Cool blue skies as the calm counterweight to coral warmth. Nothing boxy, nothing sharp, nothing loud.

- **Color.** Navy `#3D4466` carries all headings, body text, the nav bar and the founder/CTA grounds. Coral `#E8836A` is the single accent — CTAs, eyebrows, italic emphasis, links — used as a *spark*, never a field. Coral-pale `#FDF0EC` and beige `#EDE8E0` are the soft section grounds; cream `#FBF8F2` is the warm page ground. A blue-mist gradient (`#E2EAF2 → #D4E5EE`) backs heroes and illustration panels. The hand-drawn art adds blossom pink, leaf green, butter and sky — pulled into tokens as *accents only*. Footers go dark navy `#2A2D40`. See `tokens/colors.css`.
- **Type.** Two families, total. **Cormorant Garamond** (serif) for all display — set **medium (500)**, never bold-and-tight, often with an *italic coral* phrase for emphasis. **DM Sans** for everything functional — body, UI, the uppercase eyebrows (600 / 0.16em tracking / coral). Big, comfortable display sizes; body at 1.7 line-height. See `tokens/typography.css`.
- **Backgrounds.** Flat warm grounds (cream / beige / coral-pale) and the one blue-mist gradient. **No** busy gradients, no mesh, no texture noise, no dark mode. Illustrations sit on the sky gradient or plain cream — never inside a hard-edged box.
- **Imagery = hand-drawn pastel illustration.** This is the soul of the brand: loose, editorial, full-color line-and-wash scenes — a magnolia tree two students study under, a kid surfing an A+ paper through clouds, a vine-wrapped book tower, a cookie trophy. Warm and whimsical, lots of baked-in white space (scale up ~1.2–1.6 to fill a panel). Drop them in on transparent PNG; soft `drop-shadow(0 20px 60px rgba(61,68,102,.15))` when floating, no shadow inside a panel. **Never** stock photos, **never** AI-gradient blobs, **never** hand-rolled SVG facsimiles. Real headshots (warm, natural) for tutors.
- **Corners & cards.** Soft radii throughout: 8px buttons, 14px cards, 20px image panels, 28px feature blocks, pill badges. Cards are white with a **navy-tinted** two-layer shadow (`--shadow-sm`) so depth reads as resting on warm paper, not grey. No hard borders except hairlines (`--line`, navy at 12% alpha).
- **Motion & states.** Gentle and quick (150–200ms, soft ease) — never bouncy, never long. Buttons and cards **lift 2px** on hover; the primary coral CTA also darkens to `--coral-hover` `#D96E54` and carries a soft coral glow. Secondary buttons fill navy on hover. Tiles warm to coral-pale. Scroll-reveal is a 650ms fade-and-rise. Reduced-motion shows end states. No press-shrink, no parallax, no infinite loops.
- **Layout.** 1120px max content column, 48px side padding, ~100px section rhythm. Marketing pages alternate full-width feature rows (image left / right). Sticky navy nav. Plenty of air — when in doubt, add space.

---

## Iconography

Magnolia has **two** distinct icon registers — keep them apart.

1. **Brand doodle icons** (`assets/icons/`) — small, single-weight **navy hand-drawn line** doodles: `rocket`, `strength`, `lightbulb`, `lightning-bolt`, `pencil`, `a-plus`, `speech-bubbles`, `beauty`, `computer`. Transparent PNGs, sketchy and personal — they match the illustration hand. Use them as **feature markers** (sitting in a 72px coral-pale tile), *not* as functional UI controls. Never recolor them; never substitute a geometric icon-font glyph for them.
2. **Functional UI icons** — for the app/portal (nav, buttons, chrome) the Math Suite uses **[Lucide](https://lucide.dev)** (thin, rounded line icons). The Student Hub kit loads Lucide from CDN (`layout-dashboard`, `calendar`, `target`, `user`, `lock`, `mail`, `external-link`). Stick with Lucide for any new portal UI — it's the closest match to the brand's light line weight. *(Lucide is a documented choice in the real repo, not a substitution.)*

**Emoji as icons:** only the curated set above (🌸 ⏰ 📅 🍪), and only inline in copy. **Unicode glyphs:** `★` for testimonial stars (gold `--star`), `→` on text links. That's the whole vocabulary — resist adding more.

> **Font note:** Cormorant Garamond + DM Sans are the *exact* brand fonts (no substitution). They load from the Google Fonts CDN via `tokens/fonts.css`. If you want self-hosted woff2 for offline/production, drop them in and replace the `@import` with local `@font-face` — flag to Rachit either way.

---

## What's in here (manifest)

```
styles.css                  ← the single entry point consumers link
tokens/
  fonts.css                 Cormorant Garamond + DM Sans (Google CDN)
  colors.css                brand core, neutrals, pastels, semantic + aliases
  typography.css            families, weights, display & body scales
  spacing.css               spacing, radius, shadow, motion
guidelines/                 foundation specimen cards (Design System tab)
assets/
  logo/                     magnolia-flower.png
  illustrations/            13 hand-drawn pastel scenes + founder portrait
  icons/                    9 navy doodle icons
  headshots/                tutor photos
components/
  core/        Button · Badge · Card · Avatar
  forms/       Input (+ textarea)
  marketing/   SectionHeading · TestimonialCard · FeatureRow
  portal/      StatTile · SessionRow
ui_kits/
  emails/      branded transactional email templates (welcome, mock-exam, parent update)
  student-hub/ portal dashboard, re-skinned in the real brand
  website/     marketing homepage recreation
SKILL.md                    Agent Skill entry point
```

**Components** are React (`window.MagnoliaEducationDesignSystem_019ddb.<Name>`), styled purely with the CSS custom properties — no CSS-in-JS libs, no packages. Each ships a `.d.ts` (props), a `.prompt.md` (when/how), and a directory card. **UI kits** are self-contained HTML recreations that compose the same tokens; open any `index.html`.

**To build something new:** link `styles.css`, reach for the tokens, compose the components, drop in real illustrations from `assets/`, and write in Rachit's voice. When in doubt — warmer, softer, more personal.
