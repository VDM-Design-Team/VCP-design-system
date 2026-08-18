import type { Meta, StoryObj } from '@storybook/react-vite';
import tokens from '../../dist/tokens.json';

/**
 * The same token gallery, inside Storybook — so design and engineering are
 * looking at one page, not two. Generated from dist/tokens.json; nothing here
 * is maintained by hand.
 */
const meta: Meta = { title: 'Foundations/Tokens', parameters: { layout: 'fullscreen' } };
export default meta;

const Swatch = ({ name, value, util }: { name: string; value: string; util: string }) => (
  <div className="flex items-center gap-2 border border-stroke-default rounded-md p-1.5">
    <div className="size-10 rounded-sm border border-stroke-default shrink-0" style={{ background: value }} />
    <div className="min-w-0">
      <div className="text-sm font-medium truncate">{name}</div>
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

const group = (obj: Record<string, string>, prefix: string, util: string) =>
  Object.entries(obj).map(([k, v]) => <Swatch key={k} name={`${prefix}.${k}`} value={v} util={`${util}-${k}`} />);

export const Colors: StoryObj = {
  render: () => (
    <div className="p-8 bg-surface-canvas">
      <h2 className="text-heading-lg font-semibold mb-xs">Semantic — use these in components</h2>
      <h3 className="text-body-sm text-text-secondary mb-1">Surface → bg-*</h3>
      <Grid>{group(flat(tokens.surface), 'surface', 'bg-surface')}</Grid>
      <h3 className="text-body-sm text-text-secondary mb-1">Text → text-*</h3>
      <Grid>{group(flat(tokens.text), 'text', 'text-text')}</Grid>
      <h3 className="text-body-sm text-text-secondary mb-1">Stroke → border-*</h3>
      <Grid>{group(flat(tokens.stroke), 'stroke', 'border-stroke')}</Grid>
      <h3 className="text-body-sm text-text-secondary mb-1">Action</h3>
      <Grid>{group(flat(tokens.action), 'action', 'bg-action')}</Grid>
      <h3 className="text-body-sm text-text-secondary mb-1">Accent</h3>
      <Grid>{group(flat(tokens.accent), 'accent', 'bg-accent')}</Grid>
      <h2 className="text-heading-lg font-semibold mb-xs">Core — referenced by semantic tokens only</h2>
      {Object.entries(tokens.color).map(([name, ramp]) => (
        <div key={name}>
          <h3 className="text-sm text-text-secondary mb-2xs">{name}</h3>
          <Grid>{group(ramp as Record<string, string>, `color.${name}`, `bg-${name}`)}</Grid>
        </div>
      ))}
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
