/**
 * Fails CI when a component hardcodes a value that should be a token.
 * This is the guardrail that keeps the system honest as it grows.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RULES = [
  [HEX,                               'hex color — use a token (VCP ramps: tokens/core/color.json; shared ones come from GDL)'],
  [/\b(rgb|rgba|hsl|hsla)\(/g,        'raw color function — use a token'],
  [/\b(bg|text|border|fill|stroke|outline)-\[[^\]]+\]/g, 'arbitrary Tailwind color — use a token utility'],
  [/\b(p|m|gap|w|h|top|left|right|bottom)[trblxy]?-\[[^\]]+\]/g, 'arbitrary Tailwind size — use a spacing token'],
  [/\b\d+px\b/g,                      'raw px value — use a spacing/size token'],
];

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : ['.tsx', '.ts', '.css'].includes(extname(p)) ? [p] : [];
  });

/* The file with its comments blanked (lengths and line breaks kept), to tell a comment from code.
   A `//` after a `:` is a URL's, not a comment. */
const withoutComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])(\/\/[^\n]*)/g, (_, before, c) => before + ' '.repeat(c.length));

/* "#212" in a comment is a PR or issue number, not a colour: a hex made only of digits is let through
   there. In code it is still a colour ('#333'), and in a comment a hex with letters still fails. */
const isIssueNumber = (match, codeLine) => /^#\d+$/.test(match[0]) && codeLine[match.index] === ' ';

let failed = 0;
for (const file of walk('src')) {
  if (file.endsWith('.stories.tsx')) continue;
  const src = readFileSync(file, 'utf8');
  const code = withoutComments(src).split('\n');
  src.split('\n').forEach((line, i) => {
    if (/eslint-disable|ds-lint-ignore/.test(line)) return;
    for (const [re, msg] of RULES) {
      for (const m of line.matchAll(re)) {
        if (re === HEX && isIssueNumber(m, code[i])) continue;
        console.error(`${file}:${i + 1}  ${m[0]}  →  ${msg}`);
        failed++;
      }
    }
  });
}

/* The type ramp is declared twice: once as tokens, once in src/lib/cn.ts so
   tailwind-merge files `text-label-sm-medium` as a size and not as a colour.
   If those two drift, `cn()` silently drops a component's type or its colour —
   which is exactly the class of bug that shipped in Button. Fail loudly instead. */
{
  const ramp = new URL(import.meta.resolve('@vdm-design-team/gdl/tokens/semantic/type.json'));
  const tokens = Object.keys(JSON.parse(readFileSync(ramp, 'utf8')).type)
    .filter((k) => !k.startsWith('$'));
  const declared = [
    ...readFileSync('src/lib/cn.ts', 'utf8').matchAll(/^\s*'([a-z0-9-]+)',$/gm),
  ].map((m) => m[1]);
  const missing = tokens.filter((t) => !declared.includes(t));
  const extra = declared.filter((d) => !tokens.includes(d));
  if (missing.length || extra.length) {
    console.error(
      `\nsrc/lib/cn.ts TYPE_RAMP is out of step with GDL's type ramp (@vdm-design-team/gdl/tokens/semantic/type.json)` +
        (missing.length ? `\n  missing: ${missing.join(', ')}` : '') +
        (extra.length ? `\n  stale:   ${extra.join(', ')}` : ''),
    );
    failed++;
  }
}

if (failed) {
  console.error(`\n✖ ${failed} hardcoded value(s). Add tokens in tokens/ and re-run \`npm run tokens\`.`);
  process.exit(1);
}
console.log('✔ No hardcoded values in src/');
