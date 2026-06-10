import * as React from 'react';

/**
 * A labelled text field. Soft rounded border that warms to navy on focus. Pass
 * `as="textarea"` for multi-line (contact form, message box).
 *
 * @startingPoint section="Forms" subtitle="Labelled input & textarea with focus state" viewport="700x200"
 *
 * @example
 * <Input label="Your email address" type="email" placeholder="you@example.com" />
 * <Input label="Message" as="textarea" hint="Tell us about your student." />
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  as?: 'input' | 'textarea';
}

export function Input(props: InputProps): React.JSX.Element;
