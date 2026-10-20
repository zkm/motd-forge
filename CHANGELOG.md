## [0.1.3] - 2026-10-20

- Releases are automated: publishing a GitHub Release stages the version on
  npmjs.com for 2FA approval (trusted publishing, with provenance) and
  publishes it to GitHub Packages as `@zkm/motd-forge`. No CLI or config
  behavior change.

## [0.1.2] - 2026-10-14

- Raise the `js-yaml` floor to `^5.4.3`. Versions 5.0.0-5.4.0 are affected by
  an advisory where `maxTotalMergeKeys` does not limit CPU use. motd-forge only
  parses its own config file, so exposure was low.
- `figletTitle` and `isFigletAvailable` are now exported and accept an optional
  command name (default `figlet`), with availability cached per command. No CLI
  or config-file behavior change.
- `bin` uses the string shorthand; the `motd-forge` command is unchanged.
- Development moved to Yarn 4 (Berry) with the node-modules linker.

## [0.1.1] - 2026-07-24

- Upgrade `js-yaml` v4 -> v5 (v5 dropped the default export in favor of named
  exports only; `src/cli.js` switched from `import yaml from "js-yaml"` to
  `import { load } from "js-yaml"`). Internal change only, no CLI/config
  behavior change for users.

## [0.1.0] - 2026-07-24

- Initial release: Node.js port of the motd_forge Ruby gem. Banner rendering,
  system stats, quotes, CLI, YAML config support. Published to npm and
  tagged/released on GitHub. GitHub Actions CI runs install/lint/test on
  push to `master` and on PRs, matrix across Node 18 and current LTS.
