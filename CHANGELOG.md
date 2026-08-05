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
