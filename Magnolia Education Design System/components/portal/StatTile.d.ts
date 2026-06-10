import * as React from 'react';

/**
 * A linked "at a glance" stat tile in the student hub: uppercase coral label, a value,
 * an optional sub-line, with a warm coral-pale hover lift.
 *
 * @example
 * <StatTile label="This month" value="4 sessions" sub="3 completed · 1 upcoming" href="/portal/schedule" />
 */
export interface StatTileProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  value: string;
  sub?: string;
  href?: string;
}

export function StatTile(props: StatTileProps): React.JSX.Element;
