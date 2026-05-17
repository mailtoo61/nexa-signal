# TestFlight External Readiness

## External Beta Prerequisites

- Candidate build passes `npm run check:release`.
- RC freeze checklist completed (`docs/RC_FREEZE_CHECKLIST.md`).
- Legal/support links verified in production-like runtime config.
- App Store metadata and asset set prepared for beta-facing quality.

## App Store Connect Beta Review Notes

- Complete beta app information before submission.
- Provide concise test notes for reviewers:
  - core gameplay loop
  - deterministic resume/recovery behavior
  - settings and accessibility controls
- Avoid unfinished/promissory copy in review notes.

## Export Compliance Reminders

- Confirm export compliance prompts are answered truthfully in App Store Connect.
- Ensure submission answers match actual app behavior and dependencies.

## Tester Group Planning

- Group A: Internal release team smoke testers.
- Group B: Trusted external functional testers.
- Group C: Accessibility and localization-focused testers.
- Keep group size controlled in first external wave.

## Tester Onboarding Instructions

1. Install via TestFlight invite.
2. Use `docs/TESTFLIGHT_TESTER_PACK.md` as test guide.
3. Report findings using `docs/BETA_FEEDBACK_WORKFLOW.md` template.
4. Include device, iOS version, and reproduction steps for each issue.

## Known Limitations (Communicate Clearly)

- Localized store copy for some locales may still be editorially in progress.
- Certain future-facing features are intentionally deferred.
- Local-first behavior means no cloud account sync for core gameplay.

## Accessibility / Reduced Motion Notes

- Reduced motion is user-controllable in settings.
- Audio and haptics are user-controllable in settings.
- Accessibility feedback should include exact control path and expected behavior.

## Support Expectations

- Acknowledge tester reports within defined response window.
- Prioritize blocker-class defects affecting submission confidence.
- Maintain clear and calm communication; avoid defensive language.

## Feedback Collection Guidance

- Route all external feedback into one triage stream.
- Deduplicate reports by reproduction signature.
- Track RC blockers separately from minor polish observations.
