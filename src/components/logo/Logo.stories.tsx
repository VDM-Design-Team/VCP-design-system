import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta = {
  title: 'Display/Logo',
  component: Logo,
  parameters: {
    docs: {
      description: {
        component:
          'The Value Chain Plus mark — full lockup or the diamond alone (`collapsed`). ' +
          'Inline SVG from the Figma component set: the wordmark rides `text.logo` (navy → ' +
          'white in dark, as the Figma dark variant), the diamond rides `text.logo-accent` ' +
          '(brand blue in both themes). No CSS-invert hacks, no image files.',
      },
    },
  },
  args: {},
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    collapsed: { control: 'boolean' },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The Figma Small / Medium / Big variants: 16 / 28 / 44 tall. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <Logo size="sm" />
      <Logo size="md" />
      <Logo size="lg" />
    </div>
  ),
};

/** The diamond alone — the collapsed navigation rail's mark. */
export const Collapsed: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Logo collapsed size="sm" />
      <Logo collapsed size="md" />
      <Logo collapsed size="lg" />
    </div>
  ),
};

/**
 * Inside a home link, the link carries the name and the logo goes silent —
 * one announcement, not two. This is TopBar's usage.
 */
export const InAHomeLink: Story = {
  render: () => (
    <a
      href="#home"
      aria-label="Value Chain Plus — home"
      className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stroke-focused"
    >
      <Logo decorative />
    </a>
  ),
};

/** The wordmark themes to white via `text.logo`; the diamond holds its blue. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col items-start gap-6 bg-surface-canvas p-8">
            <Logo />
            <Logo collapsed />
          </div>
        </div>
      ))}
    </div>
  ),
};
