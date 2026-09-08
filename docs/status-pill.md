# StatusPill

An Added Value's status, worn as a pill — a component composing `Badge`,
and the owner of VCP's status vocabulary: this file and its `.tsx` are where
the status → tone mapping lives, and nowhere else.

**The vocabulary is open.** An AV's flow is a fixed spine wrapped around a
per-domain middle (issue #68). Ten spine statuses are fixed and shared by
every domain; the middle is whatever Design, Development, Content, Partners,
Governance or Product defines, renameable at will. So this component knows
ten statuses by name and accepts any number it has never heard of.

## Composed of

| Piece | Tier |
|---|---|
| `Badge` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `StatusPill` | Any surface showing an AV's status: tables, cards, detail panels |
| `Badge` | Generic classification with no VCP vocabulary |
| The options dropdown *(to port)* | **Changing** a status — this pill only shows one |

**The tier rule, demonstrated.** StatusPill composes one atom (`Badge`) into
one richer unit — a component, per CLAUDE.md's composition test. The VCP
vocabulary it carries doesn't change its tier; it changes its *ownership*:
the status → tone mapping lives here and only here.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `AVStatus` | — | A spine status. Ten values; a typo is a compile error |
| `custom` | `string` | — | A domain step, by whatever name the domain gives it |
| `actionable` | `boolean` | `false` | Draw the design's button style. Today only `Review` differs |
| `size` | `'sm' \| 'md'` | `'md'` | Inherited from `Badge` |

**`status` and `custom` are mutually exclusive**, enforced by the type. Exactly
one is required. That is the whole API: a domain label can never silently take
a spine treatment, and a misspelled spine status can never silently fall
through to the custom one.

```tsx
<StatusPill status="Draft" />          // spine — its own tone
<StatusPill custom={step.label} />     // domain — the shared tone
```

`AV_STATUSES` exports the spine vocabulary in lifecycle order for pickers,
legends and tests. Domain steps are not in it and cannot be — they live in the
domain's own configuration, which this repo does not own.

## The mapping

**Eleven spine statuses** — the Figma `Status_Tag_General` set plus
`Final Completed`, which the flow board draws but the tag set has no tag for,
and less the
`Review No Action` variant, which is not a state but `Review`'s second
treatment (confirmed 7 Sep 2026) and is being renamed in Figma — every fill below is the design's, matched to the
token that already carried that exact hex.

| Status | Treatment | Figma fill / text |
|---|---|---|
| Draft | neutral tonal | `#e2e8f0` / `#334155` |
| Initiated | warning tonal | `#fef9c2` / `#a65f00` |
| Pending | warning tonal | `#fef9c2` / `#a65f00` |
| Accepted | info tonal | `#dbeafe` / `#1447e6` |
| In Progress | info tonal | `#dbeafe` / `#1447e6` |
| Review | info tonal | `#dbeafe` / `#1447e6` |
| Review *(actionable)* | **info filled** | `#155dfc` / `#ffffff` |
| Completed | warning tonal | `#fef9c2` / `#a65f00` |
| Final Completed | success tonal | `#dcfce7` / `#008236` |
| Rejected | danger tonal | `#ffe2e2` / `#9f0712` |
| Reopened | info tonal | `#dbeafe` / `#1447e6` |
| Backlog | neutral tonal | `#e2e8f0` / `#334155` |

**`Review` is drawn twice**, and both pills are in the library. Tonal is the
label style — what a user sees. Filled is the button style, for a viewer who
can act on it: an admin, or the AV's initiator. Same status; only who is
looking changes.

```tsx
<StatusPill status="Review" />              // a user sees a label
<StatusPill status="Review" actionable />   // an admin sees a call to act
```

`actionable` on any other status is a no-op. The design draws one treatment
for each of them, and this component will not invent a filled variant nobody
has drawn — when design draws another, it gets a row in
`ACTIONABLE_TREATMENT`. That is also why `Badge` has a `variant`: the
treatment belongs to the atom, and this component composes it.

**Every domain step wears one treatment:** the info tonal, `#dbeafe` on
`#1447e6`, 5.60:1. Design's call, 7 Sep 2026. The reasoning is that this
component knows nothing about a step it did not define, so calling one a
"warning" would assert a meaning it cannot have.

### The two Completed states

`Completed` and `Final Completed` are **two states, not one**. `Completed` is
the assignee's: their work is done, and it is waiting on someone to accept it.
`Final Completed` is what an initiator or admin moves it to after reviewing.

The flow board has always drawn them as separate nodes — `Completed (1) +
Adding deliverables` and `Final Completed`. Only the tag set collapsed them,
which is why they briefly reached this repo as one status plus a boolean flag,
rendering identically and telling nobody apart.

The tones follow the mapping's own logic rather than inventing anything:
`Completed` is waiting on a human gate, exactly as `Pending` and `Initiated`
are, so it takes their tone. `Final Completed` is reached and verified, so it
keeps the success green `Completed` used to have.

⚠️ **`Status_Tag_General` has no `Final Completed` tag.** Same gap the 4 Sep
audit found for the six lifecycle states: the board draws a state the tag set
cannot label. Figma needs to catch up.

⚠️ **Three spine statuses share the custom fill** — `Accepted`, `In Progress`
and `Reopened` are also info tonal, so they are not distinguishable from a domain
step by colour. Their text is, which is why there is no dot and never
was: the word is the signal. Worth knowing before anyone builds a legend that
groups by colour.

## What changed on 7 September

`AVStatus` held seventeen values until this change. Six of them were domain
steps — `For Review`, `For QA`, `In QA`, `Ready for Deploy`, `Confirmed Prod`,
`Design Review` — added on 4 September when the audit found the progression
buttons moving AVs through states this tag set could not label.

**The Figma library is the model, one for one.** `Status_Tag_General`'s eleven
types are `AVStatus`; `Status_Tag_Design_Only` and
`Status_Tag_Development_Only` are those domains' chains. `In Progress` is in
General, so it is spine — it appears inside every domain's chain on the flow
board because every domain passes through it, not because any domain owns it.

That was correct while the flow had two hardcoded domains. It stopped being
correct once domains could add and rename their own steps: a `Record<AVStatus,
Treatment>` keyed by name cannot be indexed by a name that arrives as data,
and a renamed status breaks it with no compile error.

The six are gone from the union. They now render through `custom`, and all
six wear the one shared treatment — which changes five of them visually:
`For Review`, `For QA`, `Ready for Deploy` and `Design Review` were warning,
`Confirmed Prod` was success. See CHANGELOG.md for the migration.

**What this costs.** `StatusProgression`'s `AVProgressionStatus` was an
`Extract<AVStatus, …>`, which made "a lifecycle state with no tag" a compile
error. Seven of its eleven members were domain steps, so that guarantee does
not survive — there is nothing left to extract from. It was the right
guarantee for a closed vocabulary and there is no equivalent for an open one.

**Answered 7 September.** The library draws two Review pills, and the second
is named `Review No Action` — which is not a state and never was. It is one
status with two treatments: a label for a user, the button style for someone
who can act. So `Review No Action` is gone from `AVStatus` and `actionable`
carries the difference. The Figma variant is being renamed.

This also settles the colour-alone worry the earlier note raised: the two
pills are the same status, so nothing is being distinguished by colour that
the text should be carrying.

## Accessibility

- Everything Badge guarantees, inherited: no focus, no events, truncation,
  AA contrast per tone.
- The status word is the signal — there is no dot (the design has none), so
  two statuses sharing a fill are still told apart by their text.
- **Not clickable, on purpose.** The export offered `interactive`/`onClick`
  on a span; Badge's rule holds — changing status is the options dropdown's
  job (`AV_Options_Dropdown` in docs/figma-annotations.md), which will be its
  own component with real menu semantics.

## Don't

- **Don't map statuses to tones anywhere else.** `tone={status === 'Blocked'
  ? 'danger' : …}` at a call site means this file failed; add here instead.
- **Don't add a domain step to `AVStatus`.** The union is the spine — the
  statuses every domain shares and the application branches on. A step that
  belongs to one domain goes through `custom`, whatever it is called.
- **Don't reach for `custom` to dodge a type error.** If a spine status won't
  compile, the name is wrong; fix the name. `custom="Draft"` renders the
  wrong colour and silently leaves the spine.
- **Don't wrap it in an `onClick`** — that control can't be reached by
  keyboard, which is why this piece refuses to be one.
- **Don't use it for anything but AV status** — urgency is `UrgencyTag`,
  roles are `RoleBadge` (both to port).
