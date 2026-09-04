/**
 * The plugin states its version twice, because it needs it in two forms:
 *
 * 1. `plugin/.claude-plugin/plugin.json` — what Claude Code installs and
 *    caches by. Without a bump here, a release never reaches anyone.
 * 2. The "This brief is version X" line in the morning skill — what the brief
 *    compares against `main` so it can tell its reader a newer one is out.
 *
 * If those two disagree the brief lies: it either nags about an update that
 * does not exist, or stays silent about one that does. This check makes a
 * half-done bump fail the build instead.
 */
import { readFileSync } from 'node:fs';

const MANIFEST = 'plugin/.claude-plugin/plugin.json';
const SKILL = 'plugin/skills/vcp-morning/SKILL.md';

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')).version;
const stated = readFileSync(SKILL, 'utf8').match(/\*\*This brief is version ([\d.]+)\.\*\*/);

if (!stated) {
  console.error(`${SKILL}: no "**This brief is version X.**" line — step 5 has nothing to compare against.`);
  process.exit(1);
}
if (stated[1] !== manifest) {
  console.error(
    `Plugin version disagrees with itself:\n` +
      `  ${MANIFEST}  ${manifest}\n` +
      `  ${SKILL}  ${stated[1]}\n` +
      `Bump both, or the brief reports the wrong version to its reader.`,
  );
  process.exit(1);
}
console.log(`✔ Plugin version consistent: ${manifest}`);
