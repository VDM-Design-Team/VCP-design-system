import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { TagManagement, type TagManagementProps } from '../tag-management';

/**
 * DomainPage — the main content of the Super Admin's Domain page: the title, then the lists the Super Admin keeps (Domains and Global Tags) as cards, with the
 * dialogs behind them. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Domain Page` in Pages & Flows (the
 * page, Add New Tag, Add New Domain and Delete Domain).
 *
 * It is the one place the page's layout lives (the title, then the cards 32 in from the sides, as `AVListPage` lays it out), so the app only passes the lists
 * and what to do when one changes: **`<AppShell><DomainPage management={{ lists, onAdd, … }} /></AppShell>`**.
 *
 * **It is controlled and holds no data.** The page owns the lists and changes them when `TagManagement` asks: see `docs/tag-management.md`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DomainPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. Figma's frames say the placeholder "Page Title"; this is "Domains", as the sidebar names it. */
  title?: string;
  /** The lists and the dialogs behind them: `TagManagement`'s own props. */
  management: TagManagementProps;
}

export function DomainPage({ className, title = 'Domains', management, ...props }: DomainPageProps) {
  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        <TagManagement {...management} />
      </div>
    </div>
  );
}
DomainPage.displayName = 'DomainPage';
