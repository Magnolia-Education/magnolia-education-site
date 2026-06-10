import * as React from 'react';

/**
 * The section signature used across the site and emails: coral uppercase eyebrow →
 * Cormorant serif title → optional muted subtitle.
 *
 * @startingPoint section="Marketing" subtitle="Eyebrow + serif title + subtitle block" viewport="700x220"
 *
 * @example
 * <SectionHeading eyebrow="What We Offer" title="Everything a student needs to thrive."
 *   subtitle="From tutoring to exam prep, study systems, and getting ahead." />
 */
export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  /** Use on navy sections — flips title white, subtitle to on-dark. */
  onDark?: boolean;
}

export function SectionHeading(props: SectionHeadingProps): React.JSX.Element;
