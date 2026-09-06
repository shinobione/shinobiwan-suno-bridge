# SHINOBIWAN — Suno Bridge

Chrome / Edge extension for preparing Suno creations from a single SHINOBIWAN Track Manifest or JSON pack.

## Important: no special pack file is required

The normal SHINOBIWAN Track Manifest is already a valid import source. You can paste directly into the extension the block that contains at least:

```text
TITLE: TRACK TITLE
VERSION: V01
WORKFLOW: Create
WORKSPACE: optional saved workspace name
VOICE: optional saved voice name
STYLE PROMPT: Your Suno style prompt

LYRICS:
[Verse 1]
Lyrics
(backs)
```

The file picker is optional. It only exists for manifests already saved as `.txt` or JSON packs.

## Safety model

- No Suno password, cookie or API token is requested or stored.
- No private Suno API is called.
- The extension only runs after the user clicks it on `suno.com`.
- It never clicks **Create / Generate**.
- `chrome.storage.local` stores only manual field mappings.
- Source URLs are accepted only when they match a Suno `/song/` or `/s/` URL.
- Workspace / Voice preparation only selects the exact requested visible name and refuses generation/destructive controls.

## Current status

### v0.2.5 — live validated on Suno v5.5 Advanced

- Parse JSON packs and SHINOBIWAN TXT manifests.
- Accept pasted Track Manifests directly; no pack file required.
- Preserve Suno lyrics syntax exactly.
- Build titles with explicit versions such as `V01`, `Cover V02` or `Extend V03`.
- Detect Title and Lyrics automatically.
- Detect Style when possible, with one-time fallback calibration stored locally.
- Replace existing content instead of appending.
- Validate Title, Style and Lyrics after filling them.
- Keep the final Suno generation click manual.

### v0.3.0 — development

- Read optional `WORKSPACE` and `VOICE` values from the manifest / JSON.
- Open the matching Suno selectors safely.
- Select an exact saved Workspace / Voice name.
- Confirm the selected state before reporting success.
- Keep missing optional context neutral rather than pretending it is selected.

## JSON pack format

```json
{
  "title": "TRACK TITLE",
  "version": "V01",
  "workflow": "Create",
  "workspace": "",
  "voice": "",
  "source_url": "",
  "style": "Style prompt",
  "lyrics": "[Verse 1]\nLyrics\n(backs)\n\n[Chorus]\nHook"
}
```

TXT manifests are supported when they contain `TITLE:`, `STYLE PROMPT:` and `LYRICS:`. Optional fields are `VERSION:`, `PROFILE:`, `WORKFLOW:`, `WORKSPACE:`, `VOICE:` and `SOURCE URL:`.

## Music project integration

The roadmap now includes a permanent target for the ChatGPT **Music** project: once a SHINOBIWAN track is generation-ready, the assistant should output a Bridge-ready JSON object alongside the normal human-readable Track Manifest. See [`ROADMAP.md`](ROADMAP.md) for the canonical schema and constraints.

## Development branch

Current work: `dev/v0.3-context-selectors`.

Run checks locally with Node 22+:

```bash
node --check core.js
node --check dom.js
node --check bridge.js
node --check background.js
node --test tests/core.test.cjs
```

## Install an unpacked build

1. Clone or download the selected branch.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode.
4. Choose **Load unpacked** and select the folder containing `manifest.json`.
5. Open `https://suno.com/create` and click the extension icon.

This project is unofficial and is not affiliated with Suno.
