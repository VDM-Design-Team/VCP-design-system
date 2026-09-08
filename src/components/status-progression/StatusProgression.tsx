import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import type { AVStatus } from '../status-pill';

/**
 * StatusProgression — the "move this Added Value along" buttons: at most a
 * step back and a step forward, drawn from the lifecycle the viewer is
 * actually allowed to drive.
 *
 * **What this owns, and what it no longer does.** An AV's flow is a fixed
 * spine wrapped around a per-domain middle. This component owns the spine —
 * the moves out of `Draft`, the admin's accept/reject on `Pending`, the
 * initiator/admin decision on `Review`, and the terminal silence on
 * `Completed`, and the terminal silence on `Final Completed` — because those
 * are the same in every domain and the application branches on them.
 *
 * It does **not** own the middle any more. Design has one step, Development
 * has five, and Content, Partners, Governance and Product bring their own,
 * renameable (issue #68). The domain passes its ordered `chain`; this derives
 * the moves from position in it, exactly as the flow board draws them: one
 * step back, one step forward, and a handoff at the end.
 *
 * ```tsx
 * <StatusProgression role="admin" status="Pending" />
 * <StatusProgression role="assignee" chain={domain.steps} step="in-qa" />
 * ```
 *
 * Read off the Figma `Status Progression Buttons` page (audit, 4 Sep 2026).
 * The eight component sets there were two workflows times four roles; the
 * workflow half is gone, because a workflow is now just a different `chain`
 * and six domains would have meant twenty-four sets. The role half stays:
 * the same status offers different moves depending on who is looking.
 *
 * Button wording is still the design's own where the design has an opinion —
 * "Move to Handoff" for an assignee, plain "Handoff" for an admin. Wording
 * that names a step ("Return to In QA") is built from the step's label,
 * because the label is the only thing that knows what the step is called
 * today.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/**
 * One step in a domain's middle. `id` is stable and never shown — it survives
 * a rename, which is the whole point of the split. `label` is what the domain
 * calls the step today, and it is what the user reads.
 */
export interface AVChainStep {
  id: string;
  label: string;
}

/**
 * Who is looking. The design draws a separate set per role because the same
 * status offers different moves depending on the viewer.
 */
export type AVProgressionRole = 'assignee' | 'initiator' | 'assignee-initiator' | 'admin';

/** What a button does, for the caller's switch. */
export type AVTransitionKind =
  | 'move'
  | 'return'
  | 'save-draft'
  | 'submit'
  | 'accept'
  | 'reject'
  | 'handoff'
  | 'deploy';

export interface AVTransition {
  kind: AVTransitionKind;
  /**
   * The destination, on `move` and `return` only — a spine status, or the
   * `id` of a chain step. Never a label: labels change, ids do not.
   */
  to?: string;
  /** What the button says. */
  label: string;
  /** Which `Button` treatment the design gives it. */
  variant: 'primary' | 'secondary' | 'danger';
}

const move = (to: string, label: string): AVTransition => ({
  kind: 'move',
  to,
  label: `Move to ${label}`,
  variant: 'primary',
});
const back = (to: string, label: string): AVTransition => ({
  kind: 'return',
  to,
  label: `Return to ${label}`,
  variant: 'secondary',
});
const saveDraft: AVTransition = { kind: 'save-draft', label: 'Save as Draft', variant: 'secondary' };
const submit: AVTransition = { kind: 'submit', label: 'Submit', variant: 'primary' };
const accept: AVTransition = { kind: 'accept', label: 'Accept', variant: 'primary' };
/**
 * Two different Reject buttons, same `kind`, different `variant` — the
 * design draws them differently depending on lifecycle stage, not role.
 * `reject` (solid, danger) is `Pending`: an initiator's first submission.
 * `rejectSoft` (outline, secondary) is `Review`: a decision made after the
 * assignee has already handed the AV off. Named in issue #60, 7 Sep 2026.
 */
const reject: AVTransition = { kind: 'reject', label: 'Reject', variant: 'danger' };
const rejectSoft: AVTransition = { kind: 'reject', label: 'Reject', variant: 'secondary' };
const handoff = (label: string): AVTransition => ({ kind: 'handoff', label, variant: 'primary' });
const deploy: AVTransition = { kind: 'deploy', label: 'Deploy', variant: 'primary' };

/** Only these roles may start an AV moving; the design gives the rest no `Draft` set. */
const CAN_START: readonly AVProgressionRole[] = ['initiator', 'assignee-initiator', 'admin'];

/**
 * The admin's forward button at the end of the chain says just "Handoff";
 * every other role's says "Move to Handoff". Straight from the design — the
 * admin variant is 301 wide against the assignee's 360.
 */
const handoffLabel = (role: AVProgressionRole) =>
  role === 'admin' ? 'Handoff' : 'Move to Handoff';

/**
 * The moves a viewer has, for callers that need the list without the buttons
 * — a confirm dialog's copy, a keyboard shortcut map, a test. Returns the
 * design's own order: the step back first, then the step forward.
 *
 * Pass either a spine `status` or a `step` id with the `chain` it belongs to.
 */
export function avTransitions(options: {
  role: AVProgressionRole;
  status?: AVStatus;
  step?: string;
  chain?: readonly AVChainStep[];
  /**
   * This domain has a deploy step between `Completed` and `Review` —
   * Development does, Design does not. It is a property of the domain, not of
   * the AV, and it will likely move into the domain's configuration alongside
   * `chain` when #68 is settled.
   *
   * It no longer disambiguates a status: `Completed` and `Final Completed`
   * are separate statuses now, so nothing needs a flag to tell them apart.
   */
  hasDeployStep?: boolean;
}): readonly AVTransition[] {
  const { role, status, step, chain = [], hasDeployStep = false } = options;

  if (status) {
    /* The spine. Every domain shares these, so they stay here. */
    if (status === 'Draft') return CAN_START.includes(role) ? [saveDraft, submit] : [];
    if (status === 'Pending') return role === 'admin' ? [reject, accept] : [];
    /* `Accepted` starts the work; `In Progress` is the last shared step
       before the domain's own chain takes over. Both are spine — the Figma
       `Status_Tag_General` set draws them, and every domain passes through
       them — so the handover lives here rather than in anyone's chain. */
    if (status === 'Accepted' && role !== 'initiator') {
      return [move('In Progress', 'In progress')];
    }
    if (status === 'In Progress' && role !== 'initiator' && chain.length > 0) {
      return [move(chain[0].id, chain[0].label)];
    }
    /* The decision after handoff — an initiator or admin accepts or sends
       it back, never the assignee who already handed it off. Outline
       Reject, not the solid `Pending` one: see `rejectSoft` above. */
    if (status === 'Review') {
      return role === 'initiator' || role === 'admin' ? [rejectSoft, accept] : [];
    }
    /* The assignee's `Completed`: the work is done and waiting to be
       accepted. In a domain with a deploy step the admin deploys first;
       otherwise it goes straight to the initiator or admin for review. */
    if (status === 'Completed') {
      if (hasDeployStep) return role === 'admin' ? [deploy] : [];
      return role === 'initiator' || role === 'admin' ? [move('Review', 'Review')] : [];
    }
    /* Everything else on the spine is terminal or driven elsewhere. The
       design draws an empty frame; an empty toolbar is noise. */
    return [];
  }

  if (!step) return [];
  const i = chain.findIndex((s) => s.id === step);
  /* A step the chain does not contain is not an error worth throwing over —
     a domain can retire a step while an AV still sits on it. Offer nothing
     rather than guessing where it went. */
  if (i < 0 || role === 'initiator') return [];

  const previous = chain[i - 1];
  const next = chain[i + 1];

  return [
    /* The first step returns to `In Progress`, the shared step it came from —
       not to `Accepted`, because accepting is the admin's decision and not
       the assignee's to undo. */
    previous ? back(previous.id, previous.label) : back('In Progress', 'In progress'),
    next ? move(next.id, next.label) : handoff(handoffLabel(role)),
  ];
}

type StatusProgressionBase = Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  /** Who is looking — the design draws a set per role. */
  role: AVProgressionRole;
  /** A button press. The AV does not move until the caller moves it. */
  onTransition?: (transition: AVTransition) => void;
  /** Disables every button — mid-save, or while the viewer lacks the right. */
  disabled?: boolean;
  /** Spins the forward button. The row keeps its width. */
  loading?: boolean;
};

export type StatusProgressionProps = StatusProgressionBase &
  (
    | {
        /** A spine status. */
        status: AVStatus;
        step?: never;
        /** Needed on `Accepted`, to know which step the domain starts with. */
        chain?: readonly AVChainStep[];
        /** This domain deploys — see `avTransitions`. Meaningless outside `status="Completed"`. */
        hasDeployStep?: boolean;
      }
    | {
        /** The `id` of the chain step the AV sits on. */
        step: string;
        status?: never;
        /** The domain's ordered middle. Required — `step` indexes into it. */
        chain: readonly AVChainStep[];
        hasDeployStep?: never;
      }
  );

export const StatusProgression = React.forwardRef<HTMLDivElement, StatusProgressionProps>(
  ({ className, role, status, step, chain, hasDeployStep, onTransition, disabled, loading, ...props }, ref) => {
    const transitions = avTransitions({ role, status, step, chain, hasDeployStep });
    /* A terminal status has no moves — the design draws an empty frame, and
       an empty toolbar is noise, so we draw nothing. */
    if (transitions.length === 0) return null;

    const here = status ?? chain?.find((s) => s.id === step)?.label ?? 'here';

    return (
      <div
        ref={ref}
        role="group"
        aria-label={`Move this Added Value on from ${here}`}
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
