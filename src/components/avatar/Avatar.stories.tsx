import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AVATAR_TONES, toneForName } from './Avatar';

/**
 * A self-contained fake portrait. Stories must not depend on the network — a
 * placeholder service that 404s would make the "broken image" story pass for the
 * wrong reason.
 */
const photo = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" fill="hsl(${hue} 42% 52%)"/>` +
      `<circle cx="32" cy="25" r="12" fill="hsl(${hue} 38% 86%)"/>` +
      `<path d="M6 64c0-14 12-23 26-23s26 9 26 23z" fill="hsl(${hue} 38% 86%)"/>` +
      `</svg>`,
  )}`;

const SIZES = ['sm', 'md', 'lg'] as const;

/** A spread wide enough to land on all four tones several times over. */
const NAMES = [
  'Ali Rahman',
  'Eve Chen',
  'Marcus Okonkwo',
  'Priya Nair',
  'Sofia Almeida',
  'Tom Whitfield',
  'Yuki Tanaka',
  'Zainab Osei',
  'Björn Åkesson',
  'Chloé Dubois',
];

const meta = {
  title: 'Display/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'A person, as a photo or as their initials. The tone is hashed from the name onto the ' +
          "four hue-named `accent.*` families, so a person keeps their colour everywhere. " +
          '**An avatar is decorative by default** — beside a visible name it is `aria-hidden`, ' +
          'because repeating the name is noise. Set `standalone` when the avatar is the only ' +
          'identification of the person on screen.',
      },
    },
  },
  args: { name: 'Ali Rahman', size: 'md' },
  argTypes: {
    size: { control: 'radio', options: SIZES },
    tone: { control: 'select', options: [undefined, ...AVATAR_TONES] },
    src: { control: 'text' },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * 24 / 32 / 40 on Tailwind's numeric scale, each with its own type-ramp step.
 * The export's `size: number` is gone — see the note in `Avatar.tsx`.
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar {...args} size={size} />
          <span className="text-caption-sm text-text-tertiary">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** With a photo, the image fills the circle and the tone never shows. */
export const WithImage: Story = {
  args: { src: photo(210) },
  render: (args) => (
    <div className="flex items-center gap-4">
      {SIZES.map((size) => (
        <Avatar {...args} key={size} size={size} />
      ))}
    </div>
  ),
};

/** No `src` — initials, on the tone hashed from the name. */
export const InitialsFallback: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} name="Ali Rahman" />
      <Avatar {...args} name="Eve Chen" />
      <Avatar {...args} name="Marcus Okonkwo" />
      <Avatar {...args} name="Prince" />
      <Avatar {...args} name="Ada Lovelace" initials="AL" />
    </div>
  ),
};

/**
 * A URL that cannot load falls back to the initials rather than leaving a broken
 * image icon in the circle. The fallback is keyed on the URL, so a later, working
 * `src` is still tried.
 */
export const BrokenImage: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar {...args} name="Ali Rahman" src={photo(210)} />
        <span className="text-caption-sm text-text-tertiary">loads</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar {...args} name="Ali Rahman" src="/no-such-portrait.png" />
        <span className="text-caption-sm text-text-tertiary">404 → initials</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar {...args} src="/no-such-portrait.png" />
        <span className="text-caption-sm text-text-tertiary">404, no name → glyph</span>
      </div>
    </div>
  ),
};

/**
 * `ring` draws a `surface.elevated` ring outside the box, which is what separates
 * one avatar from the one it overlaps. `AvatarGroup` sets it for you.
 */
export const Ring: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-md bg-surface-elevated p-4">
        <Avatar {...args} name="Ali Rahman" />
        <Avatar {...args} name="Ali Rahman" ring />
      </div>
      <div className="flex items-center rounded-md bg-surface-elevated p-4">
        {['Ali Rahman', 'Eve Chen', 'Marcus Okonkwo'].map((name, i) => (
          <span key={name} className={i > 0 ? '-ml-2' : undefined}>
            <Avatar {...args} name={name} ring />
          </span>
        ))}
      </div>
    </div>
  ),
};

/**
 * Ten names across the four tones. Each pairs an `accent.<hue>.faint` surface
 * with `accent.<hue>.stronger` initials: 8.07:1 – 8.50:1 in light, 4.50:1 – 7.23:1
 * in dark. The export's six pastels with white initials measured 1.83:1 – 2.37:1.
 */
export const ToneRange: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {NAMES.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <Avatar {...args} name={name} />
            <span className="text-label-md text-text-secondary">{name}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {AVATAR_TONES.map((tone) => (
          <div key={tone} className="flex items-center gap-2">
            <Avatar {...args} tone={tone} initials="AB" />
            <span className="text-caption-sm text-text-tertiary">
              {tone} — {NAMES.filter((n) => toneForName(n) === tone).length} of {NAMES.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * The same avatar, twice. On the left the name is visible, so the avatar is
 * decorative and `aria-hidden` — a screen reader reads "Ali Rahman" once. On the
 * right the avatar is the only identification, so `standalone` gives it a real
 * accessible name and it reads "Ali Rahman, image".
 */
export const DecorativeVsStandalone: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Avatar {...args} name="Ali Rahman" />
        <div className="flex flex-col">
          <span className="text-label-lg text-text-primary">Ali Rahman</span>
          <span className="text-body-sm text-text-tertiary">
            decorative — the name beside it carries the meaning
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Avatar {...args} name="Ali Rahman" standalone />
        <span className="text-body-sm text-text-tertiary">
          <code>standalone</code> — nothing else names this person
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Avatar {...args} name="Ali Rahman" label="Ali Rahman, owner" />
        <span className="text-body-sm text-text-tertiary">
          <code>label</code> — overrides what is announced, and implies standalone
        </span>
      </div>
    </div>
  ),
};

/** Every class is a semantic token, so dark comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-40 flex-col gap-4 bg-surface-canvas p-8">
            <div className="flex flex-wrap items-center gap-3">
              {AVATAR_TONES.map((tone) => (
                <Avatar key={tone} tone={tone} initials="AB" size="lg" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {NAMES.slice(0, 6).map((name) => (
                <Avatar key={name} name={name} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Avatar name="Ali Rahman" src={photo(210)} size="lg" />
              <Avatar name="Eve Chen" src="/no-such-portrait.png" size="lg" />
              <Avatar size="lg" />
              <Avatar name="Ali Rahman" size="lg" ring />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
