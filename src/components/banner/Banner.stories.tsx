import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Banner, type BannerProps, type BannerTone } from './Banner';
import { Button } from '../../atoms/button';

const TONES: BannerTone[] = ['info', 'success', 'warning', 'danger'];

/** The Storybook-only switches that add and remove the optional buttons. */
type PlaygroundArgs = Omit<BannerProps, 'onDismiss' | 'dismissLabel'> & {
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Show the inline action button (`actionLabel` + `onAction`). */
  showAction?: boolean;
  /** Show the dismiss button (`onDismiss` + `dismissLabel`). */
  dismissible?: boolean;
};

const meta = {
  title: 'Components/Feedback/Banner',
  /* The playground args add two Storybook-only switches, so the component is typed to them. */
  component: Banner as React.ComponentType<PlaygroundArgs>,
  parameters: {
    docs: {
      description: {
        component:
          'A **persistent** inline message that sits in the layout. It takes real space, ' +
          'reflows the content around it, and stays until the user dismisses it or the ' +
          'condition that raised it clears. Nothing about it is timed. Compare `Toast` — ' +
          'transient, floats over the page, and takes itself away.\n\n' +
          'A Banner rendered **with** the page needs no live region: it is read in ' +
          'document order like any other content. `live` is only for a banner that ' +
          'appears **in response to an action** — and only when the Banner element is ' +
          'already in the page and its content is what changes. See the story below.',
      },
    },
  },
  args: {
    tone: 'info',
    title: 'Evidence refresh is scheduled',
    children: 'Sources will be re-checked tonight at 02:00 UTC. No action needed.',
    showAction: false,
    dismissible: false,
    showIcon: true,
  },
  argTypes: {
    tone: { control: 'select', options: TONES },
    live: { control: 'radio', options: ['off', 'polite', 'assertive'] },
    showAction: {
      control: 'boolean',
      name: 'action button',
      description: 'Adds the optional inline action. Needs `actionLabel` and `onAction`.',
    },
    dismissible: {
      control: 'boolean',
      name: 'dismiss button',
      description: 'Adds the optional dismiss button. Needs `onDismiss` and a `dismissLabel`.',
    },
    showIcon: {
      control: 'boolean',
      name: 'icon',
      description: 'Shows the tone glyph. Off, the tone word is still announced in hidden text.',
    },
    actionLabel: { control: 'text' },
    dismissLabel: { control: 'text' },
    onDismiss: { control: false },
    onAction: { control: false },
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<PlaygroundArgs>;

/**
 * The playground. **The action button and the dismiss button are both optional**
 * — flip *action button* and *dismiss button* in the controls to add or remove
 * them. Dismissing really closes it here (the component keeps no state; the
 * story does), and the button under it brings it back.
 */
export const Default: Story = {
  render: function Playground({ showAction, dismissible, actionLabel = 'Review', dismissLabel, ...args }) {
    const [open, setOpen] = React.useState(true);
    React.useEffect(() => setOpen(true), [dismissible]);
    if (!open) {
      return (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Bring it back
        </Button>
      );
    }
    const extras = {
      ...(showAction ? { actionLabel, onAction: () => {} } : {}),
      ...(dismissible
        ? { onDismiss: () => setOpen(false), dismissLabel: dismissLabel ?? 'Dismiss this banner' }
        : {}),
    };
    return (
      <div className="max-w-2xl">
        <Banner {...({ ...args, ...extras } as BannerProps)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    /* Neither optional button is there until its control is on. */
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

/**
 * The glyph is optional too (`showIcon={false}`): the tint, the stroke and the words
 * still carry the banner, and the tone word is announced from hidden text.
 */
export const WithoutIcon: Story = {
  args: { showIcon: false, tone: 'warning', title: 'Two deliverables are missing evidence' },
  render: Default.render,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')).toBeNull();
    await expect(canvasElement.querySelector('.sr-only')).toHaveTextContent('Warning');
  },
};

/** Both optional buttons on — what the controls produce when both are flipped. */
export const WithBothButtons: Story = {
  args: { showAction: true, dismissible: true, tone: 'warning', title: 'Two deliverables are missing evidence' },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Review' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss this banner' }));
    await expect(canvas.queryByRole('button', { name: 'Review' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Bring it back' }));
    await expect(canvas.getByRole('button', { name: 'Review' })).toBeInTheDocument();
  },
};

/**
 * Every banner in one view: four tones, each as a title and message, with an
 * action, with both optional buttons, and message-only. For review against
 * Figma and for visual diffs.
 */
export const AllBanners: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      {TONES.map((tone) => (
        <section key={tone} className="flex flex-col gap-3" aria-label={`${tone} banners`}>
          <h3 className="font-sans text-label-sm-medium text-text-tertiary">{tone}</h3>
          <Banner tone={tone} title="Title of inline banner">
            Inline banner message content goes here.
          </Banner>
          <Banner
            tone={tone}
            title="Title of inline banner"
            actionLabel="Review"
            onAction={() => {}}
          >
            Inline banner message content goes here.
          </Banner>
          <Banner
            tone={tone}
            title="Title of inline banner"
            actionLabel="Review"
            onAction={() => {}}
            onDismiss={() => {}}
            dismissLabel={`Dismiss the ${tone} banner`}
          >
            Inline banner message content goes here, and when it is long enough it wraps onto a
            second line to show how the glyph, title and buttons hold their places.
          </Banner>
          <Banner tone={tone}>Message only, no title.</Banner>
          <Banner tone={tone} title="Title of inline banner" showIcon={false}>
            Inline banner message content goes here, with no icon.
          </Banner>
        </section>
      ))}
    </div>
  ),
};

/**
 * Four tones, four `accent.*` families — and four different glyph *shapes*. The
 * tone is never carried by colour alone: the shape differs, and each glyph
 * carries the tone as its accessible name ("Warning", "Error"), so it survives
 * greyscale, a colour vision deficiency, and a screen reader alike.
 */
export const Tones: Story = {
  /* Figma's measurements: 16 padding, an 8 gap, a 20 × 20 icon, a 16 / 600 title, a
     14 / 400 body, and the tone's `outline.border` for the stroke. */
  play: async ({ canvasElement }) => {
    const banners = [...canvasElement.querySelectorAll<HTMLElement>('[data-tone]')];
    await expect(banners.length).toBe(4);
    for (const el of banners) {
      const cs = getComputedStyle(el);
      await expect([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]).toEqual(Array(4).fill('16px'));
      await expect(cs.columnGap).toBe('8px');
      const icon = el.querySelector('svg')!.getBoundingClientRect();
      await expect([icon.width, icon.height]).toEqual([20, 20]);
      /* The glyph is centred on the title's first line. */
      const titleBox = el.querySelector('p')!.getBoundingClientRect();
      await expect(Math.abs(icon.top + icon.height / 2 - (titleBox.top + 12))).toBeLessThan(0.5);
      const title = getComputedStyle(el.querySelector('p')!);
      await expect([title.fontSize, title.fontWeight]).toEqual(['16px', '600']);
      const body = getComputedStyle(el.querySelector('p ~ div')!);
      await expect([body.fontSize, body.fontWeight]).toEqual(['14px', '400']);
    }
    /* A warning is the circle, the critical banner the triangle. */
    const icon = (tone: string) => canvasElement.querySelector(`[data-tone="${tone}"] svg`)!.innerHTML;
    await expect(icon('warning')).not.toBe(icon('danger'));
  },
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      <Banner tone="info" title="Scheduled maintenance">
        VCP will be read-only on Sunday between 01:00 and 03:00 UTC.
      </Banner>
      <Banner tone="success" title="All evidence is current">
        Every source refreshed within the last seven days.
      </Banner>
      <Banner tone="warning" title="Two deliverables are missing evidence">
        They cannot move to Confirmed prod until a source is attached.
      </Banner>
      <Banner tone="danger" title="This workspace is over its seat limit">
        New members cannot be invited until a seat is freed or the plan is upgraded.
      </Banner>
    </div>
  ),
};

/**
 * Title and body carry different jobs and different type. The title is
 * `type.label.lg` (Poppins 500) and the body `type.body.md` (Poppins 400) —
 * same size, different weight. Both are ramp entries; neither is set with a
 * font-size or font-weight class.
 *
 * A Banner works with only a title, or with only a body. It never works with
 * neither: the tone glyph on its own is colour and shape with no meaning.
 */
export const TitleAndBody: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      <Banner tone="warning" title="Two deliverables are missing evidence">
        A deliverable needs at least one attached source before it can move to Confirmed
        prod. Open each one and attach the document you used.
      </Banner>
      <Banner tone="info" title="Title only, no body" />
      <Banner tone="info">Body only, no title — fine for a single short sentence.</Banner>
    </div>
  ),
};

/**
 * One action, rendered by the component rather than passed in as a slot. On a
 * tonal fill an ordinary `<Button variant="secondary">` inherits
 * `action.secondary.content.default`, which measures 3.75:1 in dark — under AA.
 * Rendering it here lets the button take the tone's own content token instead,
 * which is 4.59:1 at worst. A caller passing their own button could not know
 * that, so the slot is a prop pair instead: `actionLabel` + `onAction`.
 */
export const WithAction: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      <Banner
        tone="warning"
        title="Two deliverables are missing evidence"
        actionLabel="Review them"
        onAction={() => {}}
      >
        They cannot move to Confirmed prod until a source is attached.
      </Banner>
      <Banner
        tone="danger"
        title="This workspace is over its seat limit"
        actionLabel="Manage seats"
        onAction={() => {}}
        onDismiss={() => {}}
        dismissLabel="Dismiss the seat limit warning"
      >
        New members cannot be invited until a seat is freed.
      </Banner>
    </div>
  ),
};

/**
 * `dismissLabel` is **required by the type system** whenever `onDismiss` is
 * given — you cannot ship a dismissible Banner whose close button is called
 * "Close". Name the message, not the gesture: on a page with two banners, two
 * controls called "Close" are indistinguishable in a screen reader's list.
 *
 * Dismissal is the caller's state to keep. The component does not hide itself.
 */
export const Dismissible: Story = {
  render: function DismissibleDemo() {
    const [open, setOpen] = React.useState<Record<string, boolean>>({
      info: true,
      success: true,
      warning: true,
      danger: true,
    });
    const anyClosed = TONES.some((tone) => !open[tone]);
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        {TONES.filter((tone) => open[tone]).map((tone) => (
          <Banner
            key={tone}
            tone={tone}
            title={`Dismissible ${tone} banner`}
            onDismiss={() => setOpen((state) => ({ ...state, [tone]: false }))}
            dismissLabel={`Dismiss the ${tone} banner`}
          >
            The close button is named after this message, not after the gesture.
          </Banner>
        ))}
        {anyClosed && (
          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() =>
              setOpen({ info: true, success: true, warning: true, danger: true })
            }
          >
            Bring them back
          </Button>
        )}
      </div>
    );
  },
};

/**
 * Full width, in a page. A Banner belongs to a region of the page and spans it:
 * under the top bar for something workspace-wide, at the top of a form for
 * something about that form, inside a panel for something about that panel.
 * It pushes content down rather than covering it — that is the whole difference
 * from a Toast.
 */
export const InPageContext: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <div className="min-h-96 bg-surface-canvas">
      <div className="flex items-center justify-between border-b border-stroke-subtle bg-surface-elevated px-6 py-4">
        <span className="text-title-sm-semibold text-text-primary">Added Value</span>
        <Button size="sm">New deliverable</Button>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <Banner
          tone="warning"
          title="Two deliverables are missing evidence"
          actionLabel="Review them"
          onAction={() => {}}
          onDismiss={() => {}}
          dismissLabel="Dismiss the missing evidence warning"
        >
          They cannot move to Confirmed prod until a source is attached.
        </Banner>

        <section className="rounded-md border border-stroke-default bg-surface-elevated p-4">
          <h3 className="mb-3 text-title-sm-semibold text-text-primary">Q3 platform migration</h3>
          <div className="flex flex-col gap-3">
            <Banner tone="info" title="This deliverable is read-only">
              It was confirmed in production on 12 August and is now locked.
            </Banner>
            <p className="text-body-sm-regular text-text-secondary">
              Panel content sits below the banner, pushed down rather than covered.
            </p>
          </div>
        </section>
      </div>
    </div>
  ),
};

/**
 * **The live-region case.** A banner that appears in response to an action needs
 * announcing — but the region has to already exist, or the insertion is missed.
 * So the wrapper below is mounted with the form and never unmounts; only the
 * Banner inside it comes and goes, and `live` stays `off` on the Banner itself.
 *
 * Setting `live="polite"` on a Banner that is itself being inserted is the trap:
 * it looks correct and announces nothing. `live` is for a Banner that stays
 * mounted while its message changes.
 */
export const AnnouncedOnAppearance: Story = {
  parameters: { controls: { disable: true } },
  render: function AnnouncedDemo() {
    const [state, setState] = React.useState<'idle' | 'saved' | 'failed'>('idle');
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        {/* Mounted from first paint, empty. This is the live region. */}
        <div role="status" aria-live="polite" aria-atomic="false">
          {state === 'saved' && (
            <Banner
              tone="success"
              title="Deliverable saved"
              onDismiss={() => setState('idle')}
              dismissLabel="Dismiss the save confirmation"
            >
              All changes are stored.
            </Banner>
          )}
          {state === 'failed' && (
            <Banner
              tone="danger"
              title="Save failed"
              actionLabel="Try again"
              onAction={() => setState('saved')}
              onDismiss={() => setState('idle')}
              dismissLabel="Dismiss the save failure"
            >
              We could not reach the server. Nothing was lost.
            </Banner>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => setState('saved')}>
            Save
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setState('failed')}>
            Save and fail
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => setState('idle')}>
            Clear
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * Every colour is a semantic token, so dark comes for free. The fill and content
 * are the `accent.<tone>.tonal` pair Badge already measured; the border is the
 * tone's `outline.content.default`, which clears 3:1 against both page surfaces
 * in both themes — `outline.border.default` would sit at 1.83:1 for `warning`
 * in light, which is why it is not used here.
 */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-96 flex-col gap-3 bg-surface-canvas p-8">
            {TONES.map((tone) => (
              <Banner
                key={tone}
                tone={tone}
                title={`${tone[0].toUpperCase()}${tone.slice(1)} banner`}
                onDismiss={() => {}}
                dismissLabel={`Dismiss the ${tone} banner`}
              >
                The same tonal pair in both themes.
              </Banner>
            ))}
            <Banner
              tone="warning"
              title="With an action"
              actionLabel="Review"
              onAction={() => {}}
            >
              The button takes the tone's own content token, not `action.secondary`.
            </Banner>
          </div>
        </div>
      ))}
    </div>
  ),
};
