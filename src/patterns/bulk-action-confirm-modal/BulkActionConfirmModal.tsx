import * as React from 'react';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { Divider } from '../../atoms/divider';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Select, type SelectOption } from '../../atoms/select';
import { Tag } from '../../atoms/tag';
import { CycleTag } from '../../components/cycle-tag';
import { Field } from '../../components/field';
import { Modal } from '../../components/modal';
import { TypeTag, type AVType } from '../../components/type-tag';
import { UrgencyTag, type AVUrgency } from '../../components/urgency-tag';

/**
 * BulkActionConfirmModal — the question after a bulk choice, **one component for every action**: you pass the `action` and the selected Added Values, and it draws the rest — the
 * title ("Move 2 Added Values to Backlog"), the field the action collects (or the value it changes to), a collapsible **List of Added Values** with a field per Added Value where the
 * action has one, and **Cancel** / **Confirm** (red for **Reject**). Built to Figma's `Bulk_Action_Accordian_Confirmation_Popup` — all twelve of its variants.
 *
 * | `action` | Title | What it shows | What `onConfirm` gets |
 * |---|---|---|---|
 * | `urgency`, `type`, `cycle`, `status` | "Change Urgency for 2 Added Values" | "Selected AVs will be updated to:" and the `value` as its own tag | nothing |
 * | `backlog` | "Move 2 Added Values to Backlog" | **Feedback** (optional) | `{ value, overrides }` — a reason, text |
 * | `accept-pending` | "Accept 2 Pending Added Values" | `domain="development"`: **Multipart Value** checkbox; otherwise nothing | `{ value, overrides }` (boolean), or `null` |
 * | `accept` | "Accept 2 Added Values" | `development`: **Require Cypress Test Script**; `design`: **Copy to Dev**; otherwise nothing | `{ value, overrides }` (boolean), or `null` |
 * | `reject-pending`, `reject` | "Reject 2 Pending Added Values" / "Reject 2 Added Values" | **Rejection Reason** (a select of your `reasons`), required; Confirm is red for `reject` | `{ value, overrides, detail?, overrideDetails? }` — the chosen reason, and the note typed under Other |
 *
 * - **A bulk field and one per Added Value.** The bulk field "will be applied to all selected Added Values unless overridden below": in the list each Added Value has its own, which
 *   starts as the bulk one and, once changed, **overrides** it. `onConfirm` gets `{ value, overrides }`: the bulk value, and `overrides[ref]` for each Added Value that differs.
 * - **A reason's `explanation` shows under the select once it is chosen; the reason marked `other` shows an optional note field there instead** (Figma's "Specify the rejection reason (optional)").
 * - **A reason is required to reject**: Confirm says so under the field ("Select a rejection reason, or one for each Added Value.") and does not go through until every Added Value has one.
 * - **It does nothing itself.** `onConfirm` is the page's cue to make the change, then close, and say so (a toast, or `BulkActionFailedModal` for the ones that failed).
 *   Handoff is not here: it is its own multi-step popup.
 * - **The list is collapsed until asked for** (`defaultExpanded`); each line is the reference and the title, cut with "…". **A reference with an `href` is a blue link that opens the Added Value in a new tab**; without one it is plain grey text. Everything resets each time it opens.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface BulkActionAV {
  /** "VCP-12345". */
  ref: string;
  title: string;
  /**
   * Where the Added Value is. Given, the reference is a **blue link that opens it in a new tab** (that is what the blue says: it is clickable). Left out, the reference is
   * plain text in the quiet grey — it is not a link, so it is not blue.
   */
  href?: string;
}

/** The domain an Added Value is in decides what accepting it asks. */
export type BulkDomain = 'development' | 'design' | 'other';

/** What a field-collecting action hands back: the bulk value, and the Added Values (by `ref`) whose own differs. */
export interface BulkChoice<T> {
  value: T;
  overrides: Record<string, T>;
  /** Rejecting only: what was typed under **Other** for the bulk reason (it is optional, so it may be empty). */
  detail?: string;
  /** Rejecting only: the same, for an Added Value (by `ref`) whose own reason is Other. */
  overrideDetails?: Record<string, string>;
}

/** One rejection reason. `explanation` is what the select says once it is chosen; the reason with `other` asks for an optional note instead. */
export interface BulkRejectionReason {
  value: string;
  label: string;
  explanation?: string;
  other?: boolean;
}

interface BaseProps {
  open: boolean;
  onClose: () => void;
  /** The selected Added Values. */
  items: readonly BulkActionAV[];
  /** Open the list at first. */
  defaultExpanded?: boolean;
  /** Confirm is in flight: it spins and Cancel locks. */
  confirming?: boolean;
}

export type BulkActionConfirmModalProps = BaseProps &
  (
    | { action: 'urgency'; value: AVUrgency; onConfirm: () => void }
    | { action: 'type'; value: AVType; onConfirm: () => void }
    | {
        action: 'cycle';
        value: { code: string; start: string; end: string };
        onConfirm: () => void;
      }
    /** Any other status the Status menu offers (In Progress, For QA…): Figma draws no popup for these, so this is the plain "Change Status" one. */
    | { action: 'status'; value: string; onConfirm: () => void }
    | { action: 'backlog'; onConfirm: (choice: BulkChoice<string>) => void }
    | {
        action: 'accept-pending';
        domain: BulkDomain;
        onConfirm: (choice: BulkChoice<boolean> | null) => void;
      }
    | {
        action: 'accept';
        domain: BulkDomain;
        onConfirm: (choice: BulkChoice<boolean> | null) => void;
      }
    | {
        action: 'reject-pending' | 'reject';
        reasons: readonly BulkRejectionReason[];
        onConfirm: (choice: BulkChoice<string>) => void;
      }
  );

const HELPER = 'This will be applied to all selected Added Values unless overridden below.';

const plural = (n: number) => `${n} Added Value${n === 1 ? '' : 's'}`;

const titleFor = (props: BulkActionConfirmModalProps, n: number): string => {
  switch (props.action) {
    case 'urgency':
      return `Change Urgency for ${plural(n)}`;
    case 'type':
      return `Change Type for ${plural(n)}`;
    case 'cycle':
      return `Change Cycle for ${plural(n)}`;
    case 'status':
      return `Change Status for ${plural(n)}`;
    case 'backlog':
      return `Move ${plural(n)} to Backlog`;
    case 'accept-pending':
      return `Accept ${n} Pending Added Value${n === 1 ? '' : 's'}`;
    case 'reject-pending':
      return `Reject ${n} Pending Added Value${n === 1 ? '' : 's'}`;
    case 'accept':
      return `Accept ${plural(n)}`;
    case 'reject':
      return `Reject ${plural(n)}`;
  }
};

type Spec =
  | {
      kind: 'text';
      label: string;
      placeholder: string;
      itemPlaceholder: string;
    }
  | { kind: 'check'; label: string; description?: string }
  | {
      kind: 'select';
      label: string;
      placeholder: string;
      options: SelectOption[];
    };

/** The one field an action collects, if it collects any. */
const specFor = (props: BulkActionConfirmModalProps): Spec | null => {
  switch (props.action) {
    case 'backlog':
      return {
        kind: 'text',
        label: 'Feedback',
        placeholder: 'Enter a reason (optional)',
        itemPlaceholder: 'Uses bulk reason unless overridden',
      };
    case 'accept-pending':
      return props.domain === 'development'
        ? {
            kind: 'check',
            label: 'Multipart Value',
            description: 'Split this value into parts based on its sets, while keeping the original as the parent for overall progress tracking.',
          }
        : null;
    case 'accept':
      return props.domain === 'development' ? { kind: 'check', label: 'Require Cypress Test Script' } : props.domain === 'design' ? { kind: 'check', label: 'Copy to Dev' } : null;
    case 'reject-pending':
    case 'reject':
      return {
        kind: 'select',
        label: 'Rejection Reason',
        placeholder: 'Select Rejection Reason',
        options: props.reasons.map((r) => ({ value: r.value, label: r.label })),
      };
    default:
      return null;
  }
};

type Value = string | boolean;

export function BulkActionConfirmModal(props: BulkActionConfirmModalProps) {
  const { open, onClose, items, defaultExpanded = false, confirming } = props;
  const spec = specFor(props);
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [bulk, setBulk] = React.useState<Value>(spec?.kind === 'check' ? false : '');
  const [overrides, setOverrides] = React.useState<Record<string, Value>>({});
  const [error, setError] = React.useState<string | null>(null);
  /* Rejecting: the optional note under **Other**, for the bulk reason (`''`) and per Added Value (by `ref`). */
  const [details, setDetails] = React.useState<Record<string, string>>({});
  const listId = React.useId();
  const bulkRef = React.useRef<HTMLSelectElement>(null);

  /* Each time it opens, start again: list collapsed (or as asked), nothing chosen. */
  React.useEffect(() => {
    if (!open) return;
    setExpanded(defaultExpanded);
    setBulk(spec?.kind === 'check' ? false : '');
    setOverrides({});
    setDetails({});
    setError(null);
    /* On open only. */
  }, [open]); // eslint-disable-line

  const effectiveAll = (): boolean[] => items.map((item) => Boolean(effective(item.ref)));
  /* A checkbox's box already has 12 of padding inside its label, so the card adds 4: 16 all round, as Figma draws it. */
  const effective = (ref: string): Value => (spec?.kind === 'check' ? (ref in overrides ? overrides[ref] : bulk) : overrides[ref] || bulk);

  const setOverride = (ref: string, next: Value) => {
    setError(null);
    setOverrides((current) => {
      const copy = { ...current };
      /* Matching the bulk value is no override at all (a check), and a blank is none (text and select). */
      if (next === '' || (spec?.kind === 'check' && next === bulk)) delete copy[ref];
      else copy[ref] = next;
      return copy;
    });
  };

  const confirm = () => {
    if (props.action === 'reject' || props.action === 'reject-pending') {
      if (items.some((item) => !effective(item.ref))) {
        setError('Select a rejection reason, or one for each Added Value.');
        bulkRef.current?.focus();
        return;
      }
      const reasons = props.reasons;
      const isOther = (value: Value) => Boolean(reasons.find((r) => r.value === value)?.other);
      const overrideDetails: Record<string, string> = {};
      for (const [ref, value] of Object.entries(overrides)) if (isOther(value) && details[ref]) overrideDetails[ref] = details[ref];
      props.onConfirm({
        value: bulk as string,
        overrides: overrides as Record<string, string>,
        detail: isOther(bulk) ? (details[''] ?? '') : undefined,
        overrideDetails,
      });
    } else if (props.action === 'backlog') {
      props.onConfirm({
        value: bulk as string,
        overrides: overrides as Record<string, string>,
      });
    } else if (props.action === 'accept' || props.action === 'accept-pending') {
      props.onConfirm(
        spec
          ? {
              value: bulk as boolean,
              overrides: overrides as Record<string, boolean>,
            }
          : null,
      );
    } else {
      /* urgency, type, cycle, status: nothing was collected. */
      (props.onConfirm as () => void)();
    }
  };

  /* Where the action changes something *to* a value, it says what: "Selected AVs will be updated to:" and the value as its own tag. */
  const target =
    props.action === 'urgency' ? (
      <UrgencyTag urgency={props.value} />
    ) : props.action === 'type' ? (
      <TypeTag type={props.value} />
    ) : props.action === 'cycle' ? (
      <CycleTag code={props.value.code} start={props.value.start} end={props.value.end} />
    ) : props.action === 'status' ? (
      <Tag>{props.value}</Tag>
    ) : null;

  /* Under a chosen rejection reason: its explanation, or — for Other — an optional note in its place. */
  const reasonExtra = (value: Value, key: string, label: string) => {
    if (props.action !== 'reject' && props.action !== 'reject-pending') return null;
    const reason = props.reasons.find((r) => r.value === value);
    if (!reason) return null;
    if (reason.other) {
      return (
        <Input
          fullWidth
          autoComplete="off"
          aria-label={label}
          placeholder="Specify the rejection reason (optional)"
          value={details[key] ?? ''}
          onChange={(event) => setDetails((current) => ({ ...current, [key]: event.target.value }))}
        />
      );
    }
    return reason.explanation ? <p className="m-0 text-caption-md-regular text-text-tertiary">{reason.explanation}</p> : null;
  };

  const states = spec?.kind === 'check' ? effectiveAll() : [];
  const allOn = states.length > 0 && states.every(Boolean);
  const mixed = states.some(Boolean) && !allOn;

  const bulkField = !spec ? null : spec.kind === 'check' ? (
    <div className="flex flex-col gap-2">
      <div className="rounded-sm border border-stroke-default p-1">
        <Checkbox
          label={
            <span className="flex flex-col gap-1">
              {spec.label}
              {spec.description && <span className="text-caption-md-regular text-text-tertiary">{spec.description}</span>}
            </span>
          }
          /* The select-all box reads the Added Values' own: all ticked is ticked, none is clear, and **some of each is the mixed state** — untick one and the box above does not
             pretend they are all still chosen. Pressing it (mixed or not) sets every Added Value to what it becomes. */
          checked={allOn}
          indeterminate={mixed}
          onChange={(checked) => {
            setBulk(checked);
            setOverrides({});
          }}
        />
      </div>
      <p className="m-0 text-caption-md-regular text-text-tertiary">{HELPER}</p>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <Field label={spec.label} helper={HELPER} error={error ?? undefined}>
        {spec.kind === 'text' ? (
          <Input fullWidth autoComplete="off" placeholder={spec.placeholder} value={bulk as string} onChange={(event) => setBulk(event.target.value)} />
        ) : (
          <Select
            ref={bulkRef}
            fullWidth
            emphasis="regular"
            placeholder={spec.placeholder}
            options={spec.options}
            value={bulk as string}
            onChange={(next) => {
              setError(null);
              setBulk(next);
            }}
          />
        )}
      </Field>
      {spec.kind === 'select' && reasonExtra(bulk, '', 'Other rejection reason')}
    </div>
  );

  const itemField = (item: BulkActionAV) => {
    if (!spec) return null;
    if (spec.kind === 'text') {
      return (
        <Input
          fullWidth
          autoComplete="off"
          aria-label={`Reason for ${item.ref}`}
          placeholder={spec.itemPlaceholder}
          value={(overrides[item.ref] as string) ?? ''}
          onChange={(event) => setOverride(item.ref, event.target.value)}
        />
      );
    }
    if (spec.kind === 'check') {
      return (
        <div className="rounded-sm border border-stroke-default p-1">
          <Checkbox
            label={<span aria-label={`${spec.label} for ${item.ref}`}>{spec.label}</span>}
            aria-label={`${spec.label} for ${item.ref}`}
            checked={Boolean(effective(item.ref))}
            onChange={(checked) => setOverride(item.ref, checked)}
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <Select
          fullWidth
          emphasis="regular"
          aria-label={`Rejection reason for ${item.ref}`}
          placeholder={spec.placeholder}
          options={spec.options}
          value={(overrides[item.ref] as string) ?? ''}
          onChange={(next) => setOverride(item.ref, next)}
        />
        {reasonExtra((overrides[item.ref] as string) ?? '', item.ref, `Other rejection reason for ${item.ref}`)}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titleFor(props, items.length)}
      size="lg"
      showClose={false}
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" disabled={confirming} onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="button" variant={props.action === 'reject' ? 'danger' : 'primary'} loading={confirming} onClick={confirm}>
            Confirm
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {target && (
          <div className="flex flex-col items-start gap-2">
            <p className="m-0 text-body-sm-regular text-text-secondary">Selected AVs will be updated to:</p>
            {target}
          </div>
        )}
        {bulkField}
        <Divider />
        <div className="flex flex-col gap-4">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((on) => !on)}
            className="flex w-full items-center justify-between rounded-sm text-left text-body-sm-regular text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
          >
            List of Added Values
            <Icon name={expanded ? 'caret-up' : 'caret-down'} size="md" aria-hidden="true" />
          </button>
          {expanded && (
            <ul id={listId} className="m-0 flex list-none flex-col gap-5 p-0">
              {items.map((item) => (
                <li key={item.ref} className="flex min-w-0 flex-col gap-2 text-body-sm-regular">
                  <span className="flex min-w-0 gap-1">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-sm text-text-link-default hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
                      >
                        {item.ref}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="shrink-0 text-text-tertiary">{item.ref}</span>
                    )}
                    <span className="min-w-0 truncate text-text-primary" title={item.title}>
                      {item.title}
                    </span>
                  </span>
                  {itemField(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
BulkActionConfirmModal.displayName = 'BulkActionConfirmModal';
