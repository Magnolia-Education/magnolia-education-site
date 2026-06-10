Magnolia's CTA button — coral primary for the single most important action, with quieter secondary, ghost, and on-navy (white / outline-white) variants.

```jsx
<Button href="https://calendly.com/hello-magnolia-education/30min" variant="primary">
  Book a Consultation
</Button>
<Button variant="secondary">Explore Tutoring</Button>
```

- `variant`: `primary` (coral, the default CTA — text is almost always "Book a Consultation"), `secondary` (outline navy), `white` + `outline-white` (for navy sections), `ghost` (coral text link, e.g. "Learn more →").
- `size`: `sm` / `md` / `lg`. `href` makes it an `<a>`. Lifts 2px on hover; never use more than one primary per view.
