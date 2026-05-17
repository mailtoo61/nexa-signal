# RC Confidence Scoring Guide

## Scoring Categories (100 Total)

- Blocker Health: 30
- Accessibility Readiness: 15
- Localization Readiness: 15
- App Review Risk Posture: 20
- TestFlight Stability Confidence: 10
- Metadata/Asset Readiness: 10

## Confidence Thresholds

- 90-100: High confidence
- 75-89: Moderate confidence (conditional go)
- <75: Low confidence (hold)

## Weighting Rules

### Blocker Weighting (30)

- 0 open blockers required for full score.
- Any unresolved release blocker forces confidence hold recommendation.

### Accessibility Weighting (15)

- Core controls, reduced motion, and critical readability must pass.
- Severe accessibility regression reduces score significantly.

### Localization Weighting (15)

- Launch locales must be QA-complete.
- Critical mistranslation/truncation in launch locale lowers confidence band.

### App Review Risk Weighting (20)

- Broken legal/support links, placeholder metadata, or dev-tool leakage heavily penalize score.

## Release Hold Thresholds

- Any open release blocker.
- Any high App Review risk unresolved.
- Any broken legal/support path in submission candidate.

## Recommended Release Thresholds

- Minimum recommended score for submission candidate: 85
- Required conditions:
  - zero open release blockers
  - release gate green
  - metadata/assets/legal/support sign-off complete
