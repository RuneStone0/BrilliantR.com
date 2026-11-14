#!/usr/bin/env bash
# Pre-commit guard for the BrilliantR.com repo.
# Enforces the golden rule in AGENT.md: a published page change ships with the agent-facing files.
# Install: cp scripts/pre-commit-llms.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
# Bypass (only for changes with no visitor-facing effect): git commit --no-verify

set -euo pipefail

staged="$(git diff --cached --name-only --diff-filter=ACMR)"

fail=0
missing=""

# A published HTML page changed, other than the 404 page. The public site is the top-level
# index.html; website/pay, website/invoice and website/offer are private tools that AGENT.md
# forbids describing in the agent files, so they do not trigger the rule.
html_changed="$(printf '%s\n' "$staged" | grep -E '^website/[^/]+\.html$' || true)"
public_html="$(printf '%s\n' "$html_changed" | grep -v '^website/404\.html$' || true)"

if [ -n "$public_html" ]; then
  if ! printf '%s\n' "$staged" | grep -qx 'website/index\.md'; then
    fail=1
    missing="$missing website/index.md"
  fi
  if ! printf '%s\n' "$staged" | grep -qx 'website/llms\.txt'; then
    fail=1
    missing="$missing website/llms.txt"
  fi
fi

if [ "$fail" -eq 1 ]; then
  cat >&2 <<EOF

  COMMIT BLOCKED: website content changed, agent-facing files were not updated.

  Missing from this commit:$missing

  AGENT.md, "The golden rule": every change to public website content must ship with
  an updated website/index.md (full site in markdown) and website/llms.txt (the agent
  guide). Agents read those files instead of the HTML, so a stale price in llms.txt is
  worse than no file at all.

  Stage both files (update the "Last updated" date in index.md), then commit again.
  If this change genuinely has no visitor-facing effect: git commit --no-verify
EOF
  exit 1
fi

# Cheap hygiene check on llms.txt: it has to stay small enough to fit in a context window.
if printf '%s\n' "$staged" | grep -qx 'website/llms\.txt'; then
  size=$(wc -c < website/llms.txt | tr -d ' ')
  if [ "$size" -gt 6144 ]; then
    echo "  WARNING: website/llms.txt is ${size} bytes. Keep it under ~4 KB (hard limit 6 KB); move detail into index.md." >&2
  fi
fi

exit 0
