# Release Candidate Freeze Checklist

Use this checklist when declaring RC freeze for a TestFlight/App Review candidate.

## 1) Config Freeze

- Runtime config values reviewed and locked for release train.
- Legal/support URLs verified.
- Bundle id confirmed final.

## 2) Version Freeze

- Version string locked for candidate.
- Build number locked for candidate upload.
- Build metadata recorded in release notes.

## 3) Localization Freeze

- In-app copy freeze declared.
- Store metadata localization status recorded.
- High-priority locale reviewer sign-off captured.

## 4) Asset Freeze

- App icon/splash assets frozen.
- Store metadata draft promoted to RC candidate copy.
- Any visual overlays/caption styles frozen.

## 5) Screenshot Freeze

- Screenshot set exported and dimension-checked.
- Locale coverage matches submission plan.
- No placeholder or dev-only visuals.

## 6) TestFlight Smoke Pass

- Execute `docs/TESTFLIGHT_SMOKE_TESTS.md`.
- Record pass/fail with device/build references.
- Blockers triaged before external rollout.

## 7) Production Guard Verification

- `npm run check:production-guards` passes on freeze commit.
- Manual sanity pass confirms no visible dev UI in production flows.

## 8) Accessibility Verification

- Reduced motion toggle behavior verified.
- Audio/haptics toggles verified.
- Core readability and interaction checks completed.

## 9) Resume / Recovery Verification

- Continue Network behavior validated.
- Background/restore behavior validated.
- Collapse/restart clearing behavior validated.

## 10) Legal / Support Verification

- Privacy/terms/support ownership checklist complete.
- Runtime links match approved pages.
- Support contact path confirmed active.

## 11) Final Automation Gate

- `npm run check:release` passes on freeze commit SHA.

## 12) Rollback / Archive Notes

- Archive final candidate artifacts and command outputs.
- Preserve prior known-good build metadata for rollback.
- Record fallback submission strategy (previous build or hotfix path).
