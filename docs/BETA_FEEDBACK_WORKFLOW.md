# Beta Feedback Workflow

## Severity Categories

- `S0 Critical`: crash, launch failure, data-loss-risk, submission-blocking legal/compliance issue
- `S1 Major`: core flow broken, reproducible resume/recovery failure, severe accessibility regression
- `S2 Minor`: functional but degraded UX, copy issues, non-blocking visual defects
- `S3 Trivial`: polish suggestions and low-impact improvements

## Reproduction Template

- Title:
- Severity:
- Build label:
- Device model:
- iOS version:
- Locale:
- Steps to reproduce:
- Expected result:
- Actual result:
- Frequency:
- Attachment links:

## Screenshot / Video Request Guidance

- Request short clips (5-20s) for dynamic issues.
- Request screenshots for static UI/copy issues.
- Ask testers to avoid personal data in captures.

## Device / OS Collection Checklist

- Device model (exact)
- iOS version
- Battery mode (normal / low power)
- Network condition (if relevant)
- Locale and reduced-motion setting

## Localization Issue Reporting

- Include source language and observed language.
- Include exact key phrase shown on screen.
- Mark truncation vs translation quality separately.

## Accessibility Issue Reporting

- Include VoiceOver state (on/off).
- Include reduced-motion state.
- Include expected accessibility behavior and gap.

## Resume / Recovery Issue Reporting

- State whether issue occurred after:
  - background/foreground
  - collapse/restart
  - continue network
- Include whether stale UI state was visible.

## Crash / Performance Reporting Guidance

- Capture timestamp and approximate session duration.
- Note heat, battery drain, stutter, or frame drops.
- Attach crash indicators/log excerpts if available.

## Triage Flow

1. Intake and deduplicate.
2. Assign severity and owner placeholder.
3. Reproduce on internal test device.
4. Mark as RC blocker or non-blocker.
5. Track fix status and retest result.

## RC Blocker Criteria

- Any `S0 Critical`.
- Reproducible `S1 Major` in core flows:
  - launch/onboarding
  - gameplay stability
  - resume/recovery
  - legal/support accessibility paths
- Any issue that materially increases App Review rejection risk.
