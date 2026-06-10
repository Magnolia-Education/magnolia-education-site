import React from 'react';

/**
 * Magnolia Button — the coral CTA and its quieter companions.
 * Rounded, soft, lifts a touch on hover. Never sharp, never loud.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  disabled = false,
  fullWidth = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '9px 20px', fontSize: '0.85rem' },
    md: { padding: '13px 30px', fontSize: '0.95rem' },
    lg: { padding: '16px 38px', fontSize: '1.02rem' },
  };

  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 'var(--radius-sm)',
    border: '2px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    transition: 'background var(--dur) var(--ease), color var(--dur) var(--ease), transform var(--dur-fast) var(--ease), box-shadow var(--dur) var(--ease)',
    opacity: disabled ? 0.5 : 1,
    ...sizes[size],
  };

  const variants = {
    primary: { background: 'var(--coral)', color: '#fff', boxShadow: 'var(--shadow-cta)' },
    secondary: { background: 'transparent', color: 'var(--navy)', borderColor: 'var(--navy)' },
    white: { background: '#fff', color: 'var(--navy)', boxShadow: 'var(--shadow-sm)' },
    'outline-white': { background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.5)' },
    ghost: { background: 'transparent', color: 'var(--coral)', padding: '6px 4px' },
  };

  const hoverFor = (e, on) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === 'primary') {
      el.style.background = on ? 'var(--coral-hover)' : 'var(--coral)';
      el.style.transform = on ? 'var(--lift)' : 'none';
    } else if (variant === 'secondary') {
      el.style.background = on ? 'var(--navy)' : 'transparent';
      el.style.color = on ? '#fff' : 'var(--navy)';
    } else if (variant === 'white') {
      el.style.transform = on ? 'var(--lift)' : 'none';
    } else if (variant === 'outline-white') {
      el.style.borderColor = on ? '#fff' : 'rgba(255,255,255,0.5)';
      el.style.background = on ? 'rgba(255,255,255,0.06)' : 'transparent';
    } else if (variant === 'ghost') {
      el.style.opacity = on ? 0.7 : 1;
    }
  };

  const Tag = href ? 'a' : as;
  return (
    <Tag
      href={href}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => hoverFor(e, true)}
      onMouseLeave={(e) => hoverFor(e, false)}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
