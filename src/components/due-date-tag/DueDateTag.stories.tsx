import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DueDateTag, dueDateTone } from './DueDateTag';
import { DateFormatProvider } from '../../lib/format-date';

const meta = {
  title: 'Components/Display/DueDateTag',
  component: DueDateTag,
  parameters: {
    docs: {
      description: {
        component:
          'An Added Value’s due date, worn as a tag that changes colour as the date ' +
          'approaches — a `Tag` plus the owner of VCP’s due-date → tone mapping. Give it an ' +
          'ISO `date` and it reads dd/mm/yyyy (or the person’s locale), like every other date. ' +
          'The threshold is the caller’s: `dueDateTone` does the comparing but will not guess ' +
          'what “due soon” means, and `soonWithinDays` has no default.',
      },
    },
  },
  args: { date: '2025-10-01' },
  argTypes: {
    proximity: { control: 'radio', options: ['default', 'due-soon', 'overdue'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof DueDateTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ISO date reads dd/mm/yyyy, in a `<time>` that carries the ISO date. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const time = canvasElement.querySelector('time') as HTMLElement;
    await expect(time).toHaveTextContent('01/10/2025');
    await expect(time).toHaveAttribute('datetime', '2025-10-01');
  },
};

/** The three proximities the Figma set draws. */
export const Proximities: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <DueDateTag proximity="default" date="2025-10-01" />
      <DueDateTag proximity="due-soon" date="2026-09-14" />
      <DueDateTag proximity="overdue" date="2026-08-03" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('01/10/2025')).toBeVisible();
    await expect(c.getByText('14/09/2026')).toBeVisible();
    await expect(c.getByText('03/08/2026')).toBeVisible();
  },
};

/** Both `Tag` sizes. The AV table uses `sm`, which is this tag's default. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <DueDateTag proximity="due-soon" size="sm" date="2026-09-14" />
      <DueDateTag proximity="due-soon" size="md" date="2026-09-14" />
    </div>
  ),
};

/** With a locale set for the product (`DateFormatProvider`), the date reads that locale's way. */
export const InThePersonsLocale: Story = {
  render: () => (
    <DateFormatProvider locale="en-US">
      <DueDateTag proximity="due-soon" date="2026-09-14" />
    </DateFormatProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('09/14/2026')).toBeVisible();
  },
};

/** Text that is not a date still fits: a part with no due date reads "-". */
export const NoDate: Story = {
  args: { date: undefined, children: '-' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('-')).toBeVisible();
    await expect(canvasElement.querySelector('time')).toBeNull();
  },
};

/**
 * `dueDateTone` in use — the caller supplies its domain's rule for "soon" and
 * gets the tone back. Dates here are fixed relative to a pinned `now`, so the
 * story says the same thing every day.
 */
export const FromADate: Story = {
  render: () => {
    const now = new Date(2026, 8, 11);
    const rows: Array<[string, string]> = [
      ['Two days overdue', '2026-09-09'],
      ['Due today', '2026-09-11'],
      ['Due in three days', '2026-09-14'],
      ['Due in a month', '2026-10-11'],
    ];
    const toDate = (iso: string) => {
      const [year, month, day] = iso.split('-').map(Number);
      return new Date(year, month - 1, day);
    };
    return (
      <div className="flex flex-col items-start gap-3 font-sans text-body-sm-regular text-text-secondary">
        {rows.map(([what, iso]) => (
          <div key={what} className="flex items-center gap-3">
            <span className="w-44">{what}</span>
            <DueDateTag date={iso} proximity={dueDateTone({ due: toDate(iso), now, soonWithinDays: 7 })} />
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* Due today is "due soon", never "overdue" — whole days are the unit. */
    await expect(canvas.getByText('11/09/2026')).toBeInTheDocument();
    await expect(canvas.getByText('09/09/2026')).toBeInTheDocument();
  },
};
