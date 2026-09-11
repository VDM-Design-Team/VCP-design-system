import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Carousel } from './Carousel';
import { PaginationDots } from '../../atoms/pagination-dots';

const PANELS = [
  { title: 'Experimental Features Available', body: 'Early preview features you can turn on.' },
  { title: 'New Update Available', body: 'What changed in this release.' },
  { title: 'New Feature Available', body: 'Something that was not here last week.' },
];

const meta = {
  title: 'Components/Navigation/Carousel',
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component:
          'One panel at a time, with an arrow on each side. **The dots are not rendered here** — ' +
          'the caller places them, because a design does not always put them next to the content; ' +
          'the changelog dialog puts them below its footer buttons. That is also why it is ' +
          'controlled: the arrows and the dots read one number rather than two that can disagree. ' +
          'It **wraps** at both ends, and it **never moves on its own**.',
      },
    },
  },
  /* `children` is required on the component, so the meta has to carry one —
     every story's JSX child overrides it. */
  args: {
    count: PANELS.length,
    index: 0,
    label: 'What’s new',
    onIndexChange: () => {},
    children: null,
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const Panel = ({ index }: { index: number }) => (
  <div className="flex flex-col gap-1 py-4 text-center">
    <span className="text-heading-sm text-text-primary">{PANELS[index].title}</span>
    <span className="text-body-md text-text-secondary">{PANELS[index].body}</span>
  </div>
);

/** The first panel. Both arrows are live, because it wraps. */
export const Default: Story = {
  render: (args) => (
    <div className="w-[34rem] max-w-full">
      <Carousel {...args}>
        <Panel index={args.index} />
      </Carousel>
    </div>
  ),
};

/** The last panel. Next wraps back to the first rather than going dead. */
export const LastPanel: Story = {
  args: { index: 2 },
  render: Default.render,
};

/** Every colour is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <Carousel {...args}>
              <Panel index={args.index} />
            </Carousel>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * With dots, which is how it is meant to be used — placed by the caller,
 * reading the same index the arrows write.
 */
export const WithDots: Story = {
  render: function WithDotsStory(args) {
    const [index, setIndex] = React.useState(0);
    return (
      <div className="flex w-[34rem] max-w-full flex-col items-center gap-4">
        <Carousel {...args} index={index} onIndexChange={setIndex}>
          <Panel index={index} />
        </Carousel>
        <PaginationDots count={PANELS.length} index={index} onChange={setIndex} label="What’s new" />
      </div>
    );
  },
};

/**
 * Moving through it: the arrows, the wrap at both ends, and the arrow keys.
 * The panel announces its position because the slide is a polite live region —
 * which is only safe because nothing moves on its own.
 */
export const MovingThroughIt: Story = {
  render: WithDots.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slide = () => canvas.getByRole('group', { name: /of 3/ });

    await expect(slide()).toHaveAccessibleName('1 of 3');
    await expect(canvas.getByText('Experimental Features Available')).toBeInTheDocument();

    /* Forwards. */
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(slide()).toHaveAccessibleName('2 of 3');

    /* Backwards past the start wraps to the end — neither arrow is a dead end. */
    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await expect(slide()).toHaveAccessibleName('3 of 3');
    await expect(canvas.getByText('New Feature Available')).toBeInTheDocument();

    /* And forwards past the end wraps to the start. */
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(slide()).toHaveAccessibleName('1 of 3');

    /* Arrow keys move it too, from anywhere inside. */
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(slide()).toHaveAccessibleName('3 of 3');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(slide()).toHaveAccessibleName('2 of 3');

    /* The dots move it as well, and read the same number. */
    await userEvent.click(canvas.getByRole('button', { name: 'Go to page 1' }));
    await expect(slide()).toHaveAccessibleName('1 of 3');
  },
};
