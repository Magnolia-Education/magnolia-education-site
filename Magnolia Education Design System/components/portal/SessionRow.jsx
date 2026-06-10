import React from 'react';
import { Badge } from '../core/Badge.jsx';

/**
 * A schedule row in the student hub — subject + tutor, the date/time, and a status pill.
 */
export function SessionRow({ subject, tutorName, when, status = 'scheduled', style = {}, ...rest }) {
  const toneByStatus = { scheduled: 'coral', completed: 'success', cancelled: 'navy' };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: '16px 18px',
        ...style,
      }}
      {...rest}
    >
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
          {subject} with {tutorName}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-soft)', margin: '3px 0 0' }}>{when}</p>
      </div>
      <Badge variant="status" tone={toneByStatus[status]}>{status}</Badge>
    </div>
  );
}
