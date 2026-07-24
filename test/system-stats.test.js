import { test } from "node:test";
import assert from "node:assert/strict";
import { captureStats } from "../src/system-stats.js";

test("returns a snapshot with uptime, disk, and memory fields populated", () => {
  const snapshot = captureStats();

  assert.equal(typeof snapshot.uptime, "string");
  assert.equal(typeof snapshot.diskUsagePercent, "string");
  assert.equal(typeof snapshot.memUsed, "string");
  assert.equal(typeof snapshot.memTotal, "string");
  assert.equal(typeof snapshot.memUsedPercent, "string");
});
