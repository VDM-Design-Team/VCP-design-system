import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Atoms/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'An indeterminate loading indicator. `role="status"` with an accessible name, so it ' +
          'is reported without stealing focus — never `progressbar`, which promises a value ' +
          'this has no way to give. The ring inherits `currentColor`: set the colour on the ' +
          'parent with a text token, exactly as with `Icon`.',
      },
    },
  },
  args: { size: 'md' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    showLabel: { control: 'boolean' },
    decorative: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Spinner {...args} className="text-text-tertiary" />,
};

/** 16 inside a control, 20 inline, 24 for a panel. The ring keeps its optical weight. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6 text-text-tertiary">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Spinner {...args} size={size} />
          <span className="text-caption-sm text-text-subtle">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** For a wait long enough to be worth explaining, paint the label. */
export const WithLabel: Story = {
  args: { showLabel: true, label: 'Loading commitments…' },
  render: (args) => <Spinner {...args} className="text-text-secondary" />,
};

/**
 * With no visible label the name is still there — as `sr-only` text inside the
 * live region, which is what actually gets announced. The default is "Loading";
 * override it with `label` when the wait has a better name.
 */
export const WithoutLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-6 text-text-tertiary">
      <Spinner {...args} />
      <Spinner {...args} label="Saving your changes" />
    </div>
  ),
};

/**
 * `decorative` renders it silently: no `role`, `aria-hidden` on the whole thing.
 * Use it inside a control that already announces its own state — the mock button
 * below carries `aria-busy`, so a second announcement would just be noise.
 */
export const SilentInsideAControl: Story = {
  args: { decorative: true, size: 'sm' },
  render: (args) => (
    <span
      aria-busy
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-action-primary-surface-default px-4 font-sans text-label-lg text-action-primary-content-default"
    >
      <Spinner {...args} />
      Saving…
    </span>
  ),
};

/**
 * The ring is drawn in `currentColor`, so it takes the text colour of whatever it
 * sits in — never colour the spinner directly.
 */
export const InheritsColour: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <Spinner {...args} className="text-text-primary" />
      <Spinner {...args} className="text-text-tertiary" />
      <Spinner {...args} className="text-text-link-default" />
      <Spinner {...args} className="text-accent-critical-tonal-content-default" />
    </div>
  ),
};

/** Centred in the panel whose content is not there yet. */
export const InALoadingPanel: Story = {
  args: { size: 'lg', showLabel: true, label: 'Loading suppliers…' },
  render: (args) => (
    <div className="flex h-64 w-112 items-center justify-center rounded-md border border-stroke-subtle bg-surface-elevated text-text-tertiary">
      <Spinner {...args} />
    </div>
  ),
};

/** Nothing here is a colour of its own, so dark comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex items-center gap-6 bg-surface-canvas p-8 text-text-tertiary">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" showLabel label="Loading…" />
          </div>
        </div>
      ))}
    </div>
  ),
};
