import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Reads uptime, disk, and memory usage from the host. Uses /proc on Linux,
// with a best-effort shell fallback (e.g. `uptime`) elsewhere.
export function captureStats() {
  return {
    uptime: uptime(),
    diskUsagePercent: diskUsagePercent(),
    ...memory(),
  };
}

export function uptime(procUptimePath = "/proc/uptime") {
  try {
    const seconds = parseFloat(
      readFileSync(procUptimePath, "utf8").split(" ")[0],
    );
    return formatDuration(seconds);
  } catch {
    return shellUptime();
  }
}

function formatDuration(seconds) {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function shellUptime() {
  try {
    const output = execFileSync("uptime", ["-p"], { encoding: "utf8" }).trim();
    return output.replace(/^up /, "");
  } catch {
    return "unknown";
  }
}

export function diskUsagePercent(path = "/") {
  try {
    const output = execFileSync("df", ["-kP", path], { encoding: "utf8" });
    const line = output.split("\n")[1];
    if (!line) return "unknown";
    return line.trim().split(/\s+/)[4];
  } catch {
    return "unknown";
  }
}

export function memory(procMeminfoPath = "/proc/meminfo") {
  try {
    const meminfo = readFileSync(procMeminfoPath, "utf8");
    const totalKb = parseInt(
      meminfo.match(/MemTotal:\s+(\d+)/)?.[1] ?? "0",
      10,
    );
    const availableKb = parseInt(
      meminfo.match(/MemAvailable:\s+(\d+)/)?.[1] ?? "0",
      10,
    );
    const usedKb = totalKb - availableKb;
    const percent = totalKb > 0 ? Math.round((usedKb / totalKb) * 100) : 0;

    return {
      memUsed: kbToHuman(usedKb),
      memTotal: kbToHuman(totalKb),
      memUsedPercent: `${percent}%`,
    };
  } catch {
    return {
      memUsed: "unknown",
      memTotal: "unknown",
      memUsedPercent: "unknown",
    };
  }
}

function kbToHuman(kb) {
  const gb = kb / 1024 / 1024;
  if (gb >= 1) return `${Math.round(gb * 10) / 10}G`;
  return `${Math.round(kb / 1024)}M`;
}
