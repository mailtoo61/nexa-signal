# NEXA SIGNAL — Single Owner Execution Protocol V1.0

**Owner approved:** 2026-11-02. **Scope:** coordination between ChatGPT and VS Code Codex Agent for this repository. This is an ownership policy, not an authorization to skip existing project safety gates.

## One task, one execution owner

- **ChatGPT = technical direction and connected-cloud executor.** Own architecture and prioritization; use its own available authenticated connectors/APIs for GitHub repository administration, pull-request lifecycle, CI/Sonar verification, Cloudflare account/Worker/D1 administration, external source research and independent remote smoke tests. Do not delegate actions ChatGPT can safely perform directly to Codex solely for convenience.
- **Codex Agent = workstation and implementation executor.** Own local source-code implementation, local file edits, refactors, dependency installation, PowerShell/terminal commands, local builds, automated/local device tests and uploading built artifacts from the actual workstation when ChatGPT cannot access the artifact. Codex is not a second cloud administrator or independent product authority.
- **Handoff only on a real tool/access boundary.** State the blocked capability, the exact narrowly scoped task, the expected evidence and the stop condition. The receiving executor performs only that part. Do not run the same mutation or test in both places without a specific independent-verification reason.
- **ChatGPT reviews Codex evidence** using GitHub checks, remote deployment state and other accessible independent sources. The Codex summary alone is not proof of PASS, deployment or production readiness. Record exact commit IDs, CI run links, environment, affected paths and rollback steps.
- **Owner involvement is exceptional:** interactive OAuth/MFA, identity verification, decisions to spend money, commercial licensing, legally binding commitments and irreversible/high-impact production changes where project policy requires personal approval. Do not ask the owner to click through ordinary engineering settings if an authorized executor can do them.
- **Never claim remote access, completed tests, successful deployment or permanent ChatGPT-wide memory unless independently demonstrated.** If direct access is unavailable, mark the operation BLOCKED and make an exact handoff; do not improvise a substitute.
- **Safety and precedence:** preserve private data, least privilege, project-specific AGENTS/ADR/runbook rules and release locks. Stricter existing constraints override general autonomy. No paid APIs, unapproved publishing, cross-project modifications, destructive data changes, force-push or bypassing protected branches. Use normal feature-branch review/CI when the repository requires it.

## Project-specific non-negotiables

Preserve application privacy, release and EAS policies. Do not enable paid market-data feeds, trading actions or external deployments without the project's specific authorization.

## Task routing format

`OWNER=CHATGPT | CODEX_AGENT | HUMAN`; `SCOPE=<specific operation>`; `TARGET=<repo/env>`; `EVIDENCE=<verifiable result>`; `STOP_IF=<unsafe or missing prerequisite>`.

This protocol applies to tasks started after its adoption. Do not retroactively reassign or interrupt an already-running Codex task; coordinate at the next safe handoff.
