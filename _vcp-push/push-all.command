#!/bin/bash
# VCP Design System — create the five branches and push them.
# Double-click this file. It only touches this repo, and it never force-pushes.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE/.." || exit 1
REPO="$(pwd)"

echo "VCP Design System — pushing five branches"
echo "repo: $REPO"
echo

if [ ! -d .git ]; then
  echo "Expected this folder to be the repo: $REPO"
  echo "Move the _vcp-push folder inside your acme-design-system folder and try again."
  read -r -p "Press return to close." _; exit 1
fi

# Tidy the leftovers from the assistant's session (local only, never pushed).
rm -rf _to_delete 2>/dev/null
rm -rf "$HERE/stale-git-locks" 2>/dev/null
git branch -D __probe_branch >/dev/null 2>&1

DIRTY="$(git status --porcelain --untracked-files=no)"
if [ -n "$DIRTY" ]; then
  echo "You have uncommitted changes to tracked files. Commit or stash them first, then re-run this."
  echo "$DIRTY"
  read -r -p "Press return to close." _; exit 1
fi

START_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "Fetching latest main..."
git fetch -q origin main || { echo "Could not reach GitHub. Check your connection and try again."; read -r -p "Press return to close." _; exit 1; }
echo

apply () {  # apply <branch> <patchfile>
  local branch="$1" patch="$HERE/$2"
  echo "-- $branch"
  if [ ! -f "$patch" ]; then echo "   missing $(basename "$patch") - skipped"; return 1; fi
  if git rev-parse --verify "$branch" >/dev/null 2>&1; then echo "   branch already exists locally - skipped"; return 0; fi
  git checkout -q -B "$branch" origin/main || { echo "   could not create branch"; return 1; }
  if ! git am -q < "$patch"; then
    echo "   patch did not apply cleanly - backing out"
    git am --abort >/dev/null 2>&1
    git checkout -q "$START_BRANCH"
    git branch -D "$branch" >/dev/null 2>&1
    return 1
  fi
  local n; n="$(git rev-list --count origin/main..HEAD)"
  if git push -q -u origin "$branch" 2>/dev/null; then
    echo "   pushed ($n commit(s))"
  else
    echo "   built locally ($n commit(s)) but push failed - run: git push -u origin $branch"
  fi
  git checkout -q "$START_BRANCH"
}

FAILED=0
apply docs/token-gallery-action-prominence 1-docs-token-gallery-action-prominence.patch || FAILED=1
apply fix/type-scale-class-merge           2-fix-type-scale-class-merge.patch           || FAILED=1
apply fix/dark-focus-ring                  3-fix-dark-focus-ring.patch                  || FAILED=1
apply feat/segmented-control               4-feat-segmented-control.patch               || FAILED=1
apply feat/tabs                            5-feat-tabs.patch                            || FAILED=1

echo
echo "Open the pull requests here (PR text is in PR-descriptions.md next to this script):"
R="https://github.com/creativedesignlead/VCP-design-system/compare"
for b in docs/token-gallery-action-prominence fix/type-scale-class-merge fix/dark-focus-ring feat/segmented-control feat/tabs; do
  git rev-parse --verify "$b" >/dev/null 2>&1 && echo "  $R/main...$b?expand=1"
done

echo
if [ "$FAILED" -eq 0 ]; then echo "All done."; else echo "Some branches did not go through - tell Claude what this printed."; fi
read -r -p "Press return to close." _
