# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# motd-forge

## What this is

An npm/Node.js port of the [motd_forge](https://rubygems.org/gems/motd_forge) Ruby gem.
Builds a custom message-of-the-day banner showing uptime, disk and memory
usage, and a random quote — handy for homelab servers. Same concept, npm
ecosystem instead of RubyGems.

- Ruby original: https://github.com/zkm/motd_forge
- This repo: zkm/motd-forge (separate repo, not a monorepo with the gem —
  different toolchains, independent versioning, better discoverability)

## Author context

- Zach (GitHub: zkm) — deep Linux background (Arch, Gentoo, Fedora, Debian
  family), comfortable at kernel/bootloader/DKMS/storage/networking layers.
- Runs multiple personal Linux machines as a hobby (desktop "deepthought",
  a Pi, a ThinkPad, etc.) — motd-forge is aimed at that homelab use case.
- Working from WSL (Fedora) via Claude Code.
- Prefers concise, command-focused help. Wants claims verified, not assumed
  — don't guess at package/API behavior, check it.

## Scope / parity target

Match the Ruby gem's feature set as the v1 baseline:
- Uptime display
- Disk usage
- Memory usage
- Random quote (need a quote source/format — port whatever the gem uses,
  or confirm with Zach if it should diverge)

Confirm against the gem's actual source/README before assuming exact
output format or CLI flags — don't invent behavior that isn't in the
original.

## Conventions for this repo

- Package name: `motd-forge` (kebab-case, npm convention)
- ESM (`"type": "module"`), no CLI framework — `node:util`'s `parseArgs`
  is enough, mirroring the gem's stdlib-only approach (`optparse`).
- Test runner: built-in `node:test` + `node:assert/strict`, no Jest/Mocha.
- Only runtime dependency: `js-yaml`, since Node has no built-in YAML
  parser (Ruby's stdlib does). Everything else deliberately stays stdlib.
- Node version target: `>=18.3.0` (when `util.parseArgs` first shipped).
- Package manager: Yarn (classic, v1.22.22) — `yarn.lock` is the
  committed lockfile, not `package-lock.json`. End users installing the
  published package still use `npm install -g motd-forge`; Yarn is a
  dev-workflow choice for this repo only.
- Lint/format: [Biome](https://biomejs.dev) (`@biomejs/biome`, devDependency
  only — never ships to consumers). One tool instead of ESLint+Prettier,
  config in `biome.json`. 2-space indent, double quotes, import sorting on
  (`assist.actions.source.organizeImports`); everything else is Biome's
  `recommended` preset defaults.

## Commands

- `yarn install` — install dependencies
- `yarn test` — run the full `node:test` suite (`node --test`). Note: pass
  no path argument — `node --test test/` and `node --test test` both fail
  on this Node install (v26.5.0) with a spurious `MODULE_NOT_FOUND`; bare
  `node --test` relies on node's default test-file discovery and works.
- `node --test test/quotes.test.js` — run a single test file
- `node bin/motd-forge.js` — run the CLI directly from source
- `yarn link` (from repo root) — install the `motd-forge` bin globally
  from source for manual end-to-end testing
- `yarn lint` — `biome check .` (formatting, import order, lint rules;
  no writes)
- `yarn format` — `biome check --write .` (applies safe fixes)

## Architecture

Mirrors the Ruby gem's structure and data flow 1:1:

- `src/system-stats.js` — `captureStats()` returns `{ uptime,
  diskUsagePercent, memUsed, memTotal, memUsedPercent }`. Reads
  `/proc/uptime` and `/proc/meminfo` directly on Linux, falling back to
  shelling out to `uptime -p` / `df -kP` (via `execFileSync` with an args
  array, not a shell string — no injection risk) if those aren't present.
- `src/quotes.js` — `pickQuote({ file })` returns a random quote from the
  built-in `DEFAULT_QUOTES` list, or from a user-supplied file (one quote
  per line), falling back to defaults if the file is missing/empty.
- `src/banner.js` — `renderBanner({ title, stats, quote })` composes the
  final output: title + stats + quote. Title rendering shells out to
  `figlet` when it's on `PATH` (cached after first check), falling back to
  a plain bordered header otherwise.
- `src/cli.js` — `run(argv)` parses flags with `node:util`'s `parseArgs`,
  merges in `~/.motd-forge.yml` (CLI flags win over config file values via
  `js-yaml`), then builds and prints a `Banner`. This is the only module
  that touches `process.argv`, stdout, or the exit code.
- `bin/motd-forge.js` is a thin shebang wrapper that calls `cli.run()` and
  exits with its return code.
- `src/version.js` reads `VERSION` from `package.json` at runtime (single
  source of truth, unlike the Ruby gem's separate `version.rb` constant).
- `src/index.js` is a barrel export (`VERSION`, `captureStats`,
  `pickQuote`, `renderBanner`, `run`) for programmatic/library use and for
  tests to import against.

Data flows one direction, same as the gem: `CLI` gathers title/quote-file/
config choices -> builds a banner via `renderBanner` -> that pulls a stats
snapshot and a quote -> renders to a string `CLI` prints. No shared
mutable state between modules other than the memoized figlet-availability
check in `banner.js`.

## Status

Node port scaffolded and functionally complete: all four modules ported,
`node:test` suite passing (mirrors the RSpec suite 1:1), CLI manually
verified (default run, `--name`, `--no-quote`, `--quote-file`, `--config`,
`--help`, `--version`). Biome wired up for lint/format, codebase passes
`yarn lint` clean. Git repo initialized, merged with the GitHub-created
`zkm/motd-forge` remote (`origin`, branch `master`); not yet pushed. Not
yet published to npm.
