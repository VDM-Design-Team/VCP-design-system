import * as React from 'react';
import { cn } from '../../lib/cn';
import { RadioGroup } from '../../atoms/radio-group';

/**
 * InitiateToOtherDomain — the card on an Added Value that offers to initiate it into another domain: "Initiate to other Domains", then a radio group: **"Don't initiate to another domain"**
 * (selected until a person picks otherwise, as it is for most Added Values) and one option for each domain, "Initiate to Development assignment". One choice at a time.
 * Read off the Figma `Duplicate_To_Other_Domain` set (renamed here from "Duplicate"), whose six variants are the same card for each domain, leaving that domain out.
 *
 * Which domains there are is the caller's. The component draws the options it is given and never lists the current domain; there is no domain vocabulary here for the six Figma variants to be
 * a prop of. The sentence is the design's and is not a prop: each option's `name` fills "Initiate to {name} assignment".
 *
 * **`disabled`** is for an Added Value that was handed off from another domain: the card is still there, with "Don't initiate" shown selected, but nothing can be changed from here.
 *
 * A radio group is a `fieldset`, and the title is its `legend`, so a screen reader says "Initiate to other Domains, group" before the first option. The chosen value works both ways: pass
 * `value` (+ `onChange`), or leave it uncontrolled. `''` (`DONT_INITIATE`) is "don't initiate". Choosing a domain usually opens a section for it: derive it from `value`.
 *
 * The rows are tighter in Figma (16 apart) than the radio's 40 minimum touch target allows, so each option is a full-height target.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/** The value of "Don't initiate to another domain". */
export const DONT_INITIATE = '';

export interface InitiateDomainOption {
  /** What `onChange` reports for it. Not `''`: that is "don't initiate". */
  value: string;
  /** The domain's name as it reads in the sentence — "Design (BESA)". */
  name: string;
  disabled?: boolean;
}

export interface InitiateToOtherDomainProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'value' | 'defaultValue' | 'title'> {
  /** The domains it can be initiated to — not including the one it is already in. */
  options: readonly InitiateDomainOption[];
  /** Controlled: the chosen domain's `value`, or `''` for "don't initiate". */
  value?: string;
  /** Uncontrolled: what is chosen to begin with. Defaults to "don't initiate". */
  defaultValue?: string;
  /** Fires when another option is chosen, with its `value` (`''` is "don't initiate"). */
  onChange?: (value: string) => void;
  /** The card's title. Defaults to "Initiate to other Domains". */
  title?: React.ReactNode;
  /** The first option's words. Defaults to "Don't initiate to another domain". */
  noneLabel?: string;
}

export const InitiateToOtherDomain = React.forwardRef<HTMLFieldSetElement, InitiateToOtherDomainProps>(
  (
    { className, options, value, defaultValue = DONT_INITIATE, onChange, title = 'Initiate to other Domains', noneLabel = "Don't initiate to another domain", disabled, ...props },
    ref,
  ) => (
    /* The card is a wrapper, not the fieldset: a fieldset's legend sits on its top edge, over its padding, so a padded fieldset draws its title half outside the card. */
    <div className={cn('rounded-md bg-surface-elevated p-4', className)}>
      <RadioGroup
        ref={ref}
        label={<span className="text-title-sm-semibold text-text-primary">{title}</span>}
        options={[
          { value: DONT_INITIATE, label: noneLabel },
          ...options.map((option) => ({ value: option.value, label: `Initiate to ${option.name} assignment`, disabled: option.disabled })),
        ]}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    </div>
  ),
);
InitiateToOtherDomain.displayName = 'InitiateToOtherDomain';
