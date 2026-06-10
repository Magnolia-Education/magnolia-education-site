import * as React from 'react';

/**
 * An alternating marketing feature row: a hand-drawn illustration on a soft sky-gradient
 * panel beside a tag / serif title / body / coral link. Flip sides with `reverse`.
 *
 * @startingPoint section="Marketing" subtitle="Illustration panel + title/body/link, alternating" viewport="1100x360"
 *
 * @example
 * <FeatureRow tag="Tutoring" title="Weekly tutoring for lifelong learning."
 *   body="One-on-one or small groups…" linkLabel="Learn more →" linkHref="tutoring.html"
 *   image="assets/illustrations/magnolia-tree.png" imageAlt="Students under a magnolia tree" />
 */
export interface FeatureRowProps extends React.HTMLAttributes<HTMLDivElement> {
  tag?: string;
  title: React.ReactNode;
  body: React.ReactNode;
  linkLabel?: string;
  linkHref?: string;
  image: string;
  imageAlt?: string;
  /** Put the illustration on the right. Alternate down the page. */
  reverse?: boolean;
  /** Illustrations have baked-in padding — scale up ~1.2–1.6 to fill the panel. */
  imageScale?: number;
}

export function FeatureRow(props: FeatureRowProps): React.JSX.Element;
