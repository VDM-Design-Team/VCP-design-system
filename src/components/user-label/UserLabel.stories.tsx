import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { UserLabel } from './UserLabel';

const meta = {
  title: 'Components/Display/UserLabel',
  component: UserLabel,
  parameters: {
    docs: {
      description: {
        component:
          'A person, named in place: avatar, name and, under it, a role. For a table cell, a card ' +
          'header or a line in a list. Two sizes, Figma’s Default (`md`) and S (`sm`). When the ' +
          'person is something to press or remove, use `Chip`.',
      },
    },
  },
  args: { name: 'John', role: 'Assignee', fullName: 'John Doe' },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
} satisfies Meta<typeof UserLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's Default: a 32 avatar, the name in `body-sm-medium`, the role under it in `text.tertiary`. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('John')).toBeVisible();
    await expect(canvas.getByText('Assignee')).toBeVisible();
    /* The avatar beside a visible name is decoration: one announcement, not two. */
    await expect(canvasElement.querySelector('[aria-hidden="true"]')).not.toBeNull();
  },
};

/** Figma's S: a 24 avatar and one step down in type. */
export const Small: Story = { args: { size: 'sm' } };

/** Both sizes, with and without a role. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <UserLabel {...args} />
      <UserLabel {...args} role={undefined} />
      <UserLabel {...args} size="sm" />
      <UserLabel {...args} size="sm" role={undefined} />
    </div>
  ),
};

/** Without a role the label is just avatar and name. */
export const WithoutRole: Story = {
  args: { role: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText('Assignee')).toBeNull();
  },
};

/** A photo instead of initials. */
export const WithPhoto: Story = {
  args: { src: 'https://i.pravatar.cc/64?img=12' },
};

/** Squeezed, the name and role are cut with "…". */
export const Truncates: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { name: 'Bartholomew Featherstonehaugh-Wetherby', role: 'Senior assignee, procurement' },
  render: (args) => (
    <div className="w-48">
      <UserLabel {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const name = within(canvasElement).getByText('Bartholomew Featherstonehaugh-Wetherby');
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
  },
};

/** Light and dark. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex flex-col">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-wrap items-start gap-8 bg-surface-canvas p-6">
            <UserLabel {...args} />
            <UserLabel {...args} size="sm" />
          </div>
        </div>
      ))}
    </div>
  ),
};
