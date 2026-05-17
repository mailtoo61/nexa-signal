# RC Labeling Guide

## RC Naming Examples

- `RC-0.1.0-01`
- `RC-0.1.0-02-hotfix`
- `RC-0.2.0-beta-entry`

## TestFlight Build Labeling Examples

- `RC 0.1.0 (42)`
- `External Beta 0.1.0 (43)`
- `Post-fix Candidate 0.1.0 (44)`

## Archive Naming Examples

- `nexa-signal_ios_v0.1.0_b42_20260510_production`
- `nexa-signal_ios_v0.1.0_b43_20260512_external-beta`

## Semantic Version Suggestions

- Patch for risk-limited fixes: `0.1.1`
- Minor for content/feature increments: `0.2.0`
- Keep version intent aligned with release notes scope.

## Build Increment Reminders

- Increment build number for every uploaded candidate.
- Never re-use a build number in the same version train.
- Record label-to-build mapping in release notes.

## Rollback / Archive Retention Notes

- Keep at least two known-good archives:
  - latest candidate
  - last externally stable candidate
- Preserve command output and smoke-test summary with each archive.
