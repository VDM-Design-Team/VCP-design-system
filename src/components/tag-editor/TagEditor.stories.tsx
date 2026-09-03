import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagEditor, type Tag } from './TagEditor';

const TAGS: Tag[] = [
  { label: 'packaging', tone: 'blue' },
  { label: 'quick win', tone: 'green' },
  { label: 'needs data', tone: 'yellow' },
];

const meta = {
  title: 'Components/Forms/TagEditor',
  component: TagEditor,
  parameters: {
    docs: {
      description: {
        component:
          'Free-form labels on a thing: the tag list, a tone swatch row, a name field, an ' +
          'add button. Tones, not colours — the export’s raw rgb `TAG_COLOURS` (including a ' +
          'ramp-less indigo) became the `accent.{blue,green,red,yellow}` pairs Avatar proved, ' +
          'plus a neutral. The caller owns the list; this reports adds and removes.',
      },
    },
  },
  args: { tags: TAGS },
} satisfies Meta<typeof TagEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: pick a tone, name a tag, Enter or Add; remove from the pills. */
export const Default: Story = {
  render: (args) => {
    const [tags, setTags] = React.useState<Tag[]>(args.tags ? [...args.tags] : []);
    return (
      <div className="w-128">
        <TagEditor
          {...args}
          tags={tags}
          onAdd={(t) => setTags((cur) => (cur.some((x) => x.label === t.label) ? cur : [...cur, t]))}
          onRemove={(t) => setTags((cur) => cur.filter((x) => x.label !== t.label))}
        />
      </div>
    );
  },
};

/** `editable={false}`: just the list — how tags render on a card or table row. */
export const ReadOnly: Story = {
  args: { editable: false },
};

/** All five tones. */
export const Tones: Story = {
  args: {
    editable: false,
    tags: [
      { label: 'blue', tone: 'blue' },
      { label: 'green', tone: 'green' },
      { label: 'red', tone: 'red' },
      { label: 'yellow', tone: 'yellow' },
      { label: 'neutral', tone: 'neutral' },
    ],
  },
};

/** Empty and editable — the starting state. */
export const Empty: Story = {
  render: (args) => {
    const [tags, setTags] = React.useState<Tag[]>([]);
    return (
      <div className="w-128">
        <TagEditor
          {...args}
          tags={tags}
          onAdd={(t) => setTags((cur) => [...cur, t])}
          onRemove={(t) => setTags((cur) => cur.filter((x) => x.label !== t.label))}
        />
      </div>
    );
  },
};

/** Pills, swatches and the composed Input/Button are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <TagEditor {...args} onAdd={() => {}} onRemove={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
