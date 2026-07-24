import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { VERSION } from "../src/version.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = join(__dirname, "..", "bin", "motd-forge.js");

function runCli(args) {
  return execFileSync(process.execPath, [bin, ...args], { encoding: "utf8" });
}

test("--version prints the version", () => {
  assert.equal(runCli(["--version"]), `${VERSION}\n`);
});

test("run renders a banner containing the given name", () => {
  const output = runCli(["--name", "testhost", "--no-quote"]);
  assert.match(output, /testhost/);
});

test("--config with malformed YAML ignores the file and warns on stderr", () => {
  const dir = mkdtempSync(join(tmpdir(), "motd-forge-"));
  const configFile = join(dir, "bad.yml");
  writeFileSync(configFile, "title: [unterminated\n");

  try {
    const result = execFileSync(
      process.execPath,
      [bin, "--config", configFile, "--name", "testhost", "--no-quote"],
      { encoding: "utf8" },
    );
    assert.match(result, /testhost/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("--config with malformed YAML prints a warning naming the file", () => {
  const dir = mkdtempSync(join(tmpdir(), "motd-forge-"));
  const configFile = join(dir, "bad.yml");
  writeFileSync(configFile, "title: [unterminated\n");

  try {
    const result = spawnSync(
      process.execPath,
      [bin, "--config", configFile, "--no-quote"],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0);
    assert.match(result.stderr, /ignoring invalid config/);
    assert.match(
      result.stderr,
      new RegExp(configFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("--config with valid YAML uses the configured title", () => {
  const dir = mkdtempSync(join(tmpdir(), "motd-forge-"));
  const configFile = join(dir, "good.yml");
  writeFileSync(configFile, "title: fromconfig\n");

  try {
    const output = execFileSync(
      process.execPath,
      [bin, "--config", configFile, "--no-quote"],
      { encoding: "utf8" },
    );
    assert.match(output, /fromconfig/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
