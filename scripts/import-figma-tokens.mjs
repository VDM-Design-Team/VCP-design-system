/**
 * One-shot importer: VCP fig-tokens.css (Figma Variables export) -> DTCG tokens/.
 * Re-runnable: overwrites tokens/core + tokens/semantic from the export.
 *   node scripts/import-figma-tokens.mjs <path-to-fig-tokens.css>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = readFileSync(process.argv[2], 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.includes('@kind') ? c : '');

/* ---- carve the file into its selector blocks ---- */
const blocks = {};
for (const m of src.matchAll(/^([^\n{}]+)\{([\s\S]*?)^\}/gm)) {
  const sel = m[1].trim();
  blocks[sel] = (blocks[sel] || '') + m[2];
}
const base  = blocks[':root'] ?? '';
const light = blocks[':root[data-theme="light"], .light'] ?? '';
const dark  = blocks[':root[data-theme="dark"], .dark'] ?? '';

const parseVars = (css) => {
  const out = {};
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);(?:\s*\/\*\s*@kind (\w+)\s*\*\/)?/gi))
    out[m[1]] = { value: m[2].trim(), kind: m[3] ?? null };
  return out;
};
const B = parseVars(base), L = parseVars(light), D = parseVars(dark);

/* ---- helpers ---- */
const hex2 = (n) => Math.round(n).toString(16).padStart(2, '0');
const toHex = (v) => {
  let m = v.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);
  if (m) return `#${hex2(+m[1])}${hex2(+m[2])}${hex2(+m[3])}${hex2(+m[4] * 255)}`;
  m = v.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (m) return `#${hex2(+m[1])}${hex2(+m[2])}${hex2(+m[3])}`;
  return v;
};
const NOISE = /(^|-)(schemes|state-layers)(-|$)|-[23]$|^(body|title|label|font|plain|weight|width|current|4xl|sm|md|lg|button)(-|$)|^\d+$/;

/* core ramp name -> DTCG path under color.* */
/* 'primary' (pink) dropped 2026-08-18 — design confirmed it is not a brand color;
   vcp-blue is the brand. 'secondary' (teal) kept as teal-legacy pending the same call. */
const RAMPS = { 'vcp-blue': 'vcp-blue', slate: 'slate', neutral: 'neutral', blue: 'blue', green: 'green', red: 'red', yellow: 'yellow', secondary: 'teal-legacy', monochrome: 'monochrome' };

const core = { color: { $type: 'color' } };
const rampRef = {};   // css var name -> {color.x.y} reference
for (const [name, { value, kind }] of Object.entries(B)) {
  if (kind !== 'color' || !value.startsWith('rgb')) continue;
  const m = name.match(/^colors-([a-z-]+?)-(\d+|white|black|transparent)$/);
  if (!m || !RAMPS[m[1]]) continue;
  const ramp = RAMPS[m[1]], step = m[2];
  (core.color[ramp] ??= {})[step] = { $value: toHex(value) };
  rampRef[name] = `{color.${ramp}.${step}}`;
}

/* ---- semantic: resolve each var to a ramp reference or a literal ---- */
const refOrHex = (raw, scope) => {
  const m = raw.match(/var\(--([a-z0-9-]+)\)/i);
  if (!m) return toHex(raw);
  const target = m[1].replace(/-2$/, '');
  if (rampRef[target]) return rampRef[target];
  const upstream = scope[target] ?? B[target];
  return upstream ? refOrHex(upstream.value, scope) : toHex(raw);
};

const buildSemantic = (scope) => {
  const merged = { ...B, ...scope };
  const out = {};
  for (const [name, { value, kind }] of Object.entries(merged)) {
    if (kind !== 'color') continue;
    const m = name.match(/^colors-(surface|text|stroke|action|accent)-(.+)$/);
    if (!m) continue;
    if (NOISE.test(m[2])) continue;
    const path = [m[1], ...m[2].split('-')];
    let cur = (out[path[0]] ??= { $type: 'color' });
    for (let i = 1; i < path.length - 1; i++) cur = (cur[path[i]] ??= {});
    cur[path.at(-1)] = { $value: refOrHex(value, merged) };
  }
  return out;
};

const semLight = buildSemantic(L);
const semDark  = buildSemantic(D);

/* WCAG AA fixes, light theme only (dark already passes) — approved by design 2026-08-18.
   Applied post-import so re-running the importer never regresses them. */
const setPath = (obj, path, value, desc) => {
  const keys = path.split('.');
  let cur = obj;
  for (const k of keys.slice(0, -1)) cur = cur[k];
  cur[keys.at(-1)] = { $value: value, ...(desc ? { $description: desc } : {}) };
};
setPath(semLight, 'text.tertiary', '{color.slate.600}', 'AA fix: was slate-500; darkened so subtle could move up and stay readable');
setPath(semLight, 'text.subtle',   '{color.slate.500}', 'AA fix: was slate-400 (2.56:1, fails). Now 4.76:1 on white');
setPath(semLight, 'accent.success.tonal.content.default', '{color.green.900}', 'AA fix: green-800 was exactly 4.50:1; green-900 gives 8.2:1');

/* stroke.field — the resting border of a form control. Figma has no such variable:
   the export borders fields with stroke.default, which is 1.48:1 against the field
   and fails the 3:1 that 1.4.11 asks of a control boundary. Neither neighbour in the
   ramp works — strong is 2.56:1 (still failing) and stronger is 7.58:1, which reads as
   a focused or error state at rest. This sits between them, in both themes.
   Added here rather than only in tokens/ so re-importing from Figma cannot drop it. */
setPath(semLight, 'stroke.field', '{color.slate.500}', 'Form-control resting border: 4.76:1 on base and elevated, 4.55:1 on canvas');
setPath(semDark,  'stroke.field', '{color.slate.400}', 'Form-control resting border, dark: 5.71:1 on base and elevated, 6.96:1 on canvas');

/* ---- spacing / borders from the base collection ---- */
const space = { space: { $type: 'dimension' } };
for (const [name, { kind, value }] of Object.entries(B))
  if (kind === 'spacing' && /^\d+$/.test(name)) space.space[name] = { $value: `${value}px` };
const border = { borderWidth: { $type: 'dimension',
  default: { $value: `${B['width-default']?.value ?? 1}px` },
  focused: { $value: `${B['width-focused']?.value ?? 2}px` } } };

/* ---- write ---- */
mkdirSync('tokens/core', { recursive: true }); mkdirSync('tokens/semantic', { recursive: true });
const w = (p, o) => { writeFileSync(p, JSON.stringify(o, null, 2) + '\n'); console.log('✔', p); };
w('tokens/core/color.json', core);
w('tokens/core/dimension.json', space);
w('tokens/semantic/color.json', semLight);
w('tokens/semantic/color.dark.json', { dark: semDark });
w('tokens/semantic/border.json', border);

const count = (o) => typeof o === 'object' && !o.$value ? Object.values(o).reduce((a, v) => a + count(v), 0) : 1;
console.log(`core ramps: ${Object.keys(core.color).length - 1}, light semantic: ${count(semLight)}, dark semantic: ${count(semDark)}, spacing: ${Object.keys(space.space).length - 1}`);
