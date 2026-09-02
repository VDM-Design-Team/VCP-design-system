import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';
import { Badge } from '../badge';

const ITEMS = [
  {
    key: 'scope',
    title: 'What counts as an Added Value?',
    content:
      'Any change a supplier proposes that improves cost, quality or lead time beyond the contracted baseline. It moves through Draft, Pending and Backlog before delivery.',
  },
  {
    key: 'review',
    title: 'Who reviews a proposal?',
    meta: '2 steps',
    content:
      'The domain owner first, then procurement. Development-domain proposals also pick up a technical review before the points are confirmed.',
  },
  {
    key: 'points',
    title: 'How are capacity points calculated?',
    content:
      'From the effort estimate agreed at intake. Points are consumed as work lands and the balance shows on the programme dashboard.',
  },
];

const meta = {
  title: 'Navigation/Accordion',
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          'Stacked disclosure panels. Each header is a `<button>` inside a real heading, wired ' +
          'with `aria-expanded`/`aria-controls`; each open panel is a labelled `region`. ' +
          'Uncontrolled by default (one panel at a time unless `multiple`); pass `openKeys` to ' +
          'own the state. Closed content is unmounted.',
      },
    },
  },
  args: { items: ITEMS },
  argTypes: {
    multiple: { control: 'boolean' },
    headingLevel: { control: 'radio', options: [2, 3, 4] },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uncontrolled, exclusive: opening one closes the rest. */
export const Default: Story = {
  render: (args) => (
    <div className="w-160">
      <Accordion {...args} />
    </div>
  ),
};

/** `multiple` lets panels accumulate; `defaultOpenKeys` seeds the start. */
export const Multiple: Story = {
  args: { multiple: true, defaultOpenKeys: ['scope', 'points'] },
  render: (args) => (
    <div className="w-160">
      <Accordion {...args} />
    </div>
  ),
};

/** Controlled: the caller owns `openKeys` and whatever policy it likes. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState<readonly string[]>(['review']);
    return (
      <div className="flex w-160 flex-col gap-4">
        <Accordion
          {...args}
          openKeys={open}
          onToggle={(k) =>
            setOpen((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))
          }
        />
        <span className="text-body-sm text-text-tertiary">
          Open: {open.length ? open.join(', ') : 'none'}
        </span>
      </div>
    );
  },
};

/** `meta` takes nodes — a Badge reads better than bare text for counts. */
export const WithMeta: Story = {
  args: {
    items: ITEMS.map((it, i) => ({
      ...it,
      meta: i === 0 ? <Badge size="sm">4 open</Badge> : it.meta,
    })),
  },
  render: (args) => (
    <div className="w-160">
      <Accordion {...args} />
    </div>
  ),
};

/** Header, open tint and content are all tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <Accordion {...args} defaultOpenKeys={['review']} />
          </div>
        </div>
      ))}
    </div>
  ),
};
