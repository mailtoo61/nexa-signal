# iOS Release Checklist

## Bundle ID Checklist

- Confirm `bundleId` in `apps/mobile/src/shared/config/runtimeConfig.ts` is final (no placeholder).
- Confirm bundle identifier matches Apple Developer/App Store Connect app record.
- Confirm provisioning profiles and signing assets are mapped to the same bundle id.

## App Icon / Splash Checklist

- Verify app icon set is final and compliant with App Store size requirements.
- Verify splash/launch visuals match current brand and do not contain placeholder text.
- Verify no visual clipping on iPhone SE, standard, and Max-size devices.

## Privacy / Terms / Support Checklist

- Confirm `privacyPolicyUrl` is configured and reachable over HTTPS.
- Confirm `termsUrl` is configured and reachable over HTTPS.
- Confirm `supportUrl` or `supportEmail` is configured and user-facing.
- Confirm legal/support links open safely from Settings.

## App Store Metadata Checklist

- App name, subtitle, promotional text reviewed.
- Localized short/long descriptions reviewed.
- Keywords reviewed for locale and policy compliance.
- Support and marketing URLs aligned with runtime config.

## Screenshot Checklist

- Capture required iPhone size classes.
- Verify screenshots reflect current production UI.
- Verify no debug/dev overlays or internal labels are visible.

## Build / Version Checklist

- Increment `version` for release train.
- Increment `buildNumber` for each TestFlight/App Store upload.
- Confirm release channel/environment pairing is valid for the target release.

## Localization QA Checklist

- Run `npm run check:i18n`.
- Manually verify English and Turkish copy for critical paths (Home, Game, Settings, recovery).
- Spot-check DE/ES/JA/PT-BR for key presence and non-empty values.

## Accessibility Checklist

- Verify VoiceOver labels for primary controls and destructive actions.
- Verify touch targets meet minimum size expectations.
- Verify sufficient text/background contrast in Settings and Home.
- Verify no color-only state communication for critical status.

## Reduced Motion / Audio / Haptics Checklist

- Verify reduced motion setting affects transitions/effects as expected.
- Verify audio toggle gates all central audio outputs.
- Verify haptics toggle gates all central haptic outputs.

## Production Guard Checklist

- Run `npm run check:production-guards`.
- Confirm dev panels are only reachable behind explicit development gating.
- Confirm no raw debug strings appear in production-visible flows.

## Final Command Checklist

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:engine`
- `npm run check:architecture`
- `npm run check:i18n`
- `npm run check:release-config`
- `npm run check:production-guards`
- `npm run format:check`
- `npm run check:release`
