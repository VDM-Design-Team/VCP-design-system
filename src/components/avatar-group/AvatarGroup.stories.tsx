import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarGroup } from './AvatarGroup';
import { Avatar } from '../avatar';
import { Badge } from '../badge';

const photo = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" fill="hsl(${hue} 42% 52%)"/>` +
      `<circle cx="32" cy="25" r="12" fill="hsl(${hue} 38% 86%)"/>` +
      `<path d="M6 64c0-14 12-23 26-23s26 9 26 23z" fill="hsl(${hue} 38% 86%)"/>` +
      `</svg>`,
  )}`;

const TEAM = [
  'Ali Rahman',
  'Eve Chen',
  'Marcus Okonkwo',
  'Priya Nair',
  'Sofia Almeida',
  'Tom Whitfield',
  'Yuki Tanaka',
];

const SIZES = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Display/AvatarGroup',
  component: AvatarGroup,
  parameters: {
    docs: {
      description: {
        component:
          'An overlapping stack of people, with the tail collapsed into a `+N` chip. It composes ' +
          '`Avatar` and passes its own `size` straight down, so a stack and a lone avatar beside ' +
          'it are never a pixel apart. **The whole stack announces as one labelled image** — ' +
          '"Assignees: Ali Rahman, Eve Chen and 3 others" — rather than as a list of unlabelled ' +
          'pictures. The `+3` chip is `aria-hidden`; its meaning is in that label.',
      },
    },
  },
  args: { people: TEAM.slice(0, 5), max: 4, size: 'md', label: 'Assignees' },
  argTypes: {
    size: { control: 'radio', options: SIZES },
    max: { control: { type: 'number', min: 1, max: 8 } },
    people: { control: false },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Two people, no overflow. Announced as "Assignees: Ali Rahman and Eve Chen". */
export const Two: Story = {
  args: { people: TEAM.slice(0, 2) },
};

/** Five people with `max={5}` — everyone drawn, still no chip. */
export const Five: Story = {
  args: { people: TEAM.slice(0, 5), max: 5 },
};

/**
 * Past `max`, the tail collapses. The chip is neutral on purpose: it is a count,
 * not a person, so it must not read as one more tone in the hash.
 */
export const Overflow: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {[2, 3, 4].map((max) => (
        <div key={max} className="flex items-center gap-3">
          <AvatarGroup {...args} people={TEAM} max={max} />
          <span className="text-caption-sm text-text-tertiary">
            max={max} — announces “{TEAM.slice(0, max).join(', ')} and {TEAM.length - max} others”
          </span>
        </div>
      ))}
    </div>
  ),
};

/** The same three steps as `Avatar`, with the overlap scaled to match. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-6 text-caption-sm text-text-tertiary">{size}</span>
          <AvatarGroup {...args} people={TEAM} size={size} />
        </div>
      ))}
    </div>
  ),
};

/** Photos, initials and a failed URL in one stack — the fallback is per person. */
export const MixedSources: Story = {
  args: {
    people: [
      { name: 'Ali Rahman', src: photo(210) },
      { name: 'Eve Chen', src: photo(150) },
      { name: 'Marcus Okonkwo', src: '/no-such-portrait.png' },
      { name: 'Priya Nair' },
      { name: 'Sofia Almeida' },
      { name: 'Tom Whitfield' },
    ],
  },
};

/**
 * The realistic case: an assignees row in a table. The stack is decorative-ish
 * detail beside the row's own text, so it carries a `label` that says what the
 * pile of faces *is* — without it a screen reader gets a bare list of names with
 * no idea why they are there.
 */
export const AssigneesRow: Story = {
  render: () => (
    <div className="w-full max-w-2xl overflow-hidden rounded-md border border-stroke-subtle bg-surface-elevated">
      {[
        { task: 'Migrate token pipeline', status: 'In progress', people: TEAM.slice(0, 2) },
        { task: 'Audit contrast on accent tones', status: 'For QA', people: TEAM.slice(1, 6) },
        { task: 'Ship AvatarGroup', status: 'Blocked', people: TEAM },
      ].map((row, i) => (
        <div
          key={row.task}
          className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-stroke-subtle' : ''}`}
        >
          <span className="min-w-0 flex-1 truncate text-label-lg text-text-primary">{row.task}</span>
          <Badge tone="neutral" size="sm">
            {row.status}
          </Badge>
          <AvatarGroup people={row.people} size="sm" max={3} label="Assignees" />
        </div>
      ))}
    </div>
  ),
};

/**
 * When each person needs to be reachable — a profile link, a remove button — the
 * stack is the wrong shape. Render a real list with visible names, and let each
 * avatar go back to being decorative.
 */
export const WhenNotToStack: Story = {
  render: () => (
    <ul className="flex flex-col gap-2">
      {TEAM.slice(0, 3).map((name) => (
        <li key={name} className="flex items-center gap-2">
          <Avatar name={name} size="sm" />
          <a className="text-label-lg text-text-link-default underline underline-offset-4" href="#">
            {name}
          </a>
        </li>
      ))}
    </ul>
  ),
};

/** Every class is a semantic token, so dark comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-40 flex-col gap-5 bg-surface-canvas p-8">
            {SIZES.map((size) => (
              <AvatarGroup key={size} people={TEAM} size={size} max={4} label="Assignees" />
            ))}
            <AvatarGroup people={TEAM.slice(0, 2)} label="Reviewers" />
            <div className="rounded-md bg-surface-elevated p-4">
              <AvatarGroup people={TEAM} max={5} label="Attending" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
