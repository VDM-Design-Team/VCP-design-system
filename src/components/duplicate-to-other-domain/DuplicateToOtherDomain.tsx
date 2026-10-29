import * as React from 'react';
import { cn } from '../../lib/cn';
import { Checkbox } from '../../atoms/checkbox';

/**
 * DuplicateToOtherDomain — the card on an Added Value that offers to copy it into
 * the other domains: "Duplicate to other Domains", then one checkbox for each,
 * "Initiate to Development assignment". Read off the Figma `Duplicate_To_Other_Domain`
 * set, whose six variants are the same card for each domain, leaving that domain out.
 *
 * Which domains there are is the caller's. The component draws the options it is
 * given and never lists the current domain; there is no domain vocabulary here for
 * the six Figma variants to be a prop of. The sentence is the design's and is not a
 * prop: each option's `name` fills "Initiate to {name} assignment".
 *
 * A group of checkboxes is a `fieldset`, and the title is its `legend`, so a screen
 * reader says "Duplicate to other Domains, group" before the first option. The set of
 * chosen values works both ways: pass `value` (+ `onChange`), or leave it uncontrolled.
 *
 * The rows are tighter in Figma (16 apart) than `Checkbox`'s 40 minimum touch target allows,
 * so they sit edge to edge: each option is a full-height target and there is no gap between.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DuplicateDomainOption {
  /** What `onChange` reports for it. */
  value: string;
  /** The domain's name as it reads in the sentence — "Design (BESA)". */
  name: string;
  disabled?: boolean;
}

export interface DuplicateToOtherDomainProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'value' | 'defaultValue' | 'title'> {
  /** The domains it can be copied to — not including the one it is already in. */
  options: readonly DuplicateDomainOption[];
  /** Controlled: the values ticked. */
  value?: readonly string[];
  /** Uncontrolled: which are ticked to begin with. */
  defaultValue?: readonly string[];
  /** Fires with every ticked value, in the order of `options`. */
  onChange?: (value: string[]) => void;
  /** The card's title. Defaults to "Duplicate to other Domains". */
  title?: React.ReactNode;
}

export const DuplicateToOtherDomain = React.forwardRef<HTMLFieldSetElement, DuplicateToOtherDomainProps>(
  ({ className, options, value, defaultValue = [], onChange, title = 'Duplicate to other Domains', disabled, ...props }, ref) => {
    const [inner, setInner] = React.useState<readonly string[]>(defaultValue);
    const chosen = value ?? inner;

    const toggle = (domain: string, on: boolean) => {
      const next = options
        .map((o) => o.value)
        .filter((v) => (v === domain ? on : chosen.includes(v)));
      if (value === undefined) setInner(next);
      onChange?.(next);
    };

    return (
      <fieldset
        ref={ref}
        disabled={disabled}
        className={cn(
          'm-0 flex min-w-0 flex-col gap-3 rounded-md border-0 bg-surface-elevated p-4 font-sans',
          className,
        )}
        {...props}
      >
        <legend className="float-left w-full p-0 text-title-sm-semibold text-text-primary">{title}</legend>
        <div className="clear-both flex flex-col">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              checked={chosen.includes(option.value)}
              disabled={option.disabled}
              onChange={(on) => toggle(option.value, on)}
              label={`Initiate to ${option.name} assignment`}
            />
          ))}
        </div>
      </fieldset>
    );
  },
);
DuplicateToOtherDomain.displayName = 'DuplicateToOtherDomain';
