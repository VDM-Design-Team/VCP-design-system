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
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg'] },
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
 * Four sizes: `xs` (20 tall, 10 type), `sm` (24, 12), `md` (28, 14, the
 * default) and `lg` (32, 16). `sm` is for dense tables and for sitting inline
 * beside body text; `lg` is for a tag that is the focus of its row.
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
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
  /* The heights the design draws for its four sizes. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heights = Object.fromEntries(
      (['xs', 'sm', 'md', 'lg'] as const).map((size) => [
        size,
        Math.round(canvas.getByText(size).nextElementSibling!.getBoundingClientRect().height),
      ]),
    );
    await expect(heights).toEqual({ xs: 20, sm: 24, md: 28, lg: 32 });
  },
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

const rgb =(value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Removable at every size, and in every style and tone in both themes. The ✕ holds 3:1 at rest,
 * hovered and pressed on all of them: its hover and pressed colours are the tag's own hover and
 * pressed tokens, which only move away from the background (a filled tag shows its hover fill
 * behind the ✕ instead). The test reads those colours from the classes each ✕ renders.
 */
export const RemovableEverywhere: Story = {
  name: 'Removable everywhere',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined} data-theme-case={isDark ? 'dark' : 'light'}>
          <div className="flex h-full flex-col gap-3 bg-surface-canvas p-8">
            <div className="flex flex-wrap items-center gap-2">
              {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
                <Tag key={size} size={size} onRemove={() => {}}>
                  {size}
                </Tag>
              ))}
            </div>
            {VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-wrap gap-2">
                {TONES.map((tone) => (
                  <Tag key={tone} variant={variant} tone={tone} onRemove={() => {}} data-case={`${variant} ${tone}`}>
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
  play: async ({ canvasElement }) => {
    const under3to1: string[] = [];
    for (const tag of Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-case]'))) {
      const theme = tag.closest('[data-theme-case]')!.getAttribute('data-theme-case');
      const remove = tag.querySelector('button')!;
      /* What the tag sits on: its own fill, or the canvas behind a textual or clear outline tag. */
      let behind: HTMLElement = tag;
      while (rgb(getComputedStyle(behind).backgroundColor)[3] === 0 && behind.parentElement) behind = behind.parentElement;
      const fill = rgb(getComputedStyle(behind).backgroundColor);
      const ink = rgb(getComputedStyle(remove).color);
      /* The colour a `hover:` or `active:` class on the ✕ resolves to here, or undefined. */
      const state = (prefix: string) => {
        const token = remove.className.split(/\s+/).find((c) => c.startsWith(prefix))?.slice(prefix.length);
        if (!token) return undefined;
        const probe = document.createElement('span');
        probe.style.color = `var(--color-${token})`;
        tag.append(probe);
        const value = rgb(getComputedStyle(probe).color);
        probe.remove();
        return value;
      };
      /* A `hover:opacity-…` or `active:opacity-…` fades the ✕ into what is behind it. */
      const opacity = (prefix: string) =>
        Number(remove.className.split(/\s+/).find((c) => c.startsWith(prefix))?.slice(prefix.length) ?? 100) / 100;
      const fade = (fg: number[], bg: number[], alpha: number) => fg.slice(0, 3).map((c, i) => c * alpha + bg[i] * (1 - alpha));
      for (const [name, fg, bg, alpha] of [
        ['at rest', ink, fill, 1],
        ['hovered', state('hover:text-') ?? ink, state('hover:bg-') ?? fill, opacity('hover:opacity-')],
        ['pressed', state('active:text-') ?? ink, state('active:bg-') ?? fill, opacity('active:opacity-')],
      ] as const) {
        const ratio = contrast(fade(fg, bg, alpha), bg);
        if (ratio < 3) under3to1.push(`${theme} ${tag.dataset.case}, ${name}: ${ratio.toFixed(2)}:1`);
      }
    }
    await expect(under3to1).toEqual([]);
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

/** The glyph steps up with the tag: 12, 16, 20 and 24, as the design draws them. */
export const IconsBySize: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag {...args} variant="outline" tone="info" size="xs" icon={<Icon name="info" size={12} />}>
        xs
      </Tag>
      <Tag {...args} variant="outline" tone="info" size="sm" icon={<Icon name="info" size="sm" />}>
        sm
      </Tag>
      <Tag {...args} variant="outline" tone="info" size="md" icon={<Icon name="info" size="md" />}>
        md
      </Tag>
      <Tag {...args} variant="outline" tone="info" size="lg" icon={<Icon name="info" size="lg" />}>
        lg
      </Tag>
    </div>
  ),
};
