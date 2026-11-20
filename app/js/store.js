// Progress store: localStorage for earned trophies, theme and the
// spoiler setting, plus JSON export, import and reset. Everything the
// app remembers lives under these three keys and nowhere else.

const PROGRESS_KEY = "vice-ledger-progress-v1";
const THEME_KEY = "vice-ledger-theme-v1";
const SPOILER_KEY = "vice-ledger-spoiler-v1";

function validId(id) {
  return Number.isInteger(id) && id >= 1 && id <= 55;
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) return new Set();
    return new Set(ids.filter(validId));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  const ids = [...earned].filter(validId).sort((a, b) => a - b);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(ids));
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) === "night" ? "night" : "paper";
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadSpoiler() {
  return localStorage.getItem(SPOILER_KEY) === "on";
}

export function saveSpoiler(on) {
  localStorage.setItem(SPOILER_KEY, on ? "on" : "off");
}

export function exportProgressJson(earned) {
  const ids = [...earned].filter(validId).sort((a, b) => a - b);
  return JSON.stringify(
    { app: "vice-ledger", version: 1, earned: ids, exportedAt: new Date().toISOString() },
    null,
    2,
  );
}

export function downloadProgress(earned) {
  const blob = new Blob([exportProgressJson(earned)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vice-ledger-progress.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Parses an imported progress file. Throws a plain message on bad input.
export function parseImportedProgress(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error("That file holds no earned list.");
  const kept = ids.filter(validId);
  if (kept.length === 0 && ids.length > 0) {
    throw new Error("That file holds no trophy ids between 1 and 55.");
  }
  return new Set(kept);
}
