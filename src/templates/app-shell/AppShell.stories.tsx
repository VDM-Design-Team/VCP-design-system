import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
/* Storybook's own hook, not React's: the Playground's render writes its args
   back when the rail's toggle or the bar's mode switch is pressed. */
import { useArgs } from 'storybook/preview-api';
import { AppShell } from './AppShell';
import { Sidebar, type SidebarUserType } from '../../patterns/sidebar';
import { NAV_BY_USER_TYPE } from '../../patterns/sidebar/Sidebar';
import { TopBar } from '../../patterns/top-bar';
import { AVHeader } from '../../patterns/av-header';
import { PageTitle } from '../../components/page-title';
import { AV_STATUSES, type AVStatus } from '../../components/status-tag';
import type { AVProgressionRole } from '../../components/status-progression';
import { StatCard } from '../../components/stat-card';
import { EmptyState } from '../../components/empty-state';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Footer } from '../../atoms/footer';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';
import { useToolbarTheme } from '../../lib/story-theme';

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

/* The bar's light/dark switch is linked to Storybook's own theme control, both ways. */
const Bar = () => {
  const theme = useToolbarTheme();
  return (
    <TopBar
      primaryAction={<Button>Create Added Value</Button>}
      notifications={3}
      user={{ name: 'Eve Kestrel' }}
      onUserMenu={() => {}}
      {...theme}
    />
  );
};

/**
 * Page content, as plain markup. The shell frames whatever it is handed, and
 * these stories are about the frame — so they carry no component of their own
 * beyond the pieces being demonstrated.
 */
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-md border border-stroke-default bg-surface-elevated p-4">
    <h2 className="mb-1 text-title-sm-semibold text-text-primary">{title}</h2>
    <div className="text-body-sm-regular text-text-secondary">{children}</div>
  </section>
);

/* The dashboard's Value_Cards (Figma "Value Cards"): a title and a number, with the
   stripe in the status's tone. A StatCard is at least 16.5rem wide; `flex-1` lets
   the cards share the row, and when they no longer fit the flex container wraps
   the rest onto the next row. */
const Stats = () => (
  <div className="flex flex-wrap gap-4 py-6">
    <StatCard className="flex-1" label="Completed" value="12" accent="success" />
    <StatCard className="flex-1" label="In Review" value="6" accent="brand" />
    <StatCard className="flex-1" label="Overdue" value="3" accent="critical" />
    <StatCard className="flex-1" label="In Progress" value="8" accent="brand" />
    <StatCard className="flex-1" label="Pending" value="4" accent="warning" />
    <StatCard className="flex-1" label="Draft" value="5" accent="neutral" />
  </div>
);

/* A page taller than the viewport. */
const LongBody = () => (
  <div className="flex flex-col gap-4 py-6">
    {Array.from({ length: 14 }, (_, i) => (
      <Panel key={i} title={`VCP-${1200 + i}`}>
        Moved to For Review by Eve Kestrel.
      </Panel>
    ))}
  </div>
);

/* A page with nothing in it yet. */
const EmptyBody = () => (
  <div className="flex flex-1 items-center justify-center py-16">
    <EmptyState
      headingLevel={2}
      icon={<Icon name="file" size="lg" />}
      title="No drafts"
      description="An Added Value you start and don't submit waits here."
      action={<Button>Create Added Value</Button>}
    />
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

/* The Development domain's chain, as AVHeader's own stories carry it: the one
   way to show an AV on a domain step rather than a spine status. */
const DEVELOPMENT = [
  { id: 'for-review', label: 'For review' },
  { id: 'for-qa', label: 'For QA' },
  { id: 'in-qa', label: 'In QA' },
  { id: 'ready-for-deploy', label: 'Ready for deploy' },
  { id: 'confirmed-prod', label: 'Confirmed prod' },
];

/**
 * The Playground's controls. Each is a version a piece already ships — a prop
 * value or a preset — never a prop of the shell's own: the shell forwards
 * nothing, so the story builds each slot and hands it over.
 */
interface PlaygroundArgs {
  theme?: 'light' | 'dark';
  userType: SidebarUserType;
  collapsed: boolean;
  openGroups: boolean;
  domainSelector: boolean;
  barLeft: 'action' | 'linked-logo' | 'logo' | 'empty';
  bell: 'unread' | 'read' | 'hidden';
  modeSwitch: boolean;
  account: 'menu' | 'own-menu' | 'name' | 'none';
  titleBand: 'page-title' | 'av-header' | 'none';
  titleSize: 'md' | 'sm';
  subtitle: boolean;
  back: boolean;
  titleActions: boolean;
  avType: 'default' | 'new';
  avRole: AVProgressionRole;
  avWhere: AVStatus | 'for-review';
  avStatusActions: boolean;
  page: 'dashboard' | 'long' | 'empty';
  pageFooter: 'system' | 'pinned' | 'none';
}

/* The rail keeps which row is current and which domain is picked, so both work
   in the story. Keyed by the caller on the user type and `openGroups`, so a
   switch starts that rail afresh: `defaultOpen` is only a starting state. */
const PlaygroundRail = ({
  userType,
  collapsed,
  openGroups,
  domainSelector,
  onToggleCollapse,
}: Pick<PlaygroundArgs, 'userType' | 'collapsed' | 'openGroups' | 'domainSelector'> & {
  onToggleCollapse: () => void;
}) => {
  const [active, setActive] = React.useState('dashboard');
  const [domain, setDomain] = React.useState('Design');
  return (
    <Sidebar
      userType={userType}
      active={active}
      onNavigate={setActive}
      defaultOpen={
        openGroups
          ? NAV_BY_USER_TYPE[userType].filter((i) => i.items?.length).map((i) => i.key)
          : undefined
      }
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      showDomainSelector={domainSelector}
      domain={domain}
      domains={['Design', 'Development']}
      onDomainChange={setDomain}
    />
  );
};

const PAGE_TITLES: Record<PlaygroundArgs['page'], string> = {
  dashboard: 'Dashboard',
  long: 'Task Log Trail',
  empty: 'Drafts',
};

const radio = (category: string, labels?: Record<string, string>) => ({
  control: labels ? { type: 'radio' as const, labels } : ('boolean' as const),
  table: { category },
});
const select = (category: string, labels: Record<string, string>) => ({
  options: Object.keys(labels),
  control: { type: 'select' as const, labels },
  table: { category },
});

/**
 * **Every version of every piece, from the Controls panel.** The rail's user
 * type and width, the bar's left side, bell and account chip, which band names
 * the page and how, the page itself, the footer, and the theme. Each control
 * maps to a prop or preset its piece already has — see `docs/app-shell.md`.
 *
 * The rail's toggle and the bar's mode switch write back to the controls. The
 * theme follows the toolbar until a value is picked here; then this story's
 * control wins. Kept off the Docs page, where it would re-theme every story
 * beside it, and out of Chromatic: as it opens it is `Default`.
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  tags: ['!autodocs'],
  parameters: {
    chromatic: { disableSnapshot: true },
    controls: {
      expanded: true,
      /* The shell's own slots take elements, which a control can't build;
         every control here builds one. Matched on the shown name. */
      exclude: ['sidebar', 'topBar', 'header', 'children', 'footer'],
    },
  },
  /* As `Default` opens, plus the bar's mode switch, so the theme can be
     flipped from the page as well as from here. */
  args: {
    userType: 'user',
    collapsed: false,
    openGroups: false,
    domainSelector: false,
    barLeft: 'action',
    bell: 'unread',
    modeSwitch: true,
    account: 'own-menu',
    titleBand: 'page-title',
    titleSize: 'md',
    subtitle: true,
    back: false,
    titleActions: false,
    avType: 'default',
    avRole: 'assignee-initiator',
    avWhere: 'Draft',
    avStatusActions: true,
    page: 'dashboard',
    pageFooter: 'system',
  },
  argTypes: {
    theme: {
      name: 'Theme',
      description: 'Follows the toolbar until you pick one here.',
      options: ['light', 'dark'],
      ...radio('Theme', { light: 'Light', dark: 'Dark' }),
    },
    userType: {
      name: 'User type',
      description: 'Which of the four rails the design draws (`userType`).',
      ...select('Sidebar', {
        user: 'User',
        admin: 'Admin',
        'admin-dev': 'Admin Dev',
        'super-admin': 'Super Admin',
      }),
    },
    collapsed: { name: 'Collapsed', description: 'The 76-wide rail (`collapsed`).', ...radio('Sidebar') },
    openGroups: {
      name: 'Groups open',
      description: 'Archive and Planning start open (`defaultOpen`). Super Admin has none.',
      if: { arg: 'userType', neq: 'super-admin' },
      ...radio('Sidebar'),
    },
    domainSelector: {
      name: 'Domain switcher',
      description: 'Off in the design by default (`showDomainSelector`).',
      ...radio('Sidebar'),
    },
    barLeft: {
      name: 'Left side',
      description: '`primaryAction`, the logo with or without `homeHref`, or `showLeftSide={false}`.',
      ...select('Top bar', {
        action: 'Create Added Value button',
        'linked-logo': 'Logo, linked home',
        logo: 'Logo, not linked',
        empty: 'Empty',
      }),
    },
    bell: {
      name: 'Bell',
      description: '`notifications`: a count shows the dot; leave it out and there is no bell.',
      ...select('Top bar', { unread: '3 unread', read: 'Nothing unread', hidden: 'No bell' }),
    },
    modeSwitch: {
      name: 'Mode switch',
      description: 'The light/dark Toggle (`theme`). Flipping it changes the theme.',
      ...radio('Top bar'),
    },
    account: {
      name: 'Account',
      description:
        '`onUserMenuSelect` (the built-in menu), `onUserMenu` (the app opens its own), a `user` alone, or none.',
      ...select('Top bar', {
        menu: 'Account menu',
        'own-menu': "Button for the app's own menu",
        name: 'Name only',
        none: 'No user',
      }),
    },
    titleBand: {
      name: 'Title band',
      description: 'The `header` slot: `PageTitle`, `AVHeader`, or nothing.',
      ...select('Page header', { 'page-title': 'PageTitle', 'av-header': 'AVHeader', none: 'None' }),
    },
    titleSize: {
      name: 'Size',
      description: "PageTitle's `size`.",
      options: ['md', 'sm'],
      if: { arg: 'titleBand', eq: 'page-title' },
      ...radio('Page header', { md: 'md — 18 semibold', sm: 'sm — 14 medium' }),
    },
    subtitle: {
      name: 'Subtitle',
      if: { arg: 'titleBand', eq: 'page-title' },
      ...radio('Page header'),
    },
    back: {
      name: 'Back link',
      description: "PageTitle's `backHref`.",
      if: { arg: 'titleBand', eq: 'page-title' },
      ...radio('Page header'),
    },
    titleActions: {
      name: 'Actions',
      description: "PageTitle's `actions`.",
      if: { arg: 'titleBand', eq: 'page-title' },
      ...radio('Page header'),
    },
    avType: {
      name: 'AV type',
      description: "AVHeader's `type`: an existing AV by id, or a new one in words.",
      options: ['default', 'new'],
      if: { arg: 'titleBand', eq: 'av-header' },
      ...radio('Page header', { default: 'Default', new: 'New' }),
    },
    avRole: {
      name: 'Role',
      description: 'Who is looking — it decides the status buttons (`role`).',
      if: { arg: 'titleBand', eq: 'av-header' },
      ...select('Page header', {
        assignee: 'Assignee',
        initiator: 'Initiator',
        'assignee-initiator': 'Assignee and initiator',
        admin: 'Admin',
      }),
    },
    avWhere: {
      name: 'Status',
      description: 'A spine `status`, or a domain `step` on the Development chain.',
      if: { arg: 'titleBand', eq: 'av-header' },
      ...select('Page header', {
        ...Object.fromEntries(AV_STATUSES.map((s) => [s, s])),
        'for-review': 'Development step: For review',
      }),
    },
    avStatusActions: {
      name: 'Status buttons',
      description: "AVHeader's `showStatusActions`.",
      if: { arg: 'titleBand', eq: 'av-header' },
      ...radio('Page header'),
    },
    page: {
      name: 'Content',
      description: 'What is in `children`.',
      ...select('Page', { dashboard: 'Dashboard', long: 'Long page (scrolls)', empty: 'Empty page' }),
    },
    pageFooter: {
      name: 'Footer',
      description: 'The `footer` slot: the default, your own, or `null`.',
      ...select('Page', { system: 'System footer', pinned: 'Footer, year pinned to 2026', none: 'None (null)' }),
    },
  },
  /* After the toolbar's decorator, so a picked theme wins in this story. On
     <html>, like the toolbar's, so the account menu's portal follows it. */
  decorators: [
    (Story, { args, globals }) => {
      document.documentElement.classList.toggle('dark', (args.theme ?? globals.theme) === 'dark');
      return Story();
    },
  ],
  render: function Render(args, { globals }) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const theme = args.theme ?? (globals.theme === 'dark' ? 'dark' : 'light');
    const title = PAGE_TITLES[args.page];
    return (
      <AppShell
        sidebar={
          <PlaygroundRail
            key={`${args.userType}-${args.openGroups}`}
            userType={args.userType}
            collapsed={args.collapsed}
            openGroups={args.openGroups}
            domainSelector={args.domainSelector}
            onToggleCollapse={() => updateArgs({ collapsed: !args.collapsed })}
          />
        }
        topBar={
          <TopBar
            primaryAction={args.barLeft === 'action' ? <Button>Create Added Value</Button> : undefined}
            showLeftSide={args.barLeft !== 'empty'}
            homeHref={args.barLeft === 'linked-logo' ? '#home' : undefined}
            notifications={{ unread: 3, read: 0, hidden: undefined }[args.bell]}
            onNotifications={() => {}}
            theme={args.modeSwitch ? theme : undefined}
            onThemeChange={(next) => updateArgs({ theme: next })}
            user={args.account === 'none' ? undefined : { name: 'Eve Kestrel' }}
            onUserMenu={args.account === 'own-menu' ? () => {} : undefined}
            onUserMenuSelect={args.account === 'menu' ? () => {} : undefined}
          />
        }
        header={
          args.titleBand === 'page-title' ? (
            <PageTitle
              title={title}
              size={args.titleSize}
              subtitle={args.subtitle ? 'Everything you own, and everything waiting on you.' : undefined}
              backHref={args.back ? '#home' : undefined}
              backLabel={args.back ? 'Back to my Added Values' : undefined}
              actions={
                args.titleActions ? (
                  <Button variant="secondary" size="sm">
                    Export
                  </Button>
                ) : undefined
              }
            />
          ) : args.titleBand === 'av-header' ? (
            <AVHeader
              type={args.avType}
              title={args.avType === 'new' ? 'Added Value Creation' : 'VCP-1234'}
              onBack={() => {}}
              backLabel="Back to my Added Values"
              role={args.avRole}
              showStatusActions={args.avStatusActions}
              {...(args.avWhere === 'for-review'
                ? { step: 'for-review', chain: DEVELOPMENT }
                : { status: args.avWhere })}
            />
          ) : undefined
        }
        footer={{ system: undefined, pinned: <Footer year={2026} />, none: null }[args.pageFooter]}
      >
        {args.page === 'long' ? (
          <LongBody />
        ) : args.page === 'empty' ? (
          <EmptyBody />
        ) : (
          <>
            <Stats />
            <Panel title="Recent activity">Nothing yet this cycle.</Panel>
          </>
        )}
      </AppShell>
    );
  },
};

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
    children: <LongBody />,
  },
};

/** A page with nothing in it yet. `EmptyState` does the talking; the shell just holds it. */
export const EmptyPage: Story = {
  args: {
    sidebar: <Rail />,
    topBar: <Bar />,
    header: <PageTitle title="Drafts" />,
    children: <EmptyBody />,
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
