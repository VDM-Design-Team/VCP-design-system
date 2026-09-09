import * as React from 'react';
import { Badge, type BadgeProps } from '../../atoms/badge';

/**
 * StatusPill — an Added Value's status, worn as a pill: a `Badge` carrying
 * VCP's status vocabulary and the status → treatment mapping that
 * docs/badge.md promised would live in exactly one place — this one.
 *
 * **The vocabulary is open, and deliberately so.** An AV's flow is a fixed
 * spine with a per-domain middle: the flow board's `Custom Statuses` section
 * sits between `Accepted` and `Completed` and holds one chain per domain.
 * Two domains are defined today — Design has one step, Development has five —
 * and a domain can add steps and rename them, so those names are data and
 * cannot be enumerated here (issue #68). More domains may follow; nothing
 * here counts them.
 *
 * So this component knows two kinds of status:
 *
 * - **Spine statuses** — the ten in `AVStatus`. Fixed, shared by every
 *   domain, and the application branches on them. Each keeps its own
 *   treatment, measured off the Figma `Status_Tag_General` set, and a typo in
 *   one is still a compile error.
 * - **Domain steps** — anything a domain defines. Passed as `custom`, and
 *   they all wear one treatment (design's call, 7 Sep 2026): the blue tonal
 *   that `In Progress` used to carry alone.
 *
 * ```tsx
 * <StatusPill status="Draft" />          // spine — its own tone
 * <StatusPill custom={step.label} />     // domain — the shared tone
 * ```
 *
 * The two props are mutually exclusive by type, so a domain label can never
 * silently take a spine treatment, and a misspelled spine status can never
 * silently fall through to the custom one.
 *
 * **What this used to be.** Until 7 September `AVStatus` held seventeen
 * values, six of which were domain steps — `For Review`, `For QA`, `In QA`,
 * `Ready for Deploy`, `Confirmed Prod`, `Design Review`. They carried three
 * different tones between them (gates warning, work info, verified success).
 * Those six are gone from the union and all render the one custom treatment
 * now; see CHANGELOG.md for the migration.
 *
 * The three sets in the Figma library are the model, one for one:
 * `Status_Tag_General` is `AVStatus`, and `Status_Tag_Design_Only` and
 * `Status_Tag_Development_Only` are those domains' chains.
 *
 * **`Review` has two treatments**, and they are the two Review pills the
 * library draws. Tonal is the label style — what a user sees. Filled is the
 * button style, for a viewer who can act on it: an admin, or the AV's
 * initiator. Pass `actionable` for the second. The status is the same either
 * way; only who is looking changes.
 *
 * (The library names its second Review pill `Review No Action`. There is no
 * such state — confirmed 7 Sep 2026 — and the variant is being renamed.)
 *
 * There is no dot: the Figma tag is text on a fill, and text is what
 * distinguishes two statuses that share a colour.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type AVStatus =
  | 'Draft'
  | 'Initiated'
  | 'Pending'
  | 'Accepted'
  | 'In Progress'
  | 'Review'
  | 'Completed'
  | 'Rejected'
  | 'Reopened'
  | 'Backlog';

/**
 * Every spine status, in lifecycle order. For pickers, legends, and tests.
 * Domain steps are not here and cannot be — they live in the domain's own
 * configuration, which this repo does not own.
 */
export const AV_STATUSES: readonly AVStatus[] = [
  'Draft',
  'Initiated',
  'Pending',
  'Accepted',
  'In Progress',
  'Review',
  'Completed',
  'Rejected',
  'Reopened',
  'Backlog',
];

type Treatment = {
  tone: NonNullable<BadgeProps['tone']>;
  variant?: NonNullable<BadgeProps['variant']>;
};

/* THE mapping — every row measured off the Figma `Status_Tag_General` set.
   If you are writing `tone={status === 'Rejected' ? …}` at a call site, the
   line you want is already here. */
const STATUS_TREATMENT: Record<AVStatus, Treatment> = {
  Draft: { tone: 'neutral' },
  Backlog: { tone: 'neutral' },
  Pending: { tone: 'warning' },
  Initiated: { tone: 'warning' },
  Accepted: { tone: 'info' },
  'In Progress': { tone: 'info' },
  Reopened: { tone: 'info' },
  Completed: { tone: 'success' },
  Rejected: { tone: 'danger' },
  /* Tonal is Review's label style — what a viewer who cannot act on it sees.
     The filled treatment lives in ACTIONABLE_TREATMENT below. */
  Review: { tone: 'info' },
};

/**
 * Some statuses are drawn twice: once as a label, once in the design's solid
 * "button style" for the viewer who can actually act on them. `Review` is the
 * one the design draws today — a tag for a user, a call to act for an admin or
 * the AV's initiator.
 *
 * A status with no row here ignores `actionable` and keeps its one treatment,
 * rather than inventing a filled variant the design has never drawn. When
 * design draws another, it gets a row.
 */
const ACTIONABLE_TREATMENT: Partial<Record<AVStatus, Treatment>> = {
  Review: { tone: 'info', variant: 'filled' },
};

/**
 * Every domain step wears this, whatever the domain calls it and whatever
 * phase it represents. Design's call (7 Sep 2026), and the reasoning holds:
 * this component knows nothing about a step it did not define, so asserting
 * "this one is a warning" would be claiming a meaning it cannot have.
 *
 * The blue tonal is `accent.info.tonal` — blue-100 on blue-700, 5.60:1, the
 * treatment `In Progress` carried when it was still spine vocabulary.
 */
const CUSTOM_TREATMENT: Treatment = { tone: 'info' };

type StatusPillBase = Omit<
  BadgeProps,
  'tone' | 'variant' | 'icon' | 'trailingIcon' | 'children' | 'status'
> & {
  /**
   * The viewer can act on this status, so draw the design's button style.
   * Today only `Review` differs; every other status ignores it rather than
   * inventing a treatment the design has not drawn.
   */
  actionable?: boolean;
};

export type StatusPillProps = StatusPillBase &
  (
    | {
        /** A spine status. Typo-checked; each has its own treatment. */
        status: AVStatus;
        custom?: never;
      }
    | {
        /**
         * A domain-defined step, by whatever name the domain gives it. Comes
         * from data, so it is a plain string — and every one of them wears
         * the same treatment.
         */
        custom: string;
        status?: never;
      }
  );

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ status, custom, actionable, ...props }, ref) => {
    const label = status ?? custom ?? '';
    const { tone, variant } = status
      ? ((actionable ? ACTIONABLE_TREATMENT[status] : undefined) ?? STATUS_TREATMENT[status])
      : CUSTOM_TREATMENT;
    return (
      <Badge ref={ref} tone={tone} variant={variant} {...props}>
        {label}
      </Badge>
    );
  },
);
StatusPill.displayName = 'StatusPill';
