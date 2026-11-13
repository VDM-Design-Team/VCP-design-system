import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AVPage, type AVPageProps } from './AVPage';
import { DescriptionCard } from '../../components/description-card';
import type { DetailCardValue } from '../detail-card';

const PEOPLE = [{ name: 'Marvin R' }, { name: 'John Kestrel' }, { name: 'Jane Doe' }, { name: 'Amy Lee' }];
const OPTIONS = {
  people: PEOPLE,
  roles: ['QA', 'Design', 'Assignee'],
  cycles: [
    { value: 'c18', code: 'C18', start: '2025-09-20', end: '2026-10-02' },
    { value: 'c19', code: 'C19', start: '2026-10-03', end: '2026-10-16' },
  ],
  projects: ['VCP', 'BESA', 'Planning'],
  categories: ['Improvement', 'Bug', 'New Feature'],
  tags: ['Development', 'Design', 'Operations'],
};
const VIEWING: DetailCardValue = {
  initiators: [{ name: 'Marvin R' }],
  assignees: [{ name: 'John Kestrel', points: 5 }, { name: 'Jane Doe', points: 5 }],
  startDate: '2025-10-01',
  dueDate: '2099-10-01',
  cycle: 'c18',
  status: 'Accepted',
  urgency: 'Low',
  type: 'Type 1',
  projects: ['VCP'],
  category: 'Improvement',
  tags: ['Development'],
  capacityPoints: 10,
  dateInitiated: '2025-09-01',
  dateAccepted: '2025-09-12',
};
const EDITING: DetailCardValue = { initiators: [{ name: 'Marvin R' }], projects: ['VCP'], category: 'Improvement', tags: ['Development'], type: 'Type 1', urgency: 'Low' };

const read = (type: 'problem' | 'solution' | 'deliverable' | 'desired-outcome', text = 'Some Paragraph Here') => ({
  children: <DescriptionCard type={type} position={1}>{text}</DescriptionCard>,
});
const edit = (type: 'problem' | 'solution' | 'deliverable' | 'desired-outcome') => ({
  onAdd: fn(),
  onAttach: fn(),
  children: (
    <>
      <DescriptionCard editing type={type} position={1} defaultValue="Some Paragraph Here" />
      <DescriptionCard editing type={type} position={2} defaultValue="" />
    </>
  ),
});

const MEMBERS = [{ id: 'me', name: 'John Smith' }, { id: 'amy', name: 'Amy Lee' }];

/** The page to read: an Added Value that has been accepted. */
const VIEW: AVPageProps = {
  header: { title: 'VCP-123', backLabel: 'Back to Assigned', onBack: fn(), role: 'assignee', status: 'Accepted', onTransition: fn() },
  title: { reference: 'VCP-1234', value: 'Some Title Here' },
  description: { problem: { ...read('problem') }, solution: { ...read('solution') }, deliverable: { ...read('deliverable') }, 'desired-outcome': { ...read('desired-outcome') } },
  history: { count: 3 },
  comments: { currentUser: { id: 'me', name: 'John Smith' }, members: MEMBERS, comments: [] },
  details: { type: 'viewing', domain: 'development', value: VIEWING, viewerCount: 3 },
  deliverables: {
    domain: 'design',
    mode: 'view',
    links: [{ id: 'l1', title: 'Some Link Goes Here', url: 'https://www.example.com/one', domain: 'design' }],
    files: [{ id: 'f1', name: '2)-Current-and-Su....pdf', kind: 'pdf', domain: 'design' }],
  },
};

/** The page to edit: a draft being written. */
const EDIT: AVPageProps = {
  mode: 'edit',
  header: { title: 'Added Value Creation', type: 'new', backLabel: 'Back to Drafts', onBack: fn() },
  title: { value: '' },
  description: { problem: { ...edit('problem') }, solution: { ...edit('solution') }, deliverable: { ...edit('deliverable') }, 'desired-outcome': { ...edit('desired-outcome') } },
  history: { count: 1 },
  duplicate: { options: [{ value: 'development', name: 'Development' }, { value: 'content', name: 'Content' }], onChange: fn() },
  details: { type: 'new', domain: 'design', value: EDITING, options: OPTIONS, onChange: fn() },
  actions: { onDiscard: fn(), progression: { role: 'assignee-initiator', status: 'Draft', onTransition: fn() } },
};

const meta = {
  title: 'Patterns/AVPage',
  component: AVPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of an Added Value’s page, to read or to edit: the header, then the left column (title, the four description blocks, multipart, status history, ' +
          'comments or duplicate) and the right (the detail card and the deliverables). The page passes each piece’s own props; a section shows only when it is passed.',
      },
    },
  },
  args: VIEW,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AVPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const headings = (c: ReturnType<typeof within>) => c.getAllByRole('heading').map((h: HTMLElement) => h.textContent ?? '');
const inOrder = (c: ReturnType<typeof within>, names: string[]) => {
  const all = headings(c);
  const at = names.map((n) => all.findIndex((h: string) => h.includes(n)));
  return at.every((i) => i >= 0) && [...at].sort((a, b) => a - b).every((v, i) => v === at[i]);
};

/** To read: an accepted Added Value. The status button is in the header; the comments follow the history; the deliverables are under the details. */
export const Reading: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'VCP-123' })).toBeVisible();
    await expect(c.getByRole('heading', { name: 'Some Title Here' })).toBeVisible();
    await expect(c.getByText('VCP-1234')).toBeVisible();
    /* The left column's order. */
    await expect(inOrder(c, ['Some Title Here', 'Problems', 'Solutions', 'Acceptance', 'Desired outcome', 'Status History', 'Comments'])).toBe(true);
    /* The Comments title and its sort chip are centred on each other, and Comments sits 32 below the Status History card. */
    const heading = c.getByRole('heading', { name: 'Comments' });
    const chip = within(heading.parentElement!).getByRole('button');
    const mid = (el: Element) => el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
    await expect(Math.abs(mid(heading) - mid(chip))).toBeLessThan(1);
    const history = c.getByRole('heading', { name: /Status History/ }).closest('section, div[class*="rounded"]')!;
    await expect(Math.round(heading.closest('section')!.getBoundingClientRect().top - history.getBoundingClientRect().bottom)).toBe(32);
    /* The status buttons are the header's when reading. */
    await userEvent.click(c.getByRole('button', { name: /Move to In progress/i }));
    await expect(args.header.onTransition).toHaveBeenCalled();
    await expect(c.getByRole('heading', { name: 'Deliverables' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'Discard' })).toBeNull();
  },
};

/** To edit: the Title is a field, the header has no status buttons, and Discard, Save as Draft and Submit are at the bottom. */
export const Editing: Story = {
  args: EDIT,
  render: function Render(args: AVPageProps) {
    const [value, setValue] = React.useState('');
    return <AVPage {...args} title={{ value, onChange: setValue }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Added Value Creation' })).toBeVisible();
    const title = c.getByRole('textbox', { name: 'Title' });
    await userEvent.type(title, 'A new Added Value');
    await expect(title).toHaveValue('A new Added Value');
    /* Not in the header; in the bar below the columns. */
    await expect(c.getByRole('button', { name: 'Save as Draft' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Submit' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Discard' }));
    await expect(args.actions?.onDiscard).toHaveBeenCalled();
    /* Comments and deliverables are for reading; duplicating is for editing. */
    await expect(c.queryByRole('heading', { name: 'Comments' })).toBeNull();
    await expect(c.queryByRole('heading', { name: 'Deliverables' })).toBeNull();
    await expect(c.getByText('Duplicate to other Domains')).toBeVisible();
  },
};

/** A draft being read: the same page with the draft's buttons, and only the sections it has. */
export const ReadingADraft: Story = {
  args: {
    ...VIEW,
    header: { ...VIEW.header, status: 'Draft', role: 'assignee-initiator' },
    history: undefined,
    comments: undefined,
    deliverables: undefined,
    details: { type: 'viewing', domain: 'design', value: { ...VIEWING, status: 'Draft', assignees: [] } },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('heading', { name: 'Comments' })).toBeNull();
    await expect(c.queryByRole('heading', { name: 'Status History (3)' })).toBeNull();
    await expect(c.getByRole('heading', { name: 'Some Title Here' })).toBeVisible();
  },
};

/** Only some sections: the page draws what it is given, and the right column is gone when it has nothing. */
export const OnlySomeSections: Story = {
  args: { ...VIEW, details: undefined, deliverables: undefined, comments: undefined, history: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Some Title Here' })).toBeVisible();
    await expect(c.queryByRole('heading', { name: 'Deliverables' })).toBeNull();
  },
};

export const DarkTheme: Story = { globals: { theme: 'dark' } };
