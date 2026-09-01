import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta = {
  title: 'Display/Divider',
  component: Divider,
  parameters: {
    docs: {
      description: {
        component:
          'A hairline rule that separates content, horizontally or vertically, with an ' +
          'optional centred caption sitting inside the line. Decorative by default — set ' +
          '`decorative={false}` when the rule is the only thing announcing a new section.',
      },
    },
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-96">
      <Divider {...args} />
    </div>
  ),
};

/**
 * A vertical rule takes its length from its parent. Inside a flex row
 * `self-stretch` matches the tallest sibling; `min-h-4` keeps it from
 * disappearing anywhere the parent gives it no height at all.
 */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex h-10 items-center gap-4 text-text-secondary">
      <span className="text-label-lg">Draft</span>
      <Divider {...args} />
      <span className="text-label-lg">Edited 3h ago</span>
      <Divider {...args} />
      <span className="text-label-lg">2 reviewers</span>
    </div>
  ),
};

/** The caption sits inside the rule. Horizontal only. */
export const WithLabel: Story = {
  args: { label: 'or' },
  render: (args) => (
    <div className="w-96">
      <Divider {...args} />
    </div>
  ),
};

/**
 * Left: the default. `role="presentation"`, so a screen reader never mentions it —
 * the heading below already says a new section starts.
 * Right: `decorative={false}` renders `role="separator"`, for the case where the
 * rule is the *only* signal that the group changed.
 */
export const DecorativeVsSemantic: Story = {
  render: () => (
    <div className="grid w-full grid-cols-2 gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-caption-sm uppercase text-text-subtle">decorative (default)</span>
        <div className="rounded-md border border-stroke-subtle bg-surface-elevated p-4">
          <p className="text-body-md text-text-secondary">Company profile</p>
          <Divider className="my-3" />
          <p className="text-heading-sm text-text-primary">Billing</p>
          <p className="text-body-md text-text-secondary">Invoices and payment methods.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-caption-sm uppercase text-text-subtle">semantic</span>
        <div className="rounded-md border border-stroke-subtle bg-surface-elevated p-1">
          <p className="px-3 py-2 text-body-md text-text-secondary">Duplicate</p>
          <p className="px-3 py-2 text-body-md text-text-secondary">Move to…</p>
          <Divider decorative={false} className="my-1" />
          <p className="px-3 py-2 text-body-md text-accent-critical-tonal-content-default">Delete</p>
        </div>
      </div>
    </div>
  ),
};

/** Between real content blocks, at the rhythm the page already uses. */
export const BetweenContent: Story = {
  render: () => (
    <div className="w-112 rounded-md border border-stroke-subtle bg-surface-elevated p-6">
      <h3 className="text-heading-sm text-text-primary">Added Value</h3>
      <p className="mt-1 text-body-md text-text-secondary">
        Everything the supplier committed to beyond the contract price.
      </p>
      <Divider className="my-5" />
      <h3 className="text-heading-sm text-text-primary">Commitments</h3>
      <p className="mt-1 text-body-md text-text-secondary">
        Twelve open, three overdue. Owned by the category lead.
      </p>
      <Divider label="then" className="my-5" />
      <h3 className="text-heading-sm text-text-primary">Reporting</h3>
      <p className="mt-1 text-body-md text-text-secondary">
        Quarterly, exported to the supplier scorecard.
      </p>
    </div>
  ),
};

/** `stroke.default` is a semantic token, so the dark theme comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-5 bg-surface-canvas p-8">
            <Divider />
            <Divider label="or" />
            <div className="flex h-8 items-center gap-4 text-text-secondary">
              <span className="text-label-lg">One</span>
              <Divider orientation="vertical" />
              <span className="text-label-lg">Two</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
