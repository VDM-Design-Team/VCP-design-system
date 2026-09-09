import * as React from 'react';
import { cn } from '../../lib/cn';
import { Footer } from '../../atoms/footer';

/**
 * AppShell — the design system's first template: the whole-screen frame every
 * signed-in page sits in. The rail down the left at full height, the app bar
 * across the top of what remains, the page's title band and body beneath it,
 * and the copyright line at the end.
 *
 * Read off the Figma `Page_Template` (1920 × 1027, 8 Sep 2026):
 *
 *     Page_Template
 *     ├── VCP_SideBar    256 wide, full height
 *     └── Main Section   from x=256
 *         ├── Top_NavBar
 *         └── Content ..................... slot
 *             ├── Page_Title
 *             ├── padded body  32 each side ... slot
 *             └── Footer
 *
 * Both `Content`s are Figma **slots**, so the design already draws this as a
 * shell with a hole in it. That hole is `children`.
 *
 * **The rail, the bar and the title band are slots too, and that is the
 * point.** The Claude Design export mirrored twenty of `Sidebar`'s and
 * `TopBar`'s props onto the shell so it could render them itself — one more
 * surface to keep in step every time either pattern changes. Here each piece
 * keeps its own API and the shell owns only the geometry: `sidebar={<Sidebar
 * … />}`, `topBar={<TopBar … />}`, `header={<PageTitle … />}`. The one piece
 * it places itself is `Footer`, because that one has no variants to choose.
 *
 * **Two design questions are open, and the shell takes no side on either.**
 * Whether `AV_Header` and `Page_Title` are one component — either fits the
 * `header` slot, so nothing here changes when that is settled. And whether the
 * top bar is 60 or 64 — the shell adds no height of its own, so that answer
 * lands in `TopBar` alone.
 *
 * **The rail and the bar stay put; the page scrolls.** A Figma frame is
 * static and cannot say this, so it is the one behaviour added beyond the
 * geometry. Pass `className="h-auto overflow-visible"` to hand scrolling back
 * to the document — for a page embedded in something that already scrolls.
 *
 * The export's fixed 390-wide detail column is left out on purpose: no page
 * in the pages file draws one. It can be added when one does.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The navigation rail — a `Sidebar`. Full height, down the left. */
  sidebar: React.ReactNode;
  /** The app bar — a `TopBar`. Across the top of everything right of the rail. */
  topBar: React.ReactNode;
  /**
   * The band that names the page — a `PageTitle`, or an `AVHeader` on an
   * Added Value's page. Inside `<main>`, so its `h1` is the page's.
   */
  header?: React.ReactNode;
  /** The page itself. Inset 32 from each side, as the design's body slot is. */
  children: React.ReactNode;
  /**
   * What ends the page. Defaults to the system `Footer`; pass your own to
   * change it, or `null` to leave the page without one.
   */
  footer?: React.ReactNode;
}

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ className, sidebar, topBar, header, children, footer, ...props }, ref) => (
    /* The viewport, as a row: rail beside everything else. */
    <div
      ref={ref}
      className={cn('flex h-screen overflow-hidden bg-surface-canvas font-sans', className)}
      {...props}
    >
      {sidebar}
      {/* `min-w-0` so a wide table in the body scrolls itself rather than
          pushing the rail off screen. */}
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        {/* The scroll region: title band, body and footer move together under
            a bar that does not. `min-h-0` lets it shrink to what the bar
            leaves, which a flex child will not do on its own. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <main className="flex min-w-0 flex-1 flex-col">
            {header}
            {/* The design's body slot: 32 each side. No vertical inset — the
                title band's 16 below and the footer's own band supply it. */}
            <div className="flex-1 px-8">{children}</div>
          </main>
          {footer === undefined ? <Footer /> : footer}
        </div>
      </div>
    </div>
  ),
);
AppShell.displayName = 'AppShell';
