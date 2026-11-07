import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'The primary interactive control. Use `primary` for the single most important action ' +
          'on a screen, `secondary` for supporting actions, `tertiary` inside dense toolbars, and ' +
          '`danger` only for destructive, irreversible actions.',
      },
    },
  },
  args: { children: 'Continue' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'neutral', 'tertiary', 'danger', 'link'],
    },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
/** Outlined, but grey — the Cancel beside a destructive answer. */
export const Neutral: Story = { args: { variant: 'neutral', children: 'Cancel' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete account' } };
export const Link: Story = { args: { variant: 'link', children: 'Learn more' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-sm">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex items-center gap-sm">
      <Button {...args}>Default</Button>
      <Button {...args} loading>Loading</Button>
      <Button {...args} disabled>Disabled</Button>
    </div>
  ),
};

/**
 * **A loading button keeps focus.** It looks disabled and ignores presses, but it is `aria-disabled` rather than
 * `disabled`, so the person who pressed Save is not dropped onto the page while it saves. Here Save loads for a moment:
 * pressing it again (Enter, Space or a click) does nothing, and focus never leaves it.
 */
export const LoadingKeepsFocus: Story = {
  render: function Render(args) {
    const [loading, setLoading] = React.useState(false);
    const [saves, setSaves] = React.useState(0);
    return (
      <div className="flex items-center gap-4">
        <Button
          {...args}
          loading={loading}
          onClick={() => {
            setSaves((n) => n + 1);
            setLoading(true);
            window.setTimeout(() => setLoading(false), 1500);
          }}
        >
          Save
        </Button>
        <span className="text-body-sm-medium text-text-primary">Saved {saves} time{saves === 1 ? '' : 's'}</span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save' });
    save.focus();
    await userEvent.keyboard('{Enter}');

    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(save).toHaveAttribute('aria-disabled', 'true');
    await expect(save).not.toBeDisabled();
    await expect(save).toHaveFocus();

    /* Pressed again while it loads: nothing happens. (`fireEvent`, because a loading button takes no pointer events.) */
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    fireEvent.click(save);
    await expect(canvas.getByText('Saved 1 time')).toBeInTheDocument();
    await expect(save).toHaveFocus();
  },
};

const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The filled variants in both themes. The label holds 4.5:1 at rest, hovered and pressed. The
 * test reads the hover and pressed colours from the classes each button renders. (Dark primary
 * used to darken its fill under dark text: 3.26:1 hovered, 2.23:1 pressed.)
 */
export const FilledTextContrast: Story = {
  name: 'Filled text contrast, both themes',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    /* The full height, so the dark half reaches the foot of the page like the light one. */
    <div className="grid min-h-screen grid-cols-1 sm:grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined} data-theme-case={isDark ? 'dark' : 'light'}>
          <div className="flex h-full flex-wrap items-center gap-2 bg-surface-canvas p-8">
            {(['primary', 'danger'] as const).map((variant) => (
              <Button key={variant} variant={variant} data-case={variant}>
                {variant}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const under4_5to1: string[] = [];
    for (const button of Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-case]'))) {
      const theme = button.closest('[data-theme-case]')!.getAttribute('data-theme-case');
      const style = getComputedStyle(button);
      /* The colour a `hover:` or `active:` class on the button resolves to here, or undefined. */
      const state = (prefix: string) => {
        const token = button.className.split(/\s+/).find((c) => c.startsWith(prefix))?.slice(prefix.length);
        if (!token) return undefined;
        const probe = document.createElement('span');
        probe.style.color = `var(--color-${token})`;
        button.append(probe);
        const value = rgb(getComputedStyle(probe).color);
        probe.remove();
        return value;
      };
      const ink = rgb(style.color);
      const fill = rgb(style.backgroundColor);
      for (const [name, fg, bg] of [
        ['at rest', ink, fill],
        /* A filled button always changes its fill; a missing class would test the rest fill twice. */
        ['hovered', state('hover:text-') ?? ink, state('hover:bg-')],
        ['pressed', state('active:text-') ?? ink, state('active:bg-')],
      ] as const) {
        if (!bg) under4_5to1.push(`${theme} ${button.dataset.case}, ${name}: no fill class`);
        else if (contrast(fg, bg) < 4.5)
          under4_5to1.push(`${theme} ${button.dataset.case}, ${name}: ${contrast(fg, bg).toFixed(2)}:1`);
      }
    }
    await expect(under4_5to1).toEqual([]);
  },
};
