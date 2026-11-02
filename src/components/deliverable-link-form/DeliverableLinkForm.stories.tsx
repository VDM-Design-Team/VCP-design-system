import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DeliverableLinkForm, LINK_TITLE_ERROR, LINK_URL_ERROR } from './DeliverableLinkForm';

const meta = {
  title: 'Components/Forms/DeliverableLinkForm',
  component: DeliverableLinkForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The form that takes a link: a URL and a title, then Cancel and Add (or Save when changing one). "+ Add another link" ' +
          'adds another pair, and Add hands over all of them. Checked when Add or Save is pressed, with each message under its field.',
      },
    },
  },
  args: { onSubmit: fn(), onCancel: fn() },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full bg-surface-elevated p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DeliverableLinkForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Adding: type a link, press Add. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link URL' }), 'https://www.example.com');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link title' }), 'Example');
    await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
    await expect(args.onSubmit).toHaveBeenCalledWith([{ url: 'https://www.example.com', title: 'Example' }]);
  },
};

/** Pressing Add with nothing in it shows both messages, each under its field, and hands over nothing. */
export const Errors: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link URL' }), 'wronglinkformat.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
    await expect(canvas.getByText(LINK_URL_ERROR)).toBeVisible();
    await expect(canvas.getByText(LINK_TITLE_ERROR)).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Link URL' })).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** "+ Add another link" puts another pair under the first; Add hands over both. */
export const AddAnotherLink: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link URL' }), 'https://a.example.com');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link title' }), 'A');
    await userEvent.click(canvas.getByRole('button', { name: 'Add another link' }));
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link URL 2' }), 'https://b.example.com');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link title 2' }), 'B');
    await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
    await expect(args.onSubmit).toHaveBeenCalledWith([
      { url: 'https://a.example.com', title: 'A' },
      { url: 'https://b.example.com', title: 'B' },
    ]);
  },
};

/** Editing a link already added: one pair, filled in, and Save. */
export const Editing: Story = {
  args: { mode: 'edit', initial: { url: 'https://www.example.com', title: 'Some Link Name Here' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Link title' })).toHaveValue('Some Link Name Here');
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Add another link' })).toBeNull();
  },
};
