import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DescriptionCard } from './DescriptionCard';

const meta = {
  title: 'Components/Forms/DescriptionCard',
  component: DescriptionCard,
  parameters: {
    docs: {
      description: {
        component:
          'One numbered entry in an Added Value’s description: a coloured number block and the ' +
          'paragraph beside it. The colour is the type — problem, solution, deliverable, desired ' +
          'outcome. Read it, or edit it: the paragraph becomes a text field that grows with what is ' +
          'typed. The list, the section’s title and the add button are the caller’s.',
      },
    },
  },
  args: { children: 'Some paragraph here', type: 'problem', position: 1 },
  argTypes: {
    type: { control: 'radio', options: ['problem', 'solution', 'deliverable', 'desired-outcome'] },
    position: { control: 'number' },
    children: { control: 'text' },
  },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof DescriptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The four types the Figma set draws, one of each. */
export const Types: Story = {
  render: () => (
    <ol className="m-0 flex list-none flex-col gap-4 p-0">
      {(
        [
          ['problem', 'Warehouse managers cannot see which suppliers are overdue.'],
          ['solution', 'Show a supplier scorecard on the planning page.'],
          ['deliverable', 'A scorecard page with the overdue count and a CSV export.'],
          ['desired-outcome', 'Overdue suppliers are chased within a day.'],
        ] as const
      ).map(([type, text]) => (
        <li key={type}>
          <DescriptionCard type={type}>{text}</DescriptionCard>
        </li>
      ))}
    </ol>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('1')).toHaveLength(4);
    await expect(canvas.getByText('Show a supplier scorecard on the planning page.')).toBeVisible();
  },
};

/** Editing: the panel is a text field. Type, and it grows; the remove button only reports. */
export const Editing: Story = {
  args: { editing: true, defaultValue: 'Some paragraph here', onRemove: fn(), onChange: fn(), removeLabel: 'Remove problem 1' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Problem 1' });
    await expect(field).toHaveValue('Some paragraph here');
    await userEvent.type(field, '!');
    await expect(args.onChange).toHaveBeenLastCalledWith('Some paragraph here!');
    await userEvent.click(canvas.getByRole('button', { name: 'Remove problem 1' }));
    await expect(args.onRemove).toHaveBeenCalled();
  },
};

/**
 * The remove button is in the page but unseen until the card is hovered or has focus in it: the
 * keyboard can reach it, and typing keeps it on screen. (A touch screen shows it always.)
 */
export const RemoveAppearsWithFocus: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { editing: true, defaultValue: 'Some paragraph here', onRemove: fn(), removeLabel: 'Remove problem 1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: 'Remove problem 1' });
    await expect(getComputedStyle(remove).opacity).toBe('0');
    /* Typing in the field: focus is in the card, so it shows and stays. */
    await userEvent.click(canvas.getByRole('textbox', { name: 'Problem 1' }));
    await waitFor(() => expect(getComputedStyle(remove).opacity).toBe('1'));
    /* Tabbing on to the button keeps it shown. */
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await expect(getComputedStyle(remove).opacity).toBe('1');
  },
};

/**
 * With one card being written in, hovering another does not reveal its remove button, and the
 * border of the focused field is the focused blue even while the pointer is over it.
 */
export const OnlyTheFocusedCardOffersRemove: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <DescriptionCard editing position={1} defaultValue="First" onRemove={fn()} removeLabel="Remove 1" />
      <DescriptionCard editing position={2} defaultValue="Second" onRemove={fn()} removeLabel="Remove 2" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('textbox', { name: 'Problem 1' });
    await userEvent.click(first);
    await waitFor(() => expect(getComputedStyle(canvas.getByRole('button', { name: 'Remove 1' })).opacity).toBe('1'));
    /* Focus is in card 1, so card 2's button stays hidden whatever the pointer does. */
    await expect(getComputedStyle(canvas.getByRole('button', { name: 'Remove 2' })).opacity).toBe('0');
    /* The focused field's border is the focused colour: read it off a probe that uses the token. */
    const probe = document.createElement('div');
    probe.className = 'border-2 border-stroke-focused';
    canvasElement.append(probe);
    const focusedBlue = getComputedStyle(probe).borderTopColor;
    probe.remove();
    await expect(getComputedStyle(first).borderTopColor).toBe(focusedBlue);
  },
};

/** Empty with a placeholder, and the error state: the critical border and the message under the card. */
export const EditingEmptyAndInvalid: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <DescriptionCard type="solution" position={1} editing placeholder="Describe the solution" />
      <DescriptionCard
        type="solution"
        position={2}
        editing
        defaultValue=""
        placeholder="Required"
        error="You need to fill in this field before submitting the Added Value"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Solution 2' });
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('You need to fill in this field before submitting the Added Value');
  },
};

/** Controlled: the page owns the text and the list of cards. */
export const EditableList: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => {
    const [items, setItems] = React.useState(['First problem', 'Second problem']);
    return (
      <div className="flex flex-col gap-4">
        {items.map((text, i) => (
          <DescriptionCard
            key={i}
            type="problem"
            position={i + 1}
            editing
            value={text}
            onChange={(v) => setItems((all) => all.map((t, j) => (j === i ? v : t)))}
            onRemove={() => setItems((all) => all.filter((_, j) => j !== i))}
            removeLabel={`Remove problem ${i + 1}`}
          />
        ))}
      </div>
    );
  },
};

/** A long paragraph wraps inside the panel and the number block keeps its width. */
export const LongParagraph: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    position: 12,
    children:
      'A longer paragraph wraps onto as many lines as it needs. The panel grows with it, and the number ' +
      'block stretches to the same height so the two stay one card.',
  },
};

/** Fills and the panel are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-4 bg-surface-canvas p-8">
            {(['problem', 'solution', 'deliverable', 'desired-outcome'] as const).map((type) => (
              <DescriptionCard key={type} type={type}>
                Some paragraph here
              </DescriptionCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
