// Missables view: all 9 missable trophies, each with its own save
// advice box and dated sources. A hidden story trophy (the finale)
// shows as a placeholder card with no name, grade or advice text.
// Clicking a card opens that trophy's guide in the checklist.

import { escapeHtml, gradeChip, kindChip, phaseChip, sourcesListHtml } from "./html.js";
import { HIDDEN_DESCRIPTION, HIDDEN_NAME, displayDescription, displayName, isStoryHidden, trophyAriaLabel } from "./spoiler.js";

export function renderMissables(container, state, onSelect) {
  const missable = state.data.trophies.filter((t) => t.missable).sort((a, b) => a.id - b.id);
  const cards = missable
    .map((trophy) => {
      const hidden = isStoryHidden(trophy, state.spoiler, state.earned);
      const earned = state.earned.has(trophy.id);
      if (hidden) {
        return `<article class="missable-card" data-id="${trophy.id}" role="button" tabindex="0" aria-label="${escapeHtml(trophyAriaLabel(trophy, true, earned))}">
          <h3>${HIDDEN_NAME}</h3>
          <div class="chips"><span class="chip grade-hidden">Grade hidden</span>${kindChip("story")}${phaseChip(trophy.phase)}</div>
          <p>${HIDDEN_DESCRIPTION}</p>
          <p class="save-box"><b>Save advice:</b> Keep a manual save before you attempt this one — the details stay hidden until you earn it.</p>
        </article>`;
      }
      return `<article class="missable-card${earned ? " earned" : ""}" data-id="${trophy.id}" role="button" tabindex="0" aria-label="${escapeHtml(trophyAriaLabel(trophy, false, earned))}">
        <h3>${escapeHtml(displayName(trophy, false))}</h3>
        <div class="chips">${gradeChip(trophy.grade, false)}${kindChip(trophy.kind)}${phaseChip(trophy.phase)}</div>
        <p><i>${escapeHtml(displayDescription(trophy, false))}</i></p>
        <p><b>Key fact:</b> ${escapeHtml(trophy.keyfact)}</p>
        <p class="save-box"><b>Save advice:</b> ${escapeHtml(trophy.save)}</p>
        ${sourcesListHtml(trophy.sources)}
      </article>`;
    })
    .join("");

  container.innerHTML = `<p class="missable-intro"><b>${missable.length} missable trophies.</b> Each one can be lost if you pass its moment — every card carries its own save advice. When in doubt, save by hand before the attempt.</p>
  <div class="missable-grid">${cards}</div>`;

  container.querySelectorAll(".missable-card").forEach((card) => {
    const id = Number(card.dataset.id);
    card.addEventListener("click", () => onSelect(id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(id);
      }
    });
  });
}
