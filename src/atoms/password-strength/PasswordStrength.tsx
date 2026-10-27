import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * PasswordStrength — how strong the password being typed is, as a labelled
 * five-step meter. Sits under a password `Input` and answers "is this good
 * enough?" while the person is still typing.
 *
 * The meter is a `role="meter"` over five discrete levels, announced by name
 * ("Very Weak") through `aria-valuetext`, so the fill length and the colour
 * are never the only signal; the status word is printed beside the label too.
 *
 * **Scoring is not in here.** What makes a password "Fair" — length, character
 * classes, a breach list — is product policy and changes without a design
 * change, so the caller computes `strength` and hands it in. `message` is the
 * same: the copy ("Your password is too simple") belongs to whoever owns the
 * rule.
 *
 * The fill is one token per level and the length steps 20/40/60/80/100%.
 * Very Weak and Weak share `critical` — the design's orange for Weak was not a
 * token — and the length tells them apart.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type PasswordStrengthLevel = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';

const LEVELS: Record<
  PasswordStrengthLevel,
  { text: string; step: number; fill: string; weak: boolean }
> = {
  'very-weak': { text: 'Very Weak', step: 1, fill: 'bg-accent-critical-filled-surface-default', weak: true },
  weak: { text: 'Weak', step: 2, fill: 'bg-accent-critical-filled-surface-default', weak: true },
  fair: { text: 'Fair', step: 3, fill: 'bg-accent-warning-filled-surface-default', weak: false },
  good: { text: 'Good', step: 4, fill: 'bg-accent-info-filled-surface-default', weak: false },
  strong: { text: 'Strong', step: 5, fill: 'bg-accent-success-filled-surface-default', weak: false },
};

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
    const id = React.useId();
    const level = LEVELS[strength];

    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-0.5 font-sans', className)} {...props}>
        <div className="flex items-center justify-between gap-2 text-label-sm-regular text-text-tertiary">
          <span id={`${id}-label`}>{label}</span>
          <span aria-hidden="true">{level.text}</span>
        </div>
        <div
          role="meter"
          aria-labelledby={`${id}-label`}
          aria-valuemin={1}
          aria-valuemax={STEPS}
          aria-valuenow={level.step}
          aria-valuetext={level.text}
          className="h-2 w-full overflow-hidden rounded-pill bg-surface-track"
        >
          <div
            className={cn('h-full rounded-pill transition-[width] duration-300', level.fill)}
            style={{ width: `${(level.step / STEPS) * 100}%` }}
          />
        </div>
        {message && (
          <span
            aria-live="polite"
            className={cn(
              'text-caption-md-regular',
              level.weak ? 'text-accent-critical-outline-content-default' : 'text-text-tertiary',
            )}
          >
            {message}
          </span>
        )}
      </div>
    );
  },
);
PasswordStrength.displayName = 'PasswordStrength';
