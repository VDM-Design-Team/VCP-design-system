import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          'Where the current page sits in the hierarchy, each ancestor a way back. A ' +
          '`<nav aria-label="Breadcrumb">` around a real `<ol>`; the last crumb is the page ' +
          'itself — `aria-current="page"`, not a control. Prefer `href` links over ' +
          '`onNavigate` buttons whenever a URL exists.',
      },
    },
  },
  args: {
    items: ['Added Values', 'Development', 'AV-2041'],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Strings are shorthand — ancestors become buttons wired to `onNavigate`. */
export const Default: Story = {};

/** With `href` the crumbs are real links: middle-click, copy address, all of it. */
export const AsLinks: Story = {
  args: {
    items: [
      { label: 'Added Values', href: '#av' },
      { label: 'Development', href: '#av-dev' },
      { label: 'AV-2041' },
    ],
  },
};

/** Two levels is the floor — a single crumb is a page title, not a trail. */
export const TwoLevels: Story = {
  args: { items: ['Suppliers', 'Nordfjord Components'] },
};

/** A deep trail wraps rather than truncating — depth is information. */
export const Deep: Story = {
  render: (args) => (
    <div className="w-80">
      <Breadcrumb
        {...args}
        items={['Added Values', 'Development', 'Q3 2026', 'Packaging programme', 'AV-2041']}
      />
    </div>
  ),
};

/** Link, current and separator are all tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <Breadcrumb {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};
