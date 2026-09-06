# SHINOBIWAN — Suno Bridge

Chrome / Edge extension for preparing Suno creations from a single SHINOBIWAN Track Manifest or JSON pack.

## Important: no special pack file is required

The normal SHINOBIWAN Track Manifest is already a valid import source. You can paste directly into the extension the block that contains at least:

```text
TITLE: TRACK TITLE
VERSION: V01
STYLE PROMPT: Your Suno style prompt

LYRICS:
[Verse 1]
Lyrics
(backs)
```

The file picker is optional. It only exists for manifests already saved as `.txt` or JSON packs.

The v0.2.1 dev panel also contains a **Charger exemple** button so the live Suno field detection can be tested without preparing any external file.

## Safety model

- No Suno password, cookie or API token is requested or stored.
- No private Suno API is called.
- The extension only runs after the user clicks it on `suno.com`.
- It never clicks **Create / Generate**.
- `chrome.storage.local` stores only manual field mappings.
- Source URLs are accepted only when they match a Suno `/song/` or `/s/` URL.

## v0.2 development goals

- Parse JSON packs and SHINOBIWAN TXT manifests.
- Accept pasted Track Manifests directly; no pack file required.
- Preserve Suno lyrics syntax exactly.
- Build titles with explicit versions such as `V01`, `Cover V02` or `Extend V03`.
- Detect Title, Style and Lyrics fields automatically, with manual fallback mapping.
- Scan the visible Suno UI for expected Workspace, Voice and workflow state.
- Show optional Workspace / Voice / workflow / source states as neutral when no value was requested, rather than false-positive green checks.
- Open a requested source track for Cover / Extend workflows.
- Validate Title, Style and Lyrics after filling them.
- Keep the final Suno generation click manual.

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

## Development branch

Current work: `dev/v0.2-smart-detection`.

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
