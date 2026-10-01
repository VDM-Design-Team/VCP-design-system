import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard, StatCardGroup } from './StatCard';
import { Icon } from '../../atoms/icon';
import { DonutChart } from '../../atoms/donut-chart';

const meta = {
  title: 'Components/Display/StatCard',
  component: StatCard,
  parameters: {
    docs: {
      description: {
        component:
          'One number that matters, on a card. `StatCard` is one value with a coloured left ' +
          'stripe; `StatCardGroup` is two or more values under one title, split by dividers. ' +
          '`variant` picks the look: `default` is the Value_Card on normal and admin dashboards, ' +
          '`superadmin` the larger card of the superadmin dashboard. `accent` sets the stripe ' +
          'and icon tone; `hint` adds a focusable info glyph after the label. `align` is left ' +
          '(the default) or centred — a control on every story, for both forms. The label is ' +
          'not a heading: the dashboard section owns the outline.',
      },
    },
  },
  args: { label: 'Open claims', value: '128', align: 'start', variant: 'default' },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'superadmin'] },
    align: { control: 'radio', options: ['start', 'center'] },
    accent: {
      control: 'select',
      options: ['neutral', 'brand', 'info', 'success', 'critical', 'warning'],
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One value, with every option switched on: an icon, the label, an info
 * tooltip (`hint`), the value and its measurement (`unit`), and the stripe's
 * tone (`accent`). Use the controls to flip `align` between left and centred,
 * change the tone, or clear any of them.
 */
export const Default: Story = {
  args: {
    label: 'Overdue rate',
    value: '26',
    unit: '%',
    accent: 'info',
    hint: 'Share of active Added Values past their due date.',
    icon: <Icon name="graph-fill" size="lg" />,
  },
  render: (args) => (
    <div className="w-72 pt-16">
      <StatCard {...args} />
    </div>
  ),
};

/** `unit` is the measurement beside the value — "%", "days" — bottom-aligned with it. */
export const WithUnit: Story = {
  args: { label: 'Overdue rate', value: '26', unit: '%', accent: 'critical' },
  render: (args) => (
    <div className="w-64">
      <StatCard {...args} />
    </div>
  ),
};

/**
 * The Value_Card on normal and admin dashboards (Figma node 4200:21967): a title and
 * a value, with the stripe in the card's tone. In Review and In Progress use the
 * `brand` tone; the rest are accent or neutral. The default variant.
 */
export const DashboardValueCards: Story = {
  render: (args) => (
    <div className="grid w-280 grid-cols-6 gap-5">
      <StatCard align={args.align} variant={args.variant} label="Completed" value="12" accent="success" />
      <StatCard align={args.align} variant={args.variant} label="In Review" value="6" accent="brand" />
      <StatCard align={args.align} variant={args.variant} label="Overdue" value="3" accent="critical" />
      <StatCard align={args.align} variant={args.variant} label="In Progress" value="8" accent="brand" />
      <StatCard align={args.align} variant={args.variant} label="Pending" value="4" accent="warning" />
      <StatCard align={args.align} variant={args.variant} label="Draft" value="5" accent="neutral" />
    </div>
  ),
};

/**
 * A stripe and icon in each card's tone, and a focusable info glyph (`hint`)
 * after the label. This is the `superadmin` variant, matching Figma's
 * `_SuperAdmin_Metric_Card_Coloured_Base`; the superadmin dashboard sets
 * `align` to `center`.
 */
export const TonesAndHints: Story = {
  args: { variant: 'superadmin' },
  render: (args) => (
    <div className="grid w-200 grid-cols-2 gap-4 pt-16">
      <StatCard
        align={args.align}
        variant={args.variant}
        label="Values Created"
        value="25"
        accent="info"
        hint="Added Values created in the selected cycle."
        icon={<Icon name="note-pencil-fill" size="lg" />}
      />
      <StatCard
        align={args.align}
        variant={args.variant}
        label="Values Completed"
        value="31"
        accent="success"
        hint="Added Values moved to Completed."
        icon={<Icon name="check-circle-fill" size="lg" />}
      />
      <StatCard
        align={args.align}
        variant={args.variant}
        label="Overdue Value Rate"
        value="26"
        unit="%"
        accent="critical"
        hint="Share of active Added Values past their due date."
        icon={<Icon name="warning-fill" size="lg" />}
      />
      <StatCard
        align={args.align}
        variant={args.variant}
        label="Active / Total Users"
        value="12"
        unit="/ 15"
        accent="neutral"
        icon={<Icon name="users-fill" size="lg" />}
      />
    </div>
  ),
};

/** A dashboard row — the natural habitat. */
export const Tiled: Story = {
  render: (args) => (
    <div className="grid w-200 grid-cols-4 gap-4">
      <StatCard align={args.align} variant={args.variant} label="Open claims" value="128" icon={<Icon name="file-fill" size="lg" />} />
      <StatCard align={args.align} variant={args.variant} label="Escalations" value="6" icon={<Icon name="warning-fill" size="lg" />} />
      <StatCard align={args.align} variant={args.variant} label="Reconciled" value="1,204" icon={<Icon name="check-circle-fill" size="lg" />} />
      <StatCard align={args.align} variant={args.variant} label="Avg. response" value="2.4" unit="days" icon={<Icon name="clock-fill" size="lg" />} />
    </div>
  ),
};

/**
 * Values are nodes — a `DonutChart` makes a gauge tile. The card is a fixed
 * height, so the ring is sized to leave room for the title row above it.
 */
export const WithADonut: Story = {
  args: { label: 'Capacity used' },
  render: (args) => (
    <div className="w-64">
      <StatCard
        align={args.align}
        variant={args.variant}
        label={args.label}
        value={<DonutChart value={26} max={40} size={88} thickness={10} caption="of 40 pts" />}
      />
    </div>
  ),
};

/**
 * Two or more values under one title, split by vertical dividers. No stripe;
 * each item's icon carries its own tone. Matches Figma's
 * `_SuperAdmin_Metric_Card_Grouped_Base`. The group title is always centred;
 * `align` moves the items' content.
 */
export const Grouped: Story = {
  argTypes: { variant: { table: { disable: true } } },
  render: (args) => (
    <div className="w-150 pt-16">
      <StatCardGroup
        align={args.align}
        title="Avg. Time"
        items={[
          {
            label: 'In Pending',
            value: '9.2',
            unit: 'days',
            accent: 'warning',
            icon: <Icon name="clock-fill" size="lg" />,
            hint: 'Average of: (Accepted date OR Rejected date) – Submitted date',
          },
          {
            label: 'In Review',
            value: '6.5',
            unit: 'days',
            accent: 'info',
            icon: <Icon name="chats-circle-fill" size="lg" />,
            hint: 'Average of: Review decision date – Completion date',
          },
        ]}
      />
    </div>
  ),
};

/** More than two items share the width equally. */
export const GroupedThreeItems: Story = {
  argTypes: { variant: { table: { disable: true } } },
  render: (args) => (
    <div className="w-200 pt-16">
      <StatCardGroup
        align={args.align}
        title="Avg. Time"
        items={[
          { label: 'In Pending', value: '9.2', unit: 'days', accent: 'warning', icon: <Icon name="clock-fill" size="lg" /> },
          { label: 'In Review', value: '6.5', unit: 'days', accent: 'info', icon: <Icon name="chats-circle-fill" size="lg" /> },
          { label: 'Completed', value: '3.1', unit: 'days', accent: 'success', icon: <Icon name="check-circle-fill" size="lg" /> },
        ]}
      />
    </div>
  ),
};

/** Card, numerals and dividers are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="grid grid-cols-2 gap-4 bg-surface-canvas p-8">
            <StatCard align={args.align} variant={args.variant} label="Points delivered" value="34" accent="success" />
            <StatCard align={args.align} variant={args.variant} label="Handling cost" value="41" unit="k" accent="critical" />
            <div className="col-span-2">
              <StatCardGroup
                align={args.align}
                title="Avg. Time"
                items={[
                  { label: 'In Pending', value: '9.2', unit: 'days', accent: 'warning', icon: <Icon name="clock-fill" size="lg" /> },
                  { label: 'In Review', value: '6.5', unit: 'days', accent: 'info', icon: <Icon name="chats-circle-fill" size="lg" /> },
                ]}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
