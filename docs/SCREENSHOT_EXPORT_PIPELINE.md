# Screenshot Export Pipeline

## Required Device Classes (iPhone)

- 6.9" class capture set (primary)
- 6.5" class capture set (secondary)
- 5.5" class capture set if required by current App Store policy

Always verify current App Store Connect requirements before final export.

## Naming Convention

Use deterministic names:

`{locale}_{deviceClass}_{index}_{scene}.png`

Example:

`en_69_01_home-hero.png`

## Capture Checklist

- Production-visible UI only.
- No debug/dev/playtest overlays.
- No placeholder legal/support strings.
- Stable framerate during capture moment.
- Consistent orientation and aspect ratio per set.
- Clean status bar strategy (either hidden or consistent).

## Required Scene Coverage

1. Home hero
2. Core gameplay decision frame
3. High-pressure gameplay frame
4. Collapse/session summary frame
5. Continue/recovery frame
6. Settings/accessibility frame

## Reduced-Motion Capture Guidance

- Capture one settings frame showing reduced motion toggle.
- Capture one gameplay frame with reduced motion enabled.
- Ensure the visual remains representative and calm, not visually degraded.

## Dark/Light Consistency

- If only one visual mode is shipped, keep all screenshots in that mode.
- If both are user-facing and polished, do not mix modes within one locale set unless intentionally staged and captioned.

## Localization Screenshot Workflow

1. Lock base English capture sequence first.
2. Switch locale.
3. Re-capture the same shot numbers and camera framing.
4. Validate truncation and selected-language markers.
5. Export locale-specific folders.

## Export Folder Structure (Proposed)

`release-assets/`

- `screenshots/`
- `en/`
- `69/`
- `65/`
- `55/`
- `tr/`
- `69/`
- `...`
- `de/`
- `...`
- `es/`
- `...`
- `ja/`
- `...`
- `pt-BR/`
- `...`

## Final QA Before Upload

- Check file dimensions and compression artifacts.
- Check copy/caption alignment with metadata pack.
- Check that every uploaded frame reflects real gameplay and real UI states.
