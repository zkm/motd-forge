import { readFileSync } from "node:fs";

// Ships with a small built-in set; extendable with a plain-text file, one quote per line.
export const DEFAULT_QUOTES = [
  "It's not a bug, it's an undocumented feature.",
  "There's no place like 127.0.0.1.",
  "Rebooting the router fixes everything, eventually.",
  "In case of fire: git commit, git push, then evacuate.",
  "99 little bugs in the code, 99 little bugs...",
  "The cloud is just someone else's computer. This one's yours.",
];

export function pickQuote({ file } = {}) {
  const pool = loadPool(file);
  return pool[Math.floor(Math.random() * pool.length)];
}

function loadPool(file) {
  if (!file) return DEFAULT_QUOTES;

  try {
    const lines = readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.length > 0);
    return lines.length > 0 ? lines : DEFAULT_QUOTES;
  } catch {
    return DEFAULT_QUOTES;
  }
}
