# External TestFlight Wave Plan

## Wave Structure

- Wave 0: Internal-only validation (release team)
- Wave 1: Small external cohort
- Wave 2: Expanded external cohort
- Wave 3: Submission-candidate confidence wave

## Internal vs External Rollout

- Internal wave must complete smoke pass before external invite expansion.
- External rollout should be staggered, not full-batch on day one.

## Tester Count Targets (Suggested)

- Wave 1: 15-30 testers
- Wave 2: 40-80 testers
- Wave 3: 80-150 testers (or launch-target sample)

## Stagger Recommendations

- Day 1: invite ~30% of target cohort
- Day 2-3: invite remaining cohort if no critical issues
- Pause expansion if new release blocker appears

## Focus-Area Rotation

- Wave 1: install/onboarding/core loop/recovery basics
- Wave 2: localization/accessibility/settings persistence
- Wave 3: stability/performance/legal links/production confidence

## Onboarding Timing

- Send tester pack before invite window opens.
- Require first feedback check-in within 24-48 hours of install.

## Issue Escalation Flow

1. Intake via feedback workflow template.
2. Triage severity with blocker matrix.
3. Escalate release blockers immediately to release operator.
4. Freeze expansion until blocker is classified and mitigated.

## Rollback Criteria

- Reproducible crash or data-loss-risk in core flow.
- Production guard regression.
- Legal/support path failure in production candidate.

## RC Promotion Rules

- No open release blockers.
- Major issue trend stable with approved risk acceptance.
- `npm run check:release` passes on candidate commit.
- Go/no-go matrix approved by placeholder owners.
