import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { Tabs, tabId, tabPanelId, type TabItem } from '../../components/tabs';

/**
 * SettingsPage — the main content of the Settings page: the page title, a row of tabs, and the tab that is showing. It goes inside `AppShell`
 * (which draws the sidebar, the top bar and the footer); this is only what sits between them.
 *
 * Built to Figma's Settings pages (`Page_Template` → `Main Section`). **The user's and the admin's Settings are one layout with two tab lists**,
 * so one piece draws both and `audience` says which:
 *
 * - **`user`** — Personal Info, Password, Changelog.
 * - **`admin`** — Personal Info, Users, Admin Panel, Announcements, Manuals, Password.
 *
 * **It is controlled and slot-based.** The page passes each tab's body in `panels`, by key; the pattern owns the title, the tab bar, which tab is
 * showing, and the ids that tie each tab to its panel. It fetches nothing and holds no data. **A tab shows only when the page gives it a panel**, in the
 * audience's own order, so a page can leave out a tab it has not built yet without the bar showing a tab that opens nothing.
 *
 * Only the showing tab's body is mounted; the other panels stay in the page, empty, so every tab still points at a real panel.
 *
 * The bodies draw their own cards (`PersonalInfoForm`, `UsersTable`, …), so this draws none: it gives them the content area and the 24 under the tabs.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export type SettingsAudience = 'user' | 'admin';

/** Every tab Settings has, across both audiences. */
export type SettingsTabKey =
  | 'personal-info'
  | 'password'
  | 'changelog'
  | 'users'
  | 'admin-panel'
  | 'announcements'
  | 'manuals';

const LABEL: Record<SettingsTabKey, string> = {
  'personal-info': 'Personal Info',
  password: 'Password',
  changelog: 'Changelog',
  users: 'Users',
  'admin-panel': 'Admin Panel',
  announcements: 'Announcements',
  manuals: 'Manuals',
};

/** The tabs each audience has, in the order Figma draws them. */
export const SETTINGS_TABS: Record<SettingsAudience, readonly SettingsTabKey[]> = {
  user: ['personal-info', 'password', 'changelog'],
  admin: ['personal-info', 'users', 'admin-panel', 'announcements', 'manuals', 'password'],
};

export interface SettingsPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Whose Settings: picks the tab list. Default `user`. */
  audience?: SettingsAudience;
  /** The tab body for each tab, by key. A tab with no panel is left out of the bar. */
  panels: Partial<Record<SettingsTabKey, React.ReactNode>>;
  /** Controlled: the tab that is showing. If the audience has no such tab, the first one shows. */
  tab?: SettingsTabKey;
  /** Uncontrolled: the tab to start on. */
  defaultTab?: SettingsTabKey;
  onTabChange?: (tab: SettingsTabKey) => void;
  /** The page's title. Default "Settings". */
  title?: React.ReactNode;
  /** Where the back arrow goes. With neither this nor `onBack`, there is no arrow. */
  backHref?: string;
  onBack?: () => void;
  /** The back arrow's accessible name: say where it goes. */
  backLabel?: string;
  /** The page's actions, on the right of the title. */
  actions?: React.ReactNode;
}

export function SettingsPage({
  className,
  audience = 'user',
  panels,
  tab,
  defaultTab,
  onTabChange,
  title = 'Settings',
  backHref,
  onBack,
  backLabel = 'Back',
  actions,
  ...props
}: SettingsPageProps) {
  const prefix = React.useId();
  const keys = SETTINGS_TABS[audience].filter((key) => panels[key] !== undefined);
  const items: TabItem[] = keys.map((key) => ({ key, label: LABEL[key] }));

  const [own, setOwn] = React.useState<SettingsTabKey | undefined>(defaultTab);
  const wanted = tab !== undefined ? tab : own;
  /* A tab the audience does not have (the admin's Users after switching to the user's Settings) falls back to the first one. */
  const active = wanted !== undefined && keys.includes(wanted) ? wanted : keys[0];

  const select = (key: string) => {
    const next = key as SettingsTabKey;
    if (tab === undefined) setOwn(next);
    onTabChange?.(next);
  };

  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} backHref={backHref} onBack={onBack} backLabel={backLabel} actions={actions} />
      <div className="px-8">
        {/* Six tabs do not fit a phone: the row scrolls in its own box instead of pushing the page sideways. The 4 of padding, taken back by the
            margin, is room for a tab's focus ring, which an overflow box would otherwise cut off. */}
        <div className="-m-1 overflow-x-auto p-1">
          <Tabs
            tabs={items}
            value={active}
            onChange={select}
            idPrefix={prefix}
            aria-label={`${typeof title === 'string' ? title : 'Settings'} sections`}
            className="w-max min-w-full"
          />
        </div>
      </div>
      <div className="min-w-0 px-8 pb-8 pt-6">
        {keys.map((key) => (
          <div
            key={key}
            role="tabpanel"
            tabIndex={0}
            id={tabPanelId(prefix, key)}
            aria-labelledby={tabId(prefix, key)}
            hidden={key !== active}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
          >
            {key === active && panels[key]}
          </div>
        ))}
      </div>
    </div>
  );
}
SettingsPage.displayName = 'SettingsPage';
