# StatusPill

An Added Value's status, worn as a pill — a component composing `Badge`,
and the owner of VCP's status vocabulary: this file and its `.tsx` are where
the status → tone mapping lives, and nowhere else.

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
| `status` | `AVStatus` | required | The seventeen-value union — a typo is a compile error |
| `size` | `sm \| md` | `md` | Badge's sizes; `sm` for the AV table's cells |
| everything else | `BadgeProps` minus `tone`/`variant`/`icon`/`children` | — | The pill *is* a Badge; this piece owns what those carried |

`AV_STATUSES` exports the vocabulary in lifecycle order for pickers,
legends and tests.

## The mapping

Seventeen statuses. **Eleven come straight from the Figma
`Status_Tag_General` set** (design audit, 3 Sep 2026) — every fill below is
the design's, matched to the token that already carried that exact hex.
**Six were added on 4 Sep 2026** by the lead's call; Figma does not draw them
yet (see "The six additions" below).

| Status | Treatment | Figma fill / text |
|---|---|---|
| Draft | neutral tonal | `#e2e8f0` / `#334155` |
| Initiated | warning tonal | `#fef9c2` / `#a65f00` |
| Pending | warning tonal | `#fef9c2` / `#a65f00` |
| Accepted | info tonal | `#dbeafe` / `#1447e6` |
| In Progress | info tonal | `#dbeafe` / `#1447e6` |
| **For Review** ✚ | warning tonal | *not in Figma* |
| **Review** | **info filled** | `#155dfc` / `#ffffff` |
| Review No Action | info tonal | `#dbeafe` / `#1447e6` |
| **Design Review** ✚ | warning tonal | *not in Figma* |
| **For QA** ✚ | warning tonal | *not in Figma* |
| **In QA** ✚ | info tonal | *not in Figma* |
| **Ready for Deploy** ✚ | warning tonal | *not in Figma* |
| **Confirmed Prod** ✚ | success tonal | *not in Figma* |
| Completed | success tonal | `#dcfce7` / `#008236` |
| Rejected | danger tonal | `#ffe2e2` / `#9f0712` |
| Reopened | info tonal | `#dbeafe` / `#1447e6` |
| Backlog | neutral tonal | `#e2e8f0` / `#334155` |

✚ = added 4 Sep 2026, no Figma tag yet.

`Review` is the design's one **solid** tag — the review that wants acting
on. It is why `Badge` has a `variant`: the treatment belongs to the atom,
and this component composes it.

**What changed at the audit.** This component shipped with the Claude Design
export's seven statuses — `Ready for review`, `Ready for hand-off`,
`Blocked` and `Archive` among them. None of those exist in the design. They
are gone. The decorative dot is gone
too: the Figma tag is text on a fill, and the text is what separates two
statuses that share a colour.

## The six additions ✚

The audit's batch 3a found the `StatusProgression` buttons moving AVs through
six states this tag set had no tag for — **an AV parked in `For QA` had
nothing to wear.** The lead's call (4 Sep 2026) was to build them here.

They introduce **no new treatment**: each reuses a tone the mapping already
uses, following the logic already in it.

| Tone | Means | Already | Added |
|---|---|---|---|
| warning tonal | waiting on a human gate | `Pending`, `Initiated` | `For Review`, `Design Review`, `For QA`, `Ready for Deploy` |
| info tonal | work actually happening | `In Progress`, `Accepted` | `In QA` |
| success tonal | reached and verified | `Completed` | `Confirmed Prod` |

`Review` stays the **only** filled tag, exactly as the design has it — all
six additions are tonal, so the tag set's visual language is unchanged.

`StatusProgression`'s `AVProgressionStatus` is now a literal subset of
`AVStatus` (`Extract<…>`), so a lifecycle state with no tag is a compile
error. The two cannot drift apart again.

⚠️ **Figma needs to catch up.** The repo is the source of truth
(CLAUDE.md), so these six now exist here and not in `Status_Tag_General`.
Adding them to the design file closes the gap.

**Open question for design:** Figma labels both `Review` and
`Review No Action` with the visible word "Review". We render each status's
own name, so the two are distinguishable without relying on colour. If both
should read "Review", that needs a `label` override and a decision about the
colour-only distinction.

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
- **Don't extend `AVStatus` casually** — it is the design's vocabulary; a new
  status is a product decision with a lifecycle position and a Figma tag,
  not a variant.
- **Don't wrap it in an `onClick`** — that control can't be reached by
  keyboard, which is why this piece refuses to be one.
- **Don't use it for anything but AV status** — urgency is `UrgencyTag`,
  roles are `RoleBadge` (both to port).
