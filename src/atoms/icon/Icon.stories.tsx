import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon, ICON_NAMES, ICON_SIZES, CUSTOM_ICON_NAMES } from './Icon';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          'Phosphor Icons, trimmed to the glyphs the VCP Figma library references — each in ' +
          '`regular` and `fill` (the `-fill` names) — plus the in-house glyphs Phosphor has ' +
          'no equivalent for. Nine sizes: 10, 12, 16, 20, 24, 28, 32, 40 and 48. ' +
          'Filled paths that inherit `currentColor` — set colour on the parent with a text token.',
      },
    },
  },
  args: { name: 'bell', size: 'md' },
  argTypes: { name: { control: 'select', options: ICON_NAMES } },
} satisfies Meta<typeof Icon>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The nine sizes Figma draws, regular above fill. Each is a whole box with the
 * glyph centred inside it and a little in from the edges — Phosphor's own
 * artboard margin, scaled with the box. `sm` / `md` / `lg` still work as
 * 16 / 20 / 24.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-text-primary">
      {(['bell', 'bell-fill'] as const).map((name) => (
        <div key={name} className="flex items-end gap-4">
          {ICON_SIZES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
              <Icon name={name} size={size} className="outline outline-1 outline-stroke-subtle" />
              <span className="text-caption-sm-semibold text-text-tertiary">{size}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Every glyph ships both weights: `name` and `name-fill`. Only the in-house
 * glyphs that have no Figma fill drawn yet are exempt — see the docs.
 */
export const RegularAndFill: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-4">
      {ICON_NAMES.filter((n) => !n.endsWith('-fill')).map((name) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-md border border-stroke-subtle p-3 text-text-secondary"
        >
          <div className="flex gap-2">
            <Icon name={name} size={24} />
            {ICON_NAMES.includes(`${name}-fill` as never) ? (
              <Icon name={`${name}-fill` as never} size={24} />
            ) : (
              <span className="size-6" />
            )}
          </div>
          <span className="text-caption-sm-semibold text-text-tertiary text-center break-all">{name}</span>
        </div>
      ))}
    </div>
  ),
  play: async () => {
    /* Glyphs drawn in-house with no fill in Figma yet; `fire-solid` is solid already. */
    const EXEMPT = ['rectangle-stack', 'fire-solid'];
    const missing = ICON_NAMES.filter(
      (n) => !n.endsWith('-fill') && !EXEMPT.includes(n) && !ICON_NAMES.includes(`${n}-fill` as never),
    );
    await expect(missing).toEqual([]);
    const orphans = ICON_NAMES.filter(
      (n) => n.endsWith('-fill') && !ICON_NAMES.includes(n.slice(0, -5) as never),
    );
    await expect(orphans).toEqual([]);
  },
};

/**
 * The glyph is filled with `currentColor`. Set the colour on the parent using a
 * text token and it themes for free — never colour the icon directly.
 */
export const InheritsColour: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="check-circle" className="text-accent-success-tonal-content-default" />
      <Icon name="warning" className="text-accent-warning-tonal-content-default" />
      <Icon name="warning-circle" className="text-accent-critical-tonal-content-default" />
      <Icon name="info" className="text-text-link-default" />
      <Icon name="bell" className="text-text-tertiary" />
    </div>
  ),
};

/**
 * Left: decorative — the visible word already says "Delete", so the glyph is
 * `aria-hidden` and a screen reader reads the label once.
 * Right: the glyph is the only content, so it carries `label`, which renders as
 * `role="img"` with an `aria-label`.
 */
export const DecorativeVsLabelled: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-text-primary">
      <span className="inline-flex items-center gap-1.5">
        <Icon name="trash" size="sm" />
        <span className="text-label-sm-medium">Delete</span>
      </span>
      <Icon name="trash" label="Delete" />
    </div>
  ),
};

/**
 * Glyphs drawn in-house because Phosphor has none. They use Phosphor's own
 * geometry and stroke weight, so they sit beside it without looking imported —
 * compare `caret-triple-up` with Phosphor's `caret-double-up` and `caret-up`.
 */
export const CustomGlyphs: Story = {
  render: () => (
    <div className="flex items-end gap-6 text-text-primary">
      {(['caret-up', 'caret-double-up'] as const).map((name) => (
        <div key={name} className="flex flex-col items-center gap-1">
          <Icon name={name} size="lg" />
          <span className="text-caption-sm-semibold text-text-tertiary">{name}</span>
          <span className="text-caption-sm-semibold text-text-subtle">Phosphor</span>
        </div>
      ))}
      {CUSTOM_ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-1">
          <Icon name={name} size="lg" />
          <span className="text-caption-sm-semibold text-text-tertiary">{name}</span>
          <span className="text-caption-sm-semibold text-text-link-default">in-house</span>
        </div>
      ))}
    </div>
  ),
};

/** Every glyph in the set. */
export const AllGlyphs: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-4">
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-md border border-stroke-subtle p-3 text-text-secondary"
        >
          <Icon name={name} size="lg" />
          <span className="text-caption-sm-semibold text-text-tertiary text-center break-all">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex items-center gap-4 bg-surface-canvas p-8 text-text-primary">
            <Icon name="house-line" size="lg" />
            <Icon name="users" size="lg" className="text-text-tertiary" />
            <Icon name="check-circle" size="lg" className="text-accent-success-tonal-content-default" />
          </div>
        </div>
      ))}
    </div>
  ),
};
