/* Types `cdp().send` for the pointer below; `vitest.shims.d.ts`, which carries it too,
   is outside the tsconfig. */
/// <reference types="@vitest/browser-playwright" />
import * as React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../atoms/button';
import { NotificationItem, type NotificationKind, type NotificationReply } from './NotificationItem';
import { typeText } from '../../lib/story-typing';
import type { EmojiReaction } from '../emoji-reaction-picker';
import type { MentionSegment } from '../../atoms/mention-input';
import { AV_STATUSES } from '../status-tag';

/* What `moved` can move to: the ten spine statuses every domain shares, then each domain's own steps
   (Design has one, Development five). The domain steps are the domain's data, not the system's, so
   these are the ones the library draws; `status` takes any label a domain defines. */
const DOMAIN_STEPS = ['Design Review', 'For review', 'For QA', 'In QA', 'Ready for deploy', 'Confirmed prod'];

const SUBJECT = 'Change the notification layout for testing';

const LONG_COMMENT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nibh elit, sollicitudin ac est vitae, ' +
  'pharetra cursus ligula. Suspendisse tristique suscipit nibh, a scelerisque justo sodales a. Duis nisi ' +
  'arcu, tempor id suscipit nec, posuere et enim. Aliquam nunc nulla, consectetur congue sem a, tempor ' +
  'feugiat purus. Ut id arcu vel odio mollis malesuada at vitae sem.';

/* Typed, so Storybook does not read the story args off the decorator: the props are
   a union (`moved` needs `status`), and an untyped decorator collapses every story's
   args to `never`. */
/* A story's own `decorators` add to this one rather than replace it, so a full-screen story
   (Light and dark, the contrast check) opts out here instead. */
const column: Decorator = (Story, { parameters }) =>
  parameters.layout === 'fullscreen' ? (
    <Story />
  ) : (
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
          'row is the target (`href` or `onSelect`), except the comment preview, which does not open it; the unread dot makes ' +
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
        'reacted',
        'discarded',
      ] satisfies NotificationKind[],
    },
    status: {
      control: 'select',
      options: [...AV_STATUSES, ...DOMAIN_STEPS],
      description: 'For `moved` only: the status it moved to. Any label a domain defines works.',
    },
    unread: { control: 'boolean' },
    onToggleRead: { control: false },
    onSelect: { control: false },
  },
  decorators: [column],
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/* The mark-read tooltip, and whether it is open. It shows the button's name and does not
   describe the button (the name already says it), so it is found by its words, not through
   `aria-describedby`. The bubble is in a portal on `document.body`, and closed is `opacity-0`,
   not `hidden`, so it is in the DOM either way: finding it proves nothing, its positioner's open
   class does. */
const bubbleOf = (trigger: HTMLElement) => {
  const words = (trigger.getAttribute('aria-label') ?? '').split(':')[0];
  const bubble = [...document.querySelectorAll<HTMLElement>('[role="tooltip"]')].find(
    (t) => t.textContent?.trim() === words,
  );
  if (!bubble) throw new Error(`No tooltip reads "${words}"`);
  return bubble;
};
/* The tooltip is there, and the button is not described by it: its name is heard once. */
const described = async (trigger: HTMLElement) => {
  await waitFor(() => bubbleOf(trigger));
  await expect(trigger).not.toHaveAttribute('aria-describedby');
};
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
   is driven by `:hover`. Under `npm test` (Vitest's browser mode) the browser's own
   pointer moves, through the DevTools protocol; in the Storybook UI there is none, so
   the hover checks skip there.
   A move is one `Input.dispatchMouseEvent`, not Playwright's `hover()`: that one first
   waits for its target to be visible, stable and unobstructed, a dozen and more round
   trips between Vitest and the page, and in a full `npm test`, several pages at
   once, they ate the test's whole 15s. So the move does not wait for anything, and the
   stories check where it landed (`:hover`) in the page instead. */
const realPointer = async () => {
  let cdp: typeof import('vitest/browser').cdp;
  try {
    ({ cdp } = await import('vitest/browser'));
  } catch {
    return null;
  }
  /* The protocol takes the whole page's coordinates, and the story is in Vitest's
     iframe, scaled to fit: carry the point out through each frame. */
  const moveTo = (x: number, y: number) => {
    for (let w: Window = window; w.frameElement; w = w.parent) {
      const frame = w.frameElement.getBoundingClientRect();
      const scale = frame.width / w.innerWidth;
      x = frame.left + x * scale;
      y = frame.top + y * scale;
    }
    return cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  };
  return {
    /* Onto the middle of an element. */
    hover: (el: Element) => {
      const r = el.getBoundingClientRect();
      return moveTo(r.left + r.width / 2, r.top + r.height / 2);
    },
    /* The real pointer stays wherever the last test left it, which can be over this
       story's row: then the row is already hovered and the dot already gone before the
       test starts. Park it in the screen's bottom-right corner. Not the top-left: under
       Vitest the story is not centred, so the row starts there, and its stretched
       target covers the corner. */
    park: () => moveTo(window.innerWidth - 1, window.innerHeight - 1),
  };
};
const isHovered = (el: Element) => el.matches(':hover');

/** Unread, a link, with the mark-read button waiting for hover or focus. */
export const Unread: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* The row is named from its message, and says it is unread. */
    const row = canvas.getByRole('link', {
      name: 'Unread: John Kestrel commented on Change the notification layout for testing. a few seconds ago',
    });
    await expect(row).toHaveAttribute('href', '#av-1');
    const mark = canvas.getByRole('button', { name: /^Mark as read/ });
    await userEvent.click(mark);
    await expect(args.onToggleRead).toHaveBeenCalledTimes(1);
  },
};

/** The mark-read button names itself in a tooltip: after a pause on hover, at once on focus. */
export const MarkReadTooltip: Story = {
  play: async ({ canvasElement }) => {
    const mark = within(canvasElement).getByRole('button', { name: /^Mark as read/ });
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

/** Someone reacted to your comment (decided 9 Nov 2026): the comment is the preview, with its reactions. */
export const Reacted: Story = {
  args: {
    kind: 'reacted',
    actor: { name: 'Marvin Ode' },
    preview: 'On it: the handoff goes out this afternoon.',
    reactions: [{ emoji: '👍', count: 2, mine: true, people: ['You', 'Marvin Ode'] }],
    onToggleReaction: fn(),
    onSelectEmoji: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/reacted to your comment on/)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^2 reactions, 👍, you reacted/ })).toBeInTheDocument();
  },
};

/** Every kind of event, with the sentence the design draws for it. */
export const Kinds: Story = {
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
      { kind: 'reacted', time: 'a few seconds ago', expect: /reacted to your comment on/ },
      { kind: 'discarded', time: '5 minutes ago', expect: /discarded/ },
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
    /* Fourteen open their Added Value; a discarded one has no page, so its row is plain text. */
    await expect(links).toHaveLength(14);
    const discarded = Array.from(canvasElement.querySelectorAll('li p')).find((p) => p.textContent?.includes('discarded'));
    await expect(discarded).toHaveTextContent('John Kestrel discarded Change the notification layout for testing.');
    await expect(links[2]).toHaveTextContent('John Kestrel moved Change the notification layout for testing to Confirmed prod.');
    await expect(links[10]).toHaveTextContent(/handed off .*testing\. Ready for Review\./);
    await expect(links[11]).toHaveTextContent(/accepted & completed .*testing\./);
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
    const message = canvas.getByText(`${SUBJECT}.`).closest('p') as HTMLElement;
    await expect(message).toHaveTextContent(
      /^John Kestrel commented on Change the notification layout for testing. a few seconds ago$/,
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
      'John Kestrel moved Change the notification layout for testing. a few seconds ago',
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
    /* The comment is not part of the row's target: the pointer lands on the comment, not the link. */
    await expect(hitAt(canvas.getByText(/^Lorem ipsum/))).not.toBe(canvas.getByRole('link'));
    const more = await canvas.findByRole('button', { name: 'Show more' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    const less = await canvas.findByRole('button', { name: 'Show less' });
    await expect(less).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(less);
    await expect(await canvas.findByRole('button', { name: 'Show more' })).toBeVisible();
    /* Its focus ring shows whole: the card clips anything outside it, so the ring must sit
       inside the card on every side (it used to show only its left and right). */
    const shown = canvas.getByRole('button', { name: 'Show more' });
    shown.focus();
    const style = getComputedStyle(shown);
    const reach = parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth);
    const ring = shown.getBoundingClientRect();
    let clip = shown.parentElement!;
    while (getComputedStyle(clip).overflow !== 'hidden') clip = clip.parentElement!;
    const card = clip.getBoundingClientRect();
    await expect(ring.top - reach).toBeGreaterThanOrEqual(card.top);
    await expect(ring.bottom + reach).toBeLessThanOrEqual(card.bottom);
    await expect(ring.left - reach).toBeGreaterThanOrEqual(card.left);
    await expect(ring.right + reach).toBeLessThanOrEqual(card.right);
  },
};

/** A short comment fits in three lines, so there is no button. */
export const ShortCommentPreview: Story = {
  args: { preview: 'Looks good to me — shipping it.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /Show/ })).toBeNull();
  },
};

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
];

/**
 * A comment with reactions and one reply, wired the way an app would: the reply and the
 * reactions are state here, and the item reports what the user did.
 */
function CommentThread({
  initialReply,
  initialReactions = [
    { emoji: '👍', count: 2, mine: true },
    { emoji: '👀', count: 1 },
  ],
  ...rest
}: {
  initialReply?: NotificationReply;
  initialReactions?: EmojiReaction[];
  defaultReplyShown?: boolean;
}) {
  const [reply, setReply] = React.useState<NotificationReply | undefined>(initialReply);
  const [reactions, setReactions] = React.useState<EmojiReaction[]>(initialReactions);
  const me = { name: 'Kai Lindqvist' };
  const words = (value: MentionSegment[]) => value;
  const toggle = (emoji: string) =>
    setReactions((rs) =>
      rs
        .map((r) =>
          r.emoji === emoji
            ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
            : r,
        )
        .filter((r) => r.count > 0),
    );
  const select = (emoji: string) =>
    setReactions((rs) =>
      rs.some((r) => r.emoji === emoji)
        ? rs.map((r) => (r.emoji === emoji && !r.mine ? { ...r, mine: true, count: r.count + 1 } : r))
        : [...rs, { emoji, count: 1, mine: true }],
    );
  return (
    <NotificationItem
      kind="commented"
      actor={{ name: 'John Kestrel' }}
      subject={SUBJECT}
      time="a few seconds ago"
      unread
      href="#av-1"
      preview="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nibh elit, sollicitudin ac est vitae."
      reactions={reactions}
      onToggleReaction={toggle}
      onSelectEmoji={select}
      reply={reply}
      members={MEMBERS}
      currentUser={me}
      onReply={(value) => setReply({ author: me, value: words(value) })}
      onEditReply={(value) => setReply({ author: me, value: words(value) })}
      onDeleteReply={() => setReply(undefined)}
      {...rest}
    />
  );
}

/** Reactions under a comment: the thumbs-up, the palette, and a pill for each emoji. Pills toggle your own. */
export const Reactions: Story = {
  render: () => <CommentThread />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* The pill for 👍 is yours: pressing it takes yours back. */
    await userEvent.click(canvas.getByRole('button', { name: /Remove thumbs up/ }));
    await expect(canvas.getByRole('button', { name: /React with thumbs up/ })).toBeInTheDocument();
  },
};

/**
 * Replying, end to end, as the design's flow draws it: Reply opens a composer in place of the
 * row; sending it posts one reply, hidden by default; "Show Reply" shows it with Edit and Delete;
 * Edit puts the composer back, filled; Save keeps the change; Delete takes the reply away and
 * brings "Reply" back.
 */
export const ReplyFlow: Story = {
  render: () => <CommentThread />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));
    /* The row (and its reactions) give way to the composer. */
    await expect(canvas.queryByRole('button', { name: /React with/ })).toBeNull();
    const field = canvas.getByRole('textbox', { name: 'Write a reply' });
    await typeText(field, 'Thanks @jane');
    await userEvent.keyboard('{Enter}');
    await typeText(field, 'will review');
    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));

    /* Posted, and hidden by default — and focus went to "Show Reply", not the page. */
    const show = await canvas.findByRole('button', { name: 'Show Reply' });
    await waitFor(() => expect(show).toHaveFocus());
    await expect(show).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(/will review/)).toBeNull();
    await userEvent.click(show);
    await expect(await canvas.findByText(/will review/)).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Hide Reply' })).toHaveAttribute('aria-expanded', 'true');

    /* Edit, with the reply's words in the field, then Save. */
    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
    const editor = canvas.getByRole('textbox', { name: 'Write a reply' });
    await expect(editor).toHaveTextContent('Thanks @Jane Doe will review');
    await typeText(editor, ' soon');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(await canvas.findByText(/will review soon/)).toBeVisible();
    /* Saved: focus is on "Edit", where it was. */
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Edit' })).toHaveFocus());

    /* Delete: the reply goes and "Reply" comes back — with focus on it. */
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    await expect(await canvas.findByRole('button', { name: 'Reply' })).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Reply' })).toHaveFocus());
    await expect(canvas.queryByRole('button', { name: /Show Reply|Hide Reply/ })).toBeNull();
  },
};

/** A comment that already has a reply, hidden: "Show Reply" is where "Reply" was. */
export const RepliedHidden: Story = {
  render: () => (
    <CommentThread
      initialReply={{
        author: { name: 'Kai Lindqvist' },
        value: [{ type: 'text', text: 'Thanks, shipping it Friday.' }],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Show Reply' })).toBeVisible();
    await expect(canvas.queryByText(/shipping it Friday/)).toBeNull();
  },
};

/** The same, shown: the reply card with Edit and Delete. */
export const RepliedShown: Story = {
  render: () => (
    <CommentThread
      defaultReplyShown
      initialReply={{
        author: { name: 'Kai Lindqvist' },
        value: [
          { type: 'text', text: 'Thanks ' },
          { type: 'mention', id: '204', label: 'Jane Doe' },
          { type: 'text', text: ', shipping it Friday.' },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Hide Reply' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(canvasElement.querySelector('[data-type="mention"]')).toHaveTextContent('@Jane Doe');
  },
};

/** Cancelling a reply brings the row back, with its reactions. */
export const CancelReply: Story = {
  render: () => <CommentThread />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(await canvas.findByRole('button', { name: 'Reply' })).toBeVisible();
    /* Focus is back on "Reply", the control that opened the composer. */
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Reply' })).toHaveFocus());
    await expect(canvas.getByRole('button', { name: /thumbs up/ })).toBeVisible();
  },
};

const onReply = fn().mockName('onReply');

/**
 * A click on the comment does **not** open the item: the comment is content to read and select. The
 * row around it still opens, and "Show more" and the caller's `previewActions` respond as controls.
 */
export const CommentDoesNotOpenTheItem: Story = {
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
    /* The comment's text: the pointer lands on the comment, and the click does nothing to the row. */
    const comment = canvas.getByText(/^Lorem ipsum/);
    await expect(hitAt(comment)).not.toBe(row);
    await userEvent.click(hitAt(comment));
    await expect(args.onSelect).not.toHaveBeenCalled();
    /* "Show more" and "Reply" are controls of their own, and do not open the row either. */
    const more = canvas.getByRole('button', { name: 'Show more' });
    await expect(more.contains(hitAt(more))).toBe(true);
    await userEvent.click(more);
    const less = canvas.getByRole('button', { name: 'Show less' });
    await expect(less).toHaveAttribute('aria-expanded', 'true');
    const reply = canvas.getByRole('button', { name: 'Reply' });
    await expect(reply.contains(hitAt(reply))).toBe(true);
    await userEvent.click(reply);
    await expect(onReply).toHaveBeenCalledTimes(1);
    await expect(args.onSelect).not.toHaveBeenCalled();
    /* The row outside the comment still opens the item. */
    await userEvent.click(row);
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    /* And the keyboard reaches each in turn: row, mark-read, Show less, Reply. */
    (document.activeElement as HTMLElement | null)?.blur();
    for (const control of [row, canvas.getByRole('button', { name: /^Mark as read/ }), less, reply]) {
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
    const mark = canvas.getByRole('button', { name: /^Mark as read/ });
    const pointer = await realPointer();
    if (pointer) {
      await pointer.park();
      await waitFor(() => expect(isHovered(row)).toBe(false));
    }
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
    if (pointer) {
      await pointer.hover(row);
      await waitFor(() => expect(isHovered(row)).toBe(true));
      await expect(await opacityOf(dot)).toBe('0');
      await expect(await opacityOf(mark)).toBe('1');
      await pointer.park();
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
    const pointer = await realPointer();
    if (pointer) {
      await pointer.park();
      await waitFor(() => expect(isHovered(row)).toBe(false));
    }
    await userEvent.tab();
    await expect(row).toHaveFocus();
    await expect(await opacityOf(dot)).toBe('1');
    if (pointer) {
      await pointer.hover(row);
      await waitFor(() => expect(isHovered(row)).toBe(true));
      await expect(await opacityOf(dot)).toBe('1');
      await pointer.park();
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
  render: (args) => (
    /* Side by side once each half has room for its 384 column, stacked below that. */
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex h-full w-full flex-col items-center bg-surface-canvas p-8">
            <div className="w-full max-w-96">
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

/** A subject that ends in its own punctuation gets no second full stop ("Is this ready?", not "ready?."). */
export const SubjectEndsInPunctuation: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { subject: 'Is this ready?' },
  play: async ({ canvasElement }) => {
    const text = canvasElement.textContent ?? '';
    await expect(text).toContain('Is this ready?');
    await expect(text).not.toContain('ready?.');
  },
};
