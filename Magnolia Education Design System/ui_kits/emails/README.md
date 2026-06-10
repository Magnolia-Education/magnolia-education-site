# Email Templates — UI Kit

Branded transactional emails for **React Email + Resend**. Open `index.html` for three reference templates:

- **Welcome** — new family, warm first contact, signed Rachit with pronunciation.
- **Mock-exam reminder** — date/time detail block, calm encouragement, the cookie note.
- **Parent monthly update** — progress detail rows + a parent testimonial.

**Structure (email-safe):** a 600px white column, rounded 16px, with a navy logo header → soft hero (sky gradient or coral-pale) with a serif headline (italic coral pivot) → body copy → optional detail card → coral CTA button → signature (*"— Rachit"*) → dark-navy footer. Voice is first-person, addressed to the family by name. Always close as Rachit.

When porting to React Email, swap the flex/grid for `<Table>`/`<Row>`/`<Column>` and keep the same tokens (navy `#3D4466`, coral `#E8836A`, coral-pale `#FDF0EC`, Cormorant headings, DM Sans body).
