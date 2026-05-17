# Localization Polish Checklist

## Languages In Scope

- `en`
- `tr`
- `de`
- `es`
- `ja`
- `pt-BR`

## High-Priority String Areas

- Home entry/continue messaging
- Recovery states and fallback copy
- Settings labels and destructive-action confirmation text
- Session end/summary language
- Legal/support link status messaging
- Language display names

## Tone Consistency Checks

- Keep tone calm, clear, premium, and modern.
- Avoid slang, marketing hype, or overly technical phrasing.
- Ensure recovery/failure copy is reassuring and non-alarming.
- Keep imperative controls short and direct.

## Truncation / Layout Checks

- Verify long labels in German and Turkish do not clip in Settings rows.
- Verify modal confirmation copy wraps cleanly on small screens.
- Verify language selector rows remain readable with selected-state marker.
- Verify caption-length constraints for screenshot overlays.

## Character / Encoding Checks

- Run `npm run check:i18n`.
- Verify Turkish diacritics render correctly (`ğ`, `ş`, `ı`, `İ`, `ç`, `ö`, `ü`).
- Verify Japanese strings do not contain placeholder artifacts.
- Verify no `???`, mojibake, or empty values remain.

## Screenshot Localization Notes

- If localized screenshots are included, match in-app language and screenshot caption language.
- Re-capture any frame where fallback English appears unexpectedly.
- Keep locale-specific typography spacing visually balanced.

## Native-Speaker Review Status

- English: draft polished, editorial QA pending final pass.
- Turkish: draft polished, native-speaker QA recommended before submission lock.
- German/Spanish/Japanese/Portuguese (Brazil): structural coverage present, native-speaker polishing pending.

## App Store Metadata Localization Status

- English metadata: ready as submission-grade draft.
- Localized metadata: planned, not finalized.
- Store copy source templates: `docs/store-copy/*.md`.

## Sign-Off Fields

- Localization Lead: `[OWNER_TBD]`
- Turkish Reviewer: `[OWNER_TBD]`
- EU Locale Reviewer (DE/ES): `[OWNER_TBD]`
- Japanese Reviewer: `[OWNER_TBD]`
- PT-BR Reviewer: `[OWNER_TBD]`
- Sign-off Date: `[DATE_TBD]`
