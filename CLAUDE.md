# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step required. Serve the static files locally:

```bash
python -m http.server 8000
# or
npx http-server
```

Then open `http://localhost:8000`.

> ES modules require HTTP(S) — opening `index.html` directly as a `file://` URL will not work.

## Architecture

The entire app lives in three files:

- `index.html` — UI shell (modals, score panels, timer displays, event log)
- `app.js` — All logic (~3,500 lines, 7 classes + utils)
- `styles.css` — Styling with CSS custom properties for theming

### Class Structure in `app.js`

| Class | Role |
|---|---|
| `ScorekeeperApp` | Main controller; wires up all managers, owns event listeners, drives UI updates |
| `DataManager` | In-memory game state (scores, logs, config); marks dirty state for auto-save |
| `PersistenceManager` | Reads/writes `localStorage`; auto-saves every 2s; 24h session expiry |
| `TimerManager` | Main match countdown (default 100 min); pause/play/reset |
| `SecondsTimerManager` | Timeout/break countdown (default 75s) |
| `ApiManager` | Fetches rosters (CSV or JSON) from Google Sheets; submits match data via POST |
| `LoadingManager` | Shows/hides loading overlays |
| `Utils` | CSV parser, DOM helpers, notifications, file download, sanitization |
| `CONFIG` | Centralized constants: API URLs, defaults, `localStorage` keys |

`ScorekeeperApp` is instantiated on `DOMContentLoaded` and owns all the managers. State flows through `DataManager.gameState`; any mutation should mark the state dirty so `PersistenceManager` picks it up on the next auto-save tick.

### Data Persistence

All state is stored in `localStorage` under keys defined in `CONFIG.STORAGE_KEYS`:
- `gameState` — scores, team names, timeout counts, ABBA config, timer config
- `scoreLogs` — ordered array of match events (goal, timeout, halftime, stoppage)
- `timerEndTime` — countdown resume anchor
- `teamsData` — cached roster (expires after 24h)

On page load, if a session younger than 24h exists, the user is prompted to restore it.

### Event Log Schema

Each log entry always has: `GameID | Time | Event | Team | Score | Assist`. Extra fields (`Type`, `TeamLetter`, `HalftimeReason`, `abba`, `scoreID`) are added dynamically and become columns in the CSV/Sheets export.

### Backend Integration

`CONFIG.API_URL` points to a Google Sheets CSV/JSON export for roster fetching. `CONFIG.SUBMIT_URL` points to a Google Apps Script `doPost` endpoint for match submission. Both can be left blank; the app degrades gracefully (manual team entry + CSV-only export). The Apps Script source is in `function doPost.ts`.

## Key Configuration

Both URLs and match defaults live at the top of `scripts.js` in the `CONFIG` object (lines 1–21). CSS theming variables are at the top of `styles.css` under `:root`.
