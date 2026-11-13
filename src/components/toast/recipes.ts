import { MIN_ACTION_TOAST_DURATION } from './Toast';
import type { ToastOptions } from './ToastProvider';

/**
 * Toast recipes — the messages VCP raises again and again, each one written once.
 *
 * A recipe returns the options for `toast()`, so a page raises it with
 * `toast(changesSaved())` and the tone, the title and the wording are the same
 * wherever it appears. A second argument overrides any option (a longer
 * `duration`, a `dismissLabel` that names the thing). `docs/toast.md` has the
 * table: which recipe, which tone, and when.
 *
 * Only a message that comes up in more than one place earns a recipe. A message
 * said once is just a `toast({ tone, title })` in its page.
 */
/** What was missing: a field to fill in, one thing to pick, or at least one of several. */
export type MissingInputKind = 'fill' | 'select' | 'select-any';

const MISSING_INPUT: Record<MissingInputKind, (field: string) => string> = {
  fill: (field) => `${field} can’t be empty. Please fill it in before submitting.`,
  select: (field) => `Please select a ${field} before submitting.`,
  'select-any': (field) => `Please select at least one ${field} before submitting.`,
};

/**
 * Submit was blocked by a field that is missing. One toast per problem, beside the
 * error under the field (see *The one exception: a blocked Submit*), so it is
 * `announce: false`: the field error already says it.
 */
export const missingInput = (
  field: string,
  kind: MissingInputKind = 'fill',
  overrides: Partial<ToastOptions> = {},
): ToastOptions => ({
  tone: 'critical',
  title: 'Missing input',
  description: MISSING_INPUT[kind](field),
  announce: false,
  ...overrides,
});

/** Submit was blocked because a chosen assignee is not available on the chosen dates. */
export const unavailableAssignee = (overrides: Partial<ToastOptions> = {}): ToastOptions => ({
  tone: 'critical',
  title: 'Assignee unavailable',
  description:
    'A selected assignee is unavailable during the chosen dates. Please change the dates or remove this assignee before submitting.',
  announce: false,
  ...overrides,
});

/** Something the user edited was kept. */
export const changesSaved = (overrides: Partial<ToastOptions> = {}): ToastOptions => ({
  tone: 'success',
  title: 'Changes saved',
  description: 'Your updates have been saved.',
  ...overrides,
});

/** Several Added Values were changed at once: "Status changed to Backlog for 2 Added Values." */
export const bulkUpdated = (
  change: { property: string; value: string; count: number },
  overrides: Partial<ToastOptions> = {},
): ToastOptions => ({
  tone: 'success',
  title: 'Added Values updated',
  description: `${change.property} changed to ${change.value} for ${change.count} Added ${change.count === 1 ? 'Value' : 'Values'}.`,
  ...overrides,
});

/** A draft was thrown away on purpose. Pass the reference to name it. */
export const discarded = (reference?: string, overrides: Partial<ToastOptions> = {}): ToastOptions => ({
  tone: 'success',
  title: 'Draft discarded',
  description: reference ? `Added Value ${reference} was discarded.` : undefined,
  ...overrides,
});

/**
 * Something was deleted and can still be brought back: "Problem set deleted", with **Undo**.
 * It waits `MIN_ACTION_TOAST_DURATION`, since an action on a timer is only usable if there
 * is time to reach it.
 */
export const undoDeletion = (
  item: string,
  onUndo: () => void,
  overrides: Partial<ToastOptions> = {},
): ToastOptions => ({
  tone: 'info',
  title: `${item} deleted`,
  actionLabel: 'Undo',
  onAction: onUndo,
  duration: MIN_ACTION_TOAST_DURATION,
  ...overrides,
});
