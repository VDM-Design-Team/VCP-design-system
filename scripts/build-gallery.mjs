/**
 * Generates a standalone visual gallery of every token, straight from
 * dist/tokens.json. Nobody maintains it by hand — regenerate and it's current.
 *
 *   npm run gallery  ->  gallery/index.html
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const T = JSON.parse(readFileSync('dist/tokens.json', 'utf8'));

/* ---------- WCAG contrast, so the gallery flags its own problems ---------- */
const srgb = (h) => {
  const n = h.replace('#', '');
  const f = n.length === 3 ? n.split('').map((c) => c + c).join('') : n.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
};
const lum = (h) =>
  srgb(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

/* ---------- sections ---------- */
const swatch = (name, val, cls) => `
  <div class="sw">
    <div class="chip" style="background:${val}"></div>
    <div class="meta"><b>${esc(name)}</b><span>${esc(val)}</span><code>${esc(cls)}</code></div>
  </div>`;

const ramp = (label, group, tokenPrefix, util) => `
  <h3>${esc(label)}</h3><div class="grid">
  ${Object.entries(group).map(([k, v]) => swatch(`${tokenPrefix}.${k}`, v, `${util}-${k}`)).join('')}
  </div>`;

const PAIRS = [
  ['text.primary',   'surface.canvas', 'Body text on the canvas'],
  ['text.primary',   'surface.base',   'Body text on a card'],
  ['text.secondary', 'surface.base',   'Secondary text on a card'],
  ['text.tertiary',  'surface.base',   'Tertiary text on a card'],
  ['text.subtle',    'surface.base',   'Subtle text on a card'],
  ['text.disabled',  'surface.base',   'Disabled text', 'exempt'],
  ['action.primary.content.default', 'action.primary.surface.default', 'Primary button label'],
  ['action.secondary.content.default', 'surface.base', 'Secondary button label'],
  ['text.link.default', 'surface.base', 'Links'],
  ['accent.critical.filled.content.default', 'accent.critical.filled.surface.default', 'Destructive button label'],
  ['accent.critical.tonal.content.default', 'accent.critical.tonal.surface.default', 'Critical tonal badge'],
  ['accent.success.tonal.content.default', 'accent.success.tonal.surface.default', 'Success tonal badge'],
  ['accent.warning.tonal.content.default', 'accent.warning.tonal.surface.default', 'Warning tonal badge'],
  ['accent.info.tonal.content.default', 'accent.info.tonal.surface.default', 'Info tonal badge'],
];
const get = (path) => path.split('.').reduce((o, k) => o?.[k], T);
const flat = (obj, prefix = []) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === '$type') continue;
    if (typeof v === 'string') out[[...prefix, k].join('-')] = v;
    else Object.assign(out, flat(v, [...prefix, k]));
  }
  return out;
};

const contrastRows = PAIRS.map(([fg, bg, use, flag]) => {
  const f = get(fg), b = get(bg);
  const r = ratio(f, b);
  const aa = r >= 4.5, aaLarge = r >= 3;
  const verdict = flag === 'exempt' ? ['warn', 'WCAG-exempt'] : aa ? ['pass', 'AA'] : aaLarge ? ['warn', 'AA large only'] : ['fail', 'FAIL'];
  return `<tr>
    <td><span class="prev" style="background:${b};color:${f}">Aa</span> ${esc(use)}</td>
    <td><code>${esc(fg)}</code> on <code>${esc(bg)}</code></td>
    <td class="num">${r.toFixed(2)}:1</td>
    <td><span class="badge ${verdict[0]}">${verdict[1]}</span></td>
  </tr>`;
}).join('');

const typeRows = Object.entries(T.type ?? {}).map(([k, v]) =>
  `<div class="row"><code>text-${k}</code><span class="val">${v.fontSize}</span>
   <div style="font-family:${Array.isArray(v.fontFamily)?v.fontFamily.join(','):v.fontFamily};font-size:${v.fontSize};font-weight:${v.fontWeight};line-height:${v.lineHeight}${v.letterSpacing?';letter-spacing:'+v.letterSpacing:''}">The quick brown fox — 0123456789</div></div>`).join('');

const weightRows = Object.entries(T.font.weight).map(([k, v]) =>
  `<div class="row"><code>font-weight-${k}</code><span class="val">${v}</span>
   <div style="font-weight:${v};font-size:18px;font-family:Poppins,sans-serif">The quick brown fox</div></div>`).join('');

const spaceRows = Object.entries(T.space)
  .sort((a, b) => parseInt(a[1]) - parseInt(b[1]))
  .map(([k, v]) => {
    const tw = parseInt(v) / 4;
    return `<div class="row"><code>${v} → p-${tw} / gap-${tw}</code><span class="val">${v}</span>
   <div class="bar" style="width:${v}"></div></div>`;
  }).join('');

const radiusRow = Object.entries(T.radius).map(([k, v]) =>
  `<div class="sw"><div class="chip rad" style="border-radius:${v}"></div>
   <div class="meta"><b>radius.${k}</b><span>${v}</span><code>rounded-${k}</code></div></div>`).join('');

const shadowRow = Object.entries(T.shadow).map(([k]) =>
  `<div class="sw"><div class="chip shadow" style="box-shadow:var(--shadow-${k})"></div>
   <div class="meta"><b>shadow.${k}</b><code>shadow-${k}</code></div></div>`).join('');

const shadowVars = Object.entries(T.shadow).map(([k, v]) => {
  const s = Array.isArray(v) ? v[0] : v;
  return `--shadow-${k}: ${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color};`;
}).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>VCP Design System — token gallery</title>\n<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n<style>
:root{${shadowVars}--line:#dcdfe6;--muted:#6b7280}
*{box-sizing:border-box}
body{margin:0;padding:44px 40px;font:15px/1.5 "Poppins",system-ui,sans-serif;color:#11151f;background:#fff}
.wrap{max-width:1080px;margin:0 auto}
h1{font-size:28px;margin:0 0 4px;letter-spacing:-.02em}
h2{font-size:19px;margin:44px 0 4px;padding-top:20px;border-top:1px solid var(--line)}
h3{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:22px 0 10px}
.lede{color:var(--muted);margin:0 0 6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:10px}
.sw{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:9px;padding:8px}
.chip{width:40px;height:40px;border-radius:7px;border:1px solid rgba(0,0,0,.08);flex:0 0 auto}
.chip.rad{background:#eceef2;border:1px solid #b9bec9}
.chip.shadow{background:#fff;border:1px solid var(--line)}
.meta{min-width:0;display:flex;flex-direction:column;gap:1px}
.meta b{font-size:12.5px;font-weight:600}
.meta span{font-size:11.5px;color:var(--muted)}
code{font:11.5px/1.4 "JetBrains Mono",ui-monospace,monospace;background:#f7f8fa;border:1px solid var(--line);
  border-radius:4px;padding:1px 5px;align-self:flex-start;color:#374151}
.row{display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid #f0f1f4}
.row code{flex:0 0 150px;text-align:left}
.row .val{flex:0 0 54px;color:var(--muted);font-size:12.5px}
.bar{height:14px;background:#336afa;border-radius:3px}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:14px}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line)}
th{font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
td.num{font-variant-numeric:tabular-nums;font-weight:600}
.prev{display:inline-flex;align-items:center;justify-content:center;width:32px;height:24px;
  border-radius:5px;border:1px solid var(--line);font-size:12px;font-weight:600;margin-right:8px;vertical-align:middle}
.badge{font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:5px}
.badge.pass{background:#eaf7f0;color:#177f45}.badge.warn{background:#fdf4e3;color:#8a5a00}
.badge.fail{background:#fdefee;color:#c2312a}
footer{margin-top:40px;color:var(--muted);font-size:12.5px;border-top:1px solid var(--line);padding-top:16px}
</style></head><body><div class="wrap">
<h1>VCP Design System — token gallery</h1>
<p class="lede">Generated from <code>dist/tokens.json</code>. Never edited by hand — run <code>npm run gallery</code> to refresh.</p>

<h2>Semantic colours <span style="font-weight:400;color:var(--muted);font-size:14px">— what components actually use</span></h2>
${ramp('Surface → bg-*', flat(T.surface), 'surface', 'bg-surface')}
${ramp('Text → text-*', flat(T.text), 'text', 'text-text')}
${ramp('Stroke → border-*', flat(T.stroke), 'stroke', 'border-stroke')}
${ramp('Action — buttons and controls', flat(T.action), 'action', 'bg-action')}
${ramp('Accent — status colours (critical / success / warning / info / …)', flat(T.accent), 'accent', 'bg-accent')}

<h2>Contrast check</h2>
<p class="lede">Every semantic pair we ship, measured. WCAG AA needs 4.5:1 for body text.</p>
<table><thead><tr><th>Used for</th><th>Pair</th><th>Ratio</th><th></th></tr></thead><tbody>${contrastRows}</tbody></table>

<h2>Core colours <span style="font-weight:400;color:var(--muted);font-size:14px">— raw ramps, referenced by semantic tokens only</span></h2>
${Object.entries(T.color).map(([name, g]) => ramp(name, g, `color.${name}`, `bg-${name}`)).join('')}

<h2>Type</h2><h3>Sizes</h3>${typeRows}<h3>Weights</h3>${weightRows}
<h2>Spacing</h2>${spaceRows}
<h2>Radius</h2><div class="grid">${radiusRow}</div>
<h2>Elevation</h2><div class="grid">${shadowRow}</div>
<footer>VCP Design System token gallery · every value here is the same value the apps compile against.</footer>
</div></body></html>`;

mkdirSync('gallery', { recursive: true });
writeFileSync('gallery/index.html', html);
console.log('✔ gallery/index.html');
