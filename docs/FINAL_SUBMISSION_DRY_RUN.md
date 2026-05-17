# Final Submission Dry-Run

Run this on the locked submission candidate build before App Review submission.

## 1) Clean Install

- Fresh install from TestFlight build
- Launch stability confirmed

## 2) Onboarding

- Home entry flow is clear and functional
- Enter Network path starts session correctly

## 3) Gameplay Loop

- Core actions behave as expected
- Session progression/summary remains coherent

## 4) Continue Network

- Continue option appears only with valid resumable state
- Invalid state fallback remains calm and safe

## 5) Settings Persistence

- Audio/haptics/reduced-motion/language persist across relaunch

## 6) Reduced Motion

- Reduced motion toggle visibly changes behavior without regressions

## 7) Localization

- Launch locale copy verified
- No critical truncation in key controls

## 8) Background / Restore

- Background/foreground flow preserves deterministic-safe behavior

## 9) Legal Links

- Privacy/terms/support paths open successfully

## 10) Production Guard Verification

- No production-visible dev/debug panels
- `npm run check:production-guards` green on candidate commit

## 11) App Store Metadata Verification

- Metadata text aligns with in-app and release docs
- No placeholders in active submission locales

## 12) Final Smoke Checklist

- `npm run check:release` green
- RC freeze checklist complete
- Submission candidate lock acknowledged
