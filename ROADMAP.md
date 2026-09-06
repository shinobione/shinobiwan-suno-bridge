# SHINOBIWAN — Suno Bridge Roadmap

## North star

One generation-ready SHINOBIWAN track should move from ChatGPT Music project output to a prepared Suno form with minimal manual handling, while the final **Create / Generate** click always remains manual.

## ✅ v0.2.5 — Text import foundation (live validated)

- Parse SHINOBIWAN TXT Track Manifests and JSON packs.
- Detect Title and Lyrics automatically in Suno v5.5 Advanced mode.
- Detect Style when possible; otherwise calibrate the missing Style field once and remember it locally.
- Replace existing Title / Style / Lyrics instead of appending.
- Validate inserted content after Suno normalizes its rich editor.
- Preserve SHINOBIWAN Suno syntax exactly.
- Never click Create / Generate.

## 🚧 v0.3 — Context selectors

- Read optional `WORKSPACE` and `VOICE` from TXT manifests / JSON packs.
- Open the corresponding Suno selector safely.
- Select the requested saved Workspace and Voice by exact visible name.
- Confirm the selected value before marking the context ready.
- Refuse generation/destructive controls through the existing denylist.
- Keep manual fallback if Suno changes its selector DOM.

## Next — workflow automation

### v0.4 — Create / Cover / Extend preparation

- Interpret `WORKFLOW: Create | Cover | Extend`.
- Open a requested Suno source from `SOURCE URL`.
- Prepare Cover / Extend without clicking the final generation action.
- Validate source identity and selected workflow.
- Add explicit version naming (`V01`, `Cover V01`, `Extend V01`).

### v0.5 — Music project JSON generation contract

**Permanent SHINOBIWAN workflow target:** whenever ChatGPT in the Music project finishes a generation-ready track (Title + final Style Prompt + final Lyrics), it should produce a Bridge-ready JSON object in addition to the normal human-readable Track Manifest.

Canonical schema:

```json
{
  "title": "TRACK TITLE",
  "version": "V01",
  "workflow": "Create",
  "workspace": "",
  "voice": "",
  "source_url": "",
  "style": "Exact final Suno style prompt",
  "lyrics": "[Intro]\nExact final Suno lyrics\n(backs)"
}
```

Rules:

- `title`, `style`, and `lyrics` are required.
- `version`, `workflow`, `workspace`, `voice`, and `source_url` are optional but should be filled whenever known.
- Preserve the Style Prompt verbatim once the generation version is approved.
- Preserve Suno lyrics syntax exactly: `[brackets]` only for structure / sound design; raw text or `(parentheses)` only for sung/spoken vocal content, backs and ad-libs.
- Artist branding remains exactly `SHINOBIWAN`.
- The JSON must never contain private Suno credentials, cookies or tokens.
- The Bridge may prepare the form, but ChatGPT / the extension must never trigger the final generation click automatically.

Planned convenience features:

- `Copy JSON` output in the Bridge.
- Optional `.json` download using a sanitized filename based on title + version.
- Remember default Workspace / Voice locally in the extension, with manifest values taking priority.
- Validate JSON against the Bridge parser before presenting it as ready.

## Later

- Profiles / presets for recurring SHINOBIWAN lanes.
- Multiple named Voices.
- Cover / Extend source picker from the user's Suno library where the current UI allows safe deterministic selection.
- Version history and A/B naming helpers.
- Optional export of a compact session receipt showing what was prepared, without storing Suno account secrets.
