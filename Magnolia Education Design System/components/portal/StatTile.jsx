import React from 'react';

/**
 * Student-hub stat tile — a small label, a value, an optional sub-line, with the
 * warm coral-pale hover lift. Links somewhere in the portal.
 */
export function StatTile({ label, value, sub, href = '#', style = {}, ...rest }) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
        textDecoration: 'none',
        transition: 'transform var(--dur) var(--ease), background var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'var(--lift)'; e.currentTarget.style.background = 'var(--coral-pale)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      {...rest}
    >
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--coral)', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', margin: '6px 0 0' }}>{value}</p>
      {sub && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-soft)', margin: '2px 0 0' }}>{sub}</p>}
    </a>
  );
}
