import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MultipartSection, type MultipartPart } from './MultipartSection';

const PARTS: MultipartPart[] = [
  { id: 1, title: '(1/3) Parent AV Title is Here', assignee: { name: 'Marvin R' }, capacityPoints: 10, dueDate: 'October 1, 2025', customStatus: 'Ready for Deploy' },
  { id: 2, title: 'Some Parent AV Title', assignee: { name: 'Marvin R' }, capacityPoints: 10, dueDate: 'October 1, 2025', status: 'Completed' },
  { id: 3, title: 'Some Parent AV Title', assignee: { name: 'Marvin R' }, capacityPoints: 10, dueDate: 'October 1, 2025', status: 'Accepted' },
];

const meta = {
  title: 'Patterns/MultipartSection',
  component: MultipartSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The card on an Added Value’s page that lists its parts: a Multipart heading, “33% (1/3 parts completed)”, a progress bar and ' +
          'a row per part. In editing, Add Part sits under the rows. The progress is worked out from the parts themselves.',
      },
    },
  },
  args: { parts: PARTS, hint: 'An Added Value split into parts, each with its own assignee, due date and capacity points.', onOpenPart: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-3xl bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultipartSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's section: the heading, "33% (1/3 parts completed)", the bar, and three parts. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Multipart' })).toBeVisible();
    await expect(c.getByText('33% (1/3 parts completed)')).toBeVisible();
    await expect(c.getByRole('progressbar', { name: /33%/ })).toHaveAttribute('aria-valuenow', '33');
    await expect(c.getAllByRole('listitem')).toHaveLength(3);
    await userEvent.click(c.getByRole('button', { name: 'Part 3: Some Parent AV Title' }));
    await expect(args.onOpenPart).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
    /* Viewing: no Add Part. */
    await expect(c.queryByRole('button', { name: 'Add Part' })).toBeNull();
  },
};

/** Editing: **Add Part** is a full-width outlined button under the rows; a fourth part with nothing set yet reads "- CP". */
export const Editing: Story = {
  args: {
    parts: [...PARTS, { id: 4, title: '(4/4) Parent AV Title is Here', status: 'Accepted' }],
    onAddPart: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText('25% (1/4 parts completed)')).toBeVisible();
    await expect(c.getByText('- CP')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Add Part' }));
    await expect(args.onAddPart).toHaveBeenCalled();
  },
};

/** It is worked out from the rows: complete them all and the bar is full. */
export const AllDone: Story = {
  args: { parts: PARTS.map((part) => ({ ...part, status: 'Completed' as const, customStatus: undefined })) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('100% (3/3 parts completed)')).toBeVisible();
  },
};

/** Squeezed, the rows stack: the number and title on top, the rest beneath, left-aligned. Nothing scrolls sideways. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-96 bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const row = c.getAllByRole('listitem')[0];
    await expect(getComputedStyle(row).gridTemplateColumns.split(' ')).toHaveLength(2);
    const list = row.parentElement as HTMLElement;
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
  },
};

/** Wide, the rows share one grid: "Due Date:" starts in the same column and the status tags start at the same edge. */
export const Wide: Story = {
  decorators: [
    (Story) => (
      <div className="w-[72rem] bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const left = (el: HTMLElement) => Math.round(el.getBoundingClientRect().left);
    await expect(new Set(c.getAllByText('Due Date:').map(left)).size).toBe(1);
    const tags = ['Ready for Deploy', 'Completed', 'Accepted'].map((t) => c.getByText(t));
    await expect(new Set(tags.map(left)).size).toBe(1);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
