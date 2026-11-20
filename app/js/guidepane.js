// Guide pane: the selected trophy's full guide — official description,
// key fact, own-words guide, save advice for missables, and the dated
// sources. A hidden story trophy gets a placeholder instead: no name,
// no description, no grade, no guide text, no sources.

import { escapeHtml, gradeChip, kindChip, missableChip, phaseChip, sourcesListHtml, targetChip } from "./html.js";
import { HIDDEN_DESCRIPTION, HIDDEN_NAME, isStoryHidden } from "./spoiler.js";

export function renderGuidePane(container, state) {
  const trophy = state.data.trophies.find((t) => t.id === state.selectedId);
  if (!trophy) {
    container.innerHTML =
      '<div class="guide-card"><p class="guide-empty">Select a trophy from the list to read its guide.</p></div>';
    return;
  }
  const hidden = isStoryHidden(trophy, state.spoiler, state.earned);
  if (hidden) {
    container.innerHTML = `<div class="guide-card">
      <h2>${HIDDEN_NAME}</h2>
      <div class="chips"><span class="chip grade-hidden">Grade hidden</span>${kindChip("story")}${phaseChip(trophy.phase)}</div>
      <p class="guide-desc">${HIDDEN_DESCRIPTION}</p>
      <p class="guide-text">Spoiler-safe mode is on. This story trophy's name, description, grade and guide stay hidden until you earn it — or until you switch spoiler-safe off.</p>
    </div>`;
    return;
  }
  container.innerHTML = `<div class="guide-card">
    <h2>${escapeHtml(trophy.name)}</h2>
    <div class="chips">${gradeChip(trophy.grade, false)}${kindChip(trophy.kind)}${phaseChip(trophy.phase)}${trophy.missable ? missableChip() : ""}${targetChip(trophy.target)}</div>
    <p class="guide-desc">“${escapeHtml(trophy.description)}”</p>
    <p class="guide-fact"><b>Key fact:</b> ${escapeHtml(trophy.keyfact)}</p>
    <p class="guide-text">${escapeHtml(trophy.guide)}</p>
    ${trophy.save ? `<p class="save-box"><b>Save advice:</b> ${escapeHtml(trophy.save)}</p>` : ""}
    ${sourcesListHtml(trophy.sources)}
  </div>`;
}
