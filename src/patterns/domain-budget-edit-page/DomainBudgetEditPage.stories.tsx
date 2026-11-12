import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DomainBudgetEditPage } from './DomainBudgetEditPage';
import { ToastProvider, ToastViewport, useToast } from '../../components/toast';
import type { BudgetRow } from '../budget-table';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id lobortis nibh. Pellentesque euismod scelerisque purus eget hendrerit.';

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
  title: 'Patterns/DomainBudgetEditPage',
  component: DomainBudgetEditPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of the page where an admin sets each domain’s point budget for a quarter: the title, the quarter and year controls (both 40 high), the budget table and Save Changes. ' +
          'It locks everything while saving and makes the browser ask before leaving with unsaved changes; the data, the save and the toasts are the page’s. It goes inside `AppShell`.',
      },
    },
  },
  args: {
    quarter: 'Q1',
    onQuarterChange: fn(),
    year: '2026',
    years: ['2026', '2025', '2024'],
    onYearChange: fn(),
    table: { rows: ROWS },
    onSave: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DomainBudgetEditPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Would the browser ask before leaving? It does when the page has called `preventDefault` on `beforeunload`. */
const asksBeforeLeaving = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};

/* A page as the app writes it: it owns the rows, the period, the save and the toasts. */
function Page({ fail, loading }: { fail?: boolean; loading?: boolean }) {
  const { toast } = useToast();
  const [rows, setRows] = React.useState(ROWS);
  const [saved, setSaved] = React.useState(() => JSON.stringify(ROWS));
  const [saving, setSaving] = React.useState(false);
  const [quarter, setQuarter] = React.useState('Q1');
  const [year, setYear] = React.useState('2026');
  const dirty = JSON.stringify(rows) !== saved;

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      if (fail) {
        /* Unlock and keep what was typed (`dirty` stays true), so Save can be tried again. */
        toast({ tone: 'critical', title: 'Changes not saved', description: 'Something went wrong. Your changes are still here — try again.' });
        return;
      }
      setSaved(JSON.stringify(rows));
      toast({ tone: 'success', title: 'Changes Saved', description: 'Your updates have been saved successfully!' });
    }, 300);
  };

  return (
    <DomainBudgetEditPage
      quarter={quarter}
      onQuarterChange={setQuarter}
      year={year}
      years={['2026', '2025', '2024']}
      onYearChange={setYear}
      saving={saving}
      dirty={dirty}
      onSave={save}
      table={{
        rows,
        loading,
        onAllocatedChange: (id, allocated) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, allocated } : r))),
        onNotesChange: (id, notes) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, notes } : r))),
      }}
    />
  );
}

const withToasts = (props: React.ComponentProps<typeof Page>): Story['render'] =>
  function Render() {
    return (
      <ToastProvider position="top-right">
        <Page {...props} />
        <ToastViewport />
      </ToastProvider>
    );
  };

/** The whole flow: an edit, Save Changes locks everything while it saves, then a toast says it worked. */
export const SavingTheChanges: Story = {
  render: withToasts({}),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Domain Budget' })).toBeVisible();
    /* The quarter control and the year select are the same height: 40. */
    await expect(Math.round(canvas.getByRole('radiogroup', { name: 'Quarter' }).getBoundingClientRect().height)).toBe(40);
    await expect(Math.round(canvas.getByRole('combobox', { name: 'Year' }).parentElement!.getBoundingClientRect().height)).toBe(40);
    /* Nothing changed: leaving is free. An edit: the browser is asked to confirm. */
    await expect(asksBeforeLeaving()).toBe(false);
    await userEvent.click(canvas.getByRole('button', { name: 'Increase Content allocated points' }));
    await waitFor(() => expect(asksBeforeLeaving()).toBe(true));

    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));
    await expect(canvas.getByRole('button', { name: 'Save Changes' })).toHaveAttribute('aria-busy', 'true');
    /* Locked while it saves: the table, the quarter and the year. */
    await expect(canvas.getByRole('textbox', { name: 'Development allocated points' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'Year' })).toBeDisabled();
    await expect(canvas.getByRole('radio', { name: 'Q2' })).toBeDisabled();
    await waitFor(() => expect(within(document.body).getByText('Changes Saved')).toBeVisible(), { timeout: 3000 });
    await expect(canvas.getByRole('textbox', { name: 'Development allocated points' })).toBeEnabled();
    /* Saved: nothing left to lose. */
    await waitFor(() => expect(asksBeforeLeaving()).toBe(false));
  },
};

/** A save that fails: an error toast, everything unlocked and as it was left, Save still there to try again. */
export const SaveFails: Story = {
  render: withToasts({ fail: true }),
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

/** While the budgets load: the table shows placeholders and Save is not offered, as there is nothing to save. */
export const Loading: Story = {
  render: withToasts({ loading: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Loading domain budget')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  },
};

/** The quarter and the year are the page's: choosing one tells it, and it decides what happens to unsaved edits. */
export const ChoosingThePeriod: Story = {
  render: withToasts({}),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Q3' }));
    await expect(canvas.getByRole('radio', { name: 'Q3' })).toBeChecked();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Year' }), '2025');
    await expect(canvas.getByRole('combobox', { name: 'Year' })).toHaveValue('2025');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, render: withToasts({}) };
