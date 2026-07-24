import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pickQuote, DEFAULT_QUOTES } from "../src/quotes.js";

test("picks a quote from the default set", () => {
  assert.ok(DEFAULT_QUOTES.includes(pickQuote()));
});

test("falls back to defaults when the custom file is missing", () => {
  assert.ok(DEFAULT_QUOTES.includes(pickQuote({ file: "/nonexistent/path.txt" })));
});

test("reads quotes from a custom file when present", () => {
  const dir = mkdtempSync(join(tmpdir(), "motd-forge-"));
  const file = join(dir, "quotes.txt");
  writeFileSync(file, "Only quote here\n");

  try {
    assert.equal(pickQuote({ file }), "Only quote here");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
