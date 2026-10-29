import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StatusHistory } from './StatusHistory';

const meta = {
  title: 'Components/Display/StatusHistory',
  component: StatusHistory,
  parameters: {
    docs: {
      description: {
        component:
          'The collapsible bar that holds an Added Value’s status log: a clock, “Status History (n)” ' +
          'and a caret. A disclosure: the title is a heading, the bar is its button, the open ' +
          'panel is a labelled region. What the panel holds is the caller’s.',
      },
    },
  },
  args: { count: 1, onOpenChange: fn() },
  argTypes: {
    count: { control: 'number' },
    headingLevel: { control: 'radio', options: [2, 3, 4] },
  },
  decorators: [(Story) => <div className="max-w-2xl bg-surface-canvas p-4"><Story /></div>],
} satisfies Meta<typeof StatusHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

const LOG = (
  <ol className="m-0 flex list-none flex-col gap-2 p-0">
    <li>Draft → Initiated · Maya Bennett · 1 September 2026</li>
  </ol>
);

/** Closed, as the Figma set draws it first. Click or press Enter to open. */
export const Closed: Story = {
  args: { children: LOG },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('button', { name: 'Status History (1)' });
    await expect(bar).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(bar);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    await expect(bar).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: 'Status History (1)' })).toBeVisible();
    await userEvent.click(bar);
    await expect(canvas.queryByRole('region')).toBeNull();
  },
};

/** Open, with the caret turned up and the log under the bar. */
export const Open: Story = {
  args: { defaultOpen: true, children: LOG },
};

const ENTRIES = [
  { actor: 'Ali H.', from: 'Accepted', to: 'Initiated', when: 'a month ago' },
  { actor: 'Ali H.', from: 'Pending', to: 'Accepted', when: 'a month ago' },
  { actor: 'Marion Kiho', from: 'Draft', to: 'Pending', when: 'a month ago' },
  { actor: 'Marion Kiho', from: 'Pending', to: 'Draft', when: 'a month ago' },
  { actor: 'Eve', from: 'Draft', to: 'Pending', when: 'a month ago' },
  { actor: 'Eve', from: 'Initial Creation', to: 'Draft', when: '2 months ago' },
];

/** The log, as the live app draws it: who, from which status to which, and how long ago. The count follows the entries. */
export const WithEntries: Story = {
  args: { count: undefined, defaultOpen: true, entries: ENTRIES },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Status History (6)' })).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(6);
    await expect(canvas.getAllByText('changed status from')).toHaveLength(6);
    /* "Initial Creation" is a domain's own step, not a spine status: it still reads. */
    await expect(canvas.getByText('Initial Creation')).toBeVisible();
  },
};

/** Controlled: the page owns the state, here with a button outside the bar. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex flex-col gap-3">
        <StatusHistory {...args} open={open} onOpenChange={setOpen}>
          {LOG}
        </StatusHistory>
        <button type="button" className="self-start text-body-sm-medium text-text-brand-strong" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close from outside' : 'Open from outside'}
        </button>
      </div>
    );
  },
};

/** No count and a longer title: the title truncates rather than pushing the caret off. */
export const NoCount: Story = {
  args: { count: undefined, title: 'Status History' },
};

/** Card, text and glyphs are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-4 bg-surface-canvas p-8">
            <StatusHistory {...args} />
            {/* A different count per column, so the two open panels have different names. */}
            <StatusHistory {...args} count={isDark ? 2 : 1} defaultOpen>
              {LOG}
            </StatusHistory>
          </div>
        </div>
      ))}
    </div>
  ),
};
