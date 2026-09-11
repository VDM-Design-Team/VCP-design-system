import * as React from 'react';
import { Modal } from '../../components/modal';
import { Carousel } from '../../components/carousel';
import { Tooltip } from '../../components/tooltip';
import { Badge } from '../../atoms/badge';
import { Button } from '../../atoms/button';
import { Icon, type IconName } from '../../atoms/icon';
import { PaginationDots } from '../../atoms/pagination-dots';

/**
 * ChangeLogModal — what a user sees when the product has something to tell them
 * about a release: one announcement at a time, with arrows and dots to move
 * between them.
 *
 * Read off the Figma `Changelog_Update_Modal` (`7211:1060`) and
 * `_Changelog_Main_Content` (`7211:902`), audit batch 4, 11 September 2026.
 *
 * **The paging is `Carousel`**, built for this and controlled, which is what
 * lets the dots sit where the design puts them — *below the footer buttons*,
 * not beside the content. A self-contained carousel could not have done that.
 *
 * **Three kinds of announcement, and the glyph is the difference**: a flask for
 * something experimental, a megaphone for a release, a rocket for a new
 * feature. Each has its own colour, straight from the design's own variables.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type ChangeLogKind = 'experimental' | 'update' | 'feature';

/** The glyph and colour for each kind, read off `_Changelog_Main_Content`. */
const KIND: Record<ChangeLogKind, { icon: IconName; className: string; what: string }> = {
  experimental: {
    icon: 'flask',
    className: 'text-accent-green-strong',
    what: 'Experimental feature',
  },
  update: { icon: 'megaphone', className: 'text-accent-yellow-medium', what: 'Release' },
  feature: {
    icon: 'rocket',
    className: 'text-accent-info-outline-content-default',
    what: 'New feature',
  },
};

export interface ChangeLogEntry {
  kind: ChangeLogKind;
  /** "Experimental Features Available" — the design's own wording per kind. */
  title: string;
  /** Already formatted. The caller owns what a date looks like. */
  date: string;
  /** "v1.18.0". Shown as a `Badge` beside the date. */
  version: string;
  /** What the info glyph beside the title explains. */
  hint?: string;
  /** "Early preview features:" — the heading over the list. */
  heading?: string;
  /** One bullet each. */
  items: readonly string[];
}

export interface ChangeLogModalProps {
  open: boolean;
  onClose: () => void;
  /** The announcements, newest first. One is shown at a time. */
  entries: readonly ChangeLogEntry[];
  /** "View Change Log" — takes the user to the full log. */
  onViewChangeLog?: () => void;
  /** Which announcement is showing. Uncontrolled when omitted. */
  index?: number;
  onIndexChange?: (index: number) => void;
}

export function ChangeLogModal({
  open,
  onClose,
  entries,
  onViewChangeLog,
  index: controlledIndex,
  onIndexChange,
}: ChangeLogModalProps) {
  const [uncontrolled, setUncontrolled] = React.useState(0);
  const index = controlledIndex ?? uncontrolled;
  const setIndex = (next: number) => {
    if (controlledIndex === undefined) setUncontrolled(next);
    onIndexChange?.(next);
  };

  /* Reopening starts at the newest announcement rather than wherever the user
     left off last time, which is never what they meant. */
  React.useEffect(() => {
    if (!open && controlledIndex === undefined) setUncontrolled(0);
  }, [open, controlledIndex]);

  const id = React.useId();
  const titleId = `${id}-title`;

  const entry = entries[index];
  if (!entry) return null;
  const kind = KIND[entry.kind];

  return (
    <Modal
      open={open}
      onClose={onClose}
      /* The design puts the glyph above the title and the title in the body,
         so `Modal`'s header is left to the close button alone and the dialog
         is named by the heading rendered below — the third naming route
         `Modal` gained on 11 September. */
      aria-labelledby={titleId}
      size="lg"
      footer={
        /* A column, because the design puts the dots *below* the buttons. */
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full gap-4">
            <Button fullWidth onClick={onViewChangeLog}>
              View Change Log
            </Button>
            <Button fullWidth variant="secondary" onClick={onClose}>
              Got It
            </Button>
          </div>
          {entries.length > 1 && (
            <PaginationDots
              count={entries.length}
              index={index}
              onChange={setIndex}
              label="Announcements"
            />
          )}
        </div>
      }
    >
      <Carousel
        count={entries.length}
        index={index}
        onIndexChange={setIndex}
        label="Announcements"
        previousLabel="Previous announcement"
        nextLabel="Next announcement"
      >
        <div className="flex flex-col gap-3">
          {/* 32, which is off the Icon scale — see the doc. */}
          <Icon name={kind.icon} aria-hidden="true" className={`size-8 ${kind.className}`} />
          <span className="sr-only">{kind.what}</span>

          <div className="flex flex-wrap items-center gap-2">
            <h2 id={titleId} className="text-heading-md text-text-primary">
              {entry.title}
            </h2>
            {entry.hint && (
              <Tooltip content={entry.hint}>
                <button
                  type="button"
                  aria-label={`About this ${kind.what.toLowerCase()}`}
                  className="rounded-sm text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
                >
                  <Icon name="info" size="sm" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-heading-sm text-text-secondary">{entry.date}</span>
            <Badge tone="info" size="sm">
              {entry.version}
            </Badge>
          </div>

          {entry.heading && (
            <h3 className="text-heading-sm text-text-primary">{entry.heading}</h3>
          )}

          <ul className="flex list-disc flex-col gap-1 pl-5">
            {entry.items.map((item) => (
              <li key={item} className="text-body-md text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Carousel>
    </Modal>
  );
}
ChangeLogModal.displayName = 'ChangeLogModal';
