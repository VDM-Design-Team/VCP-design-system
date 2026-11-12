import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TableEmpty } from './TableEmpty';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Components/Display/TableEmpty',
  component: TableEmpty,
  parameters: {
    docs: {
      description: {
        component:
          'What every table says when it has no rows: one look, one set of words. A table passes its ' +
          'plural noun and its icon; the sentences, the search icon and **Reset** come from here, so tables ' +
          'cannot drift apart. `DataTable` shows it when a page sets no `empty`.',
      },
    },
  },
  args: { noun: 'accounts', icon: 'users' },
  argTypes: {
    noun: { control: 'text' },
    search: { control: 'text' },
    filtered: { control: 'boolean' },
  },
} satisfies Meta<typeof TableEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing there yet: "No {noun} yet." with the table's own glyph. */
export const NothingYet: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'No accounts yet.' })).toBeVisible();
  },
};

/** Filters are on and nothing matches. The icon is the magnifying glass in every table. Without `onReset` there is no Reset: a page that has nothing to put back leaves it out. */
export const Filtered: Story = {
  args: { filtered: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('No accounts match these filters.')).toBeVisible();
    await expect(c.queryByRole('button', { name: 'Reset' })).toBeNull();
  },
};

/** A search names the empty result, and it means `filtered` without saying so. Say which fields it covers in `hint`. */
export const WithASearch: Story = {
  args: { search: 'zzz', hint: 'Try a different name, email or domain.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No accounts match “zzz”.')).toBeVisible();
    await expect(within(canvasElement).getByText('Try a different name, email or domain.')).toBeVisible();
  },
};

/** A page that can put the filters back says so with **Reset**, the word `FilterBar` uses. */
export const WithReset: Story = {
  args: { filtered: true, onReset: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Reset' }));
    await expect(args.onReset).toHaveBeenCalledTimes(1);
  },
};

/** Nothing yet, with a way forward: leave it out when the table's own header already has "New …". */
export const WithAnAction: Story = {
  args: { noun: 'holidays', icon: 'calendar-blank', action: <Button variant="secondary">Add a holiday</Button> },
};

/** No noun: the generic words, which is what `DataTable` shows when a page sets no `empty`. */
export const Generic: Story = {
  args: { noun: undefined, icon: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Nothing here yet.')).toBeVisible();
  },
};

/** The one exception: a table whose Figma draws other words passes `title`. The icon, the layout and Reset stay the system's. */
export const TitleFromFigma: Story = {
  args: { noun: 'items', icon: 'database', title: 'No items.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No items.')).toBeVisible();
  },
};

/** The same in the dark theme. */
export const DarkTheme: Story = {
  args: { filtered: true, onReset: fn() },
  globals: { theme: 'dark' },
};
