import * as React from 'react';

/**
 * A small label. Three shapes share one component:
 * `eyebrow` (uppercase coral section label), `status` (tiny uppercase state pill),
 * `pill` / `capsule` (rounded label; capsule adds a hairline border — used for the
 * "⏰ Register by June 6th" deadline chip).
 *
 * @startingPoint section="Core" subtitle="Eyebrows, status pills & deadline capsules" viewport="700x150"
 *
 * @example
 * <Badge variant="eyebrow">What We Offer</Badge>
 * <Badge variant="capsule" tone="coral">⏰ Register by June 6th</Badge>
 * <Badge variant="status" tone="success">Completed</Badge>
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'eyebrow' | 'status' | 'pill' | 'capsule';
  tone?: 'coral' | 'navy' | 'success' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): React.JSX.Element;
