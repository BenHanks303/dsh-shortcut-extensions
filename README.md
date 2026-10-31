# dsh-shortcut-extensions · 快捷键拓展

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/tag/BenHanks303/dsh-shortcut-extensions?label=release&color=3559e0)](https://github.com/BenHanks303/dsh-shortcut-extensions/releases)
[![Platform](https://img.shields.io/badge/platform-DSH_Desktop_%7C_Web-3559e0)](https://github.com/deepseek-ai/deepseek-harness)

A [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) plugin that adds a keyboard-driven quick-switching layer to the DSH web/desktop UI: a model palette, a session palette with prompt preview, session cycling, find-next-answered, composer focus, and configurable permission cycling — all manageable from a sidebar control panel.

中文说明见 [README.zh.md](README.zh.md)。

## Features

- **Model palette** (`Cmd/Ctrl+Shift+M`) — fuzzy search; AntD-style colored provider tags (click a tag to filter that provider); name-suffix tags (e.g. `routing group`); reasoning badges; pin favorites to the top.
- **Session palette** (`Cmd/Ctrl+Shift+S`) — two-column layout: sessions on the left, your own prompts preview on the right (follows the highlighted row, debounced + cached). Includes archived sessions with badges; Enter opens and auto-restores archived ones.
- **Session cycling** (`Ctrl+Tab` / `Ctrl+Shift+Tab`, desktop) — cycle in the sidebar's recency order.
- **Find next answered session** (`Cmd/Ctrl+G`, web `Cmd/Ctrl+Shift+G`) — jumps to the most recently answered not-yet-viewed session; falls back to sessions that are still running.
- **Focus composer** (`Cmd/Ctrl+I`) — restores caret position via the host composer facade.
- **Permission cycling** (`Cmd/Ctrl+Shift+P`) — cycles through the presets you configure (any 2+ of Read Only / Workspace Write / Full access, plus any deployment-specific presets), expandable in the panel.
- **Sidebar control panel** — every command with live keycaps and an on/off switch; a **shortcut reference tab** listing every host command, with device-local rebind/reset; transient hint banner so no command fails silently.
- **IME-safe** — key handling ignores IME composition state (pressing Enter to commit candidates never accidentally selects an item).
- Theme-aware (light/dark), fixed-height palettes (no jumping while searching).

## Default shortcuts (macOS desktop; Ctrl on Windows/Linux)

| Command | Keys |
|---|---|
| Model palette | ⌘⇧M |
| Session palette | ⌘⇧S |
| Permission cycle | ⌘⇧P |
| Find next answered session | ⌘G (web: ⌘⇧G) |
| Focus composer | ⌘I (web: ⌘⌥I) |
| Next / previous session | ⌃Tab / ⌃⇧Tab |

Every command can be rebound in **DSH Settings → Shortcuts** or in the panel's reference tab; overrides are device-local.

## Install

1. Clone this repository.
2. In DSH, open **插件 (Plugins)** and install the plugin from the cloned directory.
3. Reload the window (Cmd+R).

Requires a standard DSH web composition. Optional host capabilities degrade gracefully: without permission presets the permission surfaces hide; without the turn-outline projection the prompt preview shows a notice.

## Notes & limitations

- Browsers reserve some keys: single-modifier bindings like `Cmd+G` are desktop-only, and `Cmd+Shift+P` is taken by Firefox (private window).
- In the desktop app, `Cmd+W` belongs to the native "close window" menu item and cannot be taken over by plugins.
- Keybinding overrides are stored per device (desktop: `userData/keybindings.json`; web: origin-local storage).

## Development

Plain JavaScript, no build step, no npm dependencies (React is provided by the host module table):

```
dsh-shortcut-extensions/
├── package.json        # manifest: bundle patch + dsh.client declaration
├── cordis.patch.yml    # loader patch: one insert row
├── index.js            # host half (empty apply; all features use host services)
├── client.js           # all UI/logic (client half, registered via ModuleLoader)
├── locale/zh.json      # display metadata + dictionaries (zh/en)
├── locale/en.json
└── icon.svg
```

## License

[MIT](LICENSE)
