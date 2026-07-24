# motd-forge

[![npm version](https://img.shields.io/npm/v/motd-forge.svg)](https://www.npmjs.com/package/motd-forge)
[![CI](https://github.com/zkm/motd-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/zkm/motd-forge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/npm/l/motd-forge.svg)](https://github.com/zkm/motd-forge/blob/master/LICENSE)

Generate a randomized login banner (MOTD) for your servers: a title (rendered
big via `figlet` if it's installed, plain text otherwise), current uptime,
disk and memory usage, and a random quote.

Node port of the [motd_forge Ruby gem](https://rubygems.org/gems/motd_forge).

## Installation

    $ npm install -g motd-forge

## Usage

    $ motd-forge
    $ motd-forge --name mybox
    $ motd-forge --quote-file ~/.motd-quotes.txt
    $ motd-forge --no-quote

Run `motd-forge --help` for the full list of options.

### Config file

Settings can also live in `~/.motd-forge.yml` (or a path passed via `--config`):

    title: mybox
    quote_file: ~/.motd-quotes.txt

CLI flags take precedence over the config file.

### Wiring it into a login banner

Add a call to `motd-forge` from `/etc/profile.d/motd-forge.sh` (or your
shell's rc file) so it prints on every SSH login:

    #!/bin/sh
    motd-forge

## Development

    $ yarn install
    $ yarn test              # run the test suite
    $ node bin/motd-forge.js   # run the CLI directly from source

## License

MIT
