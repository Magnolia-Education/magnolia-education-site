import React from 'react';

/**
 * The section signature: a coral uppercase eyebrow, a Cormorant serif title, and an
 * optional muted subtitle. Used at the top of nearly every section.
 */
export function SectionHeading({ eyebrow, title, subtitle, align = 'left', onDark = false, style = {}, ...rest }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? '680px' : undefined, marginInline: align === 'center' ? 'auto' : undefined, ...style }} {...rest}>
      {eyebrow && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--coral)', margin: '0 0 16px' }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--display-1)', lineHeight: 1.18, letterSpacing: 'var(--tracking-display)', color: onDark ? '#fff' : 'var(--navy)', margin: 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: 'var(--leading-body)', color: onDark ? 'var(--on-dark-soft)' : 'var(--ink-soft)', margin: '18px 0 0', maxWidth: '620px', marginInline: align === 'center' ? 'auto' : undefined }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
