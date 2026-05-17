# Blocker Triage Matrix

## Issue Classes

- Release Blocker
- Major Issue
- Minor Issue
- Known Acceptable Issue

## Severity Rules

### Release Blocker

- Launch crash, data integrity risk, legal/support path failure, production dev-tool exposure.
- Expected resolution: immediate hotfix path or no-go decision.

### Major Issue

- Core feature degradation without total failure.
- Expected resolution: fix before RC promotion unless risk exception approved.

### Minor Issue

- Non-blocking UX/copy/polish issue.
- Expected resolution: track and schedule post-RC if needed.

### Known Acceptable Issue

- Explicitly documented low-impact issue with workaround.
- Expected resolution: carry with risk sign-off.

## Reproduction Confidence

- High: reproducible on demand with clear steps
- Medium: intermittent but observed repeatedly
- Low: single/uncertain report pending validation

## Domain-Specific Severity Guidance

### Localization Severity

- Blocker: critical mistranslation causing action misuse in launch locale.
- Major: repeated truncation in critical controls.
- Minor: non-critical wording polish.

### Accessibility Severity

- Blocker: core path unusable for accessibility setting under test.
- Major: meaningful friction in primary controls/readability.
- Minor: isolated labeling or phrasing issue.

### Resume/Recovery Severity

- Blocker: invalid restore, stale-state corruption, or unsafe recovery behavior.
- Major: intermittent resume failure without corruption.
- Minor: non-critical status messaging mismatch.

### Performance/Battery Severity

- Blocker: severe sustained stutter, thermal failure, or repeat crashes.
- Major: noticeable degradation in core flow on target devices.
- Minor: occasional frame dips without control impact.

### App Review Risk Severity

- Blocker: likely rejection trigger (broken legal links, dev UI exposure, fake media).
- Major: weak reviewer context or inconsistent metadata.
- Minor: editorial phrasing improvements.

## Ownership Placeholders

- Release Operator: `[OWNER_TBD]`
- QA Lead: `[OWNER_TBD]`
- Localization Lead: `[OWNER_TBD]`
- Accessibility Lead: `[OWNER_TBD]`
- Legal/Support Ops: `[OWNER_TBD]`

## Resolution Expectations

- Release blocker: same-day triage, immediate escalation.
- Major: resolution plan within 24 hours.
- Minor: scheduled in backlog with target phase.
- Known acceptable: documented with explicit approval.
