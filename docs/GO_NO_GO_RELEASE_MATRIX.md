# Go / No-Go Release Matrix

## Blocker Definitions

### CRITICAL (No-Go)

- Launch crash or frequent runtime crash.
- Broken legal/privacy/support paths.
- Production-visible dev/debug tooling.
- Reproducible data integrity issues in resume/recovery.
- App Review compliance mismatch risk (metadata/privacy/export answers).

### MAJOR (Usually No-Go unless mitigated)

- Core gameplay flow instability.
- Severe accessibility failure (core controls unusable).
- Critical localization errors in launch locales.
- Significant performance degradation on target iPhone classes.

### MINOR (Go with tracking)

- Isolated copy polish issues.
- Non-blocking visual inconsistencies.
- Low-impact UX refinements.

## Acceptable Known Issues (Go Candidate)

- Clearly documented minor issues with workaround.
- Non-launch-locale store-copy placeholders (if locale not enabled for release).
- Non-critical deferred features not surfaced as production promises.

## Release Approval Owners (Placeholders)

- Release Operator: `[OWNER_TBD]`
- Product Lead: `[OWNER_TBD]`
- QA Lead: `[OWNER_TBD]`
- Legal/Support Ops: `[OWNER_TBD]`

## Readiness Scoring (Suggested)

- 90-100: Go-ready
- 75-89: Conditional go (requires explicit risk sign-off)
- <75: No-go

Scoring axes:

- Product stability
- App Review risk posture
- Operational readiness (support/legal/assets)
- TestFlight confidence

## Rollback Triggers

- New `CRITICAL` after external rollout.
- Sustained crash/performance incident.
- Compliance or legal-link regression.
- App Review rejection citing correctable quality/compliance risk.

## TestFlight Confidence Gates

1. Internal smoke pass green.
2. External tester wave 1 major issues triaged.
3. No unresolved `CRITICAL`.
4. Major issue trend stable or improving.

## App Review Submission Gate

- `npm run check:release` green on candidate commit.
- Asset pack complete and representative.
- Metadata and reviewer notes verified.
- Legal/support ownership checklist confirmed.
