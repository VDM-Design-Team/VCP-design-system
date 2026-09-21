/**
 * The four styles and six tones `Badge` and `Tag` both render — one owned
 * mapping rather than two copies drifting apart. The two components differ
 * only in shape (`Badge` is `rounded-pill`, `Tag` is `rounded-sm`); every
 * colour decision below applies identically to both.
 *
 * `outline` and `textual` share the same content token per tone: textual is
 * the outline treatment with the border and fill dropped, not a separate
 * colour decision — the precedent `TypeTag`/`UrgencyTag` already set for
 * their label colour (see docs/urgency-tag.md).
 *
 * `brand` has no `accent.brand.*` triad (a documented token gap — see
 * docs/badge.md), so its outline is hand-composed from `stroke.brand.medium`
 * + `text.brand.strong` with a plain `bg-transparent` — not a token, but not
 * an arbitrary value either: "no fill" has no colour to name. ds-lint-ignore
 */
export type ClassificationVariant = 'textual' | 'outline' | 'tonal' | 'filled';
export type ClassificationTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

export const CLASSIFICATION_STYLE: Record<ClassificationVariant, Record<ClassificationTone, string>> =
  {
    textual: {
      neutral: 'text-neutral-outline-content-default',
      brand: 'text-text-brand-strong',
      info: 'text-accent-info-outline-content-default',
      success: 'text-accent-success-outline-content-default',
      warning: 'text-accent-warning-outline-content-default',
      danger: 'text-accent-critical-outline-content-default',
    },
    outline: {
      neutral:
        'border border-neutral-outline-border-default bg-neutral-outline-surface-default text-neutral-outline-content-default',
      brand: 'border border-stroke-brand-medium bg-transparent text-text-brand-strong',
      info: 'border border-accent-info-outline-border-default bg-accent-info-outline-surface-default text-accent-info-outline-content-default',
      success:
        'border border-accent-success-outline-border-default bg-accent-success-outline-surface-default text-accent-success-outline-content-default',
      warning:
        'border border-accent-warning-outline-border-default bg-accent-warning-outline-surface-default text-accent-warning-outline-content-default',
      danger:
        'border border-accent-critical-outline-border-default bg-accent-critical-outline-surface-default text-accent-critical-outline-content-default',
    },
    /* No `accent.brand.*`/`accent.neutral.*` triad, so those two are
       hand-composed — the same gap docs/badge.md already documents. */
    tonal: {
      neutral: 'bg-surface-neutral-subtle text-text-secondary',
      brand: 'bg-surface-brand-faint text-text-brand-strong',
      info: 'bg-accent-info-tonal-surface-default text-accent-info-tonal-content-default',
      success: 'bg-accent-success-tonal-surface-default text-accent-success-tonal-content-default',
      warning: 'bg-accent-warning-tonal-surface-default text-accent-warning-tonal-content-default',
      danger: 'bg-accent-critical-tonal-surface-default text-accent-critical-tonal-content-default',
    },
    filled: {
      neutral: 'bg-surface-neutral-stronger text-text-inverted-primary',
      brand: 'bg-action-primary-surface-default text-action-primary-content-default',
      info: 'bg-accent-info-filled-surface-default text-accent-info-filled-content-default',
      success: 'bg-accent-success-filled-surface-default text-accent-success-filled-content-default',
      warning: 'bg-accent-warning-filled-surface-default text-accent-warning-filled-content-default',
      danger: 'bg-accent-critical-filled-surface-default text-accent-critical-filled-content-default',
    },
  };
