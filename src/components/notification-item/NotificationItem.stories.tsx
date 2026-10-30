import * as React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../atoms/button';
import { NotificationItem, type NotificationKind } from './NotificationItem';

const SUBJECT = 'Change the notification layout for testing';

const LONG_COMMENT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nibh elit, sollicitudin ac est vitae, ' +
  'pharetra cursus ligula. Suspendisse tristique suscipit nibh, a scelerisque justo sodales a. Duis nisi ' +
  'arcu, tempor id suscipit nec, posuere et enim. Aliquam nunc nulla, consectetur congue sem a, tempor ' +
  'feugiat purus. Ut id arcu vel odio mollis malesuada at vitae sem.';

/* Typed, so Storybook does not read the story args off the decorator: the props are
   a union (`moved` needs `status`), and an untyped decorator collapses every story's
   args to `never`. */
const column: Decorator = (Story) => (
  <div className="w-96">
    <Story />
  </div>
);

const meta = {
  title: 'Components/Feedback/NotificationItem',
  component: NotificationItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One line in a list of notifications: who did what to which Added Value, when, and whether ' +
          'it has been read. The eleven kinds of event come from Figma\'s `_Message_Content`, and the ' +
          'component owns the sentence, so the bold and regular runs are the same everywhere. The whole ' +
          'row is the target (`href` or `onSelect`), the comment preview included; the unread dot makes ' +
          'way for the mark-read button on hover and on that button\'s focus. Put items in a list.',
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
        'accepted',
        'updated',
        'rejected',
        'rejected-feedback',
        'assigned',
        'backlog',
        'handoff',
        'viewer',
      ] satisfies NotificationKind[],
    },
    unread: { control: 'boolean' },
    onToggleRead: { control: false },
    onSelect: { control: false },
  },
  decorators: [column],
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/* The tooltip a trigger is described by, and whether it is open, as in
   `Tooltip.stories`. The bubble is in a portal on `document.body`, and closed is
   `opacity-0`, not `hidden`, so it is in the DOM either way: finding it proves
   nothing, its positioner's open class does. */
const bubbleOf = (trigger: HTMLElement) => {
  const ids = (trigger.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
  const bubble = document.getElementById(ids[ids.length - 1] ?? '');
  if (!bubble) throw new Error('The trigger is not described by a tooltip');
  return bubble;
};
const described = (trigger: HTMLElement) => waitFor(() => bubbleOf(trigger));
const isOpen = (trigger: HTMLElement) => bubbleOf(trigger).parentElement?.classList.contains('opacity-100');

/* The unread dot (the avatar is `rounded-pill`, so this is the only round span). */
const dotIn = (root: HTMLElement) => root.querySelector<HTMLElement>('span.rounded-full');
/* Wait out the 200ms dissolve, then read where it landed. `getAnimations()` brings
   the style up to date first, so a transition that has just been triggered counts. */
const opacityOf = async (el: HTMLElement) => {
  for (let i = 0; i < 5; i++) {
    const running = el.getAnimations();
    if (!running.length) break;
    await Promise.allSettled(running.map((a) => a.finished));
  }
  return getComputedStyle(el).opacity;
};
/* What the pointer lands on at the middle of an element: the real hit test. */
const hitAt = (el: Element) => {
  const r = el.getBoundingClientRect();
  return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) as HTMLElement;
};
/* `userEvent.hover` fires the events but cannot make CSS `:hover` match, and the dot
   is driven by `:hover`. Under `npm test` (Vitest's browser mode) Playwright moves a
   real pointer; in the Storybook UI there is none, so the hover checks skip there. */
const realPointer = async () => {
  try {
    return (await import('vitest/browser')).userEvent;
  } catch {
    return null;
  }
};

/** Unread, a link, with the mark-read button waiting for hover or focus. */
export const Unread: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* The row is named from its message, and says it is unread. */
    const row = canvas.getByRole('link', {
      name: 'Unread: John Kestrel commented on Change the notification layout for testing a few seconds ago',
    });
    await expect(row).toHaveAttribute('href', '#av-1');
    const mark = canvas.getByRole('button', { name: 'Mark as read' });
    await userEvent.click(mark);
    await expect(args.onToggleRead).toHaveBeenCalledTimes(1);
  },
};

/** The mark-read button names itself in a tooltip: after a pause on hover, at once on focus. */
export const MarkReadTooltip: Story = {
  play: async ({ canvasElement }) => {
    const mark = within(canvasElement).getByRole('button', { name: 'Mark as read' });
    await described(mark);
    await expect(isOpen(mark)).toBe(false);
    /* Tab to the row, then to the button: focus opens it at once. */
    await userEvent.tab();
    await userEvent.tab();
    await expect(mark).toHaveFocus();
    await waitFor(() => expect(isOpen(mark)).toBe(true), { timeout: 100 });
    await expect(bubbleOf(mark)).toHaveTextContent('Mark as read');
    /* Focus leaves: it closes. A hover opens it again, after the half-second rest. */
    await userEvent.tab();
    await waitFor(() => expect(isOpen(mark)).toBe(false));
    await userEvent.hover(mark);
    await expect(isOpen(mark)).toBe(false);
    await waitFor(() => expect(isOpen(mark)).toBe(true), { timeout: 1500 });
    await userEvent.unhover(mark);
    await waitFor(() => expect(isOpen(mark)).toBe(false));
  },
};

/** Read: no dot, and the button reads "Mark as unread". */
export const Read: Story = {
  args: { unread: false, kind: 'accepted', time: '8 hours ago' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /^John Kestrel accepts/ })).toBeVisible();
    /* Read: empty on the right at rest. The mark-unread button is there for the
       keyboard, but invisible until the row is hovered or focused. */
    const mark = canvas.getByRole('button', { name: 'Mark as unread' });
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
      { kind: 'accepted', time: '8 hours ago', expect: /accepts/ },
      { kind: 'updated', time: '38 minutes ago', expect: /made an update to/ },
      { kind: 'rejected', time: '38 minutes ago', expect: /rejected/ },
      { kind: 'rejected-feedback', time: '2 hours ago', expect: /rejected .* with feedback/ },
      { kind: 'assigned', time: '3 hours ago', expect: /assigned you/ },
      { kind: 'backlog', time: '3 hours ago', expect: /moved .* to the backlog/ },
      { kind: 'handoff', time: '3 hours ago', expect: /completes .*\. Ready for review/ },
      { kind: 'viewer', time: '3 hours ago', expect: /added you as a viewer to/ },
    ];
    return (
      <ul className="w-96">
        {rows.map((row) => (
          <li key={row.kind}>
            <NotificationItem {...args} kind={row.kind} status={row.status} time={row.time} />
          </li>
        ))}
      </ul>
    );
  },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    await expect(links).toHaveLength(11);
    await expect(links[2]).toHaveTextContent('John Kestrel moved Change the notification layout for testing to Confirmed prod');
    await expect(links[9]).toHaveTextContent(/completes .*testing\. Ready for review/);
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
    const canvas = within(canvasElement);
    /* Nothing to press: not a link, not a button, no mark-read button. */
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.queryByRole('button')).toBeNull();
    /* The sentence is a plain paragraph, with no "Unread:" on a read row. */
    const message = canvas.getByText(SUBJECT).closest('p') as HTMLElement;
    await expect(message).toHaveTextContent(
      /^John Kestrel commented on Change the notification layout for testing a few seconds ago$/,
    );
    /* Read with nothing to press: nothing on the right at all, the box is empty. */
    await expect(message.nextElementSibling).toBeEmptyDOMElement();
  },
};

/**
 * A `moved` row needs its `status`; the types insist. If one arrives without it, the
 * sentence stops at the subject: never a "[Status]" placeholder in front of a user.
 */
export const MovedWithoutStatus: Story = {
  args: { kind: 'moved', status: undefined, unread: false },
  play: async ({ canvasElement }) => {
    /* The compile-time half, checked by `npm run typecheck`: leaving `status` off
       `moved` is an error. This function is never called. */
    // @ts-expect-error `status` is required for `moved`
    void (() => <NotificationItem kind="moved" actor={{ name: 'J' }} subject="S" time="now" />);
    const row = within(canvasElement).getByRole('link');
    await expect(row).toHaveAccessibleName(
      'John Kestrel moved Change the notification layout for testing a few seconds ago',
    );
    await expect(row).not.toHaveTextContent(/\[Status\]| to /);
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
    /* The comment is part of the row: the pointer lands on the row's link there. */
    await expect(hitAt(canvas.getByText(/^Lorem ipsum/))).toBe(canvas.getByRole('link'));
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

const onReply = fn().mockName('onReply');

/**
 * A click on the comment opens the item, like anywhere else on the row. "Show more"
 * and the caller's `previewActions` keep the pointer and their place in the tab order.
 */
export const CommentOpensTheItem: Story = {
  args: {
    href: undefined,
    onSelect: fn(),
    preview: LONG_COMMENT,
    previewActions: (
      <div className="flex gap-2">
        <Button variant="tertiary" size="sm" onClick={onReply}>
          Reply
        </Button>
      </div>
    ),
  },
  play: async ({ canvasElement, args }) => {
    onReply.mockClear();
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: /^Unread: John Kestrel commented on/ });
    /* The comment's text: the pointer lands on the row, and the click opens it. */
    const comment = canvas.getByText(/^Lorem ipsum/);
    await expect(hitAt(comment)).toBe(row);
    await userEvent.click(hitAt(comment));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    /* "Show more" and "Reply" take the pointer back, and do not open the row. */
    const more = canvas.getByRole('button', { name: 'Show more' });
    await expect(more.contains(hitAt(more))).toBe(true);
    await userEvent.click(more);
    const less = canvas.getByRole('button', { name: 'Show less' });
    await expect(less).toHaveAttribute('aria-expanded', 'true');
    const reply = canvas.getByRole('button', { name: 'Reply' });
    await expect(reply.contains(hitAt(reply))).toBe(true);
    await userEvent.click(reply);
    await expect(onReply).toHaveBeenCalledTimes(1);
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    /* And the keyboard reaches each in turn: row, mark-read, Show less, Reply. */
    (document.activeElement as HTMLElement | null)?.blur();
    for (const control of [row, canvas.getByRole('button', { name: 'Mark as read' }), less, reply]) {
      await userEvent.tab();
      await expect(control).toHaveFocus();
    }
  },
};

/**
 * The unread dot makes way only for the mark-read button: when the row is hovered or
 * that button is focused. Focus on the row itself or on "Show more" leaves it, since
 * nothing would take its place.
 */
export const DotMakesWayForMarkRead: Story = {
  args: { href: undefined, onSelect: fn(), preview: LONG_COMMENT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dot = dotIn(canvasElement)!;
    const row = canvas.getByRole('button', { name: /^Unread: John Kestrel commented on/ });
    const mark = canvas.getByRole('button', { name: 'Mark as read' });
    await expect(await opacityOf(dot)).toBe('1');
    /* The row's own focus: the dot stays, and the button stays hidden. */
    await userEvent.tab();
    await expect(row).toHaveFocus();
    await expect(await opacityOf(dot)).toBe('1');
    await expect(await opacityOf(mark)).toBe('0');
    /* The mark-read button's focus: the dot makes way for it. */
    await userEvent.tab();
    await expect(mark).toHaveFocus();
    await expect(await opacityOf(dot)).toBe('0');
    await expect(await opacityOf(mark)).toBe('1');
    /* "Show more" is another button, not the dot's replacement: the dot comes back. */
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Show more' })).toHaveFocus();
    await expect(await opacityOf(dot)).toBe('1');
    /* Hover: the dot makes way for the button. */
    const pointer = await realPointer();
    if (pointer) {
      await pointer.hover(row);
      await expect(await opacityOf(dot)).toBe('0');
      await expect(await opacityOf(mark)).toBe('1');
      await pointer.unhover(row, { position: { x: 0, y: 0 } });
    }
  },
};

/** With no `onToggleRead` there is no button to make way for, so the dot stays, hovered or focused. */
export const DotStaysWithoutMarkRead: Story = {
  args: { onToggleRead: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dot = dotIn(canvasElement)!;
    const row = canvas.getByRole('link', { name: /^Unread: John Kestrel commented on/ });
    await expect(canvas.queryByRole('button')).toBeNull();
    await userEvent.tab();
    await expect(row).toHaveFocus();
    await expect(await opacityOf(dot)).toBe('1');
    const pointer = await realPointer();
    if (pointer) {
      await pointer.hover(row);
      await expect(await opacityOf(dot)).toBe('1');
      await pointer.unhover(row, { position: { x: 0, y: 0 } });
    }
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
              <NotificationItem {...args} />
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
            <NotificationItem {...args} />
            <NotificationItem {...args} unread={false} kind="moved" status="Confirmed prod" />
            <NotificationItem {...args} preview={LONG_COMMENT} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
