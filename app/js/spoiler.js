// Spoiler-safe masking. When the spoiler toggle is on, an unearned
// story trophy hides its NAME, its DESCRIPTION and its GRADE on every
// surface — list, guide pane, roadmap, missables, hero next-up — and
// in aria-labels too. Earned story trophies stay visible: the setting
// hides trophies until they are earned, not after. Non-story trophies
// are never masked.

export const HIDDEN_NAME = "Hidden story trophy";
export const HIDDEN_DESCRIPTION = "Story spoiler hidden — earn this trophy to reveal it.";
export const HIDDEN_FACT = "Hidden until earned.";
export const HIDDEN_GRADE_LABEL = "Grade hidden";

export function isStoryHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === "story" && !earned.has(trophy.id);
}

export function displayName(trophy, hidden) {
  return hidden ? HIDDEN_NAME : trophy.name;
}

export function displayDescription(trophy, hidden) {
  return hidden ? HIDDEN_DESCRIPTION : trophy.description;
}

export function displayKeyfact(trophy, hidden) {
  return hidden ? HIDDEN_FACT : trophy.keyfact;
}

// The aria-label for a row or card: never carries the real name,
// description or grade of a hidden story trophy.
export function trophyAriaLabel(trophy, hidden, isEarned) {
  const state = isEarned ? "earned" : "not earned";
  if (hidden) return `Hidden story trophy, phase ${trophy.phase}, ${state}`;
  return `${trophy.name}, ${trophy.grade} trophy, phase ${trophy.phase}, ${state}`;
}
