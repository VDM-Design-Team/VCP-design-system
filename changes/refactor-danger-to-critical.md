---
bump: major
---
### Status tones — `danger` is now `critical`, matching the token family and Figma (October 2026)

The severity tone was called `danger` in the props but `accent.critical` in the tokens and `Critical` in Figma. The props now say `critical`. It changes on the components that colour by severity: `Badge`, `Tag`, `StatusPill` and `DueDatePill` (through the shared classification tones), `Toast` and `useToast`, `Banner`, `ProgressBar`, `DonutChart`, `DatePicker` markers and `Timeline`.

The **destructive-action** names are unchanged: `Button` and `IconButton` `variant="danger"`, `Menu` item `tone: 'danger'` and the status-progression Reject variant all mean "this action destroys something", which is not the same word as a severity, and they stay `danger`.

Migration: replace `danger` with `critical` wherever it is a tone, type or marker on the components above: `tone="danger"` becomes `tone="critical"` on `Badge`, `Tag`, `Banner`, `ProgressBar` and `DonutChart`; `toast({ tone: 'danger' })` becomes `toast({ tone: 'critical' })`; `markers={{ '2026-09-22': 'danger' }}` becomes `'critical'`; the `Timeline` item `tone: 'danger'` becomes `'critical'`; and the exported types `ToastTone`, `BannerTone`, `TimelineTone`, `ClassificationTone` and `DatePickerMarker` now list `'critical'` in place of `'danger'`. Leave `Button`, `IconButton` and `Menu` alone.
