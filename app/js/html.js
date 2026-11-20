// Small HTML presenters shared by every view: escaping and chips.
// The trophy data is our own static file, but names carry characters
// like & and quotes, so every interpolated string is escaped.

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function gradeChip(grade, hidden) {
  if (hidden) return '<span class="chip grade-hidden">Grade hidden</span>';
  const label = grade.charAt(0).toUpperCase() + grade.slice(1);
  return `<span class="chip grade-${escapeHtml(grade)}">${escapeHtml(label)}</span>`;
}

export function kindChip(kind) {
  const label = kind.charAt(0).toUpperCase() + kind.slice(1);
  return `<span class="chip kind">${escapeHtml(label)}</span>`;
}

export function phaseChip(phase) {
  return `<span class="chip phase">Phase ${phase}</span>`;
}

export function missableChip() {
  return '<span class="chip missable">Missable</span>';
}

export function targetChip(target) {
  if (!target) return "";
  return `<span class="chip target">Target: ${escapeHtml(target)}</span>`;
}

// A dated-sources list: every citation shows its date.
export function sourcesListHtml(sources) {
  const items = sources
    .map(
      (s) =>
        `<li><b>${escapeHtml(s.site)}</b> — <span class="src-date">${escapeHtml(s.date)}</span> · ${escapeHtml(s.covers)}</li>`,
    )
    .join("");
  return `<div class="sources"><h3>Sources</h3><ul>${items}</ul></div>`;
}
