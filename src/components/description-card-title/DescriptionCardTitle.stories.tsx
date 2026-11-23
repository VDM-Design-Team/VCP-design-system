import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DescriptionCardTitle } from './DescriptionCardTitle';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

const meta = {
  title: 'Components/Forms/DescriptionCardTitle',
  component: DescriptionCardTitle,
  parameters: {
    docs: {
      description: {
        component:
          'The card at the top of an Added Value page that names it: to read, the reference over the title; to edit, the **Title** field ' +
          '(empty, filled, with an error, or disabled). The page’s second header — `PageTitle` above it is the ID row and holds the `<h1>`; this ' +
          'card’s title is the `<h2>` under it.',
      },
    },
  },
  args: { reference: 'VCP-1234', title: 'Collapsible sidebar for improved tables' },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3] },
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DescriptionCardTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* The title is the heading; the reference is plain text above it. */
    await expect(c.getByRole('heading', { level: 2 })).toHaveTextContent('Collapsible sidebar for improved tables');
    await expect(c.getByText('VCP-1234').tagName).toBe('P');
  },
};

/** A long title wraps rather than being cut: this card is the one place the whole title shows. */
export const LongTitle: Story = {
  args: {
    reference: 'VCP-12408',
    title:
      'Rework the notification bell so the unread state survives a reload, a sign-out and a switch between the Design and Development domains',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

/** Deeper in a page, under another `<h2>`. */
export const HeadingLevel3: Story = {
  args: { headingLevel: 3 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 3 })).toBeVisible();
  },
};

/** To edit: the card is the **Title** field. It starts empty with its prompt, and takes what is typed. */
export const Editing: Story = {
  args: { editing: true, title: '', onChange: fn() },
  render: function Render(args) {
    const [title, setTitle] = React.useState(args.title);
    return <DescriptionCardTitle {...args} title={title} onChange={setTitle} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('textbox', { name: 'Title' });
    await expect(field).toHaveAttribute('placeholder', 'Type in the title');
    await userEvent.type(field, 'Collapsible sidebar');
    await expect(field).toHaveValue('Collapsible sidebar');
    /* No reference and no heading while editing: the field is the card. */
    await expect(c.queryByRole('heading')).toBeNull();
  },
};

/** A required title left empty: the message under the field, and the field is `aria-invalid`. */
export const WithAnError: Story = {
  args: { editing: true, title: '', error: 'Enter a title.' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('textbox', { name: 'Title' })).toHaveAttribute('aria-invalid', 'true');
    await expect(c.getByText('Enter a title.')).toBeVisible();
  },
};

/** The title cannot be changed: the value stays, greyed, and takes no focus. */
export const Disabled: Story = {
  args: { editing: true, title: 'Some Title Here', disabled: true },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Title' });
    await expect(field).toBeDisabled();
    await expect(field).toHaveValue('Some Title Here');
  },
};

/** A part of a multipart set: "Multipart Child of VCP-4321" beside the reference, the parent a link that opens it in a new tab. */
export const MultipartChild: Story = {
  args: { parent: { ref: 'VCP-4321', href: '/values/VCP-4321' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Multipart Child of')).toBeVisible();
    const link = c.getByRole('link', { name: /VCP-4321/ });
    await expect(link).toHaveAttribute('href', '/values/VCP-4321');
    await expect(link).toHaveAttribute('target', '_blank');
  },
};

/** With only `onOpen` the parent's reference is a real button: the keyboard reaches it and Enter presses it. */
export const MultipartChildAsAButton: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { parent: { ref: 'VCP-4321', onOpen: fn() } },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'VCP-4321' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.parent?.onOpen).toHaveBeenCalledTimes(1);
  },
};

/** Every colour is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { controls: { disable: true }, ...SIDE_BY_SIDE },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <DescriptionCardTitle {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};
