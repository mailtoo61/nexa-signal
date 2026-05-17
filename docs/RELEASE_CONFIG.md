# Mobile Release Config

Runtime config lives in `apps/mobile/src/shared/config/runtimeConfig.ts`.

## Update Before App Store Submission

- `appName`
- `appSlug`
- `bundleId` (must not include placeholder values)
- `version`
- `buildNumber`
- `releaseChannel`
- `environment`

## Legal & Support Checklist

- Set `privacyPolicyUrl` to a valid `https://` URL.
- Set `termsUrl` to a valid `https://` URL.
- Set `supportUrl` to a valid `https://` URL.
- Set `supportEmail` to a monitored support mailbox.
- Optionally set `marketingUrl`.

## Bundle ID Checklist

- Use the final iOS bundle identifier.
- Ensure bundle id matches App Store Connect app record.
- Ensure production config validation passes with no errors.

## Release Channel Notes

- Allowed channels: `dev`, `preview`, `production`.
- Allowed environments: `development`, `preview`, `production`.
- Production environment requires legal/support URLs and non-placeholder bundle id.
