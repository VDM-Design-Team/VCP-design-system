import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * Breadcrumb — where the current page sits in the hierarchy, each ancestor a
 * way back. The last crumb is the page itself: not a control, marked
 * `aria-current="page"`.
 *
 * The export rendered a flat run of buttons in a `<nav>`; the rebuilt version
 * is the full landmark pattern — `<nav aria-label="Breadcrumb">` around an
 * `<ol>`, because the crumbs are an ordered list and announcing "list, 3
 * items" is how a screen reader user learns the depth. Separators are
 * decorative and hidden.
 *
 * Crumbs can be real links (`href`) or buttons (`onNavigate`) — links when the
 * router gives you URLs (middle-click and copy-link then work), buttons only
 * when navigation is genuinely programmatic. Both look identical.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface BreadcrumbItem {
  /** Passed to `onNavigate`. Defaults to the label. */
  key?: string;
  label: string;
  /** Renders the crumb as a real `<a>`. Preferred when a URL exists. */
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Root first, current page last. Strings are shorthand for `{ label }`. */
  items: ReadonlyArray<string | BreadcrumbItem>;
  /** Fires for crumbs without an `href`. */
  onNavigate?: (key: string) => void;
}

const crumbLink = cn(
  'rounded-sm font-sans text-body-sm text-text-link-default transition-colors',
  'hover:text-text-link-hover hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, onNavigate, ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={cn('font-sans', className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((raw, i) => {
          const item = typeof raw === 'string' ? { label: raw } : raw;
          const key = item.key ?? item.label;
          const last = i === items.length - 1;
          return (
            <li key={key} className="flex items-center gap-1.5">
              {last ? (
                /* The current page: text, not a control — a link to where you
                   already are is a tab stop that does nothing. */
                <span aria-current="page" className="text-body-sm text-text-secondary">
                  {item.label}
                </span>
              ) : item.href ? (
                <a href={item.href} className={crumbLink}>
                  {item.label}
                </a>
              ) : (
                <button type="button" onClick={() => onNavigate?.(key)} className={crumbLink}>
                  {item.label}
                </button>
              )}
              {!last && (
                /* Decorative — the list order already says "then". */
                <Icon name="caret-right" aria-hidden="true" className="size-3 text-text-subtle" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  ),
);
Breadcrumb.displayName = 'Breadcrumb';
