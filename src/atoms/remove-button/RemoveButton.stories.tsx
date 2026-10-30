import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RemoveButton } from './RemoveButton';

const meta = {
  title: 'Atoms/RemoveButton',
  component: RemoveButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The small critical ✕ that takes one item out of a list. `plain` is the glyph alone; `tonal` is the glyph ' +
          'on a filled disc, which also works over a picture; the description card and the file attachment both use it. Icon only, so `label` is ' +
          'required. Whoever places it positions it and decides when it shows.',
      },
    },
  },
  args: { label: 'Remove item', onClick: fn() },
  argTypes: { tone: { control: 'inline-radio', options: ['plain', 'tonal'] } },
} satisfies Meta<typeof RemoveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Plain: the glyph alone, changing colour through hover and press. */
export const Plain: Story = {
  args: { tone: 'plain' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove item' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** Tonal: on a filled disc, for an item over a picture. */
export const Tonal: Story = { args: { tone: 'tonal' } };

/** Both, on a plain surface and over a picture. */
export const Surfaces: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-4 rounded-md bg-surface-elevated p-6">
        <RemoveButton label="Remove problem" />
        <RemoveButton tone="tonal" label="Remove file" />
      </div>
      <div className="flex items-center gap-4 rounded-md bg-surface-brand-strong p-6">
        <RemoveButton label="Remove problem" />
        <RemoveButton tone="tonal" label="Remove file" />
      </div>
    </div>
  ),
};

/* WCAG 1.4.11 asks 3:1 of a graphic that carries meaning. axe does not measure icons, so this does. */
const channels = (css: string) => css.match(/[\d.]+/g)!.slice(0, 3).map(Number);
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The ✕ at rest holds 3:1 in both themes: plain against the surface it sits on, tonal against its own disc. */
export const ContrastHolds: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true }, chromatic: { disableSnapshot: true } },
  render: () => (
    <div>
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined} data-theme-case={isDark ? 'dark' : 'light'}>
          <div className="flex items-center gap-4 bg-surface-elevated p-6">
            <RemoveButton label="Remove plain" />
            <RemoveButton tone="tonal" label="Remove tonal" />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const theme of ['light', 'dark']) {
      const scope = canvasElement.querySelector(`[data-theme-case="${theme}"]`) as HTMLElement;
      const page = channels(getComputedStyle(scope.firstElementChild as HTMLElement).backgroundColor);
      const plain = scope.querySelector('button[aria-label="Remove plain"]') as HTMLElement;
      const tonal = scope.querySelector('button[aria-label="Remove tonal"]') as HTMLElement;
      const rows = [
        ['plain on the surface', channels(getComputedStyle(plain).color), page],
        ['tonal on its disc', channels(getComputedStyle(tonal).color), channels(getComputedStyle(tonal).backgroundColor)],
      ] as const;
      for (const [name, fg, bg] of rows) {
        await expect({ theme, name, ok: contrast(fg, bg) >= 3 }).toEqual({ theme, name, ok: true });
      }
    }
  },
};
