import { parseArgs } from "node:util";
import { existsSync, readFileSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { join } from "node:path";
import yaml from "js-yaml";
import { renderBanner } from "./banner.js";
import { pickQuote } from "./quotes.js";
import { VERSION } from "./version.js";

const DEFAULT_CONFIG_PATH = join(homedir(), ".motd-forge.yml");

const USAGE = `Usage: motd-forge [options]
    -n, --name NAME                 Title to render (default: hostname)
    -q, --quote-file FILE           Custom quotes file, one per line
        --no-quote                  Don't print a quote
    -c, --config FILE               Config file (default: ${DEFAULT_CONFIG_PATH})
    -v, --version                   Print the version
    -h, --help                      Print this help`;

// Parses CLI flags, merges in an optional YAML config, and prints the banner.
// The only module that touches argv, stdout, or the process exit code.
export function run(argv = process.argv.slice(2)) {
  const options = parseOptions(argv);
  if (options.exitCode !== undefined) return options.exitCode;

  const config = loadConfig(options.configPath);
  const title = options.titleFromCli ? options.title : (config.title ?? options.title);
  const quoteFile = options.quoteFile ?? config.quote_file;

  const quote = options.showQuote ? pickQuote({ file: quoteFile }) : null;
  console.log(renderBanner({ title, quote }));
  return 0;
}

function parseOptions(argv) {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        name: { type: "string", short: "n" },
        "quote-file": { type: "string", short: "q" },
        "no-quote": { type: "boolean" },
        config: { type: "string", short: "c" },
        version: { type: "boolean", short: "v" },
        help: { type: "boolean", short: "h" },
      },
      allowPositionals: false,
    }));
  } catch (error) {
    console.error(`motd-forge: ${error.message}`);
    console.error(USAGE);
    return { exitCode: 1 };
  }

  if (values.help) {
    console.log(USAGE);
    return { exitCode: 0 };
  }

  if (values.version) {
    console.log(VERSION);
    return { exitCode: 0 };
  }

  return {
    title: values.name ?? hostname(),
    titleFromCli: values.name !== undefined,
    quoteFile: values["quote-file"],
    showQuote: !values["no-quote"],
    configPath: values.config ?? DEFAULT_CONFIG_PATH,
  };
}

function loadConfig(configPath) {
  if (!existsSync(configPath)) return {};

  try {
    return yaml.load(readFileSync(configPath, "utf8")) ?? {};
  } catch {
    console.error(`motd-forge: ignoring invalid config at ${configPath}`);
    return {};
  }
}
