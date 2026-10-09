import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { PageTitle } from './PageTitle';
import { Button } from '../../atoms/button';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

const meta = {
  title: 'Components/Navigation/PageTitle',
  component: PageTitle,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The band under the top bar that says which page you are on. Read off the Figma ' +
          '`Page_Template` → `Page_Title`: 75 tall, inset 32 each side, 32 above and 16 below. ' +
          'It carries the page’s one `h1` — `TopBar` deliberately has no heading so this can.',
      },
    },
  },
  args: { title: 'My Added Values' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof PageTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-40 bg-surface-canvas">{children}</div>
);

/** A list page: a title and nothing else. This is the common case. */
export const Default: Story = {
  render: (args) => (
    <Page>
      <PageTitle {...args} />
    </Page>
  ),
};

/** The subtitle is a real layer in the design, hidden on pages that skip it. */
export const WithSubtitle: Story = {
  args: { subtitle: 'Everything you have raised, across every domain' },
  render: (args) => (
    <Page>
      <PageTitle {...args} />
    </Page>
  ),
};

/**
 * Back as a real link — middle-click and open-in-new-tab work. The label says
 * where it goes, because "Back" tells a screen-reader user nothing.
 */
export const WithBack: Story = {
  args: { title: 'VCP-12345', backHref: '#values', backLabel: 'Back to my Added Values' },
  /* The back control and the title share a centre line. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const back = canvas.getByRole(args.backHref ? 'link' : 'button', { name: args.backLabel });
    const title = canvas.getByRole('heading', { level: 1 });
    const centre = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    };
    await expect(Math.abs(centre(back) - centre(title))).toBeLessThan(1);
    /* The arrow hugs its 20 glyph, with 8 between it and the title. */
    const box = back.getBoundingClientRect();
    await expect(box.width).toBe(20);
    await expect(box.height).toBe(20);
    await expect(Math.round(title.getBoundingClientRect().left - box.right)).toBe(8);
    /* The default title is 18 semibold. */
    await expect(getComputedStyle(title).fontSize).toBe('18px');
    await expect(getComputedStyle(title).fontWeight).toBe('600');
  },
  render: (args) => (
    <Page>
      <PageTitle {...args} />
    </Page>
  ),
};

/**
 * The small title: 14 medium, for pages that want a quieter band. The default
 * is 18 semibold. Both are `text.secondary`.
 */
export const SmallTitle: Story = {
  args: { title: 'VCP-12345', backHref: '#values', backLabel: 'Back to my Added Values', size: 'sm' },
  render: (args) => (
    <Page>
      <PageTitle {...args} />
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const title = within(canvasElement).getByRole('heading', { level: 1 });
    await expect(getComputedStyle(title).fontSize).toBe('14px');
    await expect(getComputedStyle(title).fontWeight).toBe('500');
  },
};

/** Back as history, for the cases where there is genuinely no URL. */
export const BackAsAction: Story = {
  args: { title: 'VCP-12345', onBack: () => {}, backLabel: 'Back to my Added Values' },
  /* The back control and the title share a centre line. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const back = canvas.getByRole(args.backHref ? 'link' : 'button', { name: args.backLabel });
    const title = canvas.getByRole('heading', { level: 1 });
    const centre = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    };
    await expect(Math.abs(centre(back) - centre(title))).toBeLessThan(1);
  },
  render: (args) => (
    <Page>
      <PageTitle {...args} />
    </Page>
  ),
};

/**
 * Actions sit on the right. Note the page's *primary* CTA does not belong
 * here — in `Page_Template` "Create Added Value" lives in the top bar.
 */
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button variant="secondary" size="sm">
          Export
        </Button>
        <Button variant="secondary" size="sm">
          Report a problem
        </Button>
      </>
    ),
  },
  render: (args) => (
    <Page>
      <PageTitle {...args} />
    </Page>
  ),
};

/** A long title truncates rather than wrapping, so the actions keep their row. */
export const LongTitle: Story = {
  args: {
    title: '[VCP] Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard',
    backHref: '#values',
    actions: (
      <Button variant="secondary" size="sm">
        Export
      </Button>
    ),
  },
  render: (args) => (
    <div className="w-[720px] bg-surface-canvas">
      <PageTitle {...args} />
    </div>
  ),
};

/** Every colour is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { ...SIDE_BY_SIDE },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="min-h-40 bg-surface-canvas">
            <PageTitle {...args} subtitle="Across every domain" />
          </div>
        </div>
      ))}
    </div>
  ),
};
