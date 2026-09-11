import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from './AppShell';
import { Sidebar, type SidebarUserType } from '../../patterns/sidebar';
import { TopBar } from '../../patterns/top-bar';
import { AVHeader } from '../../patterns/av-header';
import { PageTitle } from '../../components/page-title';
import { StatCard } from '../../components/stat-card';
import { EmptyState } from '../../components/empty-state';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Footer } from '../../atoms/footer';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

/* One rail with real state, so navigating and collapsing work in the story. */
const Rail = ({ userType = 'user', collapsed: initial = false }: { userType?: SidebarUserType; collapsed?: boolean }) => {
  const [active, setActive] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(initial);
  return (
    <Sidebar
      userType={userType}
      active={active}
      onNavigate={setActive}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((c) => !c)}
    />
  );
};

const Bar = () => (
  <TopBar
    primaryAction={<Button>Create Added Value</Button>}
    notifications={3}
    user={{ name: 'Eve Kestrel' }}
    onUserMenu={() => {}}
  />
);

/**
 * Page content, as plain markup. The shell frames whatever it is handed, and
 * these stories are about the frame — so they carry no component of their own
 * beyond the pieces being demonstrated.
 */
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-md border border-stroke-default bg-surface-elevated p-4">
    <h2 className="mb-1 text-heading-sm text-text-primary">{title}</h2>
    <div className="text-body-md text-text-secondary">{children}</div>
  </section>
);

const Stats = () => (
  <div className="grid grid-cols-3 gap-4 py-6">
    <StatCard label="My Added Values" value="12" delta="+3" deltaTone="positive" icon={<Icon name="lightbulb" />} />
    <StatCard label="Assigned to me" value="4" icon={<Icon name="assigned-value" />} />
    <StatCard label="In review" value="2" delta="−1" deltaTone="neutral" icon={<Icon name="archive" />} />
  </div>
);

const meta = {
  title: 'Templates/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The design system’s first template — the whole-screen frame every signed-in page sits ' +
          'in. Read off the Figma `Page_Template`: the rail at full height down the left, the app ' +
          'bar across the top of what remains, the title band and body beneath, and the copyright ' +
          'line at the end. The rail, the bar and the title band are **slots**, so each piece keeps ' +
          'its own API and the shell owns only the geometry. `Footer` is the one piece it places ' +
          'itself.',
      },
    },
  },
  /* A `user`'s dashboard. Every story starts from this and swaps a slot. */
  args: {
    sidebar: <Rail />,
    topBar: <Bar />,
    header: <PageTitle title="Dashboard" subtitle="Everything you own, and everything waiting on you." />,
    children: (
      <>
        <Stats />
        <Panel title="Recent activity">Nothing yet this cycle.</Panel>
      </>
    ),
  },
  argTypes: {
    sidebar: { control: false },
    topBar: { control: false },
    header: { control: false },
    footer: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A `user`'s dashboard. Short content, so the footer sits at the bottom of the
 * viewport rather than under the last card — the scroll region fills what the
 * bar leaves.
 */
export const Default: Story = {};

/**
 * An Added Value's page: `AVHeader` in the `header` slot instead of
 * `PageTitle`. Either fits, which is why the band is a slot — whether the two
 * are one component is a question for design, not for the shell.
 */
export const WithAVHeader: Story = {
  args: {
    sidebar: <Rail userType="admin" />,
    topBar: <Bar />,
    header: (
      <AVHeader
        title="VCP-1234"
        onBack={() => {}}
        backLabel="Back to my Added Values"
        role="assignee-initiator"
        status="Draft"
      />
    ),
    children: (
      <Panel title="Description">
        Cut the onboarding form from nine fields to four and defer the rest to first use.
      </Panel>
    ),
  },
};

/** The 76-wide rail. The toggle straddles the rail's edge, over the bar. */
export const CollapsedRail: Story = {
  args: { sidebar: <Rail collapsed /> },
};

/**
 * A page taller than the viewport. The rail and the bar stay where they are;
 * the title band, body and footer scroll together beneath them.
 */
export const LongPage: Story = {
  args: {
    sidebar: <Rail userType="admin-dev" />,
    topBar: <Bar />,
    header: <PageTitle title="Task Log Trail" />,
    children: (
      <div className="flex flex-col gap-4 py-6">
        {Array.from({ length: 14 }, (_, i) => (
          <Panel key={i} title={`VCP-${1200 + i}`}>
            Moved to For Review by Eve Kestrel.
          </Panel>
        ))}
      </div>
    ),
  },
};

/** A page with nothing in it yet. `EmptyState` does the talking; the shell just holds it. */
export const EmptyPage: Story = {
  args: {
    sidebar: <Rail />,
    topBar: <Bar />,
    header: <PageTitle title="Drafts" />,
    children: (
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          headingLevel={2}
          icon={<Icon name="file" size="lg" />}
          title="No drafts"
          description="An Added Value you start and don't submit waits here."
          action={<Button>Create Added Value</Button>}
        />
      </div>
    ),
  },
};

/** The footer slot: a pinned year for a snapshot, or `null` for none at all. */
export const CustomFooter: Story = {
  args: { footer: <Footer year={2026} /> },
};

/** Every fill is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: {
    controls: { disable: true },
    ...SIDE_BY_SIDE,
  },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <AppShell
            sidebar={<Sidebar userType="admin" active="my-values" />}
            topBar={<TopBar notifications={0} user={{ name: 'Eve Kestrel' }} />}
            header={<PageTitle title="My Values" />}
            footer={<Footer year={2026} />}
          >
            <Stats />
          </AppShell>
        </div>
      ))}
    </div>
  ),
};
