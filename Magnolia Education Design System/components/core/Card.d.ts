import * as React from 'react';

/**
 * A soft, rounded content card with a warm navy-tinted shadow. The brand's default
 * container for grouped content — never a hard-edged box.
 *
 * @example
 * <Card variant="plain" interactive>…</Card>
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `plain` white · `accent` coral-pale · `sky` blue gradient · `navy` inverted. */
  variant?: 'plain' | 'accent' | 'sky' | 'navy';
  /** Adds a hover lift — use for clickable cards. */
  interactive?: boolean;
  padding?: string;
  children?: React.ReactNode;
}

export function Card(props: CardProps): React.JSX.Element;
