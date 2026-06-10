import React from 'react';

/**
 * Text input with an optional label. Soft 2px border that warms to navy on focus.
 */
export function Input({ label, hint, type = 'text', as = 'input', id, style = {}, ...rest }) {
  const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const Tag = as === 'textarea' ? 'textarea' : 'input';

  const field = {
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--ink)',
    background: 'var(--white)',
    padding: as === 'textarea' ? '12px 16px' : '12px 18px',
    border: '2px solid var(--line-strong)',
    borderRadius: 'var(--radius-xs)',
    outline: 'none',
    transition: 'border-color var(--dur) var(--ease)',
    minHeight: as === 'textarea' ? '120px' : undefined,
    resize: as === 'textarea' ? 'vertical' : undefined,
    fontFamily: 'var(--font-body)',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {label && (
        <label htmlFor={fieldId} style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>
          {label}
        </label>
      )}
      <Tag
        id={fieldId}
        type={as === 'textarea' ? undefined : type}
        style={field}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--navy)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line-strong)'; }}
        {...rest}
      />
      {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.74rem', color: 'var(--ink-faint)' }}>{hint}</span>}
    </div>
  );
}
