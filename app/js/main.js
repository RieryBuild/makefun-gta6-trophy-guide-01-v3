// Vice Ledger — boot, state and view routing.
//
// The app loads its own data file (same-origin fetch, the only network
// the app ever does), restores progress, theme and the spoiler setting
// from localStorage, and renders one of four views: checklist, roadmap,
// missables, sources & audit. The hero and the audit strip render on
// every view.

import { renderAuditStrip } from "./auditstrip.js";
import { renderChecklist } from "./checklist.js";
import { nextUpTrophy } from "./filters.js";
import { renderGuidePane } from "./guidepane.js";
import { renderMissables } from "./missables.js";
import { renderRoadmap } from "./roadmap.js";
import { renderSources } from "./sources.js";
import { displayName, isStoryHidden } from "./spoiler.js";
import {
  downloadProgress,
  loadProgress,
  loadSpoiler,
  loadTheme,
  parseImportedProgress,
  saveProgress,
  saveSpoiler,
  saveTheme,
} from "./store.js";

const state = {
  data: null,
  earned: loadProgress(),
  view: "checklist",
  selectedId: 25,
  query: "",
  kind: "all",
  grade: "all",
  hideEarned: false,
  spoiler: loadSpoiler(),
  theme: loadTheme(),
};

const viewEl = document.getElementById("view");
const heroEl = document.getElementById("hero");
const auditEl = document.getElementById("audit-strip");
const toolbarEl = document.getElementById("toolbar");

function gradeTally() {
  const tally = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of state.data.trophies) {
    totals[trophy.grade] += 1;
    if (state.earned.has(trophy.id)) tally[trophy.grade] += 1;
  }
  return { tally, totals };
}

function renderHero() {
  const total = state.data.trophies.length;
  const earnedCount = state.earned.size;
  const percent = Math.round((earnedCount / total) * 100);
  const next = nextUpTrophy(state.data.trophies, state.earned);
  const nextHidden = next ? isStoryHidden(next, state.spoiler, state.earned) : false;
  const nextText = next
    ? `<b>Next up:</b> ${displayName(next, nextHidden)} — Phase ${next.phase}${nextHidden ? " · earn it to reveal" : ""}`
    : "<b>Platinum earned.</b> Every trophy is yours.";
  // The per-grade tally is shown only with spoiler-safe off. Showing
  // it while story trophies are hidden would attribute grades to the
  // hidden set in aggregate — and excluding the hidden set from the
  // totals instead would leak the same fact by difference when the
  // toggle flips. Hiding the whole tally leaks nothing either way.
  const { tally, totals } = gradeTally();
  const gradesText = state.spoiler
    ? "Grade breakdown hidden in spoiler-safe mode"
    : `P ${tally.platinum}/${totals.platinum} · G ${tally.gold}/${totals.gold} · S ${tally.silver}/${totals.silver} · B ${tally.bronze}/${totals.bronze}`;
  heroEl.innerHTML = `<div class="hero-count">${earnedCount} <small>/ ${total} trophies earned</small></div>
    <div class="hero-bar"><div class="hero-bar-track"><div class="hero-bar-fill" style="width:${percent}%"></div></div>
    <div class="hero-bar-label">${percent}% to platinum</div></div>
    <div class="hero-next">${nextText}</div>
    <div class="hero-grades">${gradesText}</div>`;
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === state.view);
  });
  const missableCount = state.data.trophies.filter((t) => t.missable).length;
  document.getElementById("missable-count").textContent = missableCount;
}

function renderView() {
  toolbarEl.classList.toggle("hidden", state.view !== "checklist");
  if (state.view === "checklist") {
    renderChecklist(viewEl, state, {
      onSelect: (id) => {
        state.selectedId = id;
        renderView();
      },
      onToggle: (id) => {
        if (state.earned.has(id)) state.earned.delete(id);
        else state.earned.add(id);
        saveProgress(state.earned);
        renderHero();
        renderView();
      },
    });
    renderGuidePane(document.getElementById("guide-pane"), state);
  } else if (state.view === "roadmap") {
    renderRoadmap(viewEl, state, (id) => {
      state.selectedId = id;
      state.view = "checklist";
      render();
    });
  } else if (state.view === "missables") {
    renderMissables(viewEl, state, (id) => {
      state.selectedId = id;
      state.view = "checklist";
      render();
    });
  } else {
    renderSources(viewEl, state);
  }
}

function render() {
  renderHero();
  renderTabs();
  renderView();
  renderAuditStrip(auditEl, state.data);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const button = document.getElementById("theme-toggle");
  button.textContent = state.theme === "night" ? "Paper theme" : "Night theme";
  button.setAttribute("aria-pressed", state.theme === "night" ? "true" : "false");
}

function applySpoilerButton() {
  const button = document.getElementById("spoiler-toggle");
  button.textContent = state.spoiler ? "Spoiler-safe: on" : "Spoiler-safe: off";
  button.setAttribute("aria-pressed", state.spoiler ? "true" : "false");
}

function wireEvents() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.view = tab.dataset.view;
      render();
    });
  });
  document.getElementById("theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "night" ? "paper" : "night";
    saveTheme(state.theme);
    applyTheme();
  });
  document.getElementById("spoiler-toggle").addEventListener("click", () => {
    state.spoiler = !state.spoiler;
    saveSpoiler(state.spoiler);
    applySpoilerButton();
    render();
  });
  document.getElementById("search-input").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderView();
  });
  document.getElementById("kind-filter").addEventListener("change", (event) => {
    state.kind = event.target.value;
    renderView();
  });
  document.getElementById("grade-filter").addEventListener("change", (event) => {
    state.grade = event.target.value;
    renderView();
  });
  document.getElementById("hide-earned").addEventListener("change", (event) => {
    state.hideEarned = event.target.checked;
    renderView();
  });
  document.getElementById("export-btn").addEventListener("click", () => {
    downloadProgress(state.earned);
  });
  const importFile = document.getElementById("import-file");
  document.getElementById("import-btn").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state.earned = parseImportedProgress(text);
      saveProgress(state.earned);
      render();
    } catch (error) {
      window.alert(`Import failed: ${error.message}`);
    }
    importFile.value = "";
  });
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (window.confirm("Clear all earned trophies? This cannot be undone.")) {
      state.earned = new Set();
      saveProgress(state.earned);
      render();
    }
  });
}

async function boot() {
  const response = await fetch("data/trophies.json");
  if (!response.ok) throw new Error(`Could not load trophy data (${response.status})`);
  state.data = await response.json();
  applyTheme();
  applySpoilerButton();
  wireEvents();
  render();
}

boot().catch((error) => {
  viewEl.innerHTML = `<p class="empty-note">The guide could not start: ${error.message}</p>`;
});
