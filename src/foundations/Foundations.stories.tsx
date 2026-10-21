import type { Meta, StoryObj } from '@storybook/react-vite';
import { Title, Subtitle, Description, Primary, Controls, Stories } from '@storybook/addon-docs/blocks';
import tokens from '../../dist/tokens.json';

/**
 * The same token gallery, inside Storybook — so design and engineering are
 * looking at one page, not two. Generated from dist/tokens.json; nothing here
 * is maintained by hand.
 *
 * Which token to reach for is a separate question from what a token looks
 * like — see docs/color-tokens.md for role-based selection guidance.
 */
const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      // Custom docs page, needed only for includePrimary={false} below.
      // The default page's <Stories> renders every story including the
      // first one, which <Primary> already showed — so the Colors story's
      // own opening heading rendered twice on this page.
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
};
export default meta;

const Swatch = ({ name, value, util }: { name: string; value: string; util: string }) => (
  <div className="flex items-center gap-2 border border-stroke-default rounded-md p-1.5">
    <div className="size-10 rounded-sm border border-stroke-default shrink-0" style={{ background: value }} />
    <div className="min-w-0">
      <div className="text-sm font-medium break-words">{name}</div>
      <div className="text-xs text-text-secondary">{value}</div>
      <code className="text-xs text-text-secondary">{util}</code>
    </div>
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-1.5 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
    {children}
  </div>
);

const flat = (obj: object, prefix: string[] = []): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === '$type') continue;
    if (typeof v === 'string') out[[...prefix, k].join('-')] = v;
    else Object.assign(out, flat(v as object, [...prefix, k]));
  }
  return out;
};

/**
 * `label` defaults to the fully qualified token name. The action grids override it
 * with the state alone — their headings already carry the prominence and the part,
 * and the utility line under each swatch still spells the whole thing out.
 */
const group = (
  obj: Record<string, string>,
  prefix: string,
  util: string,
  label: (key: string) => string = (k) => `${prefix}.${k}`,
) => Object.entries(obj).map(([k, v]) => <Swatch key={k} name={label(k)} value={v} util={`${util}-${k}`} />);

/**
 * Action tokens are keyed prominence → part → state, but a control is styled part
 * by part, so the gallery reads them part first. `border` only exists on secondary;
 * primary fills and tertiary stays bare, so neither draws one.
 */
const ACTION_PROMINENCE = ['primary', 'secondary', 'tertiary'] as const;

const ACTION_PARTS = [
  { part: 'surface', util: 'bg-action', note: "The control's fill." },
  { part: 'content', util: 'text-action', note: 'Label and icon colour.' },
  { part: 'border', util: 'border-action', note: 'Outline — secondary only.' },
] as const;

const actionTokens = tokens.action as Record<
  (typeof ACTION_PROMINENCE)[number],
  Record<string, Record<string, string>>
>;

export const Colors: StoryObj = {
  render: () => (
    <div className="p-8 bg-surface-canvas">
      <h2 className="text-heading-lg-semibold font-semibold mb-xs">Semantic — use these in components</h2>
      <h3 className="text-caption-md-regular text-text-secondary mb-1">Surface → bg-*</h3>
      <Grid>{group(flat(tokens.surface), 'surface', 'bg-surface')}</Grid>
      <h3 className="text-caption-md-regular text-text-secondary mb-1">Text → text-*</h3>
      <Grid>{group(flat(tokens.text), 'text', 'text-text')}</Grid>
      <h2 className="text-heading-lg-semibold font-semibold mb-1">Action — grouped by part</h2>
      <p className="text-caption-md-regular text-text-secondary mb-2">
        A control is built from three parts, and each part maps to a different Tailwind utility.
        Pick the part you are styling, then read across primary, secondary and tertiary to compare
        how the same part behaves at each level of prominence. Every row is one part's complete
        state set — default, hover, pressed, selected, deselected, disabled.
      </p>
      {ACTION_PARTS.map(({ part, util, note }) => (
        <section key={part}>
          <h3 className="text-caption-md-regular text-text-secondary mb-1">
            {part} → <code>{util}-*</code>
          </h3>
          <p className="text-caption-md-medium text-text-secondary mb-2">{note}</p>
          {ACTION_PROMINENCE.filter((p) => part in actionTokens[p]).map((p) => (
            <div key={p}>
              <h4 className="text-caption-md-medium text-text-secondary mb-1 capitalize">{p}</h4>
              <Grid>
                {group(
                  actionTokens[p][part],
                  `action.${p}.${part}`,
                  `${util}-${p}-${part}`,
                  (state) => state,
                )}
              </Grid>
            </div>
          ))}
        </section>
      ))}
      <h3 className="text-caption-md-regular text-text-secondary mb-1">Stroke → border-*</h3>
      <Grid>{group(flat(tokens.stroke), 'stroke', 'border-stroke')}</Grid>
      <h3 className="text-caption-md-regular text-text-secondary mb-1">Accent</h3>
      <Grid>{group(flat(tokens.accent), 'accent', 'bg-accent')}</Grid>
      <h2 className="text-heading-lg-semibold font-semibold mb-xs">Core — referenced by semantic tokens only</h2>
      {Object.entries(tokens.color).map(([name, ramp]) => (
        <div key={name}>
          <h3 className="text-sm text-text-secondary mb-2xs">{name}</h3>
          <Grid>{group(ramp as Record<string, string>, `color.${name}`, `bg-${name}`)}</Grid>
        </div>
      ))}
    </div>
  ),
};

type ShadowLayer = { color: string; offsetX: string; offsetY: string; blur: string; spread: string };

/* Shadows are one layer (VCP's card, menu, …) or several (GDL's elevation.1–7,
   nested a level deeper); either way the CSS is the layers joined. */
const shadows = (obj: object, path: string[] = []): [string[], string][] =>
  Object.entries(obj).flatMap(([k, v]) =>
    Array.isArray(v) || 'color' in v
      ? [[[...path, k], ([] as ShadowLayer[]).concat(v).map((l) => `${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread} ${l.color}`).join(', ')]]
      : shadows(v as object, [...path, k]),
  );

/* Swatches take the token's value inline, like the colour swatches. A
   `rounded-${k}` built at runtime never reaches Tailwind's source scan, so only
   the names some component already spells out (rounded-md, shadow-menu, …) got a
   utility — GDL's rounded-8 or shadow-elevation-3 rendered square and flat here,
   though they work in components, where the class is written in full. */
export const Shape: StoryObj = {
  render: () => (
    <div className="p-8 bg-surface-canvas">
      <h2 className="text-heading-lg-semibold font-semibold mb-1">Radius → rounded-*</h2>
      <Grid>
        {Object.entries(tokens.radius).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 border border-stroke-default rounded-md p-1.5">
            <div className="size-10 bg-action-primary-surface-default shrink-0" style={{ borderRadius: v as string }} />
            <div className="min-w-0">
              <div className="text-sm font-medium break-words">radius.{k}</div>
              <div className="text-xs text-text-secondary">{v as string}</div>
              <code className="text-xs text-text-secondary">rounded-{k}</code>
            </div>
          </div>
        ))}
      </Grid>
      <h2 className="text-heading-lg-semibold font-semibold mb-1">Elevation → shadow-*</h2>
      <Grid>
        {shadows(tokens.shadow).map(([path, css]) => (
          <div key={path.join('.')} className="flex items-center gap-2 border border-stroke-default rounded-md p-1.5">
            <div className="size-10 bg-surface-elevated shrink-0 rounded-sm" style={{ boxShadow: css }} />
            <div className="min-w-0">
              <div className="text-sm font-medium break-words">shadow.{path.join('.')}</div>
              <div className="text-xs text-text-secondary">{css}</div>
              <code className="text-xs text-text-secondary">shadow-{path.join('-')}</code>
            </div>
          </div>
        ))}
      </Grid>
    </div>
  ),
};

export const Type: StoryObj = {
  render: () => (
    <div className="p-8 bg-surface-canvas">
      {Object.entries(tokens.type).map(([k, v]) => (
        <div key={k} className="flex items-center gap-4 py-1.5 border-b border-stroke-default">
          <code className="text-xs text-text-secondary w-28 shrink-0">text-{k}</code>
          <span className="text-xs text-text-secondary w-14 shrink-0">{(v as any).fontSize}</span>
          <div style={{ fontSize: (v as any).fontSize, fontWeight: (v as any).fontWeight, lineHeight: (v as any).lineHeight }}>The quick brown fox</div>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: StoryObj = {
  render: () => (
    <div className="p-8 bg-surface-canvas">
      {Object.entries(tokens.space).map(([k, v]) => (
        <div key={k} className="flex items-center gap-4 py-1.5 border-b border-stroke-default">
          <code className="text-xs text-text-secondary w-32 shrink-0">p-{k} / gap-{k}</code>
          <span className="text-xs text-text-secondary w-14 shrink-0">{v as string}</span>
          <div className="h-3 bg-action-primary-surface-default rounded-sm" style={{ width: v as string }} />
        </div>
      ))}
    </div>
  ),
};
