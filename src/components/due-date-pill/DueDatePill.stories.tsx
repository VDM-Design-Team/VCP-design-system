import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DueDatePill, dueDateTone } from './DueDatePill';

const meta = {
  title: 'Components/Display/DueDatePill',
  component: DueDatePill,
  parameters: {
    docs: {
      description: {
        component:
          'An Added Value’s due date, worn as a pill that changes colour as the date ' +
          'approaches — a `Badge` plus the owner of VCP’s due-date → tone mapping. The date ' +
          'text is the caller’s, because how a date reads is a locale decision. So is the ' +
          'threshold: `dueDateTone` does the comparing but will not guess what “due soon” ' +
          'means, and `soonWithinDays` has no default.',
      },
    },
  },
  args: { children: 'October 1, 2025' },
  argTypes: {
    proximity: { control: 'radio', options: ['default', 'due-soon', 'overdue'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof DueDatePill>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three proximities the Figma set draws. */
export const Proximities: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <DueDatePill proximity="default">October 1, 2025</DueDatePill>
      <DueDatePill proximity="due-soon">September 14, 2026</DueDatePill>
      <DueDatePill proximity="overdue">August 3, 2026</DueDatePill>
    </div>
  ),
};

/** Both `Badge` sizes. The AV table uses `sm`, which is this pill's default. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <DueDatePill proximity="due-soon" size="sm">
        September 14, 2026
      </DueDatePill>
      <DueDatePill proximity="due-soon" size="md">
        September 14, 2026
      </DueDatePill>
    </div>
  ),
};

/**
 * `dueDateTone` in use — the caller supplies its domain's rule for "soon" and
 * gets the tone back. Dates here are fixed relative to a pinned `now`, so the
 * story says the same thing every day.
 */
export const FromADate: Story = {
  render: () => {
    const now = new Date(2026, 8, 11);
    const rows: Array<[string, Date]> = [
      ['Two days overdue', new Date(2026, 8, 9)],
      ['Due today', new Date(2026, 8, 11)],
      ['Due in three days', new Date(2026, 8, 14)],
      ['Due in a month', new Date(2026, 9, 11)],
    ];
    return (
      <div className="flex flex-col items-start gap-3 font-sans text-body-md text-text-secondary">
        {rows.map(([what, due]) => (
          <div key={what} className="flex items-center gap-3">
            <span className="w-44">{what}</span>
            <DueDatePill proximity={dueDateTone({ due, now, soonWithinDays: 7 })}>
              {due.toLocaleDateString('en-US', { dateStyle: 'long' })}
            </DueDatePill>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* Due today is "due soon", never "overdue" — whole days are the unit. */
    await expect(canvas.getByText('September 11, 2026')).toBeInTheDocument();
    await expect(canvas.getByText('September 9, 2026')).toBeInTheDocument();
  },
};
