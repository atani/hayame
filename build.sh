#!/bin/bash
set -euo pipefail

VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
mkdir -p dist

echo "Building Hayame v${VERSION}"

# --- Full version (personal use) ---
zip -r "dist/hayame-${VERSION}-full.zip" \
  manifest.json content.js content.css \
  popup.html popup.css popup.js \
  sites/ icons/ \
  -x '*.DS_Store'
echo "  -> dist/hayame-${VERSION}-full.zip (with ad skippers)"

# --- Store version (no ad skippers) ---
STORE_DIR=$(mktemp -d)
cp manifest.store.json "$STORE_DIR/manifest.json"
cp content.js content.css popup.html popup.css popup.js "$STORE_DIR/"
cp -r icons "$STORE_DIR/"
(cd "$STORE_DIR" && zip -r - .) > "dist/hayame-${VERSION}-store.zip"
rm -rf "$STORE_DIR"
echo "  -> dist/hayame-${VERSION}-store.zip (store version)"

echo "Done!"
