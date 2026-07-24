import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  captureStats,
  diskUsagePercent,
  memory,
  shellUptime,
  uptime,
} from "../src/system-stats.js";

test("returns a snapshot with uptime, disk, and memory fields populated", () => {
  const snapshot = captureStats();

  assert.equal(typeof snapshot.uptime, "string");
  assert.equal(typeof snapshot.diskUsagePercent, "string");
  assert.equal(typeof snapshot.memUsed, "string");
  assert.equal(typeof snapshot.memTotal, "string");
  assert.equal(typeof snapshot.memUsedPercent, "string");
});

test("uptime falls back to the shell `uptime` command when /proc/uptime is unreadable", () => {
  const result = uptime("/nonexistent/proc/uptime");
  assert.equal(typeof result, "string");
  assert.notEqual(result, "unknown");
});

test("shellUptime returns 'unknown' when the uptime binary can't be found", () => {
  const originalPath = process.env.PATH;
  process.env.PATH = "";
  try {
    assert.equal(shellUptime(), "unknown");
  } finally {
    process.env.PATH = originalPath;
  }
});

test("diskUsagePercent returns 'unknown' when df fails for the given path", () => {
  assert.equal(diskUsagePercent("/nonexistent/mount/path"), "unknown");
});

test("memory returns 'unknown' fields when /proc/meminfo is unreadable", () => {
  const result = memory("/nonexistent/proc/meminfo");
  assert.deepEqual(result, {
    memUsed: "unknown",
    memTotal: "unknown",
    memUsedPercent: "unknown",
  });
});

test("memory formats sub-gigabyte totals in megabytes", () => {
  const dir = mkdtempSync(join(tmpdir(), "motd-forge-"));
  const file = join(dir, "meminfo");
  writeFileSync(
    file,
    "MemTotal:         500000 kB\nMemAvailable:     100000 kB\n",
  );

  try {
    const result = memory(file);
    assert.equal(result.memTotal, "488M");
    assert.equal(result.memUsed, "391M");
    assert.equal(result.memUsedPercent, "80%");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
