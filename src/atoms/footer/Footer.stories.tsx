import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta = {
  title: 'Atoms/Footer',
  component: Footer,
  parameters: {
    docs: {
      description: {
        component:
          'The page copyright line — a year and a wordmark, and nothing else. Read off the ' +
          'Figma `Page_Template`. An **atom**, not a pattern: the inventory filed it under ' +
          '"Page structure" patterns, but it composes nothing. The year is computed rather ' +
          'than hardcoded, because a copyright that silently goes stale is worse than one ' +
          'that is obviously generated.',
      },
    },
  },
  args: {},
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The current year, computed at render. */
export const Default: Story = {};

/** Pinned, for a test or a visual baseline that must not drift each January. */
export const PinnedYear: Story = { args: { year: 2026 } };

/** It sits on the page surface, left-aligned at the content's own inset. */
export const OnThePage: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex min-h-40 flex-col justify-end bg-surface-canvas">
      <Footer {...args} />
    </div>
  ),
};

/** Both fills are tokens, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-32 items-end bg-surface-canvas">
            <Footer {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};
