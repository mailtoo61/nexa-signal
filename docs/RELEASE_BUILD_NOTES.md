# Release Build Notes

## Build Pipeline Reminders (Expo / EAS)

- Use approved iOS release profile for candidate builds.
- Ensure release environment/config values are loaded for production candidate.
- Keep build command history attached to release ticket/notes.

## Environment / Channel Expectations

- `environment` and `releaseChannel` should align with intended target.
- For App Store candidate, use production-aligned values.
- Re-run release-config checks after any config edits.

## Production Config Expectations

- Final bundle id configured.
- Version and build number set for submission.
- Privacy/terms/support paths configured and reachable.

## Signing Reminders

- Confirm Apple signing credentials are valid and not expiring mid-cycle.
- Confirm provisioning profile and certificate match release bundle id.
- Confirm account permissions for upload and TestFlight distribution.

## Archive Naming Suggestions

Use deterministic naming:

`nexa-signal_ios_v{version}_b{buildNumber}_{yyyymmdd}_{channel}`

Example:

`nexa-signal_ios_v0.1.0_b42_20260510_production`

## Build Retention Suggestions

- Keep at least:
  - latest RC candidate
  - previous known-good candidate
  - first build approved for external TestFlight
- Retain artifacts and command logs until production launch stabilization completes.

## TestFlight Build Labeling Suggestions

- Internal label format:
  - `RC-{version} ({buildNumber})`
- Notes field should include:
  - scope summary
  - known non-blocking issues
  - smoke-test status reference

## Final Candidate Gate

- Run `npm run check:release`.
- Confirm RC freeze checklist is complete.
- Confirm App Store Connect metadata/screenshot package is synchronized with candidate build.
