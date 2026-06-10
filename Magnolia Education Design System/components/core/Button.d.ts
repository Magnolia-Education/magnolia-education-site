import * as React from 'react';

/**
 * Magnolia's primary call-to-action and its quieter companions. Coral primary for the
 * one action that matters; secondary/ghost for everything else; white + outline-white for
 * use on navy sections.
 *
 * @startingPoint section="Core" subtitle="Coral CTA + secondary, white & ghost variants" viewport="700x160"
 *
 * @example
 * <Button href="https://calendly.com/..." variant="primary">Book a Consultation</Button>
 * <Button variant="secondary">Explore Tutoring</Button>
 */
export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual style. `white` / `outline-white` are for navy backgrounds. */
  variant?: 'primary' | 'secondary' | 'white' | 'outline-white' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Render as an anchor by passing href. */
  href?: string;
  as?: 'button' | 'a';
  disabled?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): React.JSX.Element;
