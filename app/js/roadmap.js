// Roadmap view: five phase columns holding ALL 55 trophies, each with
// its key fact, under a summary strip that proves the full count. A
// hidden story trophy shows as a placeholder row with no grade and no
// key fact. Clicking a row opens that trophy's guide in the checklist.

import { escapeHtml } from "./html.js";
import { displayKeyfact, displayName, isStoryHidden, trophyAriaLabel } from "./spoiler.js";

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function renderRoadmap(container, state, onSelect) {
  const { trophies, phases } = state.data;
  const perPhase = phases.map((phase) => ({
    ...phase,
    items: trophies.filter((t) => t.phase === phase.n).sort((a, b) => a.id - b.id),
  }));
  const summaryBits = perPhase.map((p) => `Phase ${p.n}: ${p.items.length}`).join(" · ");

  const columns = perPhase
    .map((phase) => {
      const rows = phase.items
        .map((trophy) => {
          const hidden = isStoryHidden(trophy, state.spoiler, state.earned);
          const earned = state.earned.has(trophy.id);
          const gradeText = hidden ? "Grade hidden" : gradeWord(trophy.grade);
          return `<div class="roadmap-row${earned ? " earned" : ""}" data-id="${trophy.id}" role="button" tabindex="0" aria-label="${escapeHtml(trophyAriaLabel(trophy, hidden, earned))}">
            <div class="r-name">${escapeHtml(displayName(trophy, hidden))} <span class="r-grade">· ${gradeText}</span></div>
            <div class="r-fact">${escapeHtml(displayKeyfact(trophy, hidden))}</div>
          </div>`;
        })
        .join("");
      return `<section class="phase-col" aria-label="Phase ${phase.n}: ${escapeHtml(phase.name)}">
        <div class="phase-head"><h3>Phase ${phase.n} · ${escapeHtml(phase.name)} <span>(${phase.items.length})</span></h3>
        <p class="phase-goal">${escapeHtml(phase.goal)}</p></div>
        <div class="phase-body">${rows}</div>
      </section>`;
    })
    .join("");

  container.innerHTML = `<div class="roadmap-summary"><b>Roadmap: all ${trophies.length} of ${trophies.length} trophies, in order.</b> ${summaryBits}. Work the phases left to right; each trophy carries its key fact.</div>
  <div class="roadmap-grid">${columns}</div>`;

  container.querySelectorAll(".roadmap-row").forEach((row) => {
    const id = Number(row.dataset.id);
    row.addEventListener("click", () => onSelect(id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(id);
      }
    });
  });
}
