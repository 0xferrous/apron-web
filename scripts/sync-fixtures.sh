#!/bin/sh
# Copy the protocol fixtures the tests read from shazow/apron, which owns
# them, and record the commit they came from.
# Usage: scripts/sync-fixtures.sh [ref]
# ref is a branch, tag, or full commit SHA (default: main).
set -eu
ref="${1:-main}"
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git -C "$tmp" init -q
git -C "$tmp" fetch -q --depth 1 https://github.com/shazow/apron "$ref"
git -C "$tmp" checkout -q FETCH_HEAD

dest="$root/tests/fixtures"
rm -rf "$dest/wire" "$dest/history.json" "$dest/webauthn.json"
mkdir -p "$dest/wire"
cp "$tmp/tests/fixtures/history.json" "$tmp/tests/fixtures/webauthn.json" "$dest/"
cp -R "$tmp/tests/fixtures/wire/replay" "$dest/wire/"
git -C "$tmp" rev-parse HEAD > "$dest/SOURCE"
echo "Synced tests/fixtures from shazow/apron@$(cat "$dest/SOURCE")"
