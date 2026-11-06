import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import { TruncatedText } from './TruncatedText';

const LONG = 'Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard and Everything Beyond It';

const meta = {
  title: 'Components/Data Display/TruncatedText',
  component: TruncatedText,
  parameters: {
    docs: {
      description: {
        component:
          'One line of text, cut with "…" when it does not fit, that says the whole of it on hover and focus — and only when it has been cut. For the name in a table\'s first column.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64 pt-12">
        <Story />
      </div>
    ),
  ],
  args: { children: LONG, className: 'text-label-sm-medium text-text-primary' },
} satisfies Meta<typeof TruncatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cut: hovering or focusing it opens the system tooltip with the whole text; it is a tab stop only because it is cut. */
export const Cut: Story = {
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(LONG);
    await userEvent.tab();
    await expect(text).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(LONG);
  },
};

/** Fits: nothing to say, so no tooltip and no tab stop. */
export const Fits: Story = {
  args: { children: 'Short name' },
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('Short name');
    await userEvent.hover(text);
    await expect(text).not.toHaveAttribute('tabindex');
    /* The bubble stays in the page for assistive tech but never opens. */
    await expect(screen.queryByRole('tooltip')?.parentElement).toHaveClass('opacity-0');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
};
