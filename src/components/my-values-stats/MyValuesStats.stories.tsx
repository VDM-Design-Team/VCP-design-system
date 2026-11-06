import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { MyValuesStats, type MyValuesStatsSegment } from './MyValuesStats';

/* The breakdown Figma draws: Draft, Pending (none), Accepted, Active, Overdue. */
const SEGMENTS: MyValuesStatsSegment[] = [
  { id: 'draft', label: 'Draft', count: 12, tone: 'neutral' },
  { id: 'pending', label: 'Pending', count: 0, tone: 'yellow' },
  { id: 'accepted', label: 'Accepted', count: 4, tone: 'blue' },
  { id: 'active', label: 'Active', count: 1, tone: 'brand' },
  { id: 'overdue', label: 'Overdue', count: 1, tone: 'critical' },
];

const meta = {
  title: 'Components/Display/MyValuesStats',
  component: MyValuesStats,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The strip across the top of My Values: who you are, how many Added Values are yours and how many are completed, ' +
          'and the rest by status as one segmented bar — each segment as wide as its count.',
      },
    },
  },
  args: { user: { name: 'Username' }, total: 65, completed: 47, segments: SEGMENTS },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyValuesStats>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's strip. Each segment is as wide as its count; a status with none is an empty outline, still labelled. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'My Values statistics' })).toBeVisible();
    await expect(c.getByText('Username')).toBeVisible();
    /* The name is regular weight; the labels and figures around it are medium. */
    await expect(getComputedStyle(c.getByText('Username')).fontWeight).toBe('400');
    await expect(c.getByText('Total AVs')).toBeVisible();
    await expect(c.getByText('65')).toBeVisible();
    await expect(c.getByText('47')).toBeVisible();

    const items = within(c.getByRole('list', { name: 'Status breakdown' })).getAllByRole('listitem');
    await expect(items).toHaveLength(5);
    const width = (i: number) => items[i].getBoundingClientRect().width;
    /* Draft (12) is much wider than Accepted (4); neither is narrower than the 100 floor. */
    await expect(width(0)).toBeGreaterThan(width(2) * 2);
    await expect(width(1)).toBeGreaterThanOrEqual(99);
    await expect(width(3)).toBeGreaterThanOrEqual(99);
    /* A count fills its bar; none leaves an outline. */
    const bar = (i: number) => items[i].querySelector('span[aria-hidden="true"]') as HTMLElement;
    await expect(getComputedStyle(bar(0)).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(bar(1)).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(bar(1)).borderTopWidth).toBe('1px');
  },
};

/** Nothing in any status yet: every segment an empty outline, in equal shares that span the whole strip (not bunched up at their floor width on the left). */
export const NothingYet: Story = {
  args: {
    total: 0,
    completed: 0,
    segments: SEGMENTS.map((s) => ({ ...s, count: 0 })),
  },
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('ul') as HTMLElement;
    const items = [...list.querySelectorAll('li')] as HTMLElement[];
    const widths = items.map((li) => Math.round(li.getBoundingClientRect().width));
    /* Equal, and together they fill the list to its right edge. */
    await expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
    await expect(Math.round(list.getBoundingClientRect().right - items[items.length - 1].getBoundingClientRect().right)).toBeLessThanOrEqual(1);
  },
};

/** The breakdown follows whatever statuses the page gives it — fewer, or more. */
export const ThreeStatuses: Story = {
  args: {
    segments: [
      { id: 'draft', label: 'Draft', count: 3, tone: 'neutral' },
      { id: 'active', label: 'Active', count: 9, tone: 'brand' },
      { id: 'overdue', label: 'Overdue', count: 2, tone: 'critical' },
    ],
  },
};

/**
 * Too narrow for one row, it wraps first: the breakdown drops to its own line, full width. It still fits, so it does not
 * scroll.
 */
export const Wraps: Story = {
  render: (args) => (
    <div className="w-144">
      <MyValuesStats {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('region', { name: 'My Values statistics' });
    const profile = within(card).getByText('Username');
    const breakdown = within(card).getByRole('list', { name: 'Status breakdown' });
    /* The breakdown is on a line of its own, below the profile. */
    await expect(breakdown.getBoundingClientRect().top).toBeGreaterThan(profile.getBoundingClientRect().bottom - 1);
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    await expect(card).not.toHaveAttribute('tabindex');
  },
};

/** Once it has wrapped and the breakdown cannot get any narrower (each segment at its floor), the whole strip scrolls. */
export const ScrollsWhenItCannotWrapAnyMore: Story = {
  render: (args) => (
    <div className="w-96">
      <MyValuesStats {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('region', { name: 'My Values statistics' });
    await expect(card.scrollWidth).toBeGreaterThan(card.clientWidth);
    await expect(getComputedStyle(card).overflowX).toBe('auto');
    /* A scrolling region is reachable by keyboard — only while it scrolls. */
    await waitFor(() => expect(card).toHaveAttribute('tabindex', '0'));
    /* It wrapped before it scrolled: the breakdown is on its own line. */
    const profile = within(card).getByText('Username');
    const breakdown = within(card).getByRole('list', { name: 'Status breakdown' });
    await expect(breakdown.getBoundingClientRect().top).toBeGreaterThan(profile.getBoundingClientRect().bottom - 1);
  },
};

/** With room, it fits and does not scroll. */
export const FitsWhenThereIsRoom: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => (
    <div className="w-280">
      <MyValuesStats {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('region', { name: 'My Values statistics' });
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    /* It fits, so it adds no tab stop. */
    await expect(card).not.toHaveAttribute('tabindex');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
