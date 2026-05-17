# App Review Submission Rehearsal

## Final Metadata Verification

- App name, subtitle, promo, and descriptions match approved draft.
- No placeholder tokens or unfinished claims.
- Keywords aligned to product scope and tone.

## Screenshot Verification

- Uploaded screenshots match real gameplay/UI states.
- No dev/debug overlays.
- Locale and caption consistency confirmed.

## Legal URL Verification

- Privacy URL reachable over HTTPS.
- Terms URL reachable over HTTPS.
- Support URL/email path validated.

## Accessibility Verification

- Core controls remain readable and operable.
- Key settings controls exposed and understandable.
- No color-only critical-state communication.

## Reduced-Motion Verification

- Reduced-motion control available in settings.
- Behavior changes are noticeable and stable.
- No visual corruption when reduced motion is enabled.

## Production Guard Verification

- `npm run check:production-guards` passes.
- Manual check confirms no production-visible dev panel.

## TestFlight Smoke Pass

- Execute `docs/TESTFLIGHT_SMOKE_TESTS.md` against candidate build.
- Record pass/fail and blockers.

## Resume / Recovery Verification

- Continue Network appears only for valid resumable snapshot.
- Invalid snapshot fallback remains calm and safe.
- Collapse/restart does not leak stale active state.

## Support Email Verification

- Support path is active and monitored.
- Response expectation documented.

## Reviewer Notes Suggestions

- Keep reviewer notes concise and factual:
  - core gameplay loop
  - settings/reduced motion controls
  - local-first behavior
  - how to reach support

## Common Rejection Prevention Reminders

- Never submit placeholder metadata in active locales.
- Keep legal/support links functional at submission time.
- Ensure media is representative and not staged beyond real behavior.
- Avoid over-claiming legal/compliance/accessibility guarantees.
