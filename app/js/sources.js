// Sources & Audit view: the source matrix (one row per source: site,
// list date, what it covers, how many citations draw on it) plus the
// audit detail and the method note. No trophy names appear here, so
// the spoiler setting has nothing to hide on this view.

import { escapeHtml } from "./html.js";

export function renderSources(container, state) {
  const { sourceList, trophies, meta } = state.data;
  const citationCount = trophies.reduce((n, t) => n + t.sources.length, 0);
  const perSite = new Map();
  for (const trophy of trophies) {
    for (const source of trophy.sources) {
      perSite.set(source.site, (perSite.get(source.site) ?? 0) + 1);
    }
  }
  const rows = sourceList
    .map((source) => {
      const siteCell = source.url
        ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.site)}</a>`
        : escapeHtml(source.site);
      return `<tr><td>${siteCell}</td><td>${escapeHtml(source.label)}</td><td><span class="src-date">${escapeHtml(source.date)}</span></td><td>${escapeHtml(source.covers)}</td><td>${perSite.get(source.site) ?? 0} citations</td></tr>`;
    })
    .join("");

  container.innerHTML = `<table class="matrix" aria-label="Source matrix">
    <thead><tr><th>Site</th><th>List</th><th>Date</th><th>What it covers</th><th>Citations</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <section class="audit-detail" aria-label="Audit detail">
    <h3>Audit</h3>
    <ul>
      <li>List: ${escapeHtml(meta.game)}, ${escapeHtml(meta.platform)}, as of <b>${escapeHtml(meta.listDate)}</b>; guide updated <b>${escapeHtml(meta.guideUpdated)}</b>.</li>
      <li><b>${citationCount}</b> dated citations across ${trophies.length} trophies — every citation carries a date, and every trophy carries at least two.</li>
      <li><b>${meta.uncitedSpecificClaims}</b> uncited specific claims. A specific count, place or step with no source behind it is not printed.</li>
      <li><b>${meta.missable}</b> missable trophies, each with its own save advice. <b>${meta.hiddenOnPlayStation}</b> trophies are hidden on PlayStation until earned.</li>
      <li>Grades: ${meta.grades.platinum} platinum · ${meta.grades.gold} gold · ${meta.grades.silver} silver · ${meta.grades.bronze} bronze. Names, descriptions and grades are byte-identical to the official list.</li>
    </ul>
  </section>
  <p class="method-note">How this guide is built: the names, descriptions and grades come from the official list as PlayStation publishes them, cross-checked across two lists dated 2026-11-18. Every guide is written in our own words from those descriptions — never copied from another guide. Where a reading of a description is our inference (a point of no return, a partner who may not stay available, a moment that may not repeat), the guide says so in plain words and cites the roadmap note dated 2026-11-20. The app works offline: its only fetch is its own data file, same-origin.</p>`;
}
