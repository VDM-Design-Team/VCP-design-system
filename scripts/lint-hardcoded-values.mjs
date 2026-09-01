/**
 * Fails CI when a component hardcodes a value that should be a token.
 * This is the guardrail that keeps the system honest as it grows.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const RULES = [
  [/#[0-9a-fA-F]{3,8}\b/g,            'hex color — add a token in tokens/core/color.json'],
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

let failed = 0;
for (const file of walk('src')) {
  if (file.endsWith('.stories.tsx')) continue;
  const src = readFileSync(file, 'utf8');
  src.split('\n').forEach((line, i) => {
    if (/eslint-disable|ds-lint-ignore/.test(line)) return;
    for (const [re, msg] of RULES) {
      for (const m of line.matchAll(re)) {
        console.error(`${file}:${i + 1}  ${m[0]}  →  ${msg}`);
        failed++;
      }
    }
  });
}

/* The type ramp is declared twice: once as tokens, once in src/lib/cn.ts so
   tailwind-merge files `text-label-lg` as a size and not as a colour. If those
   two drift, `cn()` silently drops a component's type or its colour — which is
   exactly the class of bug that shipped in Button. Fail loudly instead. */
{
  const tokens = Object.keys(JSON.parse(readFileSync('tokens/semantic/type.json', 'utf8')).type)
    .filter((k) => !k.startsWith('$'));
  const declared = [
    ...readFileSync('src/lib/cn.ts', 'utf8').matchAll(/^\s*'([a-z]+-[a-z]{2})',$/gm),
  ].map((m) => m[1]);
  const missing = tokens.filter((t) => !declared.includes(t));
  const extra = declared.filter((d) => !tokens.includes(d));
  if (missing.length || extra.length) {
    console.error(
      `\nsrc/lib/cn.ts TYPE_RAMP is out of step with tokens/semantic/type.json` +
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
