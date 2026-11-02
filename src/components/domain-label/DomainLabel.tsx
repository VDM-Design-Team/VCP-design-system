import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { Tooltip } from '../../atoms/tooltip';

/**
 * DomainLabel — the small pill that says which domain something came from: a glyph and two
 * letters ("DS"), beside a deliverable link or on the corner of an attached file. Read off
 * Figma's `_Domain_Label` set: six domains, abbreviated, with or without a tooltip that spells it
 * out ("Added by Design").
 *
 * **This component owns the domain → glyph, code and name mapping**, the way `StatusTag` owns
 * status → tone, so a link row and a file card cannot draw the same domain two ways. The colour is
 * the same for every domain (`neutral.tonal`, fixed); only the glyph and the two letters tell them
 * apart.
 *
 * It is a label, not a control: it never takes a click. The tooltip is a hover aid; the words are
 * always there for a screen reader ("Added by Design.") unless the pill is `decorative`, for a
 * place that says it already.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type DomainKey = 'design' | 'development' | 'governance' | 'content' | 'partners' | 'qa';

/** THE mapping — domain → glyph, code, short name and the name in full ("Added by Quality Assurance"). */
export const DOMAINS: Record<DomainKey, { icon: IconName; code: string; name: string; fullName: string }> = {
  design: { icon: 'pen-nib', code: 'DS', name: 'Design', fullName: 'Design' },
  development: { icon: 'code', code: 'DV', name: 'Development', fullName: 'Development' },
  governance: { icon: 'bank', code: 'GV', name: 'Governance', fullName: 'Governance' },
  content: { icon: 'image', code: 'CN', name: 'Content', fullName: 'Content' },
  partners: { icon: 'handshake', code: 'PT', name: 'Partners', fullName: 'Partners' },
  qa: { icon: 'file-magnifying-glass', code: 'QA', name: 'QA', fullName: 'Quality Assurance' },
};

export interface DomainLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** One of the six domains: sets the glyph, the code and the name. */
  domain?: DomainKey;
  /** A code outside the six, when there is no `domain`. */
  code?: string;
  /** The glyph for `code`. */
  icon?: IconName;
  /** Show "Added by {domain}" on hover. Only with `domain`. */
  tooltip?: boolean;
  /** Draw it with no words for a screen reader, where the surrounding text already names the domain. */
  decorative?: boolean;
}

export const DomainLabel = React.forwardRef<HTMLSpanElement, DomainLabelProps>(
  ({ className, domain, code, icon = 'pen-nib', tooltip, decorative, ...props }, ref) => {
    const spec = domain ? DOMAINS[domain] : { icon, code: code ?? '', name: code ?? '', fullName: code ?? '' };

    const pill = (
      <span
        ref={ref}
        aria-hidden={decorative || undefined}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5',
          'border border-stroke-inverse bg-neutral-tonal-surface-default text-neutral-tonal-content-default',
          className,
        )}
        {...props}
      >
        <Icon name={spec.icon} className="size-3" aria-hidden="true" />
        <span className="text-caption-sm-medium">{spec.code}</span>
        {!decorative && <span className="sr-only">Added by {spec.fullName}.</span>}
      </span>
    );

    return tooltip && domain && !decorative ? (
      <Tooltip content={`Added by ${spec.fullName}`}>{pill}</Tooltip>
    ) : (
      pill
    );
  },
);
DomainLabel.displayName = 'DomainLabel';
