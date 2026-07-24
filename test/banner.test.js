import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { figletTitle, isFigletAvailable } from "../src/banner.js";

function writeFakeCommand(dir, name, script) {
  const path = join(dir, name);
  writeFileSync(path, `#!/bin/sh\n${script}\n`);
  chmodSync(path, 0o755);
  return path;
}

test("isFigletAvailable returns false when the command can't be found", () => {
  assert.equal(isFigletAvailable("/nonexistent/figlet-binary"), false);
});

test("figletTitle returns null when figlet isn't available", () => {
  assert.equal(figletTitle("hi", "/nonexistent/figlet-binary"), null);
});

test("figletTitle returns the command's trimmed output when available", () => {
  const dir = mkdtempSync(join(tmpdir(), "motd-forge-"));
  const fakeFiglet = writeFakeCommand(
    dir,
    "fakefiglet",
    'printf "FAKE FIGLET: %s\\n\\n" "$1"',
  );

  try {
    assert.equal(figletTitle("hi", fakeFiglet), "FAKE FIGLET: hi");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("figletTitle returns null when the command is available but fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "motd-forge-"));
  const fakeFiglet = writeFakeCommand(dir, "fakefiglet", "exit 1");

  try {
    assert.equal(figletTitle("hi", fakeFiglet), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
