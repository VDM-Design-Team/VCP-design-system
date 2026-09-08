import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  StatusProgression,
  avTransitions,
  type AVChainStep,
  type AVProgressionRole,
} from './StatusProgression';
import type { AVStatus } from '../status-pill';

/* Two domains' chains, one for one with the Figma `Status_Tag_Design_Only`
   and `Status_Tag_Development_Only` sets. `In Progress` is not in either —
   it is spine, drawn in `Status_Tag_General`, and every domain passes through
   it before its own chain starts. */
const DEVELOPMENT: AVChainStep[] = [
  { id: 'for-review', label: 'For review' },
  { id: 'for-qa', label: 'For QA' },
  { id: 'in-qa', label: 'In QA' },
  { id: 'ready-for-deploy', label: 'Ready for deploy' },
  { id: 'confirmed-prod', label: 'Confirmed prod' },
];

const DESIGN: AVChainStep[] = [{ id: 'design-review', label: 'Design review' }];

/* A domain the repo has never heard of, to show that none of this is wired
   to Design and Development specifically. */
const GOVERNANCE: AVChainStep[] = [
  { id: 'awaiting-legal', label: 'Awaiting legal' },
  { id: 'risk-review', label: 'Risk review' },
  { id: 'signed-off', label: 'Signed off' },
];

const meta = {
  title: 'Components/Actions/StatusProgression',
  component: StatusProgression,
  parameters: {
    docs: {
      description: {
        component:
          'The "move this Added Value along" buttons, read off the Figma `Status Progression ' +
          'Buttons` page. **It owns the spine** — the moves out of `Draft`, the admin’s ' +
          'accept/reject on `Pending`, the terminal silence on `Completed` — because those are ' +
          'the same in every domain. **It does not own the middle**: the domain passes its ' +
          'ordered `chain`, and the back/forward moves derive from position in it. Never write ' +
          'a `status === …` branch at the call site.',
      },
    },
  },
  /* A default so individual stories need only `render` — the props are a
     discriminated union (`status` xor `step`), and without one TypeScript
     demands `args` on every story. */
  args: { role: 'assignee', status: 'Draft' },
  argTypes: {
    role: {
      control: 'inline-radio',
      options: ['assignee', 'initiator', 'assignee-initiator', 'admin'],
    },
  },
} satisfies Meta<typeof StatusProgression>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mid-chain: a step back and a step forward, both named by the domain. */
export const Default: Story = {
  render: () => <StatusProgression role="assignee" chain={DEVELOPMENT} step="for-qa" />,
};

/** The first step returns to `In Progress`, the shared step it came from. */
export const FirstStep: Story = {
  render: () => <StatusProgression role="assignee" chain={DEVELOPMENT} step="for-review" />,
};

/** The last step hands off instead of moving on. Admins get the short label. */
export const LastStep: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StatusProgression role="assignee" chain={DEVELOPMENT} step="confirmed-prod" />
      <StatusProgression role="admin" chain={DEVELOPMENT} step="confirmed-prod" />
    </div>
  ),
};

/** The spine. `Draft` and `Pending` never leave this component. */
export const SpineMoves: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StatusProgression role="initiator" status="Draft" />
      <StatusProgression role="admin" status="Pending" />
      <StatusProgression role="admin" status="Accepted" />
      <StatusProgression role="admin" status="In Progress" chain={DEVELOPMENT} />
    </div>
  ),
};

/**
 * The same component over three domains, including one this repo has never
 * heard of. Nothing here is wired to Design and Development — that is the
 * point of the change.
 */
export const AnyDomain: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(
        [
          ['Development', DEVELOPMENT, 'in-qa'],
          ['Design', DESIGN, 'design-review'],
          ['Governance', GOVERNANCE, 'risk-review'],
        ] as const
      ).map(([name, chain, step]) => (
        <div key={name} className="flex flex-col gap-2">
          <p className="text-label-md text-text-tertiary">{name}</p>
          <StatusProgression role="assignee" chain={chain} step={step} />
        </div>
      ))}
    </div>
  ),
};

/** Mid-save: the committing button spins, the way back stays readable. */
export const Loading: Story = {
  render: () => <StatusProgression role="assignee" chain={DEVELOPMENT} step="for-qa" loading />,
};

/** Every button disabled — mid-save, or the viewer lacks the right. */
export const Disabled: Story = {
  render: () => <StatusProgression role="assignee" chain={DEVELOPMENT} step="for-qa" disabled />,
};

/** A terminal status draws nothing rather than an empty toolbar. */
export const Terminal: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-body-sm text-text-tertiary">
      <StatusProgression role="assignee" status="Completed" />
      (renders nothing)
    </div>
  ),
};

/**
 * `Review` — the decision after handoff, named in issue #60. Only an
 * initiator or admin gets it; the assignee already handed the AV off.
 * Reject is outline here (`rejectSoft`), not the solid `Pending` one.
 */
export const ReviewDecision: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StatusProgression role="initiator" status="Review" />
      <StatusProgression role="admin" status="Review" />
      <StatusProgression role="assignee" status="Review" />
      <p className="text-caption-md text-text-tertiary">
        (assignee renders nothing — they already handed it off)
      </p>
    </div>
  ),
};

/**
 * The Development-only exception, named in issue #60: `Completed` isn't
 * always final. With `pendingDeploy`, an admin still owes a `Deploy` before
 * the real terminal `Completed` — same tag, same text, as design specified.
 */
export const PendingDeploy: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StatusProgression role="admin" status="Completed" pendingDeploy />
      <StatusProgression role="assignee" status="Completed" pendingDeploy />
      <p className="text-caption-md text-text-tertiary">
        (assignee renders nothing — only the admin deploys)
      </p>
    </div>
  ),
};

const ROLES: AVProgressionRole[] = ['assignee', 'assignee-initiator', 'initiator', 'admin'];
const SPINE: AVStatus[] = ['Draft', 'Pending', 'Accepted', 'In Progress', 'Review', 'Completed'];

/**
 * Every move the component defines, over the Development chain — the spine
 * rows first, then one row per chain step. Blank rows are positions that role
 * never drives.
 */
export const EveryTransition: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {ROLES.map((role) => {
        const spine = SPINE.filter(
          (status) => avTransitions({ role, status, chain: DEVELOPMENT }).length > 0,
        );
        const steps = DEVELOPMENT.filter(
          (s) => avTransitions({ role, step: s.id, chain: DEVELOPMENT }).length > 0,
        );
        return (
          <div key={role} className="flex flex-col gap-2">
            <p className="text-label-md text-text-tertiary">{role}</p>
            {spine.length === 0 && steps.length === 0 ? (
              <p className="text-body-sm text-text-tertiary">no moves</p>
            ) : (
              <>
                {spine.map((status) => (
                  <div key={status} className="flex items-center gap-4">
                    <span className="w-40 shrink-0 text-body-sm text-text-secondary">{status}</span>
                    <StatusProgression role={role} status={status} chain={DEVELOPMENT} />
                  </div>
                ))}
                {steps.map((s) => (
                  <div key={s.id} className="flex items-center gap-4">
                    <span className="w-40 shrink-0 text-body-sm text-text-tertiary">{s.label}</span>
                    <StatusProgression role={role} step={s.id} chain={DEVELOPMENT} />
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  ),
};
