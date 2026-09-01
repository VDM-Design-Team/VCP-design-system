/**
 * `npm run latest` — get the newest design system and open it.
 *
 * Pulls main, installs anything new, rebuilds the tokens, and starts Storybook.
 * Written for designers: it refuses rather than guesses, and every failure says
 * what to do next.
 */
import { execSync, spawn } from 'node:child_process';

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
const step = (msg) => console.log(`\n\x1b[1m→ ${msg}\x1b[0m`);
const ok = (msg) => console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
const stop = (msg, fix) => {
  console.error(`\n\x1b[31m✖ ${msg}\x1b[0m`);
  if (fix) console.error(`\n  ${fix}\n`);
  process.exit(1);
};

/* 1 — refuse to touch uncommitted work. */
step('Checking your working copy');
const dirty = run('git status --porcelain --untracked-files=no');
if (dirty) {
  stop(
    'You have uncommitted changes, so pulling could overwrite them.',
    'Commit them, or stash with `git stash`, then run this again.\n\n' + dirty,
  );
}
ok('clean');

/* 2 — get on main and pull. Fast-forward only: never invent a merge. */
step('Fetching the latest from GitHub');
const branch = run('git rev-parse --abbrev-ref HEAD');
if (branch !== 'main') {
  console.log(`  you were on "${branch}" — switching to main`);
  try {
    run('git checkout main');
  } catch {
    stop(`Could not switch to main from "${branch}".`, 'Run `git checkout main` and see what it says.');
  }
}
try {
  run('git pull --ff-only origin main');
} catch (e) {
  stop(
    'Could not pull.',
    'If it mentions authentication, run `gh auth login`.\n  If it mentions diverged history, ask an engineer — do not force anything.\n\n' +
      String(e.stdout || e.message),
  );
}
ok(`main is at ${run('git log -1 --format="%h — %s"')}`);

/* 3 — dependencies, then tokens. Tokens must be built before Storybook:
   dist/ is generated and is not in git, so a fresh clone has no theme. */
step('Installing dependencies');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch {
  stop('npm install failed.', 'Try deleting node_modules and running this again.');
}
ok('up to date');

step('Building design tokens');
try {
  run('npm run tokens');
} catch (e) {
  stop('Token build failed.', String(e.stdout || e.message));
}
ok('dist/ rebuilt');

/* 4 — hand over to Storybook. */
step('Starting Storybook at http://localhost:6006');
console.log('  It opens in your browser. Press Ctrl+C here when you are done.\n');
spawn('npm', ['run', 'dev'], { stdio: 'inherit' }).on('exit', (c) => process.exit(c ?? 0));
