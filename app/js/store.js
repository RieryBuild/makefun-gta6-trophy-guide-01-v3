// Vice Ledger progress store: earned flags in localStorage, plus export / import / reset.
export const STORAGE_KEY = 'vice-ledger-progress-v3';
export const SPOILER_KEY = 'vice-ledger-spoiler-v3';
export const THEME_KEY = 'vice-ledger-theme-v3';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch (err) {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
  } catch (err) {
    // Storage full or blocked: progress still lives in memory for this session.
  }
}

export function loadSpoilerSetting() {
  try {
    return localStorage.getItem(SPOILER_KEY) === 'on';
  } catch (err) {
    return false;
  }
}

export function saveSpoilerSetting(on) {
  try {
    localStorage.setItem(SPOILER_KEY, on ? 'on' : 'off');
  } catch (err) { /* ignore */ }
}

export function loadThemeSetting() {
  try {
    return localStorage.getItem(THEME_KEY) || 'paper';
  } catch (err) {
    return 'paper';
  }
}

export function saveThemeSetting(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) { /* ignore */ }
}

// Serialises earned progress for export; import validates the shape first.
export function exportProgressJson(earned, total) {
  return JSON.stringify({ app: 'Vice Ledger', version: 3, total, earned: [...earned].sort(), exported: new Date().toISOString() }, null, 2);
}

export function parseProgressImport(text, knownIds) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error('That file is not valid JSON.');
  }
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('No earned list found in that file.');
  const known = new Set(knownIds);
  const clean = ids.filter((id) => typeof id === 'string' && known.has(id));
  if (clean.length === 0 && ids.length > 0) throw new Error('No trophy ids in that file match this guide.');
  return new Set(clean);
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
