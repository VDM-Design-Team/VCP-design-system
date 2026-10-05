import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard, StatCardGroup } from './StatCard';
import { Icon } from '../../atoms/icon';
import { DonutChart } from '../../atoms/donut-chart';

/* The icon control: a dropdown of the filled glyphs the dashboards use,
   mapped to real `<Icon size="lg" />` nodes — a ReactNode prop otherwise only
   offers "Set object". */
const ICONS = [
  'check-square-fill',
  'note-pencil-fill',
  'calendar-x-fill',
  'users-fill',
  'clock-fill',
  'chat-dots-fill',
  'thumbs-up-fill',
  'x-circle-fill',
] as const;
const ICON_MAPPING = Object.fromEntries(ICONS.map((n) => [n, <Icon name={n} size="lg" />]));

const meta = {
  title: 'Components/Display/StatCard',
  component: StatCard,
  parameters: {
    docs: {
      description: {
        component:
          'One number that matters, on a card. There are two, one per dashboard, set by ' +
          '`variant`: `default` is the **Value_Card** on the admin and user dashboards — an 8 ' +
          'stripe, left-aligned, label over a bold value, 100 high. `superadmin` is the **super ' +
          'admin metric card** — a 12 stripe, centred, an icon, label and info hint over a ' +
          'semibold value and unit, 150 high. `StatCardGroup` is the super admin dashboard’s ' +
          'grouped card: two or more values under one title, split by dividers. `accent` sets ' +
          'the stripe and icon tone. The label is not a heading: the dashboard section owns the ' +
          'outline.',
      },
    },
  },
  args: { label: 'Completed', value: '12', accent: 'success', variant: 'default' },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'superadmin'] },
    icon: { control: 'select', options: ['none', ...ICONS], mapping: { none: undefined, ...ICON_MAPPING } },
    hint: { control: 'text' },
    accent: {
      control: 'select',
      options: ['neutral', 'brand', 'info', 'success', 'critical', 'warning'],
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The admin and user dashboards' Value_Card: the stripe, the label, the bold
 * value. Flip `variant` to `superadmin` and the super admin card's title row
 * fills in — an icon and an info hint, as Figma draws it — unless you've set
 * your own in the controls.
 */
export const Default: Story = {
  render: (args) => {
    const superadmin = args.variant === 'superadmin';
    return (
      <div className={superadmin ? 'w-72 pt-16' : 'w-60 pt-16'}>
        <StatCard
          {...args}
          icon={args.icon ?? (superadmin ? <Icon name="check-square-fill" size="lg" /> : undefined)}
          hint={args.hint ?? (superadmin ? 'Added Values moved to Completed in the selected period.' : undefined)}
        />
      </div>
    );
  },
};

/**
 * The admin and user dashboards' "Value Cards" row, as Figma draws it (`VCP
 * Pages & Flows`, node `947:306362`): one card per Added Value status,
 * left-aligned, sharing the row. In Progress is the brand blue; the others
 * are accent or neutral.
 */
export const AdminAndUserDashboard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-280 flex-wrap gap-3">
      {(
        [
          ['Completed', '12', 'success'],
          ['Overdue', '3', 'critical'],
          ['In Progress', '8', 'brand'],
          ['Pending', '4', 'warning'],
          ['Draft', '5', 'neutral'],
        ] as const
      ).map(([label, value, accent]) => (
        <div key={label} className="flex-1">
          <StatCard label={label} value={value} accent={accent} />
        </div>
      ))}
    </div>
  ),
};

/**
 * One super admin card with everything switched on: the accent icon, the
 * label, the info hint, and a value with its unit. Centred, 150 high.
 */
export const SuperAdmin: Story = {
  args: {
    variant: 'superadmin',
    label: 'Overdue Value Rate',
    value: '26',
    unit: '%',
    accent: 'critical',
    hint: 'Share of active Added Values past their due date.',
    icon: <Icon name="calendar-x-fill" size="lg" />,
  },
  render: (args) => (
    <div className="w-80 pt-16">
      <StatCard {...args} />
    </div>
  ),
};

/**
 * The super admin dashboard's metrics, as Figma draws them (`VCP Pages &
 * Flows`, node `3:4848`): four single cards, then two grouped cards — both
 * rows 150 high.
 */
export const SuperAdminDashboard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-280 flex-col gap-6 pt-16">
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          variant="superadmin"
          label="Values Created"
          value="25"
          accent="info"
          hint="Added Values created in the selected period."
          icon={<Icon name="note-pencil-fill" size="lg" />}
        />
        <StatCard
          variant="superadmin"
          label="Values Completed"
          value="31"
          accent="success"
          hint="Added Values moved to Completed in the selected period."
          icon={<Icon name="check-square-fill" size="lg" />}
        />
        <StatCard
          variant="superadmin"
          label="Overdue Value Rate"
          value="26"
          unit="%"
          accent="critical"
          hint="Share of active Added Values past their due date."
          icon={<Icon name="calendar-x-fill" size="lg" />}
        />
        <StatCard
          variant="superadmin"
          label="Active / Total Users"
          value="12"
          unit="/ 15"
          accent="neutral"
          hint="Count of unique users from total users in the Domain who created, updated, or completed a Value in the selected period"
          icon={<Icon name="users-fill" size="lg" />}
        />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <StatCardGroup
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
              icon: <Icon name="chat-dots-fill" size="lg" />,
              hint: 'Average of: Review decision date – Completion date',
            },
          ]}
        />
        <StatCardGroup
          title="Review"
          items={[
            {
              label: 'Acceptance Rate',
              value: '95',
              unit: '%',
              accent: 'info',
              icon: <Icon name="thumbs-up-fill" size="lg" />,
              hint: 'Share of reviewed Added Values that were accepted.',
            },
            {
              label: 'Values Rejected',
              value: '3',
              accent: 'critical',
              icon: <Icon name="x-circle-fill" size="lg" />,
              hint: 'Added Values rejected in the selected period.',
            },
          ]}
        />
      </div>
    </div>
  ),
};

/** `unit` is the measurement beside the value — "%", "days" — on its baseline. */
export const WithUnit: Story = {
  args: { variant: 'superadmin', label: 'In Pending', value: '9.2', unit: 'days', accent: 'warning' },
  render: (args) => (
    <div className="w-72">
      <StatCard {...args} />
    </div>
  ),
};

/**
 * Values are nodes — a `DonutChart` makes a gauge tile. Use the super admin
 * card: its 150 leaves room for the ring under the title row.
 */
export const WithADonut: Story = {
  args: { variant: 'superadmin', label: 'Capacity used', accent: 'info' },
  render: (args) => (
    <div className="w-64">
      <StatCard
        {...args}
        value={<DonutChart value={26} max={40} size={88} thickness={10} caption="of 40 pts" />}
      />
    </div>
  ),
};

/**
 * Two or more values under one title, split by vertical dividers — the super
 * admin dashboard's `_SuperAdmin_Metric_Card_Grouped`. No stripe; each item's
 * icon carries its own tone. Centred.
 */
export const Grouped: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-150 pt-16">
      <StatCardGroup
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
            icon: <Icon name="chat-dots-fill" size="lg" />,
            hint: 'Average of: Review decision date – Completion date',
          },
        ]}
      />
    </div>
  ),
};

/** More than two items share the width equally. */
export const GroupedThreeItems: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-200 pt-16">
      <StatCardGroup
        title="Avg. Time"
        items={[
          { label: 'In Pending', value: '9.2', unit: 'days', accent: 'warning', icon: <Icon name="clock-fill" size="lg" /> },
          { label: 'In Review', value: '6.5', unit: 'days', accent: 'info', icon: <Icon name="chat-dots-fill" size="lg" /> },
          { label: 'Completed', value: '3.1', unit: 'days', accent: 'success', icon: <Icon name="check-square-fill" size="lg" /> },
        ]}
      />
    </div>
  ),
};

/** Both cards and the group are tokens throughout, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="grid grid-cols-2 gap-4 bg-surface-canvas p-8">
            <StatCard label="Completed" value="12" accent="success" />
            <StatCard label="In Progress" value="8" accent="brand" />
            <StatCard
              variant="superadmin"
              label="Values Created"
              value="25"
              accent="info"
              icon={<Icon name="note-pencil-fill" size="lg" />}
            />
            <StatCard
              variant="superadmin"
              label="Overdue Value Rate"
              value="26"
              unit="%"
              accent="critical"
              icon={<Icon name="calendar-x-fill" size="lg" />}
            />
            <div className="col-span-2">
              <StatCardGroup
                title="Avg. Time"
                items={[
                  { label: 'In Pending', value: '9.2', unit: 'days', accent: 'warning', icon: <Icon name="clock-fill" size="lg" /> },
                  { label: 'In Review', value: '6.5', unit: 'days', accent: 'info', icon: <Icon name="chat-dots-fill" size="lg" /> },
                ]}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
