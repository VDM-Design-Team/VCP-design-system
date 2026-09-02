import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaginationDots } from './PaginationDots';

const meta = {
  title: 'Navigation/PaginationDots',
  component: PaginationDots,
  parameters: {
    docs: {
      description: {
        component:
          'Position dots for a carousel, an onboarding flow, a small stepper — places, not ' +
          'addresses. With `onChange` each dot is a named button ("Go to page 2"); without it ' +
          'the dots are a passive indicator with the position in visually-hidden text. The ' +
          'export shipped these as a `tablist`; they are not tabs and no longer claim to be.',
      },
    },
  },
  args: { count: 5, index: 1, label: 'Onboarding steps' },
  argTypes: {
    count: { control: 'number' },
    index: { control: 'number' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof PaginationDots>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: the active dot stretches into a pill as it moves. */
export const Default: Story = {
  render: (args) => {
    const [index, setIndex] = React.useState(args.index);
    return <PaginationDots {...args} index={index} onChange={setIndex} />;
  },
};

/**
 * No `onChange`: a passive indicator. No buttons, no tab stops — screen
 * readers get "Onboarding steps: 2 of 5" as plain hidden text.
 */
export const Passive: Story = {};

/** Two is the floor for the pattern to read as pagination at all. */
export const TwoPages: Story = {
  render: (args) => {
    const [index, setIndex] = React.useState(0);
    return <PaginationDots {...args} count={2} index={index} onChange={setIndex} />;
  },
};

/**
 * Beside content, the usual habitat — the dots confirm the position the swipe
 * or the buttons changed.
 */
export const UnderACard: Story = {
  render: (args) => {
    const [index, setIndex] = React.useState(0);
    const slides = ['Welcome to VCP', 'Propose an Added Value', 'Track it to production'];
    return (
      <div className="flex w-96 flex-col items-center gap-4">
        <div className="grid h-32 w-full place-items-center rounded-md border border-stroke-subtle bg-surface-elevated text-body-md text-text-secondary">
          {slides[index]}
        </div>
        <PaginationDots {...args} count={slides.length} index={index} onChange={setIndex} />
      </div>
    );
  },
};

/** Both fills are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-4 bg-surface-canvas p-8">
            <PaginationDots {...args} onChange={() => {}} />
            <PaginationDots {...args} index={3} />
          </div>
        </div>
      ))}
    </div>
  ),
};
