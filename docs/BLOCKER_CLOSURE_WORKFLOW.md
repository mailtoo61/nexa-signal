# Blocker Closure Workflow

## Blocker Lifecycle

1. Intake
2. Severity classification
3. Owner assignment
4. Reproduction verification
5. Fix implementation
6. Fix verification
7. Regression verification
8. Closure sign-off

## Owner Assignment Placeholders

- Release Operator: `[OWNER_TBD]`
- QA Lead: `[OWNER_TBD]`
- Domain Owner: `[OWNER_TBD]`
- Approval Sign-off: `[OWNER_TBD]`

## Reproduction Verification

- Confirm exact build label and device/iOS.
- Validate reproducibility level (high/medium/low).
- Attach evidence (screenshot/video/log note).

## Fix Verification

- Verify issue is resolved on target build.
- Verify no behavior drift in related flows.
- Re-run targeted smoke steps for affected domain.

## Regression Verification

- Validate adjacent flows:
  - onboarding
  - gameplay loop
  - continue network / resume-recovery
  - settings persistence
- Re-run `npm run check:release` on candidate branch/commit.

## Release-Blocker Escalation

- Immediate escalation to release operator.
- Pause external-wave expansion if unresolved.
- Trigger rollback readiness review when necessary.

## Rollback Decision Points

- Blocker remains reproducible after fix attempt.
- New critical regression appears.
- App Review risk increases due to unresolved blocker.

## Sign-Off Expectations

- QA confirms closure evidence.
- Release operator confirms release-gate integrity.
- Issue marked closed only after regression check completion.
