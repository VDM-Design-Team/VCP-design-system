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
`Pending`, the handover from `Accepted` into the domain's first step, the
initiator/admin decision on `Review`, and the terminal silence on `Completed`.
Those are the same in every domain and the application branches on them, so
they live here.

**One spine status isn't quite universal.** `Completed` is terminal
everywhere except Development, where it can still owe a `Deploy` action
first — see `pendingDeploy` below. Named and resolved in issue #60
(7 Sep 2026); design was explicit this is a known exception, not a pattern to
extend to other domains.

**It does not own the middle.** Two domains are defined today — Design has one
step, Development has five — and their steps are renameable (issue #68).
Nothing here counts domains, so a third costs no code change. The domain passes its ordered `chain`; the moves derive from
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
| `pendingDeploy` | `boolean` | `false` | Development-only. Only meaningful with `status="Completed"` — see below |
| `onTransition` | `(t: AVTransition) => void` | — | A button press. The AV does not move until the caller moves it |
| `disabled` | `boolean` | `false` | Every button |
| `loading` | `boolean` | `false` | Spins the forward button only |

## The transitions

Development, all roles that see the middle of the lifecycle:

| Status | Back | Forward |
|---|---|---|
| Draft † | Save as Draft | Submit |
| Pending ‡ | Reject *(danger)* | Accept |
| `Accepted` (spine) | — | Move to In Progress |
| `In Progress` (spine) | — | Move to *first chain step* |
| first chain step | Return to In Progress | Move to *next* |
| any middle step | Return to *previous* | Move to *next* |
| last chain step | Return to *previous* | Move to Handoff / **Handoff** (admin) |
| `Review` (spine) ‡ | Reject *(outline)* | Accept |
| `Completed` (spine), Development only, `pendingDeploy` | — | Deploy *(admin only)* |

Names in italics come from the chain's own labels, so "Return to In QA" is
built at render time from whatever that step is called today. The wording the
design has an opinion about — "Move to Handoff" for an assignee, plain
"Handoff" for an admin — stays hard-coded, because the design does not
generate it either.

The first chain step returns to `In Progress`, the shared step it came from —
not to `Accepted`, because accepting is the admin's decision and not the
assignee's to undo.

`Review` only offers moves to `initiator` and `admin` — the assignee already
handed the AV off and isn't the one deciding. Its Reject is `variant="secondary"`
(outline), not the solid `variant="danger"` one `Pending` uses — the design
draws these two Rejects differently depending on lifecycle stage, not role.

## Resolved: issue #60's seven unnamed Figma variants

All seven placeholder variants the Figma audit found (7 Sep 2026, design: Eve)
are now named:

| Set | Variant | Resolved as |
|---|---|---|
| Development / Initiator Only | `Status4` | `Review` |
| Development / Initiator Only | `Review` *(empty)* | Removed — was empty by mistake, not a real state |
| Development / Admin | `Deploy` | Removed — not a status at all, see below |
| Development / Admin | `Review` *(drew Handoff)* | Doesn't exist separately — `Confirmed Prod` is the only status with a Handoff action |
| Development / Admin | `Review (completed 1)` | `Review` |
| Design / Initiator Only | `Status4` | `Review` |
| Design / Design Admin | `Status8` | `Review` |

**"Deploy" isn't a status — it's the admin's action once `Completed` is
reached but isn't final yet** (Development only; see `pendingDeploy`). An AV
gets there via `Confirmed Prod` → Handoff, and moves on from there via Deploy
→ `Review` → Accept → the real terminal `Completed`. Both `Completed`
checkpoints render identically on `StatusPill` — same tone, same text — design
was explicit this is a known, accepted quirk of this one domain, not
something to design around.

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
- **Don't expect a spine status other than `Draft`, `Pending`, `Accepted`,
  `Review`, or Development's `Completed` with `pendingDeploy` to offer
  moves.** `Backlog`, `Rejected` and `Reopened` are driven elsewhere; this
  renders `null` for them rather than an empty toolbar.
- **Don't build a transition label from a step's `id`.** The id is a stable
  key, not prose — `label` is the only field that knows what the step is
  called today.
- **Don't hold onto a chain.** It belongs to the domain and can change under
  you; read it where you render, don't cache it in component state.
- **Don't move the AV yourself on click.** `onTransition` reports the wish;
  the app owns the state and the save.
- **Don't render it for a terminal status expecting an empty box** — it
  returns `null`, so don't wrap it in decoration that would be left behind.
