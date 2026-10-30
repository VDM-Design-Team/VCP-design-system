import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  NotificationItem,
  type NotificationItemBaseProps,
  type NotificationKind,
} from './NotificationItem';

/* The component's props are a union (`moved` requires `status`), which Storybook's `args` typing
   cannot hold, so the stories take the loose shape. The requirement itself is the component's. */
const Item = NotificationItem as unknown as React.ComponentType<
  NotificationItemBaseProps & { kind: NotificationKind; status?: string }
>;

const SUBJECT = 'Change the notification layout for testing';

const LONG_COMMENT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nibh elit, sollicitudin ac est vitae, ' +
  'pharetra cursus ligula. Suspendisse tristique suscipit nibh, a scelerisque justo sodales a. Duis nisi ' +
  'arcu, tempor id suscipit nec, posuere et enim. Aliquam nunc nulla, consectetur congue sem a, tempor ' +
  'feugiat purus. Ut id arcu vel odio mollis malesuada at vitae sem.';

const meta = {
  title: 'Components/Feedback/NotificationItem',
  component: Item,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One line in a list of notifications: who did what to which Added Value, when, and whether ' +
          'it has been read. The thirteen kinds of event come from Figma\'s `_Message_Content`, and the ' +
          'component owns the sentence, so the bold and regular runs are the same everywhere. The whole ' +
          'row is the target (`href` or `onSelect`); the unread dot makes way for the mark-read button ' +
          'on hover and focus. Put items in a list.',
      },
    },
  },
  args: {
    kind: 'commented',
    actor: { name: 'John Kestrel' },
    subject: SUBJECT,
    time: 'a few seconds ago',
    unread: true,
    href: '#av-1',
    onToggleRead: fn(),
  },
  argTypes: {
    kind: {
      control: 'select',
      options: [
        'commented',
        'mention',
        'moved',
        'pending',
        'accepted',
        'updated',
        'rejected',
        'rejected-feedback',
        'assigned',
        'backlog',
        'handoff',
        'completed',
        'viewer',
      ] satisfies NotificationKind[],
    },
    unread: { control: 'boolean' },
    onToggleRead: { control: false },
    onSelect: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unread, a link, with the mark-read button waiting for hover or focus. */
export const Unread: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* The row is named from its message, and says it is unread. */
    const row = canvas.getByRole('link', {
      name: 'Unread: John Kestrel commented on Change the notification layout for testing a few seconds ago',
    });
    await expect(row).toHaveAttribute('href', '#av-1');
    const mark = canvas.getByRole('button', { name: /^Mark as read/ });
    await userEvent.click(mark);
    await expect(args.onToggleRead).toHaveBeenCalledTimes(1);
    /* An unread row draws its dot. */
    await expect(canvasElement.querySelector('[data-unread-dot]')).not.toBeNull();
  },
};

/**
 * The mark-read button names itself in a tooltip: after a pause on hover, at once on focus. The bubble
 * is always in the DOM (closed is `opacity-0`, so `aria-describedby` never dangles), so the test
 * reads whether its positioner is open, not whether the bubble exists.
 */
export const MarkReadTooltip: Story = {
  play: async ({ canvasElement }) => {
    const mark = within(canvasElement).getByRole('button', { name: /^Mark as read/ });
    const bubble = () => document.getElementById(mark.getAttribute('aria-describedby')!)!;
    const open = () => bubble().parentElement!.classList.contains('opacity-100');
    await expect(open()).toBe(false);
    await userEvent.tab();
    await userEvent.tab();
    await expect(mark).toHaveFocus();
    await waitFor(() => expect(open()).toBe(true));
    await expect(bubble()).toHaveTextContent('Mark as read');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(open()).toBe(false));
  },
};

/** Read: no dot, and the button reads "Mark as unread". */
export const Read: Story = {
  args: { unread: false, kind: 'accepted', time: '8 hours ago' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /^John Kestrel accepted/ })).toBeVisible();
    /* Read: empty on the right at rest. The mark-unread button is there for the
       keyboard, but invisible until the row is hovered or focused. */
    const mark = canvas.getByRole('button', { name: /^Mark as unread/ });
    await expect(mark).toBeInTheDocument();
    await expect(getComputedStyle(mark).opacity).toBe('0');
    /* Tab to the row, then to the button: focus brings it in. */
    await userEvent.tab();
    await userEvent.tab();
    await expect(mark).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(mark).opacity).toBe('1'));
    await expect(canvasElement.querySelector('[data-unread]')).toBeNull();
  },
};

/** Every kind of event, with the sentence the design draws for it. */
export const Kinds: Story = {
  decorators: [],
  render: (args) => {
    const rows: { kind: NotificationKind; status?: string; time: string; expect: RegExp }[] = [
      { kind: 'commented', time: 'a few seconds ago', expect: /commented on/ },
      { kind: 'mention', time: 'a few seconds ago', expect: /mentioned you in a comment on/ },
      { kind: 'moved', status: 'Confirmed prod', time: '5 minutes ago', expect: /moved .* to Confirmed prod/ },
      { kind: 'pending', time: '3 hours ago', expect: /submitted .* for approval\. Pending/ },
      { kind: 'accepted', time: '8 hours ago', expect: /accepted/ },
      { kind: 'updated', time: '38 minutes ago', expect: /made an update to/ },
      { kind: 'rejected', time: '38 minutes ago', expect: /rejected/ },
      { kind: 'rejected-feedback', time: '2 hours ago', expect: /rejected .* with feedback/ },
      { kind: 'assigned', time: '3 hours ago', expect: /assigned you/ },
      { kind: 'backlog', time: '3 hours ago', expect: /moved .* to the backlog/ },
      { kind: 'handoff', time: '3 hours ago', expect: /handed off .*\. Ready for Review/ },
      { kind: 'completed', time: '3 hours ago', expect: /accepted & completed .*testing/ },
      { kind: 'viewer', time: '3 hours ago', expect: /added you as a viewer to/ },
    ];
    return (
      <ul className="w-96">
        {rows.map((row) => (
          <li key={row.kind}>
            <Item {...args} kind={row.kind} status={row.status} time={row.time} />
          </li>
        ))}
      </ul>
    );
  },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    await expect(links).toHaveLength(13);
    await expect(links[2]).toHaveTextContent('John Kestrel moved Change the notification layout for testing to Confirmed prod');
    await expect(links[10]).toHaveTextContent(/handed off .*testing\. Ready for Review/);
    await expect(links[11]).toHaveTextContent(/accepted & completed .*testing/);
  },
};

/** A row that is a button, for a list that does not navigate. */
export const AsAButton: Story = {
  args: { href: undefined, onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const row = within(canvasElement).getByRole('button', { name: /Unread: John Kestrel commented on/ });
    await userEvent.click(row);
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

/** Not interactive at all: a plain message, for a read-only list. */
export const Static: Story = {
  args: { href: undefined, onSelect: undefined, onToggleRead: undefined, unread: false },
  play: async ({ canvasElement }) => {
    /* Read with nothing to press: nothing on the right at all. */
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
    await expect(canvasElement.querySelector('[data-unread-dot]')).toBeNull();
  },
};

/**
 * With a comment. Three lines, then "Show more" if there is more; "Show less" puts it
 * back. The reply and reaction controls are the caller's, below the card.
 */
export const WithCommentPreview: Story = {
  args: { preview: LONG_COMMENT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = await canvas.findByRole('button', { name: 'Show more' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    const less = await canvas.findByRole('button', { name: 'Show less' });
    await expect(less).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(less);
    await expect(await canvas.findByRole('button', { name: 'Show more' })).toBeVisible();
  },
};

/** A short comment fits in three lines, so there is no button. */
export const ShortCommentPreview: Story = {
  args: { preview: 'Looks good to me — shipping it.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /Show/ })).toBeNull();
  },
};

/* WCAG 1.4.11 asks 3:1 of a graphic that carries meaning. axe does not measure icons or dots, so this does. */
const rgb = (css: string) => css.match(/\d+/g)!.slice(0, 3).map(Number);
const hex = (value: string) => {
  const h = value.trim().replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The unread dot and the mark-read check hold 3:1 in both themes: against the row at rest, and
 * against the hover and pressed fills the check sits on. The check's own hover colour is checked
 * too. (An earlier version used `stroke.brand.medium`, which in dark was 2.37:1 on the row.)
 */
export const MarkersClear3to1: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [],
  render: (args) => (
    <div>
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined} data-theme-case={isDark ? 'dark' : 'light'}>
          <div className="flex justify-center bg-surface-canvas p-8">
            <div className="w-128">
              <Item {...args} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const theme of ['light', 'dark']) {
      const scope = canvasElement.querySelector(`[data-theme-case="${theme}"]`) as HTMLElement;
      const row = scope.querySelector('[data-unread]') as HTMLElement;
      const style = getComputedStyle(row);
      const rest = rgb(style.backgroundColor);
      const hover = hex(style.getPropertyValue('--color-neutral-outline-surface-hover'));
      const pressed = hex(style.getPropertyValue('--color-neutral-outline-surface-pressed'));
      const dot = rgb(getComputedStyle(row.querySelector('span.rounded-full') as HTMLElement).backgroundColor);
      const check = rgb(getComputedStyle(row.querySelector('button[aria-label^="Mark"]') as HTMLElement).color);
      const checkHover = hex(style.getPropertyValue('--color-text-brand-strong'));
      for (const [name, fg, bg] of [
        ['dot on the row', dot, rest],
        ['check on the row', check, rest],
        ['check on the hover fill', check, hover],
        ['check on the pressed fill', check, pressed],
        ['check, hovered, on the hover fill', checkHover, hover],
        ['check, hovered, on the pressed fill', checkHover, pressed],
      ] as const) {
        await expect({ theme, name, ok: contrast(fg, bg) >= 3 }).toEqual({ theme, name, ok: true });
      }
    }
  },
};

/** Both themes. Every colour is a semantic token, so dark comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [],
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex w-full flex-col items-center bg-surface-canvas p-8">
            <div className="w-96">
            <Item {...args} />
            <Item {...args} unread={false} kind="moved" status="Confirmed prod" />
            <Item {...args} preview={LONG_COMMENT} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
