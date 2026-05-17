# Release Readiness Matrix

Status categories:

- `COMPLETE`: implemented and validated in current flow
- `PARTIAL`: functional baseline exists, needs additional polish/ownership
- `BLOCKED`: cannot complete until external dependency/decision is resolved
- `FUTURE`: intentionally deferred
- `NICE_TO_HAVE`: valuable but non-blocking for RC

## COMPLETE

- Resume / recovery determinism and guard rails
- Save throttling and snapshot fingerprint usage
- Recovery-state handling and invalid snapshot fallback behavior
- Settings runtime-config integration (legal/support/metadata display wiring)
- CI-style verification commands (`check:release` chain)
- Production guard checks for dev tooling exposure
- Baseline i18n structural validation (key parity, empty/placeholder scan)

## PARTIAL

- Localization quality across all locales
  - `en` and `tr` improved
  - `de`, `es`, `ja`, `pt-BR` remain partly fallback-style and need native review
- Accessibility validation
  - settings controls exist
  - full VoiceOver and dynamic type audit not yet documented as complete
- App Store metadata localization
  - English draft is polished
  - localized metadata sets still pending editorial pass
- Legal/support operations
  - config fields exist
  - final owner assignments and SLA operations need sign-off
- Performance evidence
  - no release-facing benchmark or frame-time report documented yet

## BLOCKED

- Final legal approval for privacy/terms wording (requires legal owner)
- Final domain and support operations confirmation (requires owner confirmation)
- App Store Connect asset upload execution (requires account-side submission workflow)

## FUTURE

- Crash reporting platform integration (currently absent)
- Advanced product analytics framework beyond local/product-safe telemetry stance
- Monetization systems (currently intentionally absent)
- Experimentation/remote config infrastructure (not required for current local-first scope)

## NICE_TO_HAVE

- Fully localized App Store screenshots per target language
- App Preview video with regional caption variants
- Performance soak-test report for older iPhone classes
- Additional accessibility QA pass with external tester panel

## Domain View

- Gameplay: `COMPLETE` for RC scope (no engine rewrite needed)
- Onboarding: `PARTIAL` (copy polish + first-session tuning still expandable)
- Accessibility: `PARTIAL`
- Localization: `PARTIAL`
- Legal/Support: `PARTIAL` -> `BLOCKED` for final approval tasks
- Screenshots: `PARTIAL` (plan complete, capture pending)
- Metadata: `PARTIAL` (draft complete, localization/final legal pass pending)
- Audio/Haptics controls: `COMPLETE` for settings-level gating
- Performance validation: `PARTIAL`
- Resume/Recovery: `COMPLETE` for current release target
- App Store assets pack: `PARTIAL`
- CI/Release checks: `COMPLETE`
- Crash reporting: `FUTURE`
- Analytics/privacy stance: `PARTIAL` (local-first stance clear; formal policy wording pending)
- Monetization: `FUTURE` (intentionally absent)
