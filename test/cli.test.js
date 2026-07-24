import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
