import * as React from 'react';

/**
 * A single session row in the student-hub schedule: "{subject} with {tutor}", the
 * date/time, and a coral/green/navy status pill. Composes Badge.
 *
 * @example
 * <SessionRow subject="Advanced Functions" tutorName="Rachit"
 *   when="Tue, Jun 10 · 4:30 PM EST" status="scheduled" />
 */
export interface SessionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  subject: string;
  tutorName: string;
  when: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export function SessionRow(props: SessionRowProps): React.JSX.Element;
