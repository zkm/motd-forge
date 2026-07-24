import { execFileSync } from "node:child_process";
import { pickQuote } from "./quotes.js";
import { captureStats } from "./system-stats.js";

const figletAvailability = new Map();

// Composes the final banner: a big title (via `figlet` if it's installed,
// else a plain bordered header), system stats, and a random quote.
export function renderBanner({
  title,
  stats = captureStats(),
  quote = pickQuote(),
} = {}) {
  return [renderTitle(title), renderStats(stats), renderQuote(quote)]
    .filter((line) => line != null)
    .join("\n");
}

function renderTitle(title) {
  return figletTitle(title) ?? plainTitle(title);
}

export function figletTitle(title, command = "figlet") {
  if (!isFigletAvailable(command)) return null;

  try {
    const output = execFileSync(command, [title], { encoding: "utf8" });
    return output.length > 0 ? output.replace(/\s+$/, "") : null;
  } catch {
    return null;
  }
}

export function isFigletAvailable(command = "figlet") {
  if (figletAvailability.has(command)) return figletAvailability.get(command);

  let available;
  try {
    execFileSync("which", [command], { stdio: "ignore" });
    available = true;
  } catch {
    available = false;
  }
  figletAvailability.set(command, available);
  return available;
}

function plainTitle(title) {
  const border = "=".repeat(title.length + 4);
  return `${border}\n| ${title} |\n${border}`;
}

function renderStats(stats) {
  return (
    `Uptime: ${stats.uptime} | ` +
    `Disk: ${stats.diskUsagePercent} used | ` +
    `Mem: ${stats.memUsed}/${stats.memTotal} (${stats.memUsedPercent})`
  );
}

function renderQuote(quote) {
  return quote ? `"${quote}"` : null;
}
