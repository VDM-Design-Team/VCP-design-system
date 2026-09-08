import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill, AV_STATUSES } from './StatusPill';

const meta = {
  title: 'Components/Display/StatusPill',
  component: StatusPill,
  parameters: {
    docs: {
      description: {
        component:
          'An Added Value’s status as a pill — a component composing `Badge`, and the owner ' +
          'of VCP’s status vocabulary and its status → treatment mapping. **The vocabulary is ' +
          'open.** The ten spine statuses are fixed and each keeps its own fill, measured off ' +
          'the Figma `Status_Tag_General` set. Domain steps — anything Design, Development, ' +
          'Content, Partners, Governance or Product defines in its own chain — are passed as ' +
          '`custom` and all wear one treatment, because this component knows nothing about a ' +
          'step it did not define. Not clickable by design: changing status is the options ' +
          'dropdown’s job.',
      },
    },
  },
  /* A default so individual stories need only `render`. The props are a
     discriminated union (`status` xor `custom`), and without a default that
     satisfies one branch, TypeScript demands `args` on every story. */
  args: { status: 'Draft' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The spine: ten fixed statuses, each with the fill the design gives it. */
export const SpineStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {AV_STATUSES.map((status) => (
        <StatusPill key={status} status={status} />
      ))}
    </div>
  ),
};

/**
 * Domain steps. Every one of these is `custom`, so every one wears the same
 * blue tonal — whatever the domain calls it and whatever phase it represents.
 */
export const DomainSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-28 text-label-md text-text-secondary">Design</span>
        {['Design review'].map((label) => (
          <StatusPill key={label} custom={label} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-28 text-label-md text-text-secondary">Development</span>
        {['For review', 'For QA', 'In QA', 'Ready for deploy', 'Confirmed prod'].map((label) => (
          <StatusPill key={label} custom={label} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-28 text-label-md text-text-secondary">Governance</span>
        {['Awaiting legal', 'Risk signed off'].map((label) => (
          <StatusPill key={label} custom={label} />
        ))}
      </div>
    </div>
  ),
};

/**
 * A whole AV lifecycle in order: spine, then the domain's middle, then spine
 * again. The colour change is the useful signal — it says which half of the
 * flow you are looking at.
 */
export const OneAVsJourney: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill status="Draft" />
      <StatusPill status="Pending" />
      <StatusPill status="Accepted" />
      <StatusPill status="In Progress" />
      <StatusPill custom="For QA" />
      <StatusPill custom="Confirmed prod" />
      <StatusPill status="Completed" />
      <StatusPill status="Final Completed" />
    </div>
  ),
};

/**
 * The two Completed states, side by side. `Completed` is the assignee's — the
 * work is done and waiting to be accepted, which is the same shape as
 * `Pending`, so it wears the same tone. `Final Completed` is the one that
 * means finished.
 */
export const TwoCompletedStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="w-64 text-body-sm text-text-secondary">assignee finished their work</span>
        <StatusPill status="Completed" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-64 text-body-sm text-text-secondary">initiator or admin accepted it</span>
        <StatusPill status="Final Completed" />
      </div>
    </div>
  ),
};

/** Both sizes, on a spine status and a domain step. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <span className="w-8 text-label-md text-text-secondary">{size}</span>
          <StatusPill size={size} status="Pending" />
          <StatusPill size={size} custom="Awaiting legal" />
        </div>
      ))}
    </div>
  ),
};

/**
 * `Review` is drawn twice. Tonal is the label style — what a user sees.
 * Filled is the button style, for a viewer who can act on it: an admin, or
 * the AV's initiator. Same status, different viewer.
 */
export const ReviewHasTwoStyles: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-40 text-label-md text-text-secondary">A user sees</span>
        <StatusPill status="Review" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-40 text-label-md text-text-secondary">An admin sees</span>
        <StatusPill status="Review" actionable />
      </div>
    </div>
  ),
};

/**
 * `actionable` on any other status is a no-op — the design draws one
 * treatment for each of them, and this component will not invent a second.
 */
export const ActionableIsReviewOnlyToday: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <StatusPill status="Pending" actionable />
      <StatusPill status="Rejected" actionable />
      <StatusPill custom="For QA" actionable />
    </div>
  ),
};

/** Every fill is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-48 flex-col gap-2 bg-surface-canvas p-8">
            {AV_STATUSES.map((status) => (
              <StatusPill key={status} status={status} className="self-start" />
            ))}
            <StatusPill custom="Awaiting legal" className="self-start" />
          </div>
        </div>
      ))}
    </div>
  ),
};
