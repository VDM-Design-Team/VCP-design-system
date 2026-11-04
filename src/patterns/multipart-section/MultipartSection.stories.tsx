import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { MultipartSection, type MultipartPart } from './MultipartSection';
import { ChildPartModal } from '../child-part-modal';

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
  args: { parts: PARTS, hint: 'An Added Value split into parts, each with its own assignee, due date and capacity points.', onOpenPart: fn(), onEditPartTitle: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-surface-canvas p-6">
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

/* ---- The flows: add a part, and rename one — what the section asks for, and what the page does about it. ---- */

const PARENT = 'Parent AV Title is Here';

function EditingPage({ completed }: { completed?: boolean }) {
  const [parts, setParts] = React.useState<MultipartPart[]>(PARTS.map((part) => ({ ...part })));
  const [adding, setAdding] = React.useState(false);
  const [renaming, setRenaming] = React.useState<MultipartPart | null>(null);

  /* The default title is the page's to work out: "(X/X) Parent AV Title". */
  const defaultTitle = (position: number, of: number) => `(${position}/${of}) ${PARENT}`;

  return (
    <>
      <MultipartSection parts={parts} onOpenPart={fn()} onAddPart={() => setAdding(true)} onEditPartTitle={setRenaming} />
      <ChildPartModal
        open={adding}
        onClose={() => setAdding(false)}
        statusChange={completed ? { from: 'Completed', to: 'In Progress' } : undefined}
        onConfirm={(title) => {
          const total = parts.length + 1;
          setParts((all) => [...all, { id: total, title: title || defaultTitle(total, total), status: 'Accepted' }]);
          setAdding(false);
        }}
      />
      <ChildPartModal
        open={renaming !== null}
        mode="edit"
        initialTitle={renaming?.title}
        onClose={() => setRenaming(null)}
        onConfirm={(title) => {
          if (!renaming) return;
          const position = parts.findIndex((part) => part.id === renaming.id) + 1;
          setParts((all) => all.map((part) => (part.id === renaming.id ? { ...part, title: title || defaultTitle(position, all.length) } : part)));
          setRenaming(null);
        }}
      />
    </>
  );
}

/**
 * Figma's flows. **Add Part** opens the dialog; a blank title becomes "(4/4) Parent AV Title is Here" and the new part reads "- CP". **Hovering a row
 * shows its edit button**, which opens the same dialog to rename it; a blank title there puts the default back. The section only asked.
 */
export const OnThePage: Story = {
  decorators: [(Story) => <Story />],
  render: () => <EditingPage />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* Add Part, with the title left blank: the default is used. */
    await userEvent.click(c.getByRole('button', { name: 'Add Part' }));
    const add = await screen.findByRole('dialog', { name: 'Add a New Child Part to Multipart AV' });
    await userEvent.click(within(add).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(c.getByRole('button', { name: 'Part 4: (4/4) Parent AV Title is Here' })).toBeVisible());
    await expect(c.getByText('- CP')).toBeVisible();

    /* Rename part 2 through its edit button. */
    await userEvent.click(c.getByRole('button', { name: 'Edit title of part 2' }));
    const edit = await screen.findByRole('dialog', { name: 'Edit Child Part Title' });
    await expect(within(edit).getByRole('textbox', { name: 'Title' })).toHaveValue('Some Parent AV Title');
    await userEvent.clear(within(edit).getByRole('textbox', { name: 'Title' }));
    await userEvent.type(within(edit).getByRole('textbox', { name: 'Title' }), 'Backend{Enter}');
    await waitFor(() => expect(c.getByRole('button', { name: 'Part 2: Backend' })).toBeVisible());

    /* Rename it again, leaving the title blank: the default is back. */
    await userEvent.click(c.getByRole('button', { name: 'Edit title of part 2' }));
    const again = await screen.findByRole('dialog', { name: 'Edit Child Part Title' });
    await userEvent.clear(within(again).getByRole('textbox', { name: 'Title' }));
    await userEvent.click(within(again).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(c.getByRole('button', { name: 'Part 2: (2/4) Parent AV Title is Here' })).toBeVisible());
  },
};

/** Adding a part to a **completed** Added Value: the dialog warns that its status will change. */
export const AddingToACompletedAV: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <EditingPage completed />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Add Part' }));
    const add = await screen.findByRole('dialog', { name: 'Add a New Child Part to Multipart AV' });
    await expect(within(add).getByText('Status will change')).toBeVisible();
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

/** Wide, the rows share one grid: "Due Date:" starts in the same column and the status tags end at the same edge. */
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
    const right = (el: HTMLElement) => Math.round(el.getBoundingClientRect().right);
    const tags = ['Ready for Deploy', 'Completed', 'Accepted'].map((t) => c.getByText(t));
    await expect(new Set(tags.map(right)).size).toBe(1);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
