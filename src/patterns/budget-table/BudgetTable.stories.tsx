import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { BudgetTable, type BudgetRow } from './BudgetTable';
import { Button } from '../../atoms/button';
import { Select } from '../../atoms/select';
import { SegmentedControl } from '../../atoms/segmented-control';
import { ToastProvider, ToastViewport, useToast } from '../../components/toast';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id lobortis nibh. Pellentesque euismod ' +
  'scelerisque purus eget hendrerit. Fusce pellentesque convallis dolor, at laoreet orci malesuada eget. Integer ' +
  'viverra neque nulla, in interdum nisl euismod a. Duis eget interdum odio. In luctus id tellus non suscipit. ' +
  'Quisque ligula nibh, ultrices et interdum nec, aliquam ut metus. Ut eleifend elementum porta.';

/* The six rows Figma draws: three in budget with notes, an unset one, an over-budget one, an unset one with no notes. */
const ROWS: BudgetRow[] = [
  { id: 'dev', domain: 'Development', allocated: 120, consumed: 60, notes: LOREM },
  { id: 'design', domain: 'Design', allocated: 120, consumed: 60 },
  { id: 'content', domain: 'Content', allocated: null, consumed: 0 },
  { id: 'gov', domain: 'Governance', allocated: 120, consumed: 160, notes: LOREM },
  { id: 'partners', domain: 'Partners', allocated: 120, consumed: 60, notes: LOREM },
  { id: 'qa', domain: 'Quality Assurance', allocated: null, consumed: 0 },
];

const meta = {
  title: 'Patterns/BudgetTable',
  component: BudgetTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Where an admin sets each domain’s point budget for a quarter: an allocation field with a stepper, the points ' +
          'consumed against it as a bar, what remains, and an optional note. Remaining and the bar are derived, so they ' +
          'follow the allocation: at once for a nudge, after a brief pause for typing.',
      },
    },
  },
  args: { rows: ROWS, onAllocatedChange: fn(), onNotesChange: fn() },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BudgetTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The table keeps its own rows here, so the allocation and notes can be edited as they will be on the page. */
function useRows(initial: readonly BudgetRow[]) {
  const [rows, setRows] = React.useState(initial);
  return {
    rows,
    onAllocatedChange: (id: BudgetRow['id'], allocated: number | null) =>
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, allocated } : r))),
    onNotesChange: (id: BudgetRow['id'], notes: string) =>
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, notes } : r))),
  };
}

/** Live: type an allocation and Remaining and the bar follow; an unset domain says "Set Budget". */
export const Default: Story = {
  render: (args) => {
    const state = useRows(args.rows);
    return <BudgetTable {...args} {...state} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('table', { name: 'Domain budget' })).toBeVisible();
    /* Over budget: negative Remaining, and a critical-coloured figure. */
    await expect(canvas.getByText('-40 pts')).toBeVisible();
    /* Unset budgets prompt for one. */
    await expect(canvas.getByRole('textbox', { name: 'Content allocated points' })).toHaveAttribute('placeholder', 'Set Budget');

    const dev = canvas.getByRole('textbox', { name: 'Development allocated points' });
    await expect(dev).toHaveValue('120');
    await userEvent.clear(dev);
    await userEvent.type(dev, '100{Enter}');
    await expect(dev).toHaveValue('100');
    /* 100 allocated, 60 consumed: 40 remain. (Design is still 60 pts remaining.) */
    await expect(canvas.getByText('40 pts')).toBeVisible();
  },
};

/** An unset budget: nudging up gives it its first number, and Remaining and the bar come alive. */
export const SettingABudget: Story = {
  render: (args) => {
    const state = useRows(args.rows);
    return <BudgetTable {...args} {...state} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByRole('textbox', { name: 'Content allocated points' });
    await expect(content).toHaveValue('');
    await userEvent.click(canvas.getByRole('button', { name: 'Increase Content allocated points' }));
    await expect(content).toHaveValue('0');
    await userEvent.type(content, '{ArrowUp}{ArrowUp}');
    await expect(content).toHaveValue('2');
    /* Taking it back: clear it and leave. */
    await userEvent.clear(content);
    await userEvent.tab();
    await expect(content).toHaveValue('');
  },
};

/** 100% and over: a full critical bar and a red negative Remaining. 75–99%: the warning bar. */
export const Statuses: Story = {
  args: {
    rows: [
      { id: 'a', domain: 'Fine', allocated: 120, consumed: 60 },
      { id: 'b', domain: 'Warning', allocated: 120, consumed: 100 },
      { id: 'c', domain: 'Over budget', allocated: 120, consumed: 160 },
      { id: 'd', domain: 'Unset', allocated: null, consumed: 0 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const percent = (name: string) => Math.round(Number(canvas.getByRole('progressbar', { name }).getAttribute('aria-valuenow')));
    await expect(percent('Fine budget usage')).toBe(50);
    await expect(percent('Warning budget usage')).toBe(83);
    await expect(percent('Over budget budget usage')).toBe(100);
    await expect(percent('Unset budget usage')).toBe(0);
  },
};

/** One line until it has focus, then as tall as what is written; the other cells don't move. */
export const NotesGrowOnFocus: Story = {
  render: (args) => {
    const state = useRows(args.rows);
    return <BudgetTable {...args} {...state} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const note = canvas.getByRole('textbox', { name: 'Development note' });
    const collapsed = note.getBoundingClientRect().height;
    await userEvent.click(note);
    await waitFor(() => expect(note.getBoundingClientRect().height).toBeGreaterThan(collapsed * 2));
    await userEvent.tab();
    await waitFor(() => expect(note.getBoundingClientRect().height).toBeLessThanOrEqual(collapsed));
  },
};

/** Typing an allocation commits after a brief pause, so Remaining and the bar follow it without leaving the field. */
export const FollowsTyping: Story = {
  render: (args) => {
    const state = useRows(args.rows);
    return <BudgetTable {...args} {...state} commitDelay={150} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dev = canvas.getByRole('textbox', { name: 'Development allocated points' });
    await userEvent.clear(dev);
    await userEvent.type(dev, '100');
    await waitFor(() => expect(canvas.getByText('40 pts')).toBeVisible());
    await expect(dev).toHaveFocus();
  },
};

/** While the budgets load: the headers stay, each cell is a placeholder, and one status says what is happening. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading domain budget');
    await expect(canvas.getByRole('columnheader', { name: /Allocated Points/ })).toBeVisible();
    await expect(canvas.queryByRole('textbox')).toBeNull();
  },
};

/** While a save is in flight every field is locked. */
export const Saving: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Development allocated points' })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: 'Development note' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Increase Development allocated points' })).toBeDisabled();
  },
};

/** No domains yet. */
export const NoDomains: Story = { args: { rows: [] } };

/** The column hints are Figma's copy; any can be replaced. */
export const CustomHints: Story = {
  args: { hints: { allocated: 'Points set aside for this quarter.' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'About allocated points' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'About consumed' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'About remaining' })).toBeVisible();
  },
};

/* The page around the table, as Figma's `Domain Budget Edit` flow draws it: the quarter and year, the table, and
   "Save Changes", which spins while it saves and ends in a toast. A save can fail: the table keeps what was typed, and an
   error toast says so. Leaving with unsaved changes is the browser's own prompt. */
function SavePage({ fail, ...args }: React.ComponentProps<typeof BudgetTable> & { fail?: boolean }) {
  const state = useRows(args.rows);
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(() => JSON.stringify(args.rows));
  const [quarter, setQuarter] = React.useState('Q1');
  const dirty = JSON.stringify(state.rows) !== saved;

  /* Unsaved changes: ask the browser to confirm leaving. */
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      if (fail) {
        toast({
          tone: 'critical',
          title: 'Changes not saved',
          description: 'Something went wrong. Your changes are still here — try again.',
        });
        return;
      }
      setSaved(JSON.stringify(state.rows));
      toast({ tone: 'success', title: 'Changes Saved', description: 'Your updates have been saved successfully!' });
    }, 300);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        {/* Both 40 high — the segmented control at `lg`, the select at `md` — so they sit as one row. */}
        <SegmentedControl
          size="lg"
          aria-label="Quarter"
          options={['Q1', 'Q2', 'Q3', 'Q4'].map((q) => ({ value: q, label: q, disabled: saving }))}
          value={quarter}
          onChange={setQuarter}
        />
        <Select size="md" aria-label="Year" defaultValue="2026" options={['2026', '2025', '2024']} disabled={saving} />
      </div>
      <BudgetTable {...args} {...state} disabled={saving} />
      <div className="flex justify-end">
        <Button loading={saving} onClick={save}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

const page = (fail: boolean): Story['render'] =>
  function Render(args) {
    return (
      <ToastProvider position="top-right">
        <SavePage {...args} fail={fail} />
        <ToastViewport />
      </ToastProvider>
    );
  };

/** Would the browser ask before leaving? It does when the page has called `preventDefault` on `beforeunload`. */
const asksBeforeLeaving = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};

/** The whole edit page: Save Changes locks the table while it saves, then a toast says it worked. */
export const OnThePage: Story = {
  render: page(false),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* The quarter control and the year select are the same height: 40. */
    await expect(Math.round(canvas.getByRole('radiogroup', { name: 'Quarter' }).getBoundingClientRect().height)).toBe(40);
    await expect(Math.round(canvas.getByRole('combobox', { name: 'Year' }).parentElement!.getBoundingClientRect().height)).toBe(40);
    /* Nothing changed: leaving is free. An edit: the browser is asked to confirm. */
    await expect(asksBeforeLeaving()).toBe(false);
    await userEvent.click(canvas.getByRole('button', { name: 'Increase Content allocated points' }));
    await waitFor(() => expect(asksBeforeLeaving()).toBe(true));

    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));
    await expect(canvas.getByRole('button', { name: 'Save Changes' })).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('textbox', { name: 'Development allocated points' })).toBeDisabled();
    await waitFor(() => expect(within(document.body).getByText('Changes Saved')).toBeVisible(), { timeout: 3000 });
    await expect(canvas.getByRole('textbox', { name: 'Development allocated points' })).toBeEnabled();
    /* Saved: nothing left to lose. */
    await waitFor(() => expect(asksBeforeLeaving()).toBe(false));
  },
};

/** A save that fails: an error toast, the table unlocked and exactly as it was left, Save still there to try again. */
export const SaveFails: Story = {
  render: page(true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Increase Content allocated points' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(within(document.body).getByText('Changes not saved')).toBeVisible(), { timeout: 3000 });
    await expect(canvas.getByRole('textbox', { name: 'Content allocated points' })).toHaveValue('0');
    await expect(canvas.getByRole('textbox', { name: 'Content allocated points' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
    /* Still unsaved, so still worth a warning. */
    await waitFor(() => expect(asksBeforeLeaving()).toBe(true));
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
