# StatusProgression *(component)*

The "move this Added Value along" buttons: at most a step back and a step
forward, drawn from the lifecycle the viewer is actually allowed to drive.
Read off the Figma **Status Progression Buttons** page — eight component sets,
two workflows × four viewer roles.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Button` | atom | Every transition, at `size="sm"` (36 = the design's 37) |
| `StatusPill` | component | **Type only** — `AVProgressionStatus` is a subset of its `AVStatus`. Nothing rendered |

One atom, used twice — which is why this is a **component**, not a pattern:
it presents as one control unit. `AVHeader` is the pattern that places it.

The import rows are checked against the real imports — `npm test` fails if
this list drifts.

## When to use

| Situation | Use |
|---|---|
| An AV page's header | This, via `AVHeader` |
| A row of AVs in a table | Not this — a table row offers a menu, not a toolbar |
| Any "what can I do to this AV?" question in code | `avTransitions(workflow, role, status)` |

## This owns the mapping

`StatusPill` owns status → tone. **This owns status → transitions.** Call
sites pass the three facts and handle the callback:

```tsx
<StatusProgression
  workflow="development"
  role="assignee"
  status={av.status}
  onTransition={(t) => save(t)}
/>
```

If you find yourself writing `status === 'For Review' ? …` anywhere else, the
line you want is already in `TRANSITIONS`.

Every label is the design's own wording, **not** generated from the status
name — the design says "Move to Handoff" to an assignee and plain "Handoff"
to an admin, and we say what it says.

## One vocabulary, two owners

`StatusPill` owns the **vocabulary and its tones**. This owns the
**transitions over it**. `AVProgressionStatus` is literally a subset:

```ts
export type AVProgressionStatus = Extract<AVStatus, 'Draft' | 'Pending' | …>;
```

`Extract` is doing real work — adding a state here that `StatusPill` cannot
display is a **compile error**.

That was not true when this component shipped. The audit (batch 3a) found the
two vocabularies disagreeing: six states here — `For Review`, `For QA`,
`In QA`, `Ready for Deploy`, `Confirmed Prod`, `Design Review` — had no tag to
wear, so an AV parked in any of them could not be labelled. The lead's call
(4 Sep 2026) was to build the six into `StatusPill`, and the subset
relationship above is what keeps them from drifting apart again.

⚠️ **Figma has not caught up.** Those six tags do not exist in
`Status_Tag_General`; the repo is the source of truth and the design file
needs the addition. See [figma-audit.md](figma-audit.md).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `workflow` | `'development' \| 'design'` | `'development'` | Which lifecycle this AV runs on |
| `role` | `'assignee' \| 'initiator' \| 'assignee-initiator' \| 'admin'` | — | **Required.** Who is looking — the design draws a set per role |
| `status` | `AVProgressionStatus` | — | **Required.** Where the AV is now |
| `onTransition` | `(t: AVTransition) => void` | — | A press. The AV does not move until you move it |
| `disabled` | `boolean` | — | Every button, e.g. while the viewer's rights load |
| `loading` | `boolean` | — | Spins the committing button only; the way back stays readable |
| `className` | `string` | — | On the group |
| `ref` | `Ref<HTMLDivElement>` | — | The group |

`AVTransition` is `{ kind, to?, label, variant }` — `kind` is what happened
(`move`, `return`, `save-draft`, `submit`, `accept`, `reject`, `handoff`),
`to` is the destination on `move`/`return`, and `label` is what the button
said, so a confirm dialog can quote it back.

## The transitions

Development, all roles that see the middle of the lifecycle:

| Status | Back | Forward |
|---|---|---|
| Draft † | Save as Draft | Submit |
| Pending ‡ | Reject *(danger)* | Accept |
| Accepted | — | Move to In Progress |
| In Progress | — | Move to For Review |
| For Review | Return to In Progress | Move to For QA |
| For QA | Return to For Review | Move to In QA |
| In QA | Return to For QA | Move to Ready for Deploy |
| Ready for Deploy | Return to In QA | Move to Confirmed Prod |
| Confirmed Prod | Return to Ready for Deploy | Move to Handoff / **Handoff** (admin) |
| Completed | — | — *(renders nothing)* |

† `assignee-initiator`, `initiator` and `admin` only. ‡ `admin` only.

Design runs the same shape over a shorter lifecycle: Draft †, Pending ‡,
Accepted → In Progress → Design Review → Handoff.

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
- **Don't pass a non-transitioning `AVStatus` here** (`Backlog`, `Rejected`,
  `Reopened`, …) — `AVProgressionStatus` is the subset that has moves, and
  TypeScript will say so.
- **Don't move the AV yourself on click.** `onTransition` reports the wish;
  the app owns the state and the save.
- **Don't render it for a terminal status expecting an empty box** — it
  returns `null`, so don't wrap it in decoration that would be left behind.
