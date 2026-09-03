/**
 * Enforces the composition rules of the atomic tiers (CLAUDE.md):
 *
 * 1. Every component/pattern/template's docs page carries a "## Composed of"
 *    section that names EVERY piece its .tsx actually imports — the section is
 *    checked against the real import graph, so it cannot drift.
 * 2. A pattern must compose at least TWO distinct pieces (that is what makes
 *    it a pattern); a template must compose at least one.
 * 3. Imports flow downward only: atoms import no other tier, components never
 *    import patterns/templates, patterns never import templates.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TIERS = ['atoms', 'components', 'patterns', 'templates'];
const RANK = Object.fromEntries(TIERS.map((t, i) => [t, i]));

const pieces = new Map(); // name -> tier
for (const tier of TIERS) {
  const dir = join('src', tier);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.isDirectory()) pieces.set(name.name, tier);
  }
}

const importsOf = (tier, name) => {
  const dir = join('src', tier, name);
  const found = new Map(); // dep name -> dep tier
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.tsx') || f.endsWith('.stories.tsx')) continue;
    const src = readFileSync(join(dir, f), 'utf8');
    for (const m of src.matchAll(/from '\.\.\/(?:\.\.\/(atoms|components|patterns|templates)\/)?([a-z-]+)'/g)) {
      const depTier = m[1] ?? tier;
      const dep = m[2];
      if (pieces.has(dep)) found.set(dep, depTier);
    }
  }
  return found;
};

let failed = 0;
const fail = (msg) => { console.error(msg); failed++; };

for (const [name, tier] of pieces) {
  const deps = importsOf(tier, name);

  /* Rule 3 — imports flow downward only. */
  for (const [dep, depTier] of deps) {
    if (RANK[depTier] > RANK[tier])
      fail(`src/${tier}/${name}: imports ${depTier}/${dep} — imports must flow downward`);
    if (tier === 'atoms' && !(depTier === 'atoms' && dep === 'icon'))
      fail(`src/atoms/${name}: imports ${dep} — an atom may only use Icon internally`);
  }

  /* Rule 2 — patterns compose ≥2, templates ≥1. */
  if (tier === 'patterns' && deps.size < 2)
    fail(`src/patterns/${name}: composes ${deps.size} piece(s) — a pattern is 2+ components; re-tier it or compose more`);
  if (tier === 'templates' && deps.size < 1)
    fail(`src/templates/${name}: composes nothing — a template arranges patterns`);

  /* Rule 1 — docs carry an accurate "Composed of" section. */
  if (tier === 'atoms') continue; // atoms compose nothing worth listing
  const docPath = join('docs', `${name}.md`);
  if (!existsSync(docPath)) { fail(`${docPath}: missing (rule 4)`); continue; }
  const doc = readFileSync(docPath, 'utf8');
  const section = doc.match(/## Composed of\n([\s\S]*?)(\n## |$)/);
  if (!section) { fail(`${docPath}: missing "## Composed of" section`); continue; }
  for (const [dep] of deps) {
    const pascal = dep.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
    if (!section[1].includes(`\`${pascal}\``))
      fail(`${docPath}: "Composed of" does not mention \`${pascal}\` (imported by the .tsx)`);
  }
}

if (failed) {
  console.error(`\n✖ ${failed} composition problem(s).`);
  process.exit(1);
}
console.log(`✔ Composition checked: ${pieces.size} pieces, imports flow downward, docs match the graph.`);
