import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FilterBar, type FilterBarProps } from './FilterBar';

const STATUSES = ['Pending', 'Accepted', 'In progress', 'Design Review', 'Review', 'Rejected', 'Backlog'];
const PRIORITIES = [
  { value: 'all', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];
const TAGS = [
  { value: 'bug', label: 'Bug', group: 'Global (Cross-Domain)' },
  { value: 'feature', label: 'New Feature', group: 'Global (Cross-Domain)' },
  { value: 'improvement', label: 'Improvement', group: 'Global (Cross-Domain)' },
  { value: 'vcp', label: 'VCP', group: 'Domain-Specific (In-Domain)' },
  { value: 'offerpump', label: 'OfferPump', group: 'Domain-Specific (In-Domain)' },
  { value: 'whu', label: 'WHU', group: 'Domain-Specific (In-Domain)' },
  { value: 'nt', label: 'NT', group: 'Domain-Specific (In-Domain)' },
  { value: 'caf', label: 'CAF', group: 'Domain-Specific (In-Domain)' },
];
const CYCLES = [
  { value: 'c34', code: 'C34', start: '2026-06-09', end: '2026-06-23' },
  { value: 'c33', code: 'C33', start: '2026-05-25', end: '2026-06-08' },
  { value: 'c32', code: 'C32', start: '2026-05-11', end: '2026-05-24' },
  { value: 'c18', code: 'C18', start: '2025-09-20', end: '2026-10-02' },
];
const PRESETS = [
  { label: 'Today', value: '2026-09-15' },
  { label: 'Last 7 days', value: '2026-09-09', rangeEnd: '2026-09-15' },
  { label: 'This Month', value: '2026-09-01', rangeEnd: '2026-09-30' },
  { label: 'Last Month', value: '2026-08-01', rangeEnd: '2026-08-31' },
];

const meta = {
  title: 'Patterns/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The row of filters above a list: search, period, status, priority and tags, then ' +
          'Reset and a Filters button that shows or hides the fields. Every filter is ' +
          'controlled by the page; the bar draws the fields and reports changes. Leave a ' +
          'filter out and its field is not drawn.',
      },
    },
  },
  args: { onReset: fn(), onSearchChange: fn() },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A page's filter state, so each story is the real thing: values go in, and come back out. */
function Page(
  props: FilterBarProps & {
    initial?: Partial<State>;
    /** Filters this page does not have: it leaves their props out, which is how the bar hides them. */
    without?: Array<'period' | 'cycle' | 'status' | 'priority' | 'tags'>;
  },
) {
  const { initial, without = [], ...rest } = props;
  const has = (name: 'period' | 'cycle' | 'status' | 'priority' | 'tags') => !without.includes(name);
  const [s, setS] = React.useState<State>({
    search: '',
    period: {},
    status: [],
    priority: '',
    tags: [],
    cycle: '',
    ...initial,
  });
  const set = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }));
  return (
    <FilterBar
      {...rest}
      search={s.search}
      onSearchChange={(search) => {
        set({ search });
        rest.onSearchChange?.(search);
      }}
      period={has('period') ? { value: s.period, onChange: (period) => set({ period }), presets: PRESETS } : undefined}
      cycle={has('cycle') ? { options: CYCLES, value: s.cycle, onChange: (cycle) => set({ cycle }) } : undefined}
      status={has('status') ? { options: STATUSES, value: s.status, onChange: (status) => set({ status }) } : undefined}
      priority={
        has('priority') ? { options: PRIORITIES, value: s.priority, onChange: (priority) => set({ priority }) } : undefined
      }
      tags={has('tags') ? { options: TAGS, value: s.tags, onChange: (tags) => set({ tags }) } : undefined}
      onReset={() => {
        set({ search: '', period: {}, status: [], priority: '', tags: [], cycle: '' });
        rest.onReset?.();
      }}
    />
  );
}
interface State {
  search: string;
  period: { start?: string; end?: string };
  status: string[];
  priority: string;
  cycle: string;
  tags: string[];
}

/** Figma's Filters-shown bar, empty: search at the left, the fields, Reset and Filters at the right. */
export const Default: Story = {
  render: (args) => <Page {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('searchbox'), 'pump');
    await expect(args.onSearchChange).toHaveBeenLastCalledWith('pump');

    /* Priority: the native select, with an explicit "All priorities". */
    /* Cycle: the row says the code and the dates, the field keeps just the code. */
    await userEvent.click(canvas.getByRole('button', { name: 'Cycle' }));
    await userEvent.click(canvas.getByRole('option', { name: 'C33 (May 25, 2026 - Jun 08, 2026)' }));
    await expect(canvas.getByRole('button', { name: 'Cycle' })).toHaveTextContent('C33');

    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Priority' }), 'high');
    await expect(canvas.getByRole('combobox', { name: 'Priority' })).toHaveValue('high');

    /* Status: a draft until Apply. */
    await userEvent.click(canvas.getByRole('combobox', { name: 'Status' }));
    await userEvent.click(canvas.getByRole('option', { name: 'In progress' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveTextContent('In progress');

    /* Tags: removable tags in the field. */
    /* Tags has a search box, so its trigger is a button; status has none, so its trigger is the combobox. */
    await userEvent.click(canvas.getByRole('button', { name: 'Tags' }));
    await userEvent.click(canvas.getByRole('option', { name: 'VCP' }));
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('button', { name: 'Remove VCP' })).toBeVisible();

    /* Period: a preset closes the calendar and fills the field. */
    await userEvent.click(canvas.getByRole('button', { name: 'Period' }));
    await userEvent.click(within(canvasElement.ownerDocument.body).getByRole('button', { name: 'Last 7 days' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /Period, 09\/09\/2026-15\/09\/2026/ })).toBeVisible(),
    );

    /* Reset clears every value the page holds. */
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(args.onReset).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('searchbox')).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: 'Remove VCP' })).toBeNull();
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Select status');
    await expect(canvas.getByRole('button', { name: 'Cycle' })).toHaveTextContent('Select cycle');
  },
};

/** Filters pressed: only the search field, Reset and Filters. The fields stay mounted, so their values survive. */
export const FiltersHidden: Story = {
  render: (args) => <Page {...args} initial={{ status: ['Pending'] }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Filters' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toBeVisible();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('combobox', { name: 'Status', hidden: true })).not.toBeVisible();

    await userEvent.click(toggle);
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Pending');
  },
};

/** Figma's filled row: every field holds a value; the tags field grows and wraps the rest. */
export const Filled: Story = {
  render: (args) => (
    <Page
      {...args}
      initial={{
        period: { start: '2026-02-01', end: '2026-03-01' },
        status: ['In progress'],
        priority: 'normal',
        cycle: 'c33',
        tags: ['vcp', 'offerpump', 'whu', 'nt', 'caf'],
      }}
    />
  ),
};

/**
 * Which filters show is which props the page passes. A draft page has no status filter (every row is a
 * draft), so it leaves `status` out and the bar closes up around the rest. A page does the same for
 * anything its user may not use; the bar knows nothing about roles.
 */
export const WithoutStatus: Story = {
  render: (args) => <Page {...args} without={['status']} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('combobox', { name: 'Status' })).toBeNull();
    await expect(canvas.getByRole('combobox', { name: 'Priority' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Tags' })).toBeVisible();
  },
};

/** Just a search field and the two buttons, for a page with nothing to filter by. */
export const SearchOnly: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <FilterBar {...args} search={value} onSearchChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('combobox')).toBeNull();
    /* Nothing to show or hide, so the button claims no panel. */
    await expect(canvas.getByRole('button', { name: 'Filters' })).not.toHaveAttribute('aria-expanded');
  },
};

/** `children` adds a field to the row — here a page's own assignee picker. */
export const WithExtraField: Story = {
  render: (args) => (
    <FilterBar {...args} status={{ options: STATUSES }}>
      <div className="w-40">
        <select aria-label="Assignee" className="h-10 w-full rounded-md border border-stroke-strong bg-surface-elevated px-3 text-body-sm-regular">
          <option>Anyone</option>
          <option>Eve Kestrel</option>
        </select>
      </div>
    </FilterBar>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Assignee' })).toBeVisible();
  },
};

/** Below `md`, as Figma's Mobile: Reset and Filters, then search, then the fields two across. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' }, chromatic: { viewports: [375] } },
  render: (args) => <Page {...args} initial={{ priority: 'normal', tags: ['vcp'] }} />,
};

/** Tokens only, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex flex-col">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <Page {...args} initial={{ status: ['Accepted'], priority: 'high', tags: ['bug', 'vcp'] }} />
          </div>
        </div>
      ))}
    </div>
  ),
};
