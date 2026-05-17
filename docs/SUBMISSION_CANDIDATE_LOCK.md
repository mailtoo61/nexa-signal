# Submission Candidate Lock

## Version Freeze

- Lock semantic version for submission candidate.
- Increment build number only for blocker-fix rebuilds.

## Config Freeze

- Lock runtime config values used by candidate.
- No config changes without release-operator approval.

## Metadata Freeze

- Lock App Store metadata text for active submission locales.
- Allow edits only for blocker-level App Review risk.

## Localization Freeze

- Freeze in-app copy for launch locales.
- Non-launch locale edits require explicit risk review.

## Screenshot Freeze

- Freeze final screenshot set and naming.
- No visual substitutions after lock unless blocker-level issue.

## No-New-Feature Rule

- No feature additions after candidate lock.
- Scope limited to blocker fixes and compliance corrections.

## Blocker-Only Patch Policy

- Patch acceptance requires:
  - blocker classification
  - reproduction proof
  - risk-benefit sign-off

## RC Labeling

- Use standard RC labels from `docs/RC_LABELING_GUIDE.md`.
- Keep label -> build -> commit mapping updated.

## Rollback / Archive References

- Maintain archive for:
  - current candidate
  - last known-good candidate
- Keep command outputs and smoke summary attached.

## Final Verification Gate

- `npm run check:release` must pass on locked candidate commit.
