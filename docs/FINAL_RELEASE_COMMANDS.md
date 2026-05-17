# Final Release Commands

Run from repository root: `f:/nexasignal`

## 1) Install

```bash
npm install
```

## 2) Core Verification Commands

```bash
npm run typecheck
npm run lint
npm run test
npm run test:engine
npm run check:architecture
npm run check:i18n
npm run check:release-config
npm run check:production-guards
npm run format:check
```

## 3) Aggregated Release Gate

```bash
npm run check:release
```

`check:release` runs the required release chain in sequence and should be used as the final green gate before submission packaging.

## 4) Expo / iOS Build-Prep Notes

This repository currently validates release readiness through TypeScript, lint, tests, architecture boundaries, i18n checks, release-config checks, production guards, and formatting checks.

If your release workflow includes Expo prebuild or EAS-specific checks, run them in your deployment environment with final credentials/config:

```bash
# Optional, if used in your release process:
# npx expo prebuild --platform ios
# npx expo-doctor
```

Do not treat optional Expo commands as substitutes for `npm run check:release`.

## 5) Final Gate Sequence (Recommended)

1. `npm install`
2. `npm run check:release`
3. Verify legal/support owner sign-offs in `docs/LEGAL_SUPPORT_CHECKLIST.md`
4. Verify localization sign-offs in `docs/LOCALIZATION_POLISH_CHECKLIST.md`
5. Capture and validate screenshot set from `docs/APP_STORE_SCREENSHOT_PLAN.md`
6. Submit App Store metadata pack from `docs/APP_STORE_METADATA.md`
