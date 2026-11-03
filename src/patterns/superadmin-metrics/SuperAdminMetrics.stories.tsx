import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SuperAdminMetrics, type SuperAdminMetricsData } from './SuperAdminMetrics';

const DOMAINS = ['Development Domain', 'Design Domain', 'Quality Domain'];

/* The figures Figma draws. */
const METRICS: SuperAdminMetricsData = {
  valuesCreated: 25,
  valuesCompleted: 31,
  overdueRate: 26,
  activeUsers: 12,
  totalUsers: 15,
  avgPendingDays: 9.2,
  avgReviewDays: 6.5,
  acceptanceRate: 95,
  valuesRejected: 3,
};

/* Figma's empty state: counts are a real 0, rates and averages have nothing to be worked out from. */
const EMPTY: SuperAdminMetricsData = {
  valuesCreated: 0,
  valuesCompleted: 0,
  overdueRate: null,
  activeUsers: 0,
  totalUsers: 0,
  avgPendingDays: null,
  avgReviewDays: null,
  acceptanceRate: null,
  valuesRejected: 0,
};

const meta = {
  title: 'Patterns/SuperAdminMetrics',
  component: SuperAdminMetrics,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The super admin dashboard’s numbers for one domain and month: four single figures and two grouped cards, with ' +
          'a domain and month filter. It owns no arithmetic — the figures arrive ready — and reflows by its own width.',
      },
    },
  },
  args: {
    metrics: METRICS,
    domains: DOMAINS,
    domain: DOMAINS[0],
    month: '2026-09-01',
    onDomainChange: fn(),
    onMonthChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SuperAdminMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's dashboard: four single cards, then Avg. Time and Review. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Domain metrics' })).toBeVisible();
    await expect(c.getByRole('combobox', { name: 'Domain' })).toHaveValue('Development Domain');
    await expect(c.getByRole('combobox', { name: 'Month' })).toHaveValue('September 2026');
    /* The two filters read alike: the same size and weight. */
    const type = (name: string) => {
      const style = getComputedStyle(c.getByRole('combobox', { name }));
      return [style.fontSize, style.fontWeight, style.color];
    };
    await expect(type('Domain')).toEqual(type('Month'));
    for (const [label, figure] of [
      ['Values Created', '25'],
      ['Values Completed', '31'],
      ['Overdue Value Rate', '26'],
      ['In Pending', '9.2'],
      ['In Review', '6.5'],
      ['Acceptance Rate', '95'],
      ['Values Rejected', '3'],
    ]) {
      await expect(c.getByText(label, { selector: 'span' })).toBeVisible();
      await expect(c.getAllByText(figure).length).toBeGreaterThan(0);
    }
    await expect(c.getByText('/ 15')).toBeVisible();
    /* The users card is the quiet one: fixed and narrower than the three that share the row. */
    const width = (label: string) =>
      c.getByText(label, { selector: 'span' }).closest('div.relative')!.getBoundingClientRect().width;
    await expect(width('Active / Total Users')).toBeLessThan(width('Values Created'));
    await expect(width('Values Created')).toBeCloseTo(width('Values Completed'), 0);
    /* Every figure explains itself. */
    for (const name of ['Values Created', 'Overdue Value Rate', 'Active / Total Users', 'In Pending', 'Values Rejected']) {
      await expect(c.getByRole('button', { name: `About ${name}` })).toBeVisible();
    }
  },
};

/** Nothing happened yet: counts read 0, and what cannot be worked out reads "--". */
export const Empty: Story = {
  args: { metrics: EMPTY },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* Overdue rate, both averages and the acceptance rate. */
    await expect(c.getAllByText('--')).toHaveLength(4);
    await expect(c.getByText('/ 0')).toBeVisible();
    await expect(c.getAllByText('0').length).toBeGreaterThanOrEqual(4);
  },
};

/** While the figures load: a placeholder for each, and the section says it is busy. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Domain metrics' })).toHaveAttribute('aria-busy', 'true');
    await expect(c.queryByText('25')).toBeNull();
    /* The labels, filters and tooltips are all still there. */
    await expect(c.getByRole('button', { name: 'About Values Created' })).toBeVisible();
  },
};

/** Controlled: pick a domain or a month and the page fetches the new figures. */
export const Interactive: Story = {
  render: (args) => {
    const [domain, setDomain] = React.useState(args.domain);
    const [month, setMonth] = React.useState(args.month);
    return (
      <SuperAdminMetrics
        {...args}
        domain={domain}
        month={month}
        metrics={domain === 'Development Domain' ? METRICS : EMPTY}
        onDomainChange={setDomain}
        onMonthChange={setMonth}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Domain' }), 'Design Domain');
    await expect(c.getByRole('combobox', { name: 'Domain' })).toHaveValue('Design Domain');
    await expect(c.getAllByText('--')).toHaveLength(4);
    await userEvent.click(c.getByRole('combobox', { name: 'Month' }));
    await userEvent.click(await within(document.body).findByRole('button', { name: 'March 2026' }));
    await expect(c.getByRole('combobox', { name: 'Month' })).toHaveValue('March 2026');
  },
};

/** Narrower, it goes two across, then stacks: the cards follow the section, not the screen. */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-176">
      <SuperAdminMetrics {...args} />
    </div>
  ),
};

export const VeryNarrow: Story = {
  render: (args) => (
    <div className="w-96">
      <SuperAdminMetrics {...args} />
    </div>
  ),
};

/** A figure's tooltip copy can be replaced. */
export const CustomHints: Story = {
  args: { hints: { valuesCreated: 'Values created in this domain this month.' } },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
