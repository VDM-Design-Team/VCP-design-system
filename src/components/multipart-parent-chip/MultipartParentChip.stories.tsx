import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MultipartParentChip } from './MultipartParentChip';

const meta = {
  title: 'Components/Data Display/MultipartParentChip',
  component: MultipartParentChip,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'On a child part’s row, a small link to its parent: “Parent: VCP-4321 ↗”. With an `href` it opens the parent in a new tab; with only `onOpen` it is a button; ' +
          'with neither it is plain text (nowhere to go, so nothing to focus). Underlined on hover; a long reference is cut with an ellipsis.',
      },
    },
  },
  args: { parentRef: 'VCP-4321', onOpen: fn() },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultipartParentChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's chip, as a button: “Parent: VCP-4321” and an arrow. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Parent: VCP-4321' }));
    await expect(args.onOpen).toHaveBeenCalled();
  },
};

/** With an `href` it is a real link that opens the parent in a new tab (and says so to a screen reader), and keeps its arrow because the arrow is true. */
export const AsALink: Story = {
  args: { href: '/added-values/VCP-4321', onOpen: undefined },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Parent: VCP-4321 (opens in a new tab)' });
    await expect(link).toHaveAttribute('href', '/added-values/VCP-4321');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link.querySelector('svg')).not.toBeNull();
  },
};

/** With neither an `href` nor `onOpen` there is nowhere to go, so it is plain text: not focusable, not a button, and no arrow. */
export const NowhereToGo: Story = {
  args: { onOpen: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('button')).toBeNull();
    await expect(c.queryByRole('link')).toBeNull();
    const text = c.getByText('Parent: VCP-4321');
    await expect(text.closest('[tabindex]')).toBeNull();
    await expect(canvasElement.querySelector('svg')).toBeNull();
  },
};

/** 164 wide at most: a long reference is cut with an ellipsis, and the arrow stays. */
export const LongReference: Story = {
  args: { parentRef: 'VCP-43214321-and-a-lot-more' },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('button');
    await expect(chip.getBoundingClientRect().width).toBeLessThanOrEqual(164);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
