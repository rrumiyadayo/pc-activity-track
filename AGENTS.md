# Repository Guidelines

## Project Structure & Module Organization
- Keep application code in `src/` and supporting scripts in `scripts/`; reserve `tests/` for automated checks. Add data/output under `data/` and `artifacts/` to keep the root clean.
- Place configuration (e.g., `.env.example`, `pyproject.toml`, `package.json`, `Makefile`) at the repo root. Document any required environment variables in `README.md`.
- Prefer small, focused modules with clear boundaries; keep platform-specific adapters isolated from core logic.

## Build, Test, and Development Commands
- Use a single entry point for local workflows: `make bootstrap` (set up env), `make lint`, `make test`, `make run` (or equivalent scripts). If Make is unavailable, mirror these in `scripts/` (e.g., `scripts/lint.sh`).
- Keep commands self-describing inside the Makefile or scripts with `help` targets (`make help`), and ensure they fail fast on errors (`set -euo pipefail` in shell scripts).

## Coding Style & Naming Conventions
- Follow formatter/linter defaults for the chosen stack (e.g., `ruff/black` for Python, `eslint/prettier` for JS/TS). Add config files to the root and run them in CI.
- Use snake_case for files in Python, kebab-case for shell scripts, and PascalCase for types/classes. Keep function names action-oriented (`record_activity`, `emit_event`).
- Keep modules cohesive and under ~300 lines; extract helpers rather than inline complex logic.

## Testing Guidelines
- Mirror the code tree under `tests/` with descriptive names (`tests/test_activity_tracker.py`). Prefer deterministic tests and avoid relying on wall-clock time; inject clocks or use fixed timestamps.
- Target fast, hermetic tests first; add integration checks behind a single command (`make test` or `npm test`). Track coverage and guard critical paths (activity detection, persistence).

## Commit & Pull Request Guidelines
- Use concise, present-tense commit subjects (Conventional Commit prefixes encouraged: `feat:`, `fix:`, `chore:`). Group related changes; avoid mixed concerns.
- PRs should explain intent, summarize key changes, and note any follow-up items. Link issues/tasks, include screenshots or logs if behavior changes, and list testing done (`make test`, manual steps).

## Security & Configuration Tips
- Never commit secrets; use `.env` with `.env.example` checked in. If telemetry or OS-level access is required, document permissions clearly.
- Pin tool versions in lockfiles (e.g., `poetry.lock`, `package-lock.json`) and update via dedicated PRs to keep reproducibility high.
