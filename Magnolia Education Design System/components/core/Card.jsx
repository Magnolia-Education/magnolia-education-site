import React from 'react';

/**
 * Magnolia content card — white, softly rounded, navy-tinted shadow.
 * Optional accent variants tint the ground (coral-pale) or invert to navy.
 */
export function Card({ children, variant = 'plain', interactive = false, padding = '28px 30px', style = {}, ...rest }) {
  const variants = {
    plain: { background: 'var(--surface-card)', color: 'var(--ink)' },
    accent: { background: 'var(--coral-pale)', color: 'var(--ink)' },
    sky: { background: 'var(--gradient-sky)', color: 'var(--navy)' },
    navy: { background: 'var(--navy)', color: 'var(--on-dark)' },
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        boxShadow: variant === 'navy' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        padding,
        transition: 'transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
        cursor: interactive ? 'pointer' : 'default',
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={interactive ? (e) => { e.currentTarget.style.transform = 'var(--lift)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; } : undefined}
      onMouseLeave={interactive ? (e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
