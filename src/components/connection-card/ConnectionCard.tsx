import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';

/**
 * ConnectionCard — an outside service you can link your account to: its logo, its name, whether it is connected, and the button that
 * connects it. Built to Figma's `_Personal_Info_Item_Jira_Connect` (the Jira card on the Personal Info settings).
 *
 * **It is generic on purpose.** It draws a logo tile, a name, a one-line `status` and one action — and nothing about *which* service,
 * what connecting does, or what the states are. Jira's "Not connected" with a **Connect** button is the design's only drawn state;
 * "Connected as …" with **Disconnect**, or an in-flight "Connecting…", are the same card with other words, so `status` and
 * `actionLabel` are the caller's. What the button does (an OAuth redirect, a popup, a request) is the caller's too: it only reports the press.
 *
 * - **`logo`** is whatever mark the service has (an `<svg>` or `<img>`), drawn white on a brand tile. Decorative — the name beside it
 *   says which service this is.
 * - **`loading`** spins the button while connecting or disconnecting.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the token in
 * `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ConnectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The service's name: "Jira". */
  name: string;
  /** Its mark, drawn on a brand tile. Decorative. */
  logo: React.ReactNode;
  /** Where the link stands, in a line: "Not connected", "Connected as ada@company.com". */
  status: React.ReactNode;
  /** The button's words: "Connect", "Disconnect". */
  actionLabel?: string;
  /** The button was pressed. What it does is the caller's. */
  onAction?: () => void;
  /** The button spins — connecting or disconnecting. */
  loading?: boolean;
  disabled?: boolean;
}

export const ConnectionCard = React.forwardRef<HTMLDivElement, ConnectionCardProps>(
  ({ className, name, logo, status, actionLabel = 'Connect', onAction, loading, disabled, ...props }, ref) => {
    const id = React.useId();
    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={`${id}-name`}
        className={cn(
          'flex w-96 max-w-full items-center justify-between gap-6 rounded-md border border-stroke-default bg-surface-elevated p-4 font-sans',
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-brand-strong text-text-inverted-primary"
          >
            {logo}
          </span>
          <div className="flex min-w-0 flex-col">
            <span id={`${id}-name`} className="truncate text-body-sm-semibold text-text-secondary">
              {name}
            </span>
            <span className="truncate text-caption-md-regular text-text-tertiary">{status}</span>
          </div>
        </div>
        <Button
          size="sm"
          type="button"
          loading={loading}
          disabled={disabled}
          aria-label={`${actionLabel} ${name}`}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    );
  },
);
ConnectionCard.displayName = 'ConnectionCard';
