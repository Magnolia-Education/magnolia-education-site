import * as React from 'react';

/**
 * A parent/student testimonial: gold stars, an italic quote, and an attributed author
 * with their role. Used in the horizontal testimonial rail and in emails.
 *
 * @startingPoint section="Marketing" subtitle="Star rating, italic quote, attribution" viewport="360x260"
 *
 * @example
 * <TestimonialCard
 *   quote="My son went from an 80% average to 98% on his final exam."
 *   author="SYLVIA APOSTOLIDIS" role="Parent" />
 */
export interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
}

export function TestimonialCard(props: TestimonialCardProps): React.JSX.Element;
