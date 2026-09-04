import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  StatusProgression,
  avTransitions,
  type AVProgressionRole,
  type AVProgressionStatus,
  type AVWorkflow,
} from './StatusProgression';

const meta = {
  title: 'Components/Actions/StatusProgression',
  component: StatusProgression,
  parameters: {
    docs: {
      description: {
        component:
          'The "move this Added Value along" buttons, read off the Figma `Status Progression ' +
          'Buttons` page. It owns the status → transitions mapping the way StatusPill owns ' +
          'status → tone: pass workflow, role and status, handle `onTransition`, and never ' +
          'write a `status === …` branch at the call site.',
      },
    },
  },
  args: {
    workflow: 'development',
    role: 'assignee',
    status: 'For Review',
  },
  argTypes: {
    workflow: { control: 'inline-radio', options: ['development', 'design'] },
    role: {
      control: 'inline-radio',
      options: ['assignee', 'initiator', 'assignee-initiator', 'admin'],
    },
    status: {
      control: 'select',
      options: [
        'Draft',
        'Pending',
        'Accepted',
        'In Progress',
        'For Review',
        'For QA',
        'In QA',
        'Ready for Deploy',
        'Confirmed Prod',
        'Design Review',
        'Completed',
      ],
    },
  },
} satisfies Meta<typeof StatusProgression>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The step back is secondary, the step forward primary — the design's order. */
export const BackAndForward: Story = {
  args: { status: 'In QA' },
};

/** The first step: nothing to return to, so one button. */
export const ForwardOnly: Story = {
  args: { status: 'Accepted' },
};

/** An admin looking at a Pending AV: the one destructive button in the set. */
export const AdminPending: Story = {
  args: { role: 'admin', status: 'Pending' },
};

/** Creating an AV — the only place "Save as Draft"/"Submit" appears. */
export const Draft: Story = {
  args: { role: 'assignee-initiator', status: 'Draft' },
};

/** A terminal status draws nothing. The design's empty variant, honoured. */
export const Terminal: Story = {
  args: { status: 'Completed' },
  render: (args) => (
    <div className="text-body-sm text-text-tertiary">
      <StatusProgression {...args} />
      (nothing renders — `Completed` has no moves)
    </div>
  ),
};

/** Mid-save: the committing button spins, the way back stays readable. */
export const Loading: Story = {
  args: { status: 'For QA', loading: true },
};

const WORKFLOWS: AVWorkflow[] = ['development', 'design'];
const ROLES: AVProgressionRole[] = ['assignee', 'assignee-initiator', 'initiator', 'admin'];
const STATUSES: AVProgressionStatus[] = [
  'Draft',
  'Pending',
  'Accepted',
  'In Progress',
  'For Review',
  'For QA',
  'In QA',
  'Ready for Deploy',
  'Confirmed Prod',
  'Design Review',
  'Completed',
];

/**
 * Every row the design defines, in one place — the eight Figma sets laid out
 * as workflow × role × status. Blank cells are statuses that role never sees.
 */
export const EveryTransition: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {WORKFLOWS.map((workflow) => (
        <section key={workflow} className="flex flex-col gap-4">
          <h3 className="text-heading-sm capitalize text-text-primary">{workflow}</h3>
          {ROLES.map((role) => {
            const rows = STATUSES.filter(
              (status) => avTransitions(workflow, role, status).length > 0,
            );
            return (
              <div key={role} className="flex flex-col gap-2">
                <p className="text-label-md text-text-tertiary">{role}</p>
                {rows.length === 0 ? (
                  <p className="text-body-sm text-text-tertiary">no moves</p>
                ) : (
                  rows.map((status) => (
                    <div key={status} className="flex items-center gap-4">
                      <span className="w-40 shrink-0 text-body-sm text-text-secondary">
                        {status}
                      </span>
                      <StatusProgression workflow={workflow} role={role} status={status} />
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  ),
};
