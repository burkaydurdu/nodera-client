#!/usr/bin/env bash
# Validates that every locale under locales/ has exactly the keys of the reference locale
# (tr/common.json). Both directions are checked so no locale drifts ahead of the other.
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install jq and retry (e.g., brew install jq)." >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${PROJECT_ROOT:-$SCRIPT_DIR}"

LOCALES_DIR="${1:-$PROJECT_ROOT/locales}"
REF_LOCALE="tr"
REF_FILE="$LOCALES_DIR/$REF_LOCALE/common.json"

if [ ! -f "$REF_FILE" ]; then
  echo "Error: reference file not found: $REF_FILE" >&2
  exit 2
fi

DIFF_SCRIPT="$SCRIPT_DIR/locale-diff.sh"
if [ ! -f "$DIFF_SCRIPT" ]; then
  echo "Error: $DIFF_SCRIPT not found. Make sure it exists alongside this script." >&2
  exit 2
fi

fail_count=0
total_count=0

echo "Locale validation started (reference: $REF_LOCALE/common.json)"
echo ""

for dir in "$LOCALES_DIR"/*; do
  [ -d "$dir" ] || continue
  lang="$(basename "$dir")"
  if [ "$lang" = "$REF_LOCALE" ]; then
    continue
  fi
  total_count=$((total_count + 1))
  target_file="$dir/common.json"
  if [ ! -f "$target_file" ]; then
    echo "FAIL $lang: missing file $lang/common.json" >&2
    fail_count=$((fail_count + 1))
    continue
  fi
  echo "Checking: $lang"
  if ! bash "$DIFF_SCRIPT" "$REF_FILE" "$target_file"; then
    echo "FAIL $lang: key mismatch" >&2
    fail_count=$((fail_count + 1))
  else
    echo "OK   $lang: all keys present"
  fi
  echo ""
done

echo "Summary: checked=$total_count passed=$((total_count - fail_count)) failed=$fail_count"

if [ "$fail_count" -gt 0 ]; then
  echo "Locale validation failed: $fail_count locale(s) differ from $REF_LOCALE/common.json" >&2
  exit 1
fi

echo "All locales are complete."
exit 0
