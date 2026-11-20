// Audit strip: the same six facts on EVERY view — list date, total
// dated citations, uncited-specific-claims count (must be 0),
// missable count, hidden-on-PlayStation count, guide updated date.
// The citation total is counted from the data, never hardcoded.

export function renderAuditStrip(element, data) {
  const citationCount = data.trophies.reduce((n, t) => n + t.sources.length, 0);
  const { meta } = data;
  element.innerHTML = `<span>List: <b>${meta.listDate}</b></span>
    <span>Citations: <b>${citationCount} dated</b></span>
    <span>Uncited specific claims: <b class="ok">${meta.uncitedSpecificClaims}</b></span>
    <span>Missable: <b>${meta.missable}</b></span>
    <span>Hidden on PlayStation: <b>${meta.hiddenOnPlayStation}</b></span>
    <span>Guide updated: <b>${meta.guideUpdated}</b></span>`;
}
