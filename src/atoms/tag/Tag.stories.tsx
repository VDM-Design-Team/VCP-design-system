import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Tag } from './Tag';
import { Icon } from '../icon';

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'critical'] as const;
const VARIANTS = ['textual', 'outline', 'tonal', 'filled'] as const;

const meta = {
  title: 'Atoms/Tag',
  component: Tag,
  parameters: {
    docs: {
      description: {
        component:
          'A small, rounded-rectangle label that classifies the thing beside it (or, with ' +
          '`onRemove`, a value you can take back out) — a different shape from `Badge`\'s pill, even though they share the same four ' +
          'styles and six tones (`../../lib/classification-tones`). ' +
          '`TypeTag` and `UrgencyTag` compose this rather than each hand-rolling their own shell ' +
          '— introducing a new contextual tag means composing `Tag`, not building a second one.',
      },
    },
  },
  args: { children: 'Label', variant: 'tonal', tone: 'neutral', size: 'md' },
  argTypes: {
    variant: { control: 'radio', options: VARIANTS },
    tone: { control: 'select', options: TONES },
    size: { control: 'radio', options: ['sm', 'md'] },
    icon: { control: false },
    trailingIcon: { control: false },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The four styles Figma draws for Tag, all VCP's own semantics — GDL's Tag
 * doesn't dictate them. `textual` is what `TypeTag`/`UrgencyTag` render today.
 */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Tag {...args} key={variant} variant={variant} tone="info">
          {variant}
        </Tag>
      ))}
    </div>
  ),
};

/** Six generic tones, at the default `tonal` style. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {TONES.map((tone) => (
        <Tag {...args} key={tone} tone={tone}>
          {tone}
        </Tag>
      ))}
    </div>
  ),
};

/** Every style against every tone, so the full 24-combination matrix is visible at once. */
export const Matrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-16 text-caption-md-medium text-text-subtle">{variant}</span>
          {TONES.map((tone) => (
            <Tag {...args} key={tone} variant={variant} tone={tone}>
              {tone}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * `md` (28 tall, 14 type) is the default. `sm` (24 tall, 12 type) is for dense
 * tables and for sitting inline beside body text.
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-2">
          <span className="w-8 text-caption-sm-semibold text-text-tertiary">{size}</span>
          {TONES.map((tone) => (
            <Tag {...args} key={tone} tone={tone} size={size}>
              {tone}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * `icon` takes any `ReactNode`, but the real `Icon` component is what you
 * want. Match the glyph to the tag — `size="sm"` on a `sm` tag, `size="md"`
 * on an `md` one. The slot is `aria-hidden`, so the glyph is never announced.
 */
export const WithLeadingIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag {...args} variant="outline" tone="success" icon={<Icon name="check-circle" size="md" />}>
        Approved
      </Tag>
      <Tag {...args} variant="outline" tone="warning" icon={<Icon name="clock" size="md" />}>
        Awaiting review
      </Tag>
      <Tag {...args} variant="outline" tone="critical" icon={<Icon name="warning-circle" size="md" />}>
        Blocked
      </Tag>
    </div>
  ),
};

/**
 * `onRemove` adds a ✕ at the end — a value picked into a field, or an AV's tag in edit mode.
 * The ✕ is the only focusable part, named `Remove ${label}`.
 */
export const Removable: Story = {
  args: { onRemove: fn() },
  render: function Render(args) {
    const [tags, setTags] = React.useState(['VCP', 'OfferPump', 'WHU']);
    return (
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((t) => (
          <Tag
            key={t}
            {...args}
            size="sm"
            onRemove={() => {
              setTags((l) => l.filter((x) => x !== t));
              args.onRemove?.();
            }}
          >
            {t}
          </Tag>
        ))}
        <Tag {...args} variant="outline" tone="success" onRemove={args.onRemove}>
          Approved
        </Tag>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* Keyboard-reachable: Tab lands on the first ✕, Enter removes it. */
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Remove VCP' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByText('VCP')).toBeNull();
    await expect(canvas.getByText('OfferPump')).toBeVisible();
  },
};

/** Rounded-rectangle beside Badge's pill — the shape difference the two share nothing else in common on. */
export const BesideBadge: Story = {
  name: 'Beside Badge',
  render: () => (
    <div className="flex items-center gap-3">
      <Tag tone="brand">Tag</Tag>
      <span className="text-caption-md-medium text-text-subtle">rounded-sm</span>
    </div>
  ),
};

/**
 * Every class is a semantic token, so dark comes for free.
 */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-40 flex-col gap-3 bg-surface-canvas p-8">
            {VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-2">
                {TONES.map((tone) => (
                  <Tag key={tone} variant={variant} tone={tone}>
                    {tone}
                  </Tag>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
