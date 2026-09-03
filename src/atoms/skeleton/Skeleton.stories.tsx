import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';
import { Button } from '../button';

const meta = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'A content placeholder shown while data loads. It holds the shape of the content that ' +
          'is about to arrive, so nothing jumps when it lands. The block itself is decorative ' +
          'and always `aria-hidden` — the loading state has to be announced by a live region on ' +
          'the container around it. See the "Announcing the load" story: that pattern is the ' +
          'point of this component, not the shimmer.',
      },
    },
  },
  argTypes: {
    radius: { control: 'radio', options: ['sm', 'md', 'pill'] },
    textStyle: {
      control: 'select',
      options: [
        'title-sm',
        'body-lg',
        'body-md',
        'body-sm',
        'label-lg',
        'label-md',
        'label-sm',
        'caption-md',
        'caption-sm',
      ],
    },
    lines: { control: { type: 'number', min: 1, max: 8 } },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One bar, full width of its parent, as tall as a line of `body-md` text. */
export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** An explicit `width`/`height` for content the token scale does not know about. */
export const Block: Story = {
  name: 'Single block',
  render: (args) => <Skeleton {...args} width={320} height={160} radius="md" />,
};

/** `circle` squares the block with `width` and rounds it to `shape.radius.pill`. */
export const Circle: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Skeleton {...args} circle width={24} />
      <Skeleton {...args} circle width={32} />
      <Skeleton {...args} circle />
      <Skeleton {...args} circle width={64} />
    </div>
  ),
};

/**
 * `lines` stacks N rows with the last one short. Each row is exactly one line
 * box of `textStyle`: the row is the ramp's line-height, the bar inside is the
 * ramp's font-size. Three `body-md` lines therefore occupy precisely the height
 * of three lines of body-md copy — nothing shifts when the text arrives.
 */
export const Lines: Story = {
  name: 'Multi-line',
  render: (args) => (
    <div className="flex w-96 flex-col gap-6">
      {(['body-lg', 'body-md', 'body-sm', 'caption-sm'] as const).map((step) => (
        <div key={step}>
          <p className="mb-2 text-label-sm text-text-subtle">{step}</p>
          <Skeleton {...args} lines={3} textStyle={step} />
        </div>
      ))}
    </div>
  ),
};

/** The same three lines, next to the real copy they stand in for. */
export const MatchesTheTypeRamp: Story = {
  name: 'Matches the type ramp',
  render: (args) => (
    <div className="flex gap-8">
      <div className="w-72">
        <Skeleton {...args} lines={3} textStyle="body-md" />
      </div>
      <p className="w-72 text-body-md text-text-primary">
        The rows are one line box tall each, so the placeholder and the copy occupy the same
        vertical space. Swapping one for the other moves nothing on the page, which is the
        whole reason to use a skeleton rather than a spinner.
      </p>
    </div>
  ),
};

/** Avatar plus a title line and a paragraph — the shape most cards actually need. */
export const Card: Story = {
  name: 'Card placeholder',
  render: (args) => (
    <div className="w-96 rounded-md border border-stroke-subtle bg-surface-elevated p-4">
      <div className="flex items-start gap-3">
        <Skeleton {...args} circle width={40} />
        <div className="flex-1">
          <Skeleton {...args} textStyle="title-sm" width="55%" />
          <div className="mt-1">
            <Skeleton {...args} lines={3} textStyle="body-sm" />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Skeleton {...args} height={120} radius="md" />
      </div>
    </div>
  ),
};

/**
 * **The pattern everyone gets wrong.** The Skeleton is `aria-hidden`, so on its
 * own it announces nothing at all — a screen-reader user gets silence while the
 * page waits. The loading state belongs on the *container*: a polite live region
 * with `aria-busy`, holding a visually hidden "Loading …" message next to the
 * skeleton. When the data lands, both are replaced by the real content in the
 * same region, and the live region announces it. Toggle it and listen.
 */
export const AnnouncingTheLoad: Story = {
  name: 'Announcing the load (live region)',
  render: (args) => {
    const [loading, setLoading] = React.useState(true);
    return (
      <div className="flex w-96 flex-col items-start gap-4">
        <Button size="sm" variant="secondary" onClick={() => setLoading((v) => !v)}>
          {loading ? 'Finish loading' : 'Load again'}
        </Button>

        <div
          aria-live="polite"
          aria-busy={loading}
          className="w-full rounded-md border border-stroke-subtle bg-surface-elevated p-4"
        >
          {loading ? (
            <>
              {/* Heard, not seen. Without this the region is silent while busy. */}
              <span className="sr-only">Loading activity…</span>
              {/* Seen, not heard. */}
              <Skeleton {...args} textStyle="title-sm" width="45%" />
              <div className="mt-2">
                <Skeleton {...args} lines={3} textStyle="body-md" />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-title-sm text-text-primary">Recent activity</h3>
              <p className="mt-2 text-body-md text-text-secondary">
                Priya moved two deliverables into review, and the November forecast was
                approved. Nothing else has changed since your last visit.
              </p>
            </>
          )}
        </div>
      </div>
    );
  },
};

/**
 * The pulse is dropped entirely under `prefers-reduced-motion: reduce` — a large
 * animated block is a vestibular trigger. The static fill still reads as a
 * placeholder, so nothing is lost. Turn the OS setting on and reload to compare.
 */
export const ReducedMotion: Story = {
  name: 'Reduced motion',
  render: (args) => (
    <div className="flex w-96 flex-col gap-2">
      <p className="text-body-sm text-text-secondary">
        With “reduce motion” on, this block holds a flat `surface.neutral.medium` fill instead
        of pulsing.
      </p>
      <Skeleton {...args} height={80} radius="md" />
    </div>
  ),
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    const panel = (
      <div className="flex flex-col gap-4 bg-surface-canvas p-6">
        {/* On the canvas as well as on an elevated card — the fill has to read on both. */}
        <div className="flex items-start gap-3">
          <Skeleton {...args} circle width={40} />
          <div className="flex-1">
            <Skeleton {...args} lines={2} textStyle="body-md" />
          </div>
        </div>
        <div className="rounded-md bg-surface-elevated p-4">
          <Skeleton {...args} lines={2} textStyle="body-md" />
        </div>
      </div>
    );
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full">{panel}</div>
        <div className="dark w-full">{panel}</div>
      </div>
    );
  },
};
