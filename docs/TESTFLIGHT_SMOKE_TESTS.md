# TestFlight Smoke Tests

Run these checks on each candidate TestFlight build before external rollout.

## Test Metadata

- Build: `[BUILD_NUMBER]`
- Device: `[DEVICE_MODEL / iOS_VERSION]`
- Tester: `[NAME]`
- Date: `[DATE]`

## 1) Fresh Install

- Install from TestFlight.
- Launch app and verify first-load stability.
- Confirm no immediate crash or broken entry UI.

## 2) Onboarding / Entry

- Verify Enter Network path works.
- Verify Home labels are readable and calm.

## 3) Gameplay Loop

- Start run, perform stabilize/repair/connect style actions.
- Verify score/tick/stability updates appear consistent.

## 4) Continue Network

- Create resumable progress.
- Return to Home and verify Continue Network visibility only when valid snapshot exists.

## 5) Settings Persistence

- Toggle audio/haptics/reduced motion.
- Restart app and confirm settings persist correctly.

## 6) Language Switching

- Change language.
- Confirm critical Home/Settings labels update and remain readable.

## 7) Reduced Motion

- Enable reduced motion.
- Verify transitions/effects behavior is calmer and still functional.

## 8) Audio / Haptics

- Verify toggles gate feedback output as expected.

## 9) Background / Restore

- Send app to background during active session.
- Return and verify deterministic-safe resume behavior.

## 10) Collapse / Recovery

- Reach collapse/session-end state.
- Verify restart/clear flow does not leak stale active snapshot state.

## 11) Legal Links

- Open privacy, terms, and support paths from settings.
- Verify links are reachable and valid.

## 12) Production Visibility Checks

- Confirm no dev/playtest/debug panels are visible in production flow.
- Confirm no placeholder metadata text appears in user-facing screens.

## 13) Low Battery / Thermal Notes (Manual)

- Optional but recommended: run short session on low battery mode.
- Note any severe stutter, thermal warning, or interaction delay.

## Result Summary

- Pass/Fail: `[PASS|FAIL]`
- Blockers: `[NONE|LIST]`
- Follow-ups: `[LIST]`
