# SHINOBIWAN — Suno Bridge

Chrome / Edge extension for preparing Suno creations from a single SHINOBIWAN pack.

## Safety model

- No Suno password, cookie or API token is requested or stored.
- No private Suno API is called.
- The extension only runs after the user clicks it on `suno.com`.
- It never clicks **Create / Generate**.
- `chrome.storage.local` stores only manual field mappings.
- Source URLs are accepted only when they match a Suno `/song/` or `/s/` URL.

## v0.2 development goals

- Parse JSON packs and SHINOBIWAN TXT manifests.
- Preserve Suno lyrics syntax exactly.
- Build titles with explicit versions such as `V01`, `Cover V02` or `Extend V03`.
- Detect Title, Style and Lyrics fields automatically, with manual fallback mapping.
- Scan the visible Suno UI for expected Workspace, Voice and workflow state.
- Open a requested source track for Cover / Extend workflows.
- Validate Title, Style and Lyrics after filling them.
- Keep the final Suno generation click manual.

## Pack format

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

Legacy TXT manifests are also supported when they contain `TITLE:`, `STYLE PROMPT:` and `LYRICS:`. Optional fields are `VERSION:`, `PROFILE:`, `WORKFLOW:`, `WORKSPACE:`, `VOICE:` and `SOURCE URL:`.

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
