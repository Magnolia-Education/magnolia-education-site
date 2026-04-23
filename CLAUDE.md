# CLAUDE.md — Magnolia Education Website

Claude Code reads this file automatically at the start of every session. Follow everything here.

---

## Project Overview

Magnolia Education — premium tutoring business (Mississauga/Toronto). This repo is the marketing website.

- **Repo:** `Magnolia-Education/magnolia-education-site`
- **Local path:** `C:\Users\rachi\Desktop\magnolia-website`
- **Hosting:** Netlify (auto-deploys on push to `main`)
- **Preview URL:** `lucent-bunny-d11129.netlify.app`
- **Production domain:** `magnolia-education.com` (Cloudflare DNS)
- **Old domain:** `magnoliatutoring.com` (Redirecting to magnolia-education.com)

---

## BUILD / TEST / AUDIT Workflow

Every change follows this sequence. No exceptions.

### 1. BUILD

- Make the requested change
- Keep changes minimal and scoped — don't refactor unrelated code
- If a change touches layout or visual styling, describe exactly what you changed and why

### 2. TEST

- Run any available linting or validation (HTML validation, broken link checks, etc.)
- Open the modified page(s) locally to verify: `start <filename>.html` in PowerShell
- Confirm the change renders correctly at desktop AND mobile widths
- If you cannot visually verify, explicitly say so and list what Rachit should check

### 3. AUDIT

- Before marking done, review your own changes:
  - Did you break anything else on the page?
  - Did you accidentally remove or overwrite existing content?
  - Are all image paths correct and relative?
  - Does the HTML validate?
- List any side effects or risks

### 4. WAIT FOR APPROVAL

- Saving and committing locally is fine — do that as you go
- **NEVER `git push` or deploy without Rachit's explicit approval**
- Present a summary: what changed, what was tested, what to verify
- Rachit verifies locally, then gives the go-ahead to push

---

## Code Conventions

### HTML/CSS
- Single-file pages (HTML with inline or linked CSS/JS)
- All image paths relative to repo root (e.g., `images/filename.png`)
- Filenames may have spaces — handle accordingly
- Use semantic HTML
- Mobile-responsive — test at 375px and 1440px minimum
- Copyright year: 2026
- CTA text everywhere: "Book a Consultation"

### Images
- Illustrations have whitespace padding baked into the files
- **NEVER guess `transform: scale()` values** — if an image tuner config JSON exists, read values from there. If it doesn't exist yet, ask Rachit for the values or flag that they need to be set manually
- Tutor headshots are in `images/` folder, some filenames have spaces
- Headshots support optional `photoPosition` field in `content.js`

### Content
- Dynamic content lives in `content.js`
- Real testimonial names are used (sourced from Google Doc "Previous Testimonials - Magnolia Tutoring")
- Newsletter sections are currently commented out (Kit not yet set up)

---

## Page-Specific Notes

### index.html
- Service cards: alternating full-width rows (image left/right, text opposite)
- Founder photo: `object-fit: contain`, never crop
- Pronunciation guide for "Rachit" included
- Real testimonials with attribution names
- "Join Our Team" links to contact.html
- Footer: email on one line, tagline updated

### tutoring.html
- "How Tutoring Works" — 4-step section (replaced old session types)
- Book tower illustration — should be large/prominent
- Technology and Mindfulness sections alternate
- "Straight-A Reviews" section is commented out

### study-skills.html
- "What's Included" section: salmon/pink background, 3×2 grid of WHITE ROUNDED CARDS with shadow
- Each card: pink/peach square (72×72px) behind icon PNG, icon on top, label, then short description paragraph below
- Description text: smaller font (~14px), muted color, centered
- Icons: strength.png, pencil.png, lighteningbolt.png, lightbulb.png, beauty.png, speech bubbles.png
- All icon styles from magnolia-image-config.json — never hardcode

### mock-exams.html
- Step 1 image → `5ExamExhale.png`
- Step 3 image → `6Mockexampage.png`
- Philosophy section image removed

### contact.html
- "Let's Talk" section kept
- Contact form via Netlify Forms
- Calendly embed stays
- "Book a Consultation" button above the "30 min" text

### tutors.html
- Tutor data driven by `content.js`
- Headshot filenames have spaces
- `photoPosition` field controls cropping

---

## What NOT To Do

- **Never `git push` without approval** — local saves and commits are fine
- **Never guess image scale/position values**
- **Never remove or overwrite content without being asked to**
- **Never refactor unrelated code while fixing a bug**
- **Never change page structure/layout unless explicitly requested**
- If unsure about anything, ask rather than assume

---

## Image Tuning Workflow

ALL image styling on this site is controlled by `magnolia-image-config.json` in the repo root. This is the single source of truth for every image's scale, position, fit, border-radius, and container dimensions.

### Rules

1. **NEVER guess or invent image CSS values.** Always read magnolia-image-config.json first.
2. **NEVER hardcode scale, object-position, object-fit, or container dimensions** without checking the config.
3. When adding or modifying any image on any page, look up its entry in the config by filename. Apply these properties exactly:
   - `transform: scale({scale})`
   - `transform-origin: center`
   - `object-fit: {objectFit}`
   - `object-position: {objectPositionX}% {objectPositionY}%`
   - `border-radius: {borderRadius}px`
   - Container width: `{containerWidth}px`
   - Container height: `{containerHeight}px`
4. If an image is NOT in the config, do NOT style it yourself. Flag it and ask Rachit to tune it in the image tuner first.
5. When Rachit provides an updated magnolia-image-config.json, re-read it and apply any changed values.

### Config format

Each entry is keyed by image path (e.g. `"images/MAGNOLIATREE.PNG"`) and contains:
```json
{
  "scale": 1.6,
  "objectPositionX": 100,
  "objectPositionY": 30,
  "objectFit": "cover",
  "borderRadius": 7,
  "containerWidth": 460,
  "containerHeight": 460,
  "page": "tutoring.html",
  "section": "Hero Section",
  "id": "tut-hero"
}
```

### Dev tool

The image tuner lives at `/dev/image-tuner.html`. Rachit uses this to visually dial in values and export the config JSON. Claude Code never modifies the tuner tool unless explicitly asked.
