import React from 'react';

/**
 * Alternating feature row — a hand-drawn illustration on a soft sky panel beside a
 * tag / serif title / body / link. The backbone of the marketing pages.
 */
export function FeatureRow({ tag, title, body, linkLabel, linkHref = '#', image, imageAlt = '', reverse = false, imageScale = 1.4, style = {}, ...rest }) {
  const textCol = (
    <div>
      {tag && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--coral)', margin: '0 0 14px' }}>{tag}</p>}
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)', lineHeight: 1.15, color: 'var(--navy)', margin: '0 0 16px' }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.975rem', lineHeight: 1.75, color: 'var(--ink-soft)', margin: '0 0 22px' }}>{body}</p>
      {linkLabel && <a href={linkHref} style={{ fontFamily: 'var(--font-body)', color: 'var(--coral)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>{linkLabel}</a>}
    </div>
  );

  const imageCol = (
    <div style={{ background: 'var(--gradient-sky)', borderRadius: 'var(--radius-lg)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <img src={image} alt={imageAlt} style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', transform: `scale(${imageScale})`, transformOrigin: 'center' }} />
    </div>
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: reverse ? '60% 40%' : '40% 60%',
        gap: '64px',
        alignItems: 'center',
        ...style,
      }}
      {...rest}
    >
      {reverse ? <>{textCol}{imageCol}</> : <>{imageCol}{textCol}</>}
    </div>
  );
}
