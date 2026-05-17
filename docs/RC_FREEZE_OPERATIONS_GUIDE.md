# RC Freeze Operations Guide

## No-New-Feature Policy

- No new gameplay, UX, or platform feature work after RC freeze starts.
- Changes must be limited to blocker resolution, compliance fixes, or release-critical corrections.

## Blocker-Only Patch Policy

- Every patch must map to a tracked blocker/major issue.
- Patch requires:
  - reproduction evidence
  - fix verification
  - regression verification

## Freeze Escalation Rules

- Any new release blocker triggers immediate escalation to release operator placeholder.
- External wave expansion pauses until blocker is triaged and dispositioned.
- Repeated regressions trigger freeze risk review.

## Emergency Rollback Conditions

- Reproducible launch crash.
- Broken legal/support path in submission candidate.
- Production dev/debug leakage.
- Critical data integrity risk in resume/recovery flow.

## Allowed vs Non-Allowed Changes During RC Freeze

### Allowed

- Blocker fixes
- App Review compliance wording corrections
- Release metadata typo corrections (risk-reviewed)
- Asset replacement only when tied to blocker/compliance issue

### Non-Allowed

- New feature additions
- Scope-expanding refactors
- Visual redesign not tied to blocker/compliance risk
- Non-essential dependency churn

## Metadata Freeze Guidance

- Freeze active locale metadata before submission candidate lock.
- Only unblock for critical factual/correction updates.

## Localization Freeze Guidance

- Freeze launch-locale copy at RC freeze entry.
- Require explicit risk review for late locale edits.

## Screenshot / Preview Video Freeze Guidance

- Lock capture set and naming once QA complete.
- Replace assets only for blocker-level misrepresentation or quality defects.

## Release Gate Expectations

- `npm run check:release` must be green on freeze-entry candidate and every blocker-fix candidate.
