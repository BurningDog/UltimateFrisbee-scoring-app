# Setup Guide

This app uses free services to store and serve data:

- **Google Form** — player signup (name + team)
- **Google Sheet** — roster data source and match log storage
- **GitHub Pages** — hosts the scoring app

## Data flow

```
Google Form (player signup)
        ↓
Google Sheet (roster + match logs) ←──────────────┐
        ↓                                         │
Scoring App (GitHub Pages) ←→ User (match events) ┘
```

---

## Step 1 — Google Form

1. Create a Google Form to collect player signups. Player name and team are required; all other fields are optional.
2. Link the form to your Google Sheet so signups are automatically added to the player register.

---

## Step 2 — Google Sheet: Team_roster tab

Create a sheet tab named exactly **`Team_roster`**. This is what the app fetches for team/player data.

- **Row 1** — team names spread horizontally: `=TRANSPOSE(UNIQUE(Signup_Team_Column))`
- **Rows below each team** — sorted player names: `=SORT(IFERROR(FILTER(Signup_Names, Signup_Team_Column =A1),""),1,TRUE)`

Where `Signup_Team_Column` is the form-response column containing the player's team, and `Signup_Names` is the column containing player names.

---

## Step 3 — Publish the roster as CSV [API_URL]

1. In the Google Sheet: **File → Share → Publish to web → Link → Team_roster → Comma-separated values (CSV)**
2. Enable **"Automatically republish when changes are made"**
3. Copy the URL — this is your `API_URL`: `https://docs.google.com/spreadsheets/d/e/...&single=true&output=csv`

---

## Step 4 — Deploy the Apps Script [SUBMIT_URL]

This script receives match data from the app and writes it to the Google Sheet.

1. In the Google Sheet: **Extensions → Apps Script → Editor → New file**
2. Paste the contents of `function doPost.ts` (from this repository) into the new file
3. Replace `LINK_TO_YOUR_SPREADSHEET` with your spreadsheet's ID (the `XXXX` part of `https://docs.google.com/spreadsheets/d/XXXX/edit`)
4. Click **Deploy → New deployment**
5. Give it a name
6. Set **Execute as:** `Me (your_email_account)`
7. Set **Who has access:** `Anyone`
8. Copy the Web app URL — this is your `SUBMIT_URL`: `https://script.google.com/macros/s/.../exec`

---

## Step 5 — Configure and deploy the app

1. Fork/clone this repository to your own GitHub account
2. In `scripts.js`, update the two URLs at the top (`CONFIG` object):
   - `API_URL` → your CSV publish URL from Step 3
   - `SUBMIT_URL` → your Apps Script URL from Step 4
3. Replace `logo.png` and `page_icon.png` with your own images (optional)
4. Edit `styles.css` to match your branding (optional)
5. In your GitHub repo: **Settings → Pages → Build and deployment → Deploy from a branch → main → Save**
6. Your app URL will appear at the top of the Pages settings: `https://your_account.github.io/repository_name/`

---

## Using the App

### Match setup

Open the app and tap **Match Setup**. Configure:

| Field             | Default | Notes                              |
|-------------------|---------|----------------------------------- |
| Team A / Team B   | —       | Selected from fetched roster       |
| Match duration    | 100 min | Main timer countdown               |
| Halftime (min)    | 55 min  | Time at which halftime triggers    |
| Halftime duration | 7 min   |                                    |
| Timeout duration  | 75 sec  | Auxiliary timer countdown          |
| Timeouts total    | 2       | Per team                           |
| Timeouts per half | 0       | 0 = no per-half limit              |
| ABBA              | None    | Male/Female = gender of first line |

Once saved, team rosters appear in the lists at the bottom of the page. Rosters are fixed for the duration of the match once loaded.

### During a match

- **Main timer** (top): match countdown — tap to play/pause, hold 3 seconds to reset
- **Auxiliary timer** (below): timeout/break countdown — same controls
- Log events using the **Score A / Score B** buttons; select scorer and assist from the roster dropdowns (N/A and CALLAHAN are always available)
- The log shows scores, timeouts, halftime, and stoppages; any entry can be edited or deleted via the gear icon
- Data is auto-saved every 2 seconds to `localStorage`; if the page reloads, you'll be prompted to restore the session

### Submitting

Tapping **Submit**:

1. Posts the match log to the Google Sheet as a new tab named `"Team A vs Team B, <date>"`
2. Downloads a local CSV copy as a backup
3. Clears local session data

---

## What gets logged in the Sheet

Each submission creates a tab with columns:

| GameID | Time | Event | Team | Score | Assist |
|--------|------|-------|------|-------|--------|

Additional columns (`Type`, `TeamLetter`, `HalftimeReason`, `abba`, `scoreID`) are added dynamically as needed. The data can be filtered in Sheets to produce player stats, team rankings, assist leaders, and connection heat maps across a season.
