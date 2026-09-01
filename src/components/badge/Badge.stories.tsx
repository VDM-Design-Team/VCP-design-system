import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Icon } from '../icon';

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const;

const meta = {
  title: 'Display/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'A small, non-interactive label that classifies the thing beside it. Every coloured ' +
          'tone is an `accent.<name>.tonal` surface/content pair; `neutral` is the same shape ' +
          'built from `surface.neutral.*` + `text.*`. ' +
          '**Badge carries no VCP vocabulary** — for statuses like "For QA" or "Confirmed prod" ' +
          'use the `StatusPill` pattern, which maps VCP statuses onto these tones.',
      },
    },
  },
  args: { children: 'Label', tone: 'neutral', size: 'md' },
  argTypes: {
    tone: { control: 'select', options: TONES },
    size: { control: 'radio', options: ['sm', 'md'] },
    icon: { control: false },
    trailingIcon: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Six generic tones. None of them names a VCP status — that is `StatusPill`'s job. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {TONES.map((tone) => (
        <Badge {...args} key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
};

/**
 * `md` (28 tall) is the default and what the Figma Tag ships at. `sm` (24 tall)
 * is for dense tables and for sitting inline beside body text.
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-2">
          <span className="w-8 text-caption-sm text-text-tertiary">{size}</span>
          {TONES.map((tone) => (
            <Badge {...args} key={tone} tone={tone} size={size}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * `icon` takes any `ReactNode`, but the real `Icon` component is what you want:
 * it inherits the tone's content colour through `currentColor`. Match the glyph
 * to the badge — `size="sm"` on a `sm` badge, `size="md"` on an `md` one.
 *
 * The Badge renders the slot `aria-hidden`, so the glyph is never announced —
 * the label is the meaning.
 */
export const WithLeadingIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} tone="success" icon={<Icon name="check-circle" size="md" />}>
        Approved
      </Badge>
      <Badge {...args} tone="warning" icon={<Icon name="clock" size="md" />}>
        Awaiting review
      </Badge>
      <Badge {...args} tone="danger" icon={<Icon name="warning-circle" size="md" />}>
        Blocked
      </Badge>
      <Badge {...args} tone="info" size="sm" icon={<Icon name="info" size="sm" />}>
        Informational
      </Badge>
    </div>
  ),
};

/**
 * A trailing glyph reads as a hint about what follows. It is still decoration —
 * if you want a dismiss "×" the user can click, that is a `Chip`, not a Badge:
 * this slot is `aria-hidden` and outside the tab order.
 */
export const WithTrailingIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} tone="brand" trailingIcon={<Icon name="arrow-right" size="md" />}>
        Continue
      </Badge>
      <Badge {...args} tone="neutral" trailingIcon={<Icon name="caret-down" size="md" />}>
        More
      </Badge>
      <Badge
        {...args}
        tone="info"
        icon={<Icon name="git-branch" size="md" />}
        trailingIcon={<Icon name="arrow-right" size="md" />}
      >
        Both slots
      </Badge>
    </div>
  ),
};

/**
 * Badges are labels, not sentences. The label never wraps — it truncates with an
 * ellipsis once the container runs out of room, so a badge never grows a second
 * line and never blows out a table cell. If the text needs an ellipsis to fit,
 * the label is too long: shorten it.
 */
export const LongLabel: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-2">
      <Badge {...args} tone="warning">
        Escalated to the platform team for review
      </Badge>
      <Badge {...args} tone="info" size="sm" icon={<Icon name="info" size="sm" />}>
        Escalated to the platform team for review
      </Badge>
    </div>
  ),
};

/** How a row of them reads together — a table cell, a filter summary, a card header. */
export const MixedRow: Story = {
  render: () => (
    <div className="flex max-w-xl flex-wrap items-center gap-2">
      <Badge tone="brand" size="sm">Beta</Badge>
      <Badge tone="success" size="sm" icon={<Icon name="check-circle" size="sm" />}>Passing</Badge>
      <Badge tone="neutral" size="sm">v2.4.1</Badge>
      <Badge tone="warning" size="sm" icon={<Icon name="clock" size="sm" />}>Stale</Badge>
      <Badge tone="danger" size="sm">2 failures</Badge>
      <Badge tone="info" size="sm">Read-only</Badge>
    </div>
  ),
};

/**
 * Every class is a semantic token, so dark comes for free. Note the fills sit at
 * roughly 1.1:1 against the page in light — the badge shape is not visible by
 * colour alone, which is exactly why the label always carries the meaning.
 */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-40 flex-col gap-3 bg-surface-canvas p-8">
            {(['md', 'sm'] as const).map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-2">
                {TONES.map((tone) => (
                  <Badge key={tone} tone={tone} size={size}>
                    {tone}
                  </Badge>
                ))}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success" icon={<Icon name="check-circle" size="md" />}>Approved</Badge>
              <Badge tone="danger" trailingIcon={<Icon name="x" size="md" />}>Rejected</Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

// Temporary no-op to exercise the visual-review comment on PR #22 — reverted in the next commit.
