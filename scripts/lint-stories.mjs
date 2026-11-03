/**
 * Fails the build on story mistakes that render fine on their own and only look wrong in Storybook.
 *
 * `decorators: []` on a story reads as "no frame for this one", but a story's decorators are added
 * to the meta's, never instead of them. The meta's frame still wraps the story: four Light and dark
 * stories were squeezed into a 384px or 26rem column by exactly this (fixed in #224 and #228). To let
 * a story lay itself out, make the meta's decorator step aside: check `parameters.layout ===
 * 'fullscreen'`, or a parameter of your own such as `frame: 'none'`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.stories.tsx') ? [p] : [];
  });

/* Comments are blanked (lengths and line breaks kept) so a comment that explains the rule can quote it. */
const withoutComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (c) => ' '.repeat(c.length));

let failed = 0;
for (const file of walk('src')) {
  const code = withoutComments(readFileSync(file, 'utf8'));
  for (const m of code.matchAll(/\bdecorators\s*:\s*\[\s*\]/g)) {
    const line = code.slice(0, m.index).split('\n').length;
    console.error(
      `${file}:${line}  decorators: []  →  a story's decorators add to the meta's; this removes nothing. ` +
        `Make the meta's decorator skip this story (parameters.layout === 'fullscreen', or frame: 'none').`,
    );
    failed++;
  }
}

if (failed) {
  console.error(`\n✖ ${failed} story mistake(s).`);
  process.exit(1);
}
console.log('✔ Stories: no decorators: []');
