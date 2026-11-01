#!/usr/bin/env bash
# Install the Remotion skill library into an agent's skill directory.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/skills"
DEST=""

usage() {
  cat <<'USAGE'
Usage: scripts/install.sh [--claude | --cursor | --dir <path>]

  --claude           install into ./.claude/skills
  --cursor           install into ./.cursor/rules (flat .mdc-free markdown)
  --dir <path>       install into an arbitrary directory
  (no flag)          install into ./.claude/skills

Environment:
  FORCE=1            overwrite existing files
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    --claude) DEST="./.claude/skills"; shift ;;
    --cursor) DEST="./.cursor/rules"; shift ;;
    --dir)    DEST="${2:?--dir needs a path}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

DEST="${DEST:-./.claude/skills}"
mkdir -p "$DEST"

count=0
for dir in "$SRC"/*/; do
  name="$(basename "$dir")"
  target="$DEST/$name"
  if [ -e "$target" ] && [ "${FORCE:-0}" != "1" ]; then
    echo "skip  $name (exists; set FORCE=1 to overwrite)"
    continue
  fi
  mkdir -p "$target"
  cp "$dir/SKILL.md" "$target/SKILL.md"
  count=$((count + 1))
  echo "install $name"
done

# The reference directory is linked from several skills.
REF_SRC="$(cd "$SRC/.." && pwd)/reference"
if [ -d "$REF_SRC" ]; then
  mkdir -p "$DEST/../remotion-reference"
  cp -r "$REF_SRC/." "$DEST/../remotion-reference/"
  echo "install reference/ -> $(cd "$DEST/.." && pwd)/remotion-reference"
fi

echo
echo "installed $count skills into $DEST"
