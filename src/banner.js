import { execFileSync } from "node:child_process";
import { pickQuote } from "./quotes.js";
import { captureStats } from "./system-stats.js";

let figletAvailable;

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

function figletTitle(title) {
  if (!isFigletAvailable()) return null;

  try {
    const output = execFileSync("figlet", [title], { encoding: "utf8" });
    return output.length > 0 ? output.replace(/\s+$/, "") : null;
  } catch {
    return null;
  }
}

function isFigletAvailable() {
  if (figletAvailable !== undefined) return figletAvailable;

  try {
    execFileSync("which", ["figlet"], { stdio: "ignore" });
    figletAvailable = true;
  } catch {
    figletAvailable = false;
  }
  return figletAvailable;
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
