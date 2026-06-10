import React from 'react';

/**
 * Testimonial card — gold stars, an italic quote, and an attributed author.
 * White, softly rounded, the brand's warm shadow.
 */
export function TestimonialCard({ quote, author, role, rating = 5, style = {}, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: '28px 28px 24px',
        ...style,
      }}
      {...rest}
    >
      <div style={{ color: 'var(--star)', fontSize: '0.95rem', letterSpacing: '2px', marginBottom: '14px' }} aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(rating)}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--ink)', fontStyle: 'italic', margin: '0 0 20px' }}>
        &ldquo;{quote}&rdquo;
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', color: 'var(--navy)', margin: 0 }}>
        {author}
      </p>
      {role && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ink-soft)', margin: '2px 0 0' }}>{role}</p>}
    </div>
  );
}
