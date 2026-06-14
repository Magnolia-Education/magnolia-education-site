import * as React from 'react';

/**
 * A round avatar: a photo when `src` is given, otherwise the person's initials on a
 * soft coral ground. Photos crop to center-top so headshots frame the face.
 *
 * @example
 * <Avatar name="Rachit Chakerwarti" size={44} />
 * <Avatar name="Gladys Lou" src="assets/headshots/gladys-lou.jpg" size={56} />
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLElement> {
  name?: string;
  src?: string;
  size?: number | string;
}

export function Avatar(props: AvatarProps): React.JSX.Element;
