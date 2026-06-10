import React from 'react';

/**
 * Small label — an uppercase coral "eyebrow", a rounded status pill, or the
 * coral-pale deadline capsule used across the site.
 */
export function Badge({ children, variant = 'eyebrow', tone = 'coral', style = {}, ...rest }) {
  const tones = {
    coral: { bg: 'var(--coral-pale)', fg: 'var(--coral)', border: 'rgba(232,131,106,0.28)' },
    navy: { bg: 'rgba(61,68,102,0.08)', fg: 'var(--navy)', border: 'var(--line-strong)' },
    success: { bg: 'var(--success-bg)', fg: 'var(--success)', border: 'transparent' },
    warning: { bg: 'var(--warning-bg)', fg: 'var(--warning)', border: 'transparent' },
    error: { bg: 'var(--error-bg)', fg: 'var(--error)', border: 'transparent' },
    info: { bg: 'var(--info-bg)', fg: 'var(--info)', border: 'transparent' },
  };
  const t = tones[tone] || tones.coral;

  if (variant === 'eyebrow') {
    return (
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--coral)',
          ...style,
        }}
        {...rest}
      >
        {children}
      </span>
    );
  }

  const isPill = variant === 'pill' || variant === 'capsule';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        fontFamily: 'var(--font-body)',
        fontSize: variant === 'status' ? '0.66rem' : '0.8rem',
        fontWeight: 600,
        letterSpacing: variant === 'status' ? '0.06em' : '0.01em',
        textTransform: variant === 'status' ? 'uppercase' : 'none',
        color: t.fg,
        background: t.bg,
        border: variant === 'capsule' ? `1px solid ${t.border}` : '1px solid transparent',
        borderRadius: 'var(--radius-pill)',
        padding: variant === 'status' ? '4px 11px' : '8px 16px',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
