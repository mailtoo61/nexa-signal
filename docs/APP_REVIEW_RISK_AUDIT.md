# App Review Risk Audit

## Risk Legend

- `LOW`: unlikely to block review if normal QA is completed
- `MEDIUM`: could delay review or require metadata/build iteration
- `HIGH`: likely rejection risk unless mitigated pre-submission

## 1) Hidden DEV Tooling Exposure

- Risk: `MEDIUM`
- Why: project includes development-oriented playtest/tuning UI paths
- Mitigation:
  - run `npm run check:production-guards`
  - manually verify production-visible screens contain no dev labels
  - capture submission screenshots from production-safe states only

## 2) Broken Legal/Support Links

- Risk: `HIGH`
- Why: App Review often checks links directly
- Mitigation:
  - verify runtime config URLs are final and reachable over HTTPS
  - verify support URL or support email path is active
  - run device-level tap-through before submission

## 3) Placeholder Metadata / Store Copy

- Risk: `HIGH`
- Why: placeholder copy degrades quality and can trigger review concerns
- Mitigation:
  - finalize metadata from `docs/APP_STORE_METADATA.md`
  - complete localized store-copy files as needed
  - avoid `[DRAFT_TBD]` text in submitted locales

## 4) Incomplete Legal / Support Ownership

- Risk: `MEDIUM`
- Why: operational gaps create poor review and post-launch support readiness
- Mitigation:
  - assign owners in `docs/LEGAL_SUPPORT_CHECKLIST.md`
  - confirm SLA and escalation path before external testing

## 5) Accessibility Gaps

- Risk: `MEDIUM`
- Why: visible accessibility regressions can trigger rejection or feedback loops
- Mitigation:
  - verify reduced motion behavior
  - verify readable contrast and core VoiceOver labels
  - include settings evidence in QA and screenshots

## 6) Resume / Recovery Reliability

- Risk: `LOW`
- Why: deterministic resume/recovery and tests are already in place
- Mitigation:
  - include background/restore smoke tests in TestFlight pass
  - avoid late changes to persistence or recovery state logic

## 7) Localization Quality

- Risk: `MEDIUM`
- Why: some locales remain template-level for store copy
- Mitigation:
  - prioritize English/Turkish final polish
  - add native-speaker pass for DE/ES/JA/PT-BR before localized storefront submission

## 8) Unfinished Future-Feature Visibility

- Risk: `MEDIUM`
- Why: visible “coming soon” artifacts can be questioned if misleading
- Mitigation:
  - keep placeholders calm and non-promissory
  - do not advertise unavailable features in screenshots/preview

## 9) Performance / Battery Perception

- Risk: `MEDIUM`
- Why: App Review may flag obvious heat/battery/performance instability
- Mitigation:
  - run repeated sessions on target iPhone classes
  - avoid capturing submission media during unstable frame conditions

## 10) Privacy Statement Alignment

- Risk: `MEDIUM`
- Why: App Store privacy answers must align with in-app behavior and copy
- Mitigation:
  - ensure privacy wording reflects local-first storage reality
  - avoid over-claiming compliance beyond approved legal text
