# StatusProgression *(component)*

The "move this Added Value along" buttons: at most a step back and a step
forward, drawn from the lifecycle the viewer is actually allowed to drive.
Read off the Figma **Status Progression Buttons** page — eight component sets,
four viewer roles over a spine the system owns and a chain the domain owns.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Button` | atom | Every transition, at `size="sm"` (36 = the design's 37) |
| `StatusPill` | component | **Type only** — the spine half of `status` is its `AVStatus`. Nothing rendered |

One atom, used twice — which is why this is a **component**, not a pattern:
it presents as one control unit. `AVHeader` is the pattern that places it.

The import rows are checked against the real imports — `npm test` fails if
this list drifts.

## When to use

| Situation | Use |
|---|---|
| An AV page's header | This, via `AVHeader` |
| A row of AVs in a table | Not this — a table row offers a menu, not a toolbar |
| Any "what can I do to this AV?" question in code | `avTransitions({ role, status })` or `avTransitions({ role, step, chain })` |

## What it owns, and what it doesn't

**It owns the spine.** The moves out of `Draft`, the admin's accept/reject on
`Pending`, the handover from `Accepted` into the domain's first step, and the
terminal silence on `Completed`. Those are the same in every domain and the
application branches on them, so they live here.

**It does not own the middle.** Design has two steps, Development has six,
and Content, Partners, Governance and Product bring their own — renameable
(issue #68). The domain passes its ordered `chain`; the moves derive from
position in it, exactly as the flow board draws them: one step back, one step
forward, and a handoff at the end.

```tsx
<StatusProgression role="admin" status="Pending" />
<StatusProgression role="assignee" chain={domain.steps} step="in-qa" />
```

`status` and `step` are mutually exclusive, enforced by the type; `step`
requires `chain`.

## Chain steps

```ts
interface AVChainStep {
  id: string;    // stable, never shown — survives a rename
  label: string; // what the domain calls it today; what the user reads
}
```

**`to` on a transition is always an `id`, never a label.** Labels change; ids
do not. A caller that switches on `transition.to` keeps working after a
domain renames a step.

A `step` the chain does not contain yields no moves rather than throwing — a
domain can retire a step while an AV still sits on it, and guessing where it
went would be worse than offering nothing.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `role` | `AVProgressionRole` | — | **Required.** Who is looking |
| `status` | `AVStatus` | — | A spine position. Excludes `step` |
| `step` | `string` | — | A chain step's `id`. Excludes `status`; needs `chain` |
| `chain` | `readonly AVChainStep[]` | — | The domain's ordered middle. Required with `step`; also needed on `Accepted` |
| `onTransition` | `(t: AVTransition) => void` | — | A button press. The AV does not move until the caller moves it |
| `disabled` | `boolean` | `false` | Every button |
| `loading` | `boolean` | `false` | Spins the forward button only |

## The transitions

Development, all roles that see the middle of the lifecycle:

| Status | Back | Forward |
|---|---|---|
| Draft † | Save as Draft | Submit |
| Pending ‡ | Reject *(danger)* | Accept |
| `Accepted` (spine) | — | Move to *first chain step* |
| first chain step | — | Move to *next* |
| any middle step | Return to *previous* | Move to *next* |
| last chain step | Return to *previous* | Move to Handoff / **Handoff** (admin) |

Names in italics come from the chain's own labels, so "Return to In QA" is
built at render time from whatever that step is called today. The wording the
design has an opinion about — "Move to Handoff" for an assignee, plain
"Handoff" for an admin — stays hard-coded, because the design does not
generate it either.

The first chain step has no way back: the design draws no return to
`Accepted`, because accepting is the admin's decision and not the assignee's
to undo.

## Not modelled — the design has no names for these

Five Figma variants carry placeholder layer names, so they are left out
rather than guessed:

| Set | Variant | Buttons it draws |
|---|---|---|
| Development / Initiator Only | `Status4` | Reject · Accept |
| Development / Initiator Only | `Review` | *(none visible)* |
| Development / Admin | `Deploy` | Handoff |
| Development / Admin | `Review` | Handoff |
| Development / Admin | `Review (completed 1)` | Reject · Accept |
| Design / Initiator Only | `Status4` | Reject · Accept |
| Design / Design Admin | `Status8` | Reject · Accept |

Consequence: the `initiator` role currently offers moves on `Draft` only.
The question is with design (Eve) in
[issue #60](https://github.com/VDM-Design-Team/VCP-design-system/issues/60) —
name these in Figma and they can be added in a minor bump.

## Accessibility

- A named `role="group"` — "Move this Added Value on from For Review" — so
  the buttons are announced as one set with their context, not as two loose
  buttons at the end of a header.
- The destructive **Reject** is `Button variant="danger"`, whose label text
  says "Reject" — the colour is reinforcement, never the only signal.
- `loading` spins only the committing button, and `Button` sets `aria-busy`
  and disables it, so the row cannot be double-submitted.
- Buttons are `size="sm"` = 36 tall. That is under the 40px touch guidance
  and matches the design's 37; the same documented exemption `Button`'s own
  `sm` carries for pointer-dense chrome.

## Don't

- **Don't re-derive the mapping at a call site.** That is the whole point of
  this component. Use `avTransitions()` if you need the list without buttons.
- **Don't expect a spine status other than `Draft`, `Pending` or `Accepted`
  to offer moves.** `Backlog`, `Rejected` and `Reopened` are driven elsewhere;
  this renders `null` for them rather than an empty toolbar.
- **Don't build a transition label from a step's `id`.** The id is a stable
  key, not prose — `label` is the only field that knows what the step is
  called today.
- **Don't hold onto a chain.** It belongs to the domain and can change under
  you; read it where you render, don't cache it in component state.
- **Don't move the AV yourself on click.** `onTransition` reports the wish;
  the app owns the state and the save.
- **Don't render it for a terminal status expecting an empty box** — it
  returns `null`, so don't wrap it in decoration that would be left behind.
