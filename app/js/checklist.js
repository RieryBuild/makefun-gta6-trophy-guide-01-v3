// Checklist view: one row per trophy in the filtered list, with a
// checkbox, the official description, the key fact and the chips.
// Clicking a row opens its guide; the checkbox only toggles earned.

import { escapeHtml, gradeChip, kindChip, missableChip, phaseChip, targetChip } from "./html.js";
import { displayDescription, displayKeyfact, displayName, isStoryHidden, trophyAriaLabel } from "./spoiler.js";
import { filterTrophies } from "./filters.js";

export function renderChecklist(container, state, callbacks) {
  const visible = filterTrophies(state.data.trophies, state);
  const countEl = document.getElementById("result-count");
  if (countEl) countEl.textContent = `${visible.length} of ${state.data.trophies.length} shown`;

  if (visible.length === 0) {
    container.innerHTML =
      '<div class="checklist-layout"><p class="empty-note">No trophies match these filters. Clear the search or widen the filters.</p><div class="guide-pane" id="guide-pane"></div></div>';
    return;
  }

  const rows = visible
    .map((trophy) => {
      const hidden = isStoryHidden(trophy, state.spoiler, state.earned);
      const earned = state.earned.has(trophy.id);
      const selected = state.selectedId === trophy.id;
      const classes = ["trophy-row", earned ? "earned" : "", selected ? "selected" : ""].join(" ").trim();
      return `<article class="${classes}" data-id="${trophy.id}" role="button" tabindex="0" aria-label="${escapeHtml(trophyAriaLabel(trophy, hidden, earned))}">
        <input type="checkbox" ${earned ? "checked" : ""} data-check="${trophy.id}" aria-label="Mark ${escapeHtml(displayName(trophy, hidden))} earned">
        <div>
          <div class="trophy-name">${escapeHtml(displayName(trophy, hidden))}</div>
          <div class="trophy-desc">${escapeHtml(displayDescription(trophy, hidden))}</div>
          <div class="trophy-fact"><b>Key fact:</b> ${escapeHtml(displayKeyfact(trophy, hidden))}</div>
        </div>
        <div class="trophy-chips">${gradeChip(trophy.grade, hidden)}${kindChip(trophy.kind)}${phaseChip(trophy.phase)}${trophy.missable ? missableChip() : ""}${targetChip(trophy.target)}</div>
      </article>`;
    })
    .join("");

  container.innerHTML = `<div class="checklist-layout"><div class="checklist-rows">${rows}</div><div class="guide-pane" id="guide-pane"></div></div>`;

  container.querySelectorAll(".trophy-row").forEach((row) => {
    const id = Number(row.dataset.id);
    row.addEventListener("click", (event) => {
      if (event.target.closest("input[type=checkbox]")) return;
      callbacks.onSelect(id);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        callbacks.onSelect(id);
      }
    });
  });
  container.querySelectorAll("input[data-check]").forEach((box) => {
    box.addEventListener("change", () => callbacks.onToggle(Number(box.dataset.check)));
    box.addEventListener("click", (event) => event.stopPropagation());
  });
}
