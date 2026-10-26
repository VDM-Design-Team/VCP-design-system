import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Tag } from './Tag';
import { Icon } from '../icon';

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const;
const VARIANTS = ['textual', 'outline', 'tonal', 'filled'] as const;

const meta = {
  title: 'Atoms/Tag',
  component: Tag,
  parameters: {
    docs: {
      description: {
        component:
          'A small, non-interactive, rounded-rectangle label that classifies the thing beside ' +
          'it — a different shape from `Badge`\'s pill, even though they share the same four ' +
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
      <Tag {...args} variant="outline" tone="danger" icon={<Icon name="warning-circle" size="md" />}>
        Blocked
      </Tag>
    </div>
  ),
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
