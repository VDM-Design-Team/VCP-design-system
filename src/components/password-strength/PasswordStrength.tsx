import * as React from 'react';
import { cn } from '../../lib/cn';
import { ProgressBar } from '../../atoms/progress-bar';
import type { PasswordStrengthLevel } from '../../lib/password-strength';

/**
 * PasswordStrength — how strong the password being typed is, as a labelled
 * five-step meter. Sits under a password `Input` and answers "is this good
 * enough?" while the person is still typing.
 *
 * It is a `ProgressBar` with the password domain on top: the five levels, the
 * level → tone mapping, and one line of advice under the bar. The bar itself —
 * track, fill, label row, `role="meter"` with real `aria-value*` — is
 * `ProgressBar`'s, and the level is read out by name ("Very Weak") through its
 * `valueLabel`, so the fill length and the colour are never the only signal. The
 * words are the main signal (the bright fills can fall under 3:1), so the row is
 * `labelSize="md"`, the label size.
 *
 * **Scoring is not in here.** What makes a password "Fair" — length, character
 * classes, a breach list — is product policy and changes without a design
 * change, so the caller computes `strength` and hands it in. `message` is the
 * same: the copy ("Your password is too simple") belongs to whoever owns the
 * rule.
 *
 * Weak is the orange `pending` tone, a bright shade that sits below the 3:1 a
 * graphic should reach against the light track (2.27:1). Fair is the brown
 * `warning` tone, as Figma's `_Password_Item_Strength` draws it (4.00:1). The
 * level is always written out beside the bar, so the colour never carries the
 * meaning alone.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type { PasswordStrengthLevel };

const LEVELS = {
  'very-weak': { text: 'Very Weak', step: 1, tone: 'critical', weak: true },
  weak: { text: 'Weak', step: 2, tone: 'pending', weak: true },
  fair: { text: 'Fair', step: 3, tone: 'warning', weak: false },
  good: { text: 'Good', step: 4, tone: 'info', weak: false },
  strong: { text: 'Strong', step: 5, tone: 'success', weak: false },
} as const;

const STEPS = 5;

export interface PasswordStrengthProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The caller's verdict. Scoring lives with the password policy, not here. */
  strength: PasswordStrengthLevel;
  /** Name of the meter, top left. */
  label?: string;
  /**
   * One line under the bar — why it scored this way, or how to improve it.
   * Critical-coloured for `very-weak` and `weak`, quiet otherwise. Announced
   * politely when it changes.
   */
  message?: string;
}

export const PasswordStrength = React.forwardRef<HTMLDivElement, PasswordStrengthProps>(
  ({ className, strength, label = 'Password Strength', message, ...props }, ref) => {
    const level = LEVELS[strength];

    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-0.5 font-sans', className)} {...props}>
        <ProgressBar
          role="meter"
          label={label}
          labelSize="md"
          valueLabel={level.text}
          value={level.step}
          max={STEPS}
          tone={level.tone}
        />
        {/* The live region is always in the DOM, so a message that arrives later is announced: a region
            inserted already holding text is often not. Empty, it is visually hidden and takes no gap. */}
        <span
          aria-live="polite"
          className={cn(
            message ? 'text-caption-md-regular' : 'sr-only',
            level.weak ? 'text-accent-critical-outline-content-default' : 'text-text-tertiary',
          )}
        >
          {message}
        </span>
      </div>
    );
  },
);
PasswordStrength.displayName = 'PasswordStrength';
