import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, type ToastTone } from './Toast';
import { ToastProvider, ToastViewport, useToast } from './ToastProvider';
import { Button } from '../../atoms/button';

const TONES: ToastTone[] = ['info', 'success', 'warning', 'danger'];

const meta = {
  title: 'Components/Feedback/Toast',
  component: Toast,
  parameters: {
    docs: {
      description: {
        component:
          'A **transient** message that appears, says one thing, and goes away. A Toast ' +
          'interrupts nothing: it takes no focus, blocks nothing, and the user is never ' +
          'required to deal with it. Compare `Banner` — persistent, sits in the layout, ' +
          'stays until dismissed or until the condition clears.\n\n' +
          '**The `Toast` element carries no live region.** The role lives on ' +
          '`ToastViewport`, which is mounted with the app and is empty until a toast ' +
          'arrives — a region inserted alongside its first message is announced late or ' +
          'not at all. Raise toasts through `ToastProvider` / `useToast()` and this is ' +
          'handled for you; the hook throws if the provider is missing.',
      },
    },
  },
  args: {
    tone: 'info',
    title: 'Draft saved',
    children: 'Your changes are safe. Nothing else to do.',
  },
  argTypes: {
    tone: { control: 'select', options: TONES },
    duration: { control: false },
    onDismiss: { control: false },
    onAction: { control: false },
    onPauseChange: { control: false },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Four tones, four `accent.*` families — and four different glyph *shapes*, so
 * the tone survives greyscale, a colour vision deficiency, and a screenshot.
 * Each glyph also carries the tone as its accessible name ("Error", "Warning"),
 * so it survives into the announcement too. Colour is never the only signal.
 */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Toast {...args} tone="info" title="Export queued">
        You will get a link when it finishes.
      </Toast>
      <Toast {...args} tone="success" title="Deliverable accepted">
        Moved to Confirmed prod.
      </Toast>
      <Toast {...args} tone="warning" title="Evidence is out of date">
        Last refreshed 41 days ago.
      </Toast>
      <Toast {...args} tone="danger" title="Save failed">
        We could not reach the server. Nothing was lost.
      </Toast>
    </div>
  ),
};

/**
 * A Toast with an action **never auto-dismisses**, whatever `duration` says.
 * Racing a countdown to reach a control fails WCAG 2.2.1, so the component
 * ignores the timer entirely once `actionLabel` is present — note the absence
 * of `data-duration` on the element.
 *
 * The action is a real `Button` rendered by the component, not a slot: on a
 * tonal fill it needs the tone's own content token to stay above 4.5:1, and a
 * caller passing a plain `<Button>` would not know that.
 */
export const WithAction: Story = {
  args: {
    tone: 'danger',
    title: 'Upload failed',
    children: 'evidence-q3.pdf did not finish uploading.',
    actionLabel: 'Retry',
    onAction: () => {},
    duration: 4000,
    onDismiss: () => {},
    dismissLabel: 'Dismiss the upload failure',
  },
};

/**
 * `onDismiss` renders the close control. It is an `IconButton`, so it already
 * requires a name — and the name defaults to `Dismiss: <title>` rather than a
 * bare "Close", which says nothing in a list of controls.
 *
 * The target is 40 square. Negative margins pull it into the toast's padding so
 * the box stays compact without shrinking the hit area.
 */
export const Dismissible: Story = {
  args: { onDismiss: () => {} },
  render: (args) => (
    <div className="flex flex-col gap-3">
      {TONES.map((tone) => (
        <Toast {...args} key={tone} tone={tone} title={`Dismissible ${tone} toast`}>
          The close button is named after the message, not after the gesture.
        </Toast>
      ))}
    </div>
  ),
};

/**
 * **WCAG 2.2.1, demonstrated.** The toast below is on an eight-second timer.
 * Hover it, or tab into its close button, and the countdown stops; leave and it
 * resumes *with the time that was left* rather than starting over. Switching to
 * another browser tab pauses it too.
 *
 * The readout is driven by the component's own `onPauseChange`, so what you see
 * is the component's real state — the toast also reports it as `data-paused` on
 * the element.
 */
export const AutoDismissPausesOnHover: Story = {
  parameters: { controls: { disable: true } },
  render: function AutoDismissDemo() {
    const DURATION = 8000;
    const [visible, setVisible] = React.useState(true);
    const [paused, setPaused] = React.useState(false);
    const [remaining, setRemaining] = React.useState(DURATION);

    React.useEffect(() => {
      if (!visible || paused) return;
      const id = window.setInterval(
        () => setRemaining((value) => Math.max(0, value - 100)),
        100,
      );
      return () => window.clearInterval(id);
    }, [visible, paused]);

    const restart = () => {
      setRemaining(DURATION);
      setPaused(false);
      setVisible(true);
    };

    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex items-center gap-3 text-label-md text-text-secondary">
          <span data-testid="toast-timer-readout">
            {visible ? `${(remaining / 1000).toFixed(1)}s left` : 'dismissed'}
          </span>
          <span
            data-testid="toast-pause-readout"
            className={
              paused
                ? 'text-accent-warning-outline-content-default'
                : 'text-accent-success-outline-content-default'
            }
          >
            {paused ? 'PAUSED — hover or focus is holding the timer' : 'running'}
          </span>
        </div>

        {visible ? (
          <Toast
            tone="success"
            title="Deliverable submitted"
            duration={DURATION}
            onDismiss={() => setVisible(false)}
            dismissLabel="Dismiss the submission confirmation"
            onPauseChange={setPaused}
          >
            Hover me, or tab to the close button, and the countdown stops.
          </Toast>
        ) : (
          <Button variant="secondary" onClick={restart}>
            Show it again
          </Button>
        )}
      </div>
    );
  },
};

/**
 * Several at once. Note that the two live regions keep `danger` apart from the
 * rest: errors go to the assertive region, everything else to the polite one,
 * so a confirmation never interrupts and an error never waits its turn. The
 * cost is that a mixed batch is not in strict arrival order on screen.
 */
export const Stacked: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <div className="min-h-96 bg-surface-canvas p-8">
      <ToastViewport
        position="bottom-right"
        toasts={[
          { id: '1', tone: 'info', title: 'Export queued', description: 'Two files.' },
          {
            id: '2',
            tone: 'success',
            title: 'Deliverable accepted',
            description: 'Moved to Confirmed prod.',
          },
          {
            id: '3',
            tone: 'warning',
            title: 'Evidence is out of date',
            description: 'Last refreshed 41 days ago.',
          },
          {
            id: '4',
            tone: 'danger',
            title: 'Save failed',
            description: 'We could not reach the server.',
            duration: null,
          },
        ]}
        onDismiss={() => {}}
      />
    </div>
  ),
};

/**
 * The supported path end to end. `ToastProvider` renders your app, then the
 * viewport — so both live regions are in the page before anything is raised,
 * and the viewport sits *after* the content in the DOM, which is why a keyboard
 * user reaches the close button after the page rather than being dropped into
 * it. Focus is never moved to a toast.
 *
 * Inspect the DOM before pressing anything: the two regions are already there
 * and empty. That is the entire design.
 */
export const WithProvider: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <ToastProvider position="bottom-right">
      <div className="flex min-h-96 flex-col gap-4 bg-surface-canvas p-8">
        <p className="text-body-md text-text-secondary">
          The polite and assertive regions are already in the DOM, empty, below this
          content.
        </p>
        <ToastTriggers />
      </div>
    </ToastProvider>
  ),
};

function ToastTriggers() {
  const { toast, dismissAll } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({ tone: 'success', title: 'Draft saved', description: 'Nothing to do.' })
        }
      >
        Polite toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({
            tone: 'danger',
            title: 'Save failed',
            description: 'We could not reach the server.',
            actionLabel: 'Retry',
            onAction: () => {},
            dismissLabel: 'Dismiss the save failure',
          })
        }
      >
        Assertive toast, with an action
      </Button>
      <Button variant="tertiary" size="sm" onClick={dismissAll}>
        Dismiss all
      </Button>
    </div>
  );
}

/**
 * Every colour is a semantic token, so dark comes for free. The tonal fill and
 * content pair is the one Badge already measured; the border is the tone's
 * `outline.content.default`, which clears 3:1 against the page in both themes
 * so a floating toast always has a visible edge.
 */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-96 flex-col gap-3 bg-surface-canvas p-8">
            {TONES.map((tone) => (
              <Toast
                key={tone}
                tone={tone}
                title={`${tone[0].toUpperCase()}${tone.slice(1)} toast`}
                onDismiss={() => {}}
                dismissLabel={`Dismiss the ${tone} toast`}
              >
                The same tonal pair in both themes.
              </Toast>
            ))}
            <Toast
              tone="danger"
              title="Save failed"
              actionLabel="Retry"
              onAction={() => {}}
              onDismiss={() => {}}
              dismissLabel="Dismiss the save failure"
            >
              With an action, so it never auto-dismisses.
            </Toast>
          </div>
        </div>
      ))}
    </div>
  ),
};
