// Filtering: kind, grade, text search and hide-earned, plus the
// next-up picker the hero shows. A hidden story trophy never matches
// a search query — matching it would leak that it exists under a
// searched word.

import { isStoryHidden } from "./spoiler.js";

export function trophyMatchesKind(trophy, kind) {
  if (kind === "all") return true;
  if (kind === "missable") return trophy.missable;
  if (kind === "finale") return trophy.kind === "platinum" || trophy.kind === "completion";
  return trophy.kind === kind;
}

export function trophyMatchesSearch(trophy, query, hidden) {
  if (!query) return true;
  if (hidden) return false;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.keyfact}`.toLowerCase();
  return haystack.includes(needle);
}

export function filterTrophies(trophies, state) {
  return trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, state.kind)) return false;
    const earned = state.earned.has(trophy.id);
    if (state.hideEarned && earned) return false;
    const hidden = isStoryHidden(trophy, state.spoiler, state.earned);
    // A hidden story trophy has no matchable grade: it appears only
    // when the grade filter is "all". Matching it against a grade
    // would leak that grade by inclusion and exclusion.
    if (state.grade !== "all") {
      if (hidden) return false;
      if (trophy.grade !== state.grade) return false;
    }
    if (!trophyMatchesSearch(trophy, state.query, hidden)) return false;
    return true;
  });
}

// First unearned trophy in roadmap order: lowest phase, then id.
export function nextUpTrophy(trophies, earned) {
  const ordered = [...trophies].sort((a, b) => a.phase - b.phase || a.id - b.id);
  return ordered.find((trophy) => !earned.has(trophy.id)) ?? null;
}
