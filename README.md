# Hayame - Video Speed Controller

A lightweight Chrome extension to control video playback speed with keyboard shortcuts. No bloat, no injection — just direct `playbackRate` control.

## Install

[Chrome Web Store](https://chromewebstore.google.com/) (pending review)

Or load manually:
1. `chrome://extensions` → Developer mode ON
2. "Load unpacked" → select this folder

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Shift+D` | Speed up (+0.1) |
| `Shift+S` | Slow down (-0.1) |
| `Shift+A` | Reset to 1.0x (press again to restore previous speed) |
| `Shift+Z` | Rewind 10 seconds |
| `Shift+C` | Forward 10 seconds |
| `Shift+\` | Toggle help overlay |

Shortcuts are disabled when typing in text fields.

## Why Hayame?

Other speed controllers use complex injection bridges, synthetic events, and site-specific hacks that break video players on sites like Abema. Hayame sets `video.playbackRate` directly — nothing more.

## Build

```bash
./build.sh
# dist/hayame-x.x.x-store.zip  (Chrome Web Store)
# dist/hayame-x.x.x-full.zip   (with all features)
```

## Privacy

Hayame only stores your preferred speed locally. No data collection, no analytics. See [PRIVACY.md](PRIVACY.md).

## License

MIT
