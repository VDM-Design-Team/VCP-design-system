import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DescriptionSection } from './DescriptionSection';
import { DescriptionCard } from '../description-card';
import { FileAttachment } from '../file-attachment';

const meta = {
  title: 'Components/Forms/DescriptionSection',
  component: DescriptionSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One block of an Added Value\'s description: a title with an optional add button, the numbered ' +
          '`DescriptionCard`s, and the attached files with a paperclip. The frame only: the cards are the ' +
          'children and the files are `attachments`. Pass `onAdd` and `onAttach` for an editor; leave them ' +
          'off and the cards in their reading look for a view.',
      },
    },
  },
  args: { title: 'Problems' },
  decorators: [
    (Story) => (
      <div className="w-176 max-w-full bg-surface-canvas p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DescriptionSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const files = (
  <>
    <FileAttachment name="image.png" kind="image" onRemove={fn()} />
    <FileAttachment name="image.png" kind="image" onRemove={fn()} />
  </>
);

/** Editing: the add button, the cards as text fields, two attached files and the paperclip. */
export const Editing: Story = {
  args: { onAdd: fn(), onAttach: fn(), attachments: files },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard editing position={1} defaultValue="Some paragraph here" onRemove={fn()} removeLabel="Remove problem 1" />
      <DescriptionCard editing position={2} defaultValue="Some paragraph here" onRemove={fn()} removeLabel="Remove problem 2" />
    </DescriptionSection>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Problems' })).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Add Problems' }));
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Attach files' }));
    await expect(args.onAttach).toHaveBeenCalledTimes(1);
  },
};

/** Viewing: no controls, the cards in their reading look. Deliverables are teal. */
export const Viewing: Story = {
  args: { title: 'Acceptance Criteria / Deliverables' },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard type="deliverable" position={1}>Some paragraph here</DescriptionCard>
      <DescriptionCard type="deliverable" position={2}>Some paragraph here</DescriptionCard>
      <DescriptionCard type="deliverable" position={3}>Some paragraph here</DescriptionCard>
    </DescriptionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

/** A card that is missing its text, with the message under it; no files yet, so only the paperclip. */
export const WithAnError: Story = {
  args: { title: 'Solution', onAdd: fn(), onAttach: fn() },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard type="solution" editing position={1} defaultValue="Some paragraph here" />
      <DescriptionCard
        type="solution"
        editing
        position={2}
        placeholder="Describe the solution"
        error="You need to fill in this field before submitting the Added Value"
      />
    </DescriptionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('You need to fill in this field');
    await expect(canvas.getByRole('button', { name: 'Attach files' })).toBeVisible();
  },
};

/** A single card, with no add button: "Desired Outcome". */
export const SingleCard: Story = {
  args: { title: 'Desired Outcome' },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard type="desired-outcome" editing position={1} defaultValue="Some paragraph here" />
    </DescriptionSection>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /^Add/ })).toBeNull();
  },
};

/** Both themes. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [],
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <DescriptionSection title={isDark ? 'Problems (dark)' : 'Problems'} onAdd={fn()} onAttach={fn()} attachments={files}>
              <DescriptionCard editing position={1} defaultValue="Some paragraph here" onRemove={fn()} />
              <DescriptionCard editing position={2} defaultValue="" placeholder="Required" error="You need to fill in this field" />
            </DescriptionSection>
          </div>
        </div>
      ))}
    </div>
  ),
};
