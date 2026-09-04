import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';

/**
 * StatusProgression — the "move this Added Value along" buttons: at most a
 * step back and a step forward, drawn from the lifecycle the viewer is
 * actually allowed to drive.
 *
 * **This owns the status → transitions mapping**, the way `StatusPill` owns
 * status → tone. Call sites never write `status === 'For Review' ? …` — they
 * pass the three facts (workflow, role, status) and handle `onTransition`.
 *
 * Read straight off the Figma `Status Progression Buttons` page (audit,
 * 4 Sep 2026): eight component sets — two workflows (Development, Design)
 * times four viewer roles — each a `_Status_Progression_Base` holding one or
 * two `Button_Small_VCP`. Every label below is the design's own wording, not
 * generated from the status name, because the design does not generate them
 * either ("Move to Handoff" for an assignee, plain "Handoff" for an admin).
 *
 * **The vocabulary here is not `StatusPill`'s.** `Status_Tag_General` names
 * eleven statuses; this page names a different lifecycle (For QA, In QA,
 * Ready for Deploy, Confirmed Prod, Design Review) that overlaps it only in
 * part. That is a design-side divergence, flagged in docs/figma-audit.md and
 * deliberately not reconciled here — inventing a merged vocabulary in code
 * would bake a decision that belongs to design.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type AVWorkflow = 'development' | 'design';

/**
 * Who is looking. The design draws a separate set per role because the same
 * status offers different moves depending on the viewer.
 */
export type AVProgressionRole = 'assignee' | 'initiator' | 'assignee-initiator' | 'admin';

/** The lifecycle this component moves an AV through. See the note above. */
export type AVProgressionStatus =
  | 'Draft'
  | 'Pending'
  | 'Accepted'
  | 'In Progress'
  | 'For Review'
  | 'For QA'
  | 'In QA'
  | 'Ready for Deploy'
  | 'Confirmed Prod'
  | 'Design Review'
  | 'Completed';

/** What a button does, for the caller's switch. */
export type AVTransitionKind =
  | 'move'
  | 'return'
  | 'save-draft'
  | 'submit'
  | 'accept'
  | 'reject'
  | 'handoff';

export interface AVTransition {
  kind: AVTransitionKind;
  /** The destination, on `move` and `return` only. */
  to?: AVProgressionStatus;
  /** The design's own wording — render it, don't rebuild it. */
  label: string;
  /** Which `Button` treatment the design gives it. */
  variant: 'primary' | 'secondary' | 'danger';
}

const move = (to: AVProgressionStatus): AVTransition => ({
  kind: 'move',
  to,
  label: `Move to ${to}`,
  variant: 'primary',
});
const back = (to: AVProgressionStatus): AVTransition => ({
  kind: 'return',
  to,
  label: `Return to ${to}`,
  variant: 'secondary',
});
const saveDraft: AVTransition = { kind: 'save-draft', label: 'Save as Draft', variant: 'secondary' };
const submit: AVTransition = { kind: 'submit', label: 'Submit', variant: 'primary' };
const accept: AVTransition = { kind: 'accept', label: 'Accept', variant: 'primary' };
const rejectSoft: AVTransition = { kind: 'reject', label: 'Reject', variant: 'secondary' };
const rejectHard: AVTransition = { kind: 'reject', label: 'Reject', variant: 'danger' };
const handoff = (label: string): AVTransition => ({ kind: 'handoff', label, variant: 'primary' });

type Steps = Partial<Record<AVProgressionStatus, readonly AVTransition[]>>;

/* The Development middle — identical in the design across Assignee Only,
   Assignee+Initiator and Admin (their variant widths match to the pixel), so
   it is written once rather than three times. */
const DEV_LIFECYCLE: Steps = {
  Accepted: [move('In Progress')],
  'In Progress': [move('For Review')],
  'For Review': [back('In Progress'), move('For QA')],
  'For QA': [back('For Review'), move('In QA')],
  'In QA': [back('For QA'), move('Ready for Deploy')],
  'Ready for Deploy': [back('In QA'), move('Confirmed Prod')],
};

/* The Design middle — the same shape over a much shorter lifecycle. */
const DESIGN_LIFECYCLE: Steps = {
  Accepted: [move('In Progress')],
  'In Progress': [move('Design Review')],
};

const START: Steps = { Draft: [saveDraft, submit] };

/* THE mapping. Every row is a Figma variant; every label is its button text. */
const TRANSITIONS: Record<AVWorkflow, Record<AVProgressionRole, Steps>> = {
  development: {
    /* Status_Progression_Development_Assignee_Only */
    assignee: {
      ...DEV_LIFECYCLE,
      'Confirmed Prod': [back('Ready for Deploy'), handoff('Move to Handoff')],
      /* The design's terminal variant carries no buttons at all. */
      Completed: [],
    },
    /* Status_Progression_Development_Assignee_Initiator */
    'assignee-initiator': {
      ...START,
      ...DEV_LIFECYCLE,
      'Confirmed Prod': [back('Ready for Deploy'), handoff('Move to Handoff')],
    },
    /* Status_Progression_Development_Initiator_Only — see the docs' "Not
       modelled" table: its other two variants are unnamed in the design. */
    initiator: { ...START },
    /* Status_Progression_Development_Admin */
    admin: {
      ...START,
      Pending: [rejectHard, accept],
      ...DEV_LIFECYCLE,
      /* Admin's forward button says just "Handoff", and its variant is 301
         wide against the assignee's 360 — the shorter label, in the design. */
      'Confirmed Prod': [back('Ready for Deploy'), handoff('Handoff')],
    },
  },
  design: {
    /* Status_Progression_Design_Assignee_Only */
    assignee: {
      ...DESIGN_LIFECYCLE,
      'Design Review': [back('In Progress'), handoff('Move to Handoff')],
    },
    /* Status_Progression_Design_Assignee_Initiator */
    'assignee-initiator': {
      ...START,
      ...DESIGN_LIFECYCLE,
      'Design Review': [back('In Progress'), handoff('Move to Handoff')],
    },
    /* Status_Progression_Design_Initiator_Only */
    initiator: { ...START },
    /* Status_Progression_Design_Design_Admin */
    admin: {
      ...START,
      Pending: [rejectHard, accept],
      ...DESIGN_LIFECYCLE,
      'Design Review': [back('In Progress'), handoff('Handoff')],
    },
  },
};

/**
 * The moves a viewer has, for callers that need the list without the buttons
 * — a confirm dialog's copy, a keyboard shortcut map, a test. Returns the
 * design's own order: the step back first, then the step forward.
 */
export function avTransitions(
  workflow: AVWorkflow,
  role: AVProgressionRole,
  status: AVProgressionStatus,
): readonly AVTransition[] {
  return TRANSITIONS[workflow][role][status] ?? [];
}

export interface StatusProgressionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Which lifecycle this AV runs on. */
  workflow?: AVWorkflow;
  /** Who is looking — the design draws a set per role. */
  role: AVProgressionRole;
  /** Where the AV is now. */
  status: AVProgressionStatus;
  /** A button press. The AV does not move until the caller moves it. */
  onTransition?: (transition: AVTransition) => void;
  /** Disables every button — mid-save, or while the viewer lacks the right. */
  disabled?: boolean;
  /** Spins the forward button. The row keeps its width. */
  loading?: boolean;
}

export const StatusProgression = React.forwardRef<HTMLDivElement, StatusProgressionProps>(
  (
    { className, workflow = 'development', role, status, onTransition, disabled, loading, ...props },
    ref,
  ) => {
    const transitions = avTransitions(workflow, role, status);
    /* A terminal status has no moves — the design draws an empty frame, and
       an empty toolbar is noise, so we draw nothing. */
    if (transitions.length === 0) return null;

    return (
      <div
        ref={ref}
        role="group"
        aria-label={`Move this Added Value on from ${status}`}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {transitions.map((t) => (
          <Button
            key={t.kind + (t.to ?? '') + t.label}
            size="sm"
            variant={t.variant}
            disabled={disabled}
            /* Only the forward button spins: it is the one that commits. */
            loading={loading && t.variant !== 'secondary'}
            onClick={() => onTransition?.(t)}
          >
            {t.label}
          </Button>
        ))}
      </div>
    );
  },
);
StatusProgression.displayName = 'StatusProgression';
