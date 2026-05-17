# App Store Connect Execution

## 1) App Store Connect Setup Flow

1. Sign in to App Store Connect with release-capable account access.
2. Create app record for iOS:
   - Platform: iOS
   - Name: `NEXA SIGNAL`
   - Primary language: choose launch default
   - Bundle ID: must match release bundle id exactly
   - SKU: internal immutable identifier
3. Confirm bundle id exists in Apple Developer account and is linked to the app record.

## 2) App Creation Checklist

- App name matches release metadata pack.
- Bundle id matches runtime config and signing setup.
- Category/subcategory selected.
- Content rights and age rating questionnaire scheduled.
- Privacy policy URL prepared and reachable.
- Support URL/email prepared.

## 3) Bundle ID Linkage & Signing Reminders

- Confirm `bundleId` in runtime config is final for release train.
- Confirm provisioning/signing assets are generated for that id.
- Avoid last-minute bundle id changes after TestFlight starts.
- Reconfirm entitlements/capabilities before first production upload.

## 4) Build Upload Notes

- Upload signed iOS build through your approved Expo/EAS pipeline.
- Verify build version and build number before upload.
- Wait for processing, then confirm:
  - build appears in TestFlight
  - no processing warnings requiring metadata changes

## 5) TestFlight Flow

### Internal Testing

1. Add internal testers (App Store Connect users).
2. Assign latest build.
3. Run smoke tests from `docs/TESTFLIGHT_SMOKE_TESTS.md`.
4. Capture blocker defects before external rollout.

### External Testing

1. Complete required beta app information and compliance prompts.
2. Add external tester group(s).
3. Submit build for Beta App Review.
4. After approval, monitor feedback and crash signals daily.

## 6) Phased Release Notes

- Keep release notes short, factual, and calm.
- Mention core player value and stability improvements.
- Avoid unverified claims (performance/compliance/legal guarantees).

## 7) Common Rejection Pitfalls

- Broken privacy/terms/support links.
- Placeholder metadata/screenshot text.
- Production-visible debug/dev interfaces.
- Misleading or non-representative gameplay media.
- Incomplete account/data handling disclosures.
- Claims of accessibility compliance without verification evidence.

## 8) Release Freeze Reminders

- Freeze config, copy, and store assets before RC upload.
- Permit only blocker fixes after freeze.
- Re-run `npm run check:release` on freeze commit.
- Archive exact build metadata and submission notes for rollback traceability.
