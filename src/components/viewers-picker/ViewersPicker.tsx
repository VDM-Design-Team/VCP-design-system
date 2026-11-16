import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { RemoveButton } from '../../atoms/remove-button';
import { Tooltip } from '../../atoms/tooltip';
import { Popover } from '../popover';

/**
 * ViewersPicker — who can see an Added Value without working on it, and the way to change that. Built to Figma's `Detail_Card_Edit_Viewers`
 * (`State`: Default / Hover / Clicked), `_Detail_Card_Edit_Viewers_Dropdown` (Hover / Empty Search / Filled Search / No Viewers / No Viewers Search) and
 * `_Detail_Card_Edit_Viewers_Menu_Item` (`Is Assigned Viewer`).
 *
 * The trigger is the small pill with an eye and the count. **Hover or focus it and the viewers are listed** ("3 Viewers", then each person, or "No viewers yet"
 * for an empty list): a look, nothing to do. **Press it** (when the page lets the person change viewers: `onAdd` or `onRemove` is given) and a panel opens with
 * a **Search by name** field, the people who match that are not viewers yet (press one to add them), and the viewers, each with a button to remove them. Without
 * `onAdd` and `onRemove` it is read-only: the hover list is all there is.
 *
 * The picker holds no data. The page passes `viewers` and `candidates` (everyone who could be added; people already viewing are left out of the matches) and
 * changes them in `onAdd` / `onRemove`. After an add or a remove the focus returns to the search field, so it never lands on a row that has gone.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ViewerPerson {
  id: string;
  name: string;
  /** A photo. Without one, their initials. */
  src?: string;
}

export interface ViewersPickerProps {
  /** Who is viewing now, in the order to show them. */
  viewers: readonly ViewerPerson[];
  /** Everyone who could be added. People who are already viewers never show as a match. */
  candidates?: readonly ViewerPerson[];
  /** A person was pressed in the matches: add them. Leave out (with `onRemove`) for a read-only list. */
  onAdd?: (person: ViewerPerson) => void;
  /** A viewer's remove button was pressed. */
  onRemove?: (person: ViewerPerson) => void;
  className?: string;
}

const countText = (n: number) => `${n} ${n === 1 ? 'Viewer' : 'Viewers'}`;

function Person({ person }: { person: ViewerPerson }) {
  return (
    <>
      <Avatar size="sm" name={person.name} src={person.src} />
      <span className="min-w-0 truncate text-body-sm-regular text-text-primary">{person.name}</span>
    </>
  );
}

/** The read-only list: the heading, then each viewer. Also what the hover shows. */
function ViewerList({ viewers, hint }: { viewers: readonly ViewerPerson[]; hint?: boolean }) {
  if (viewers.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-label-sm-semibold text-text-secondary">No viewers yet</p>
        {hint && <p className="text-body-sm-regular text-text-secondary">Click to manage viewers</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-sm-semibold text-text-secondary">{countText(viewers.length)}</p>
      <ul className="flex flex-col gap-2">
        {viewers.map((person) => (
          <li key={person.id} className="flex items-center gap-2">
            <Person person={person} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PillTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  count: number;
  viewers: readonly ViewerPerson[];
  editable: boolean;
  previewDisabled: boolean;
}

/* The pill: an eye and a count. The pill's name ("3 viewers") says the count; the list that opens on hover is its description, and it names the people. */
const PillTrigger = React.forwardRef<HTMLButtonElement, PillTriggerProps>(({ count, viewers, editable, previewDisabled, className, ...props }, ref) => (
  <Tooltip content={<ViewerList viewers={viewers} hint={editable} />} placement="bottom" wide disabled={previewDisabled}>
    <button
      ref={ref}
      type="button"
      aria-label={`${count} ${count === 1 ? 'viewer' : 'viewers'}`}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-sm border border-neutral-outline-border-default px-2',
        'text-caption-md-medium text-neutral-outline-content-default',
        'hover:bg-neutral-outline-surface-hover active:bg-neutral-outline-surface-pressed',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
        !editable && 'cursor-default',
        className,
      )}
      {...props}
    >
      <Icon name="eye" size="sm" aria-hidden="true" />
      {count}
    </button>
  </Tooltip>
));
PillTrigger.displayName = 'PillTrigger';

export function ViewersPicker({ viewers, candidates = [], onAdd, onRemove, className }: ViewersPickerProps) {
  const editable = Boolean(onAdd || onRemove);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const search = React.useRef<HTMLInputElement>(null);

  const viewingIds = new Set(viewers.map((person) => person.id));
  const needle = query.trim().toLocaleLowerCase();
  const matches = needle
    ? candidates.filter((person) => !viewingIds.has(person.id) && person.name.toLocaleLowerCase().includes(needle))
    : [];

  /* The pill with its hover list. A component of its own that passes everything on to the button, so the Popover can clone its `aria-expanded`, `onClick` and ref onto the real control. */
  const trigger = <PillTrigger count={viewers.length} viewers={viewers} editable={editable} previewDisabled={open} />;
  if (!editable) return <span className={cn('inline-flex', className)}>{trigger}</span>;

  const backToSearch = () => search.current?.focus();

  return (
    <Popover
      className={className}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
      trigger={trigger}
      placement="bottom"
      align="left"
      width="md"
      autoFocus
      panelClassName="max-h-75 overflow-y-auto p-3"
      content={
        <div className="flex flex-col gap-3">
          <Input
            ref={search}
            fullWidth
            aria-label="Search people by name"
            placeholder="Search by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            leadingIcon={<Icon name="magnifying-glass" size="sm" aria-hidden="true" />}
          />
          {needle && (
            <ul className="flex flex-col gap-1" aria-label="People to add">
              {matches.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd?.(person);
                      setQuery('');
                      backToSearch();
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left hover:bg-surface-neutral-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
                  >
                    <Person person={person} />
                    <span className="sr-only">: add as a viewer</span>
                  </button>
                </li>
              ))}
              {matches.length === 0 && <li className="px-1 text-body-sm-regular text-text-secondary">No one matches</li>}
            </ul>
          )}
          {viewers.length === 0 ? (
            <p className="text-label-sm-semibold text-text-secondary">No viewers yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-label-sm-semibold text-text-secondary">{countText(viewers.length)}</p>
              <ul className="flex flex-col gap-1">
                {viewers.map((person) => (
                  <li key={person.id} className="group/row flex items-center gap-2 rounded-sm px-1 py-1 hover:bg-surface-neutral-faint">
                    <Person person={person} />
                    {onRemove && (
                      <RemoveButton
                        tone="tonal"
                        label={`Remove ${person.name} as a viewer`}
                        /* On a pointer, it shows when the row is hovered or has focus, as Figma draws it; on a touch screen there is no hover, so it is always there. */
                        className="ml-auto opacity-0 transition-opacity motion-reduce:transition-none group-hover/row:opacity-100 group-focus-within/row:opacity-100 pointer-coarse:opacity-100"
                        onClick={() => {
                          onRemove(person);
                          backToSearch();
                        }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
    />
  );
}
