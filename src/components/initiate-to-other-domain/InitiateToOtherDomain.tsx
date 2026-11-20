import * as React from 'react';
import { cn } from '../../lib/cn';
import { RadioGroup } from '../../atoms/radio-group';

/**
 * InitiateToOtherDomain — the card on an Added Value that offers to initiate it into another
 * domain: "Initiate to other Domains", then **one choice**. The first option is "Don't
 * initiate to another domain", chosen by default (most Added Values, a new one included, go to
 * no other domain), and after it come the other domains, "Initiate to Development assignment".
 * Only one can be chosen: they are radio buttons. Read off the Figma `Duplicate_To_Other_Domain`
 * set (called "Duplicate" there, and here until November 2026), whose six variants are the same
 * card for each domain, leaving that domain out.
 *
 * **Why radio buttons, not Figma's checkboxes (design lead, 20 November 2026).** An Added Value
 * is initiated to one other domain at a time, so a group of checkboxes offered a choice the
 * implementation does not have. Figma still draws checkboxes and has no "Don't initiate" option
 * or Disabled variant: those are ours, and the Figma set needs the same changes.
 *
 * Which domains there are is the caller's. The component draws the options it is given and never
 * lists the current domain; there is no domain vocabulary here for the six Figma variants to be a
 * prop of. The sentence is the design's and is not a prop: each option's `name` fills "Initiate to
 * {name} assignment".
 *
 * It is a `RadioGroup`, so it is a `fieldset` and the title is its `legend`: a screen reader says
 * "Initiate to other Domains, group" before the first option. The chosen value works both ways:
 * pass `value` (+ `onChange`), or leave it uncontrolled. `null` is "don't initiate". Choosing a
 * domain usually opens a section for it: read `onChange`'s value, or derive the section from `value`.
 *
 * **`disabled`** is for an Added Value that came from another domain and is edited in the
 * second: the card is still there, **"Don't initiate" is shown chosen** whatever `value` says,
 * nothing can be changed, and a line under the title says why (`disabledReason`). The line is
 * the group's description, so a screen reader hears it too.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface InitiateDomainOption {
  /** What `onChange` reports for it. Never empty: an empty value is "don't initiate". */
  value: string;
  /** The domain's name as it reads in the sentence — "Design (BESA)". */
  name: string;
  disabled?: boolean;
}

export interface InitiateToOtherDomainProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'value' | 'defaultValue' | 'title'> {
  /** The domains it can be initiated to — not including the one it is already in. */
  options: readonly InitiateDomainOption[];
  /** Controlled: the domain's `value`, or `null` for "don't initiate". */
  value?: string | null;
  /** Uncontrolled: what is chosen to begin with. Default `null`, "don't initiate". */
  defaultValue?: string | null;
  /** Fires when the choice changes, with the domain's `value`, or `null` for "don't initiate". */
  onChange?: (value: string | null) => void;
  /** The card's title. Defaults to "Initiate to other Domains". */
  title?: React.ReactNode;
  /** The first option's words. Defaults to "Don't initiate to another domain". */
  noneLabel?: string;
  /** The line under the title of a `disabled` card, saying why nothing can be changed. Has a default; only drawn when the card is disabled. */
  disabledReason?: React.ReactNode;
}

const DISABLED_REASON = "This Added Value came from another domain, so it can't be initiated to others from here.";

/* The radio group's own value for "don't initiate": a domain's value is never empty. */
const NONE = '';

export const InitiateToOtherDomain = React.forwardRef<HTMLFieldSetElement, InitiateToOtherDomainProps>(
  (
    {
      className,
      options,
      value,
      defaultValue = null,
      onChange,
      title = 'Initiate to other Domains',
      noneLabel = "Don't initiate to another domain",
      disabled,
      disabledReason = DISABLED_REASON,
      ...props
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState<string | null>(defaultValue);
    const chosen = value === undefined ? inner : value;
    /* A disabled card is for an AV that came from another domain: nothing is initiated from here, so it says so. */
    const shown = disabled ? NONE : (chosen ?? NONE);

    const choose = (next: string) => {
      const domain = next === NONE ? null : next;
      if (value === undefined) setInner(domain);
      onChange?.(domain);
    };

    return (
      /* The card is a wrapper, not the fieldset: a legend sits on its fieldset's top edge, so a padded, filled fieldset would draw the title across the card's border. */
      <div className={cn('rounded-md bg-surface-elevated p-4', className)}>
        <RadioGroup
          ref={ref}
          label={<span className="text-title-sm-semibold">{title}</span>}
          description={disabled ? disabledReason : undefined}
          disabled={disabled}
          value={shown}
          onChange={choose}
          options={[
            { value: NONE, label: noneLabel },
            ...options.map((option) => ({
              value: option.value,
              label: `Initiate to ${option.name} assignment`,
              disabled: option.disabled,
            })),
          ]}
          {...props}
        />
      </div>
    );
  },
);
InitiateToOtherDomain.displayName = 'InitiateToOtherDomain';
