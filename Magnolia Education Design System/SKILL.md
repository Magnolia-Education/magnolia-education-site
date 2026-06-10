---
name: magnolia-education-design
description: Use this skill to generate well-branded interfaces and assets for Magnolia Education — a premium, warm, editorial math-tutoring brand (Toronto). Covers branded HTML emails, the student hub, parent communications, and the marketing site. Contains essential design guidelines, colors, type, fonts, illustrations, icons, and UI kit components for production or throwaway prototypes/mocks.
user-invocable: true
---

# Magnolia Education — Design Skill

Read **`readme.md`** first — it is the full design guide (company context, content/voice fundamentals, visual foundations, iconography, and the file manifest). Then explore the other files.

Quick map:
- **`styles.css`** — the one stylesheet to link. It `@import`s every token file (`tokens/colors.css`, `typography.css`, `spacing.css`, `fonts.css`). Build with the CSS custom properties it defines.
- **`assets/`** — real brand assets: the magnolia logo, 13 hand-drawn pastel illustrations, 9 navy doodle icons, tutor headshots. **Copy these out and reference them** — never redraw them as SVG or generate new ones.
- **`components/`** — React primitives (Button, Badge, Card, Avatar, Input, SectionHeading, TestimonialCard, FeatureRow, StatTile, SessionRow). Each has a `.prompt.md` with usage.
- **`ui_kits/`** — full-screen recreations to copy from: `emails/`, `student-hub/`, `website/`.
- **`guidelines/`** — foundation specimen cards (colors, type, spacing, brand).

The brand in one breath: *a handwritten note from a great teacher, elevated.* Navy + coral on warm cream/beige, Cormorant Garamond display + DM Sans body, generous whitespace, soft rounded corners, hand-drawn pastel illustrations, and a warm first-person voice that's **always signed Rachit**. Never corporate, never SaaS-templated.

## How to work

If creating **visual artifacts** (slides, mocks, throwaway prototypes, emails): copy the assets you need into your working folder and produce **static HTML** the user can open. Link `styles.css` or inline the tokens.

If working on **production code**: copy assets and read the rules here to become an expert in the brand — match the voice, the color discipline (coral as a spark, not a field), the type pairing, and the illustration-first imagery.

If the user invokes this skill with no other guidance, ask what they want to build, ask a few sharp questions (audience: parent vs student? surface: email / hub / site? tone), then act as an expert designer who outputs HTML artifacts *or* production code as the need dictates.
