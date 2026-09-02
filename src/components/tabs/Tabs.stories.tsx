import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, tabId, tabPanelId } from './Tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          'Moves between sibling panels of content under one heading — Overview / Activity / ' +
          'Files. Each tab owns a panel. If the options only change how the *same* content is ' +
          'shown, use SegmentedControl instead. This component renders the bar; you render the ' +
          'panels and wire them with `tabId()` and `tabPanelId()`.' +
          '\n\n**From Figma:** Tabs organize and allow navigation between groups of content ' +
          'that are related and at the same level of hierarchy.',
      },
    },
  },
  args: {
    'aria-label': 'Deliverable sections',
    tabs: ['Overview', 'Activity', 'Files'],
    defaultValue: 'Overview',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    fullWidth: { control: 'boolean' },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Tabs {...args} size="sm" />
      <Tabs {...args} size="md" />
    </div>
  ),
};

/** Counts sit after the label and pick up the brand tint when their tab is selected. */
export const WithCounts: Story = {
  args: {
    tabs: [
      { key: 'all', label: 'All', count: 128, countLabel: '128 deliverables' },
      { key: 'mine', label: 'Assigned to me', count: 12, countLabel: '12 deliverables' },
      { key: 'review', label: 'In review', count: 0, countLabel: 'none in review' },
    ],
    defaultValue: 'mine',
  },
};

/** A disabled tab stays visible so the section is discoverable, but can't be reached. */
export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { key: 'overview', label: 'Overview' },
      { key: 'activity', label: 'Activity' },
      { key: 'billing', label: 'Billing', disabled: true },
    ],
    defaultValue: 'overview',
  },
};

/** Tabs share the width evenly — narrow containers and mobile. */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div className="w-96">
      <Tabs {...args} />
    </div>
  ),
};

/**
 * The whole pattern: bar plus panels, correctly associated. This is the story to
 * copy into a feature — a tab bar on its own is not an accessible tab set.
 */
export const WithPanels: Story = {
  render: (args) => {
    const prefix = 'demo';
    const [value, setValue] = React.useState('Overview');
    return (
      <div className="w-full max-w-lg">
        <Tabs {...args} idPrefix={prefix} value={value} onChange={setValue} />
        {(args.tabs as string[]).map((key) => (
          <div
            key={key}
            role="tabpanel"
            id={tabPanelId(prefix, key)}
            aria-labelledby={tabId(prefix, key)}
            hidden={key !== value}
            tabIndex={0}
            className="p-4 text-body-md text-text-secondary"
          >
            The {key.toLowerCase()} panel.
          </div>
        ))}
      </div>
    );
  },
};

/** Both themes side by side — the underline and label must stay readable in each. */
export const DarkTheme: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      <div className="bg-surface-canvas p-8">
        <Tabs {...args} />
      </div>
      <div className="dark bg-surface-canvas p-8">
        <Tabs {...args} />
      </div>
    </div>
  ),
};
