/**
 * Fails the build when a field's edge would be too faint to find (rule 5: 3:1 on UI borders).
 *
 * A form field is found by its edge. Every colour that edge can take (at rest, in error, with a
 * warning, while focused) must clear 3:1 against what a field sits on (the card, the page) in both
 * themes. The warning edge did not (yellow-500, 1.91:1 on white) until #235; a token picked for a
 * banner's outline, where the tint carries the meaning, was reused as a field's edge, where nothing
 * else does. This reads the built tokens, so run `npm run tokens` first (CI does).
 *
 * Only field edges are held to it. A banner's outline or a tag's is decoration and is allowed to be
 * faint (see docs/banner.md); add a pair here only for an edge that is the thing's only boundary.
 */
import { existsSync, readFileSync } from 'node:fs';

/* What a field's edge can be drawn in, and what a field sits on. */
const EDGES = [
  ['stroke-strong', 'at rest'],
  ['accent-critical-outline-border-default', 'in error'],
  ['accent-warning-outline-border-default', 'with a warning'],
  ['stroke-focused', 'focused'],
];
const BEHIND = ['surface-elevated', 'surface-canvas'];
const MIN = 3;

if (!existsSync('dist/theme.css') || !existsSync('dist/tokens.dark.css')) {
  console.error('✖ dist/ is not built. Run `npm run tokens` first.');
  process.exit(1);
}
const light = readFileSync('dist/theme.css', 'utf8');
const dark = readFileSync('dist/tokens.dark.css', 'utf8');
const value = (css, name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8})\\b`))?.[1];

const rgb = (hex) => {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const luminance = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

let failed = 0;
let checked = 0;
for (const [theme, css] of [['light', light], ['dark', dark]]) {
  for (const [edge, when] of EDGES) {
    for (const behind of BEHIND) {
      /* The dark file only overrides; a token it leaves alone is the light value. */
      const e = value(css, edge) ?? value(light, edge);
      const b = value(css, behind) ?? value(light, behind);
      if (!e || !b) {
        console.error(`✖ ${theme}: ${!e ? edge : behind} is not in the built tokens`);
        failed++;
        continue;
      }
      checked++;
      const r = ratio(e, b);
      if (r < MIN) {
        console.error(
          `✖ ${theme}: a field's edge ${when} (${edge} ${e}) on ${behind} (${b}) is ${r.toFixed(2)}:1, under ${MIN}:1`,
        );
        failed++;
      }
    }
  }
}

if (failed) {
  console.error(`\n✖ ${failed} field edge(s) too faint. Move the token a step darker (or lighter, in dark).`);
  process.exit(1);
}
console.log(`✔ Field edges clear ${MIN}:1 in both themes (${checked} pairs)`);
