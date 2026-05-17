# Live Execution Fill-In Guide

Use this guide to populate release-operation templates with real execution data.
Do not enter assumptions; record only observed evidence.

## 1) Populate Operational Templates with Real Data

- Update wave boards after each execution window (not in advance).
- Record exact RC label/build and timestamp for each update.
- Use issue IDs consistently across all templates.

## 2) Required Evidence Expectations

- Every blocker or major issue should have:
  - reproduction steps
  - device/iOS context
  - screenshot/video evidence where possible
  - verification outcome after fix
- Keep evidence links durable and traceable.

## 3) Tester Verification Expectations

- Confirm active participation with actual tester interactions.
- Separate internal vs external TestFlight feedback.
- Track accessibility and localization tester coverage explicitly.

## 4) Blocker Verification Expectations

- Reproduction confirmed before fixing.
- Fix verified on candidate build.
- Regression checks completed on adjacent flows.
- Release gate re-run after blocker fixes.

## 5) Localization Sign-Off Evidence

- Store native-review outcomes by locale.
- Capture truncation checks in critical UI paths.
- Verify metadata and screenshot language consistency.

## 6) Screenshot / Preview Video QA Evidence

- Confirm export dimensions and safe areas.
- Confirm no dev/debug leakage in captures.
- Confirm compression quality is acceptable at upload scale.

## 7) Final RC Approval Evidence

- Completed go/no-go review template.
- RC lock record filled with final status.
- Submission package checklist marked complete.
- `npm run check:release` green on locked submission candidate.
