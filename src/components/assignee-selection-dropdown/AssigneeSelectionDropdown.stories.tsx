import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AssigneeSelectionDropdown, type AssigneeOption } from './AssigneeSelectionDropdown';

const PEOPLE: AssigneeOption[] = [
  { value: 'amy', label: 'Amy Lee', availability: 'available' },
  { value: 'bo', label: 'Bo Tran', availability: 'available' },
  { value: 'cy', label: 'Cy Park', availability: 'busy', until: 'May 17' },
  { value: 'di', label: 'Di Moss', availability: 'busy', until: 'May 20' },
  { value: 'ed', label: 'Ed Ruiz', availability: 'unavailable', until: 'May 17' },
];

const meta = {
  title: 'Components/Forms/AssigneeSelectionDropdown',
  component: AssigneeSelectionDropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Picking an assignee when availability matters, on `SearchSelect`: collapsible Available / ' +
          'Busy / Unavailable groups with a status dot, a date pill on busy and unavailable rows, ' +
          'unavailable people not selectable, and an unknown state for when the dates are not set yet. ' +
          'After a pick, a busy person warns under the field and an unavailable one errors.',
      },
    },
  },
  args: { people: PEOPLE, 'aria-label': 'Assignee' },
  decorators: [
    (Story) => (
      <div className="h-96 w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssigneeSelectionDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(args: React.ComponentProps<typeof AssigneeSelectionDropdown>) {
  const [value, setValue] = React.useState(args.value ?? '');
  return <AssigneeSelectionDropdown {...args} fullWidth value={value} onChange={setValue} />;
}

const open = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /Assignee/ }));
};

/** The default view: Available and Busy open, Unavailable folded. */
export const DefaultView: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => open(canvasElement),
};

/** No start date, due date or cycle yet: a notice and a plain list; anyone can be picked. */
export const UnknownAvailability: Story = {
  args: { availabilityKnown: false },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => open(canvasElement),
};

/** Folds are the user's: collapse a group and its rows leave the list and the arrow keys. */
export const AllCollapsed: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    const canvas = within(canvasElement);
    for (const name of ['Available', 'Busy']) {
      await userEvent.click(canvas.getByRole('button', { name: new RegExp(`^${name}`) }));
    }
  },
};

export const AllExpanded: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Unavailable/ }));
  },
};

/** The dates moved after the pick: the person is busy — a warning, and they can still be assigned. */
export const PickedIsBusy: Story = {
  args: { value: 'cy' },
  render: (args) => <Controlled {...args} />,
};

/** …or unavailable — an error, and the form must not submit with them. */
export const PickedIsUnavailable: Story = {
  args: { value: 'ed' },
  render: (args) => <Controlled {...args} />,
};

export const DarkTheme: Story = { ...DefaultView, globals: { theme: 'dark' } };

/** Unavailable people can't be picked, folded or not; a busy one can. */
export const PickingSomeone: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    await open(canvasElement);
    const canvas = within(canvasElement);
    /* Unavailable starts folded: Ed isn't on screen. */
    await expect(canvas.queryByRole('option', { name: /Ed Ruiz/ })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: /^Unavailable/ }));
    const ed = canvas.getByRole('option', { name: /Ed Ruiz/ });
    await expect(ed).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(ed);
    await expect(canvas.queryByText(/cannot be assigned/)).toBeNull();
    await userEvent.click(canvas.getByRole('option', { name: /Cy Park/ }));
    await expect(await canvas.findByText(/busy during the selected dates/)).toBeInTheDocument();
  },
};
