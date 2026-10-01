#!/usr/bin/env bash
# Compares the flattened key sets of two locale JSON files and prints the keys that are
# present in one but missing from the other. Exit 1 on any difference.
set -euo pipefail

usage() {
  echo "Usage: bash $0 <ref_locale_json> <target_locale_json>" >&2
  echo "Example: bash $0 locales/tr/common.json locales/en/common.json" >&2
}

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install jq and retry (e.g., brew install jq)." >&2
  exit 2
fi

if [ ${#} -ne 2 ]; then
  usage
  exit 2
fi

REF_JSON="$1"
TARGET_JSON="$2"

if [ ! -f "$REF_JSON" ]; then
  echo "Error: ref locale file not found: $REF_JSON" >&2
  exit 2
fi

if [ ! -f "$TARGET_JSON" ]; then
  echo "Error: target locale file not found: $TARGET_JSON" >&2
  exit 2
fi

# Flatten JSON keys into dot-separated paths for all scalar values
flatten_keys() {
  local file="$1"
  jq -r 'paths(scalars) as $p | [$p[] | tostring] | join(".")' "$file" | LC_ALL=C sort -u
}

ref_keys=$(mktemp)
target_keys=$(mktemp)
trap 'rm -f "$ref_keys" "$target_keys"' EXIT

flatten_keys "$REF_JSON" >"$ref_keys"
flatten_keys "$TARGET_JSON" >"$target_keys"

missing_in_target=$(comm -23 "$ref_keys" "$target_keys" || true)
missing_in_ref=$(comm -13 "$ref_keys" "$target_keys" || true)

if [ -z "$missing_in_target" ] && [ -z "$missing_in_ref" ]; then
  echo "No key differences between $REF_JSON and $TARGET_JSON"
  exit 0
fi

echo "LOCALE VALIDATION FAILED" >&2
if [ -n "$missing_in_target" ]; then
  echo "Keys present in $REF_JSON but missing from $TARGET_JSON:" >&2
  echo "$missing_in_target" >&2
  echo "" >&2
fi
if [ -n "$missing_in_ref" ]; then
  echo "Keys present in $TARGET_JSON but missing from $REF_JSON:" >&2
  echo "$missing_in_ref" >&2
  echo "" >&2
fi
exit 1
