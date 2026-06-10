import React from 'react';

/**
 * Avatar — initials on a soft coral ground, or a photo. Used in the student hub
 * sidebar and tutor cards.
 */
export function Avatar({ name = '', src, size = 40, style = {}, ...rest }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const dim = typeof size === 'number' ? `${size}px` : size;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: dim, height: dim, borderRadius: '999px', objectFit: 'cover', objectPosition: 'center top', display: 'block', ...style }}
        {...rest}
      />
    );
  }

  return (
    <span
      style={{
        width: dim,
        height: dim,
        borderRadius: '999px',
        background: 'var(--coral-pale)',
        color: 'var(--coral)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: `calc(${dim} * 0.4)`,
        flex: 'none',
        ...style,
      }}
      aria-label={name}
      {...rest}
    >
      {initials}
    </span>
  );
}
