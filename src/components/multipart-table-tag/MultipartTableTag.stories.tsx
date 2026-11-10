import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MultipartTableTag } from './MultipartTableTag';

const meta = {
  title: 'Components/Data Display/MultipartTableTag',
  component: MultipartTableTag,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The small tag in the AV table that says an Added Value is part of a multipart set: a child shows where it sits (“1/3”), a ' +
          'parent shows a progress ring of its parts. Its tooltip explains it, on hover and on keyboard focus.',
      },
    },
  },
  args: { kind: 'child', position: 1, total: 3, parentRef: 'VCP-4321' },
  argTypes: { kind: { control: 'radio', options: ['child', 'parent'] } },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultipartTableTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A child: the split glyph and its place, "1/3". */
export const Child: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Multipart child, part 1 of 3')).toBeInTheDocument();
    await expect(c.getByText('1/3')).toBeVisible();
    /* Keyboard focus opens the tooltip, with the parent's ID. */
    await userEvent.tab();
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible());
    await expect(within(document.body).getByRole('tooltip')).toHaveTextContent(/Parent ID: VCP-4321/);
  },
};

/** A parent: the glyph turned over and a progress ring of how many parts are done. */
export const Parent: Story = {
  args: { kind: 'parent', completed: 1, total: 3, position: undefined, parentRef: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Multipart parent, 1 of 3 parts completed')).toBeInTheDocument();
    await userEvent.tab();
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible());
    await expect(within(document.body).getByRole('tooltip')).toHaveTextContent(/It currently has 3 child parts\./);
  },
};

/** Figma's size: 28 high, with 14 type and 20 glyphs. The tooltip opens above, as Figma draws it (`Tooltip` flips and slides now, so the table's edge no longer cuts it off). */
export const FigmasSize: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => (
    <div className="pt-32">
      <MultipartTableTag {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByText('1/3').closest('[tabindex]') as HTMLElement;
    await expect(Math.round(tag.getBoundingClientRect().height)).toBe(28);
    await expect(getComputedStyle(within(canvasElement).getByText('1/3')).fontSize).toBe('14px');
    await expect(Math.round(tag.querySelector('svg')!.getBoundingClientRect().width)).toBe(20);
    await userEvent.tab();
    const tip = await within(document.body).findByRole('tooltip');
    await waitFor(() => expect(tip).toBeVisible());
    /* Above the tag (there is room on this page), not beside it. */
    await waitFor(() => expect(tip.getBoundingClientRect().bottom).toBeLessThanOrEqual(tag.getBoundingClientRect().top + 1));
  },
};

/** Both, with their tooltips open (as Figma draws them). */
export const BothOpen: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div className="flex items-end gap-12">
      <MultipartTableTag kind="child" position={2} total={3} parentRef="VCP-4321" />
      <MultipartTableTag kind="parent" completed={3} total={3} />
    </div>
  ),
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <div className="flex items-center gap-4">
      <MultipartTableTag kind="child" position={1} total={3} parentRef="VCP-4321" />
      <MultipartTableTag kind="parent" completed={1} total={3} />
    </div>
  ),
};
