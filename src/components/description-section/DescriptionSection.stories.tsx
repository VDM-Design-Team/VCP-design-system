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

/* A small inline picture stands in for an uploaded image, so the card shows its own preview. */
const PICTURE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%23c7d2fe'/><circle cx='22' cy='24' r='8' fill='%236366f1'/><path d='M0 64 L24 36 L40 52 L50 42 L64 58 V64Z' fill='%234f46e5'/></svg>";

const files = (
  <>
    <FileAttachment name="image.png" kind="image" thumb={PICTURE} onRemove={fn()} />
    <FileAttachment name="report.pdf" kind="pdf" onRemove={fn()} />
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
    /* No add and no paperclip: the fold button is the only control. */
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

/** A card that is missing its text, with the message under it; no files yet, so only the paperclip. */
export const WithAnError: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
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
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
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

/**
 * Every section folds: the caret button at the right of the header is the toggle (the title is not). Folded, only the header
 * shows; the body is hidden, not unmounted, so what was typed is there when it opens again.
 */
export const Collapsible: Story = {
  args: { title: 'Acceptance Criteria / Deliverables', defaultOpen: false },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DescriptionSection {...args}>
        <DescriptionCard type="deliverable" position={1}>Some paragraph here</DescriptionCard>
      </DescriptionSection>
      <DescriptionSection title="Desired outcome" defaultOpen>
        <DescriptionCard type="desired-outcome" editing position={1} />
      </DescriptionSection>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Some paragraph here')).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Expand Acceptance Criteria / Deliverables' }));
    await expect(canvas.getByText('Some paragraph here')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Collapse Acceptance Criteria / Deliverables' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse Desired outcome' }));
    await expect(canvas.getByRole('button', { name: 'Expand Desired outcome' })).toBeVisible();
  },
};

/** The add button and the fold button are separate controls: pressing add does not fold the section. */
export const AddInACollapsibleHeader: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { title: 'Problems', onAdd: fn() },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard editing position={1} />
    </DescriptionSection>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add Problems' }));
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('button', { name: 'Collapse Problems' })).toBeVisible();
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
