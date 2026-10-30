import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DescriptionSection } from './DescriptionSection';
import { DescriptionCard } from '../description-card';
import { FileAttachment } from '../file-attachment';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

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
  args: { type: 'problem' },
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

/** Editing: the add button, the cards as text fields, two attached files and the paperclip. The cards need no type or number. */
export const Editing: Story = {
  args: { type: 'problem', onAdd: fn(), onAttach: fn(), attachments: files },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard editing defaultValue="Some paragraph here" onRemove={fn()} />
      <DescriptionCard editing defaultValue="Some paragraph here" onRemove={fn()} />
    </DescriptionSection>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Problems' })).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    /* Each card was given its number and a name for its remove button. */
    await expect(canvas.getByRole('textbox', { name: 'Problem 2' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove problem 2' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Add problem' }));
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Attach files' }));
    await expect(args.onAttach).toHaveBeenCalledTimes(1);
  },
};

/** The four sections, each with its fixed title and its cards in its own colour. */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <DescriptionSection type="problem" onAdd={fn()} onAttach={fn()}>
        <DescriptionCard>Some paragraph here</DescriptionCard>
      </DescriptionSection>
      <DescriptionSection type="solution" onAdd={fn()} onAttach={fn()}>
        <DescriptionCard>Some paragraph here</DescriptionCard>
      </DescriptionSection>
      <DescriptionSection type="deliverable" onAdd={fn()}>
        <DescriptionCard>Some paragraph here</DescriptionCard>
      </DescriptionSection>
      <DescriptionSection type="desired-outcome">
        <DescriptionCard>Some paragraph here</DescriptionCard>
      </DescriptionSection>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Problems', 'Solutions', 'Acceptance Criteria / Deliverables', 'Desired outcome']) {
      await expect(canvas.getByRole('region', { name })).toBeVisible();
    }
  },
};

/** Viewing: no add and no paperclip, the cards in their reading look. */
export const Viewing: Story = {
  args: { type: 'deliverable' },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard>Some paragraph here</DescriptionCard>
      <DescriptionCard>Some paragraph here</DescriptionCard>
      <DescriptionCard>Some paragraph here</DescriptionCard>
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
  args: { type: 'solution', onAdd: fn(), onAttach: fn() },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard editing defaultValue="Some paragraph here" />
      <DescriptionCard editing error="You need to fill in this field before submitting the Added Value" />
    </DescriptionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('You need to fill in this field');
    await expect(canvas.getByRole('button', { name: 'Attach files' })).toBeVisible();
  },
};

/** Desired outcome is one card: even if asked, it has no add button and no attachments. */
export const DesiredOutcome: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { type: 'desired-outcome', onAdd: fn(), onAttach: fn(), attachments: files },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard editing />
    </DescriptionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /^Add/ })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Attach files' })).toBeNull();
    await expect(canvas.queryByText('image.png')).toBeNull();
    await expect(canvas.getByRole('textbox', { name: 'Desired outcome 1' })).toBeVisible();
  },
};

/**
 * Every section folds: the caret button at the right of the header is the toggle (the title is not). Folded,
 * only the header shows; the body is hidden, not unmounted, so what was typed is there when it opens again.
 */
export const Collapsible: Story = {
  args: { type: 'deliverable', defaultOpen: false },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DescriptionSection {...args}>
        <DescriptionCard>Some paragraph here</DescriptionCard>
      </DescriptionSection>
      <DescriptionSection type="desired-outcome" defaultOpen>
        <DescriptionCard editing />
      </DescriptionSection>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Some paragraph here')).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Expand Acceptance Criteria / Deliverables' }));
    /* It slides, so it is visible a moment after the press, not on it. */
    await waitFor(() => expect(canvas.getByText('Some paragraph here')).toBeVisible());
    await expect(canvas.getByRole('button', { name: 'Collapse Acceptance Criteria / Deliverables' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse Desired outcome' }));
    await expect(canvas.getByRole('button', { name: 'Expand Desired outcome' })).toBeVisible();
  },
};

/** The add button and the fold button are separate controls: pressing add does not fold the section. */
export const AddInTheHeader: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { type: 'problem', onAdd: fn() },
  render: (args) => (
    <DescriptionSection {...args}>
      <DescriptionCard editing />
    </DescriptionSection>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add problem' }));
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('button', { name: 'Collapse Problems' })).toBeVisible();
  },
};

/** Both themes. */
export const LightAndDark: Story = {
  /* Two identical sections side by side, one per theme: the landmark-uniqueness rules stand down. */
  parameters: { layout: 'fullscreen', controls: { disable: true }, ...SIDE_BY_SIDE },
  decorators: [],
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <DescriptionSection type="problem" onAdd={fn()} onAttach={fn()} attachments={files}>
              <DescriptionCard editing defaultValue="Some paragraph here" onRemove={fn()} />
              <DescriptionCard editing placeholder="Required" error="You need to fill in this field" />
            </DescriptionSection>
          </div>
        </div>
      ))}
    </div>
  ),
};
