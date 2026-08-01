---
name: dudu-review
description: Automatically use this skill whenever reviewing code, pull requests, commits, diffs, scripts, GitHub Actions, setup instructions, or personal automation in this repository. Review for safe, reliable operation on macOS Apple Silicon and zsh.
---

# Dudu Code Review

## Automatic use

Use this skill automatically when a request involves any of the following in this repository:
- Reviewing a pull request, commit, diff, branch, or changed file.
- Checking whether code, scripts, commands, or workflows are safe or correct.
- Reviewing GitHub Actions, deployment, setup, maintenance, or recovery changes.
- Reviewing personal automation, AI-assisted workflows, remote access, smart-home integrations, or scheduled tasks.
- Approving, validating, merging, or deciding whether a change is ready.

Do not require the user to name this skill. Apply it whenever these conditions match. Review only the proposed change and its stated issue or PR goal. Do not modify production code.

## Standards

### Compatibility
- Require commands to work on macOS Apple Silicon and zsh.
- Flag Linux-only paths, package assumptions, services, or commands.
- Flag GNU-only flags unless the repository installs and explicitly invokes the GNU tool.
- Prefer macOS-safe paths and architecture-aware Homebrew usage; do not assume `/usr/local`.

### Safety
- Flag destructive, irreversible, or broad-scope commands.
- Flag hard-coded secrets, tokens, passwords, credentials, or private URLs.
- Require explicit human confirmation before delete, overwrite, permission changes, deployment, restart, or smart-home/security changes.
- Require sensitive values to come from documented environment variables or GitHub Secrets.

### Reliability
- Check error handling and non-zero exit behavior.
- Check retries, bounded timeouts, duplicate prevention/idempotency, and rollback or recovery.
- Flag workflows that can hang, repeat actions, or leave partial state.
- Do not accept “works” without reproducible test evidence.

### Git quality
- Verify the change matches the issue or PR goal.
- Flag unrelated files, refactors, formatting, or dependency changes.
- Require clear, copy-pasteable validation commands and expected results.

### Automation quality
- Separate deterministic steps from AI judgment.
- Require human approval before high-impact actions.
- Flag hidden state, undocumented prerequisites, machine-specific paths, implicit credentials, or reliance on prior manual setup.
- Prefer observable inputs, outputs, logs, and explicit state.

## Review output

Report only actionable findings. For each finding use:

```text
[Critical|High|Medium|Low] Short title
File: path/to/file:line
Why it matters: concrete impact in this repository
Minimal safe fix: smallest change that resolves the risk
Validation: exact command or test proving the fix
```

Severity:
- **Critical:** credential exposure, destructive action, security bypass, or likely irreversible impact.
- **High:** likely failure, unsafe automation, deployment/security risk, or major incompatibility.
- **Medium:** reliability, maintainability, hidden-state, or validation weakness with practical impact.
- **Low:** small correctness, clarity, or repository-quality issue.

If there are no findings, state that no actionable issues were found and list the validation evidence reviewed.