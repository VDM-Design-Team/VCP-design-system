import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ViewersPicker, type ViewerPerson } from './ViewersPicker';

const PEOPLE: ViewerPerson[] = [
  { id: 'maya', name: 'Maya Bennett' },
  { id: 'liam', name: 'Liam Carter' },
  { id: 'noah', name: 'Noah Foster' },
  { id: 'adam', name: 'Adam Reyes' },
  { id: 'adrian', name: 'Adrian Cruz' },
  { id: 'priya', name: 'Priya Nair' },
];
const VIEWING = PEOPLE.slice(0, 3);

const meta = {
  title: 'Components/Forms/ViewersPicker',
  component: ViewersPicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Who can see an Added Value without working on it, and the way to change it. The pill shows an eye and the count; **hover or focus it** for the list, **press it** ' +
          'to search for people and add them or remove viewers. Without `onAdd` and `onRemove` it is read-only. It holds no data: the page passes the lists and changes them.',
      },
    },
  },
  args: { viewers: VIEWING, candidates: PEOPLE },
} satisfies Meta<typeof ViewersPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Read-only: the pill, and the list on hover or focus. */
export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    const pill = within(canvasElement).getByRole('button', { name: '3 viewers' });
    await userEvent.hover(pill);
    const body = within(canvasElement.ownerDocument.body);
    const heading = await body.findByText('3 Viewers');
    await waitFor(() => expect(heading).toBeVisible());
    await expect(body.getByText('Maya Bennett')).toBeVisible();
  },
};

/** Nobody is viewing: the hover says so, and, when it can be changed, where to do it. */
export const NoViewers: Story = {
  args: { viewers: [], onAdd: fn(), onRemove: fn() },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button', { name: '0 viewers' }));
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByText('No viewers yet')).toBeVisible());
    await expect(body.getByText('Click to manage viewers')).toBeVisible();
  },
};

/** Press it: search by name, add whoever matches, remove a viewer. The page holds the lists. */
export const Managing: Story = {
  render: function Render(args) {
    const [viewers, setViewers] = React.useState<ViewerPerson[]>(VIEWING);
    return (
      <div className="h-80 w-72">
        <ViewersPicker
          {...args}
          viewers={viewers}
          onAdd={(person) => setViewers((list) => [...list, person])}
          onRemove={(person) => setViewers((list) => list.filter((item) => item.id !== person.id))}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: '3 viewers' }));
    const search = await c.findByRole('textbox', { name: 'Search people by name' });
    await expect(c.getByText('3 Viewers')).toBeVisible();
    /* Typing offers the people who are not viewers yet; the ones who are never show as a match. */
    await userEvent.type(search, 'Ad');
    await expect(c.getByRole('button', { name: /Adam Reyes/ })).toBeVisible();
    await expect(c.getByRole('button', { name: /Adrian Cruz/ })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: /Adam Reyes/ }));
    /* Added: the count grows, the search clears and focus stays in the search field. */
    await expect(c.getByText('4 Viewers')).toBeVisible();
    await expect(c.getByRole('button', { name: '4 viewers' })).toBeInTheDocument();
    await expect(search).toHaveFocus();
    await expect(search).toHaveValue('');
    /* Removed: the same, and the person is gone from the list. */
    await userEvent.click(c.getByRole('button', { name: 'Remove Liam Carter as a viewer' }));
    await expect(c.getByText('3 Viewers')).toBeVisible();
    await expect(c.queryByText('Liam Carter')).toBeNull();
    await expect(search).toHaveFocus();
  },
};

/** Nobody matches the search. */
export const NoMatch: Story = {
  args: { onAdd: fn(), onRemove: fn() },
  render: (args) => (
    <div className="h-80 w-72">
      <ViewersPicker {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: '3 viewers' }));
    await userEvent.type(await c.findByRole('textbox', { name: 'Search people by name' }), 'zzz');
    await expect(c.getByText('No one matches')).toBeVisible();
  },
};
