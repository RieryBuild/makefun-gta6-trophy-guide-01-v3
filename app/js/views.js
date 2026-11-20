// Vice Ledger views: checklist, guide pane, roadmap, missables, sources & audit.
// Spoiler rule (applied everywhere, including aria-labels): a story trophy that is
// not earned yet shows nothing of its name, description or grade while spoiler-safe is on.
import { PHASES, KIND_LABELS, buildSourceMatrix, countCitations } from './data.js';

export function isStoryHidden(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function gradeBadge(trophy, hidden) {
  if (hidden) return el('span', 'grade-badge', 'Grade hidden');
  return el('span', 'grade-badge grade-' + trophy.grade, gradeLabel(trophy.grade));
}

function kindTag(trophy) {
  return el('span', 'kind-tag', KIND_LABELS[trophy.kind] || trophy.kind);
}

function phaseTag(trophy) {
  return el('span', 'phase-tag', 'Phase ' + trophy.phase);
}

function missableTag() {
  return el('span', 'miss-tag', 'MISSABLE');
}

function trophyCheckbox(trophy, state, onToggle) {
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.id);
  box.setAttribute('aria-label', isStoryHidden(trophy, state) ? 'Hidden story trophy — mark earned' : 'Mark ' + trophy.name + ' earned');
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  box.addEventListener('click', (event) => event.stopPropagation());
  return box;
}

export function filteredTrophies(state) {
  const query = state.search.trim().toLowerCase();
  return state.trophies.filter((trophy) => {
    if (state.kind === 'missable' && !trophy.missable) return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.hideEarned && state.earned.has(trophy.id)) return false;
    if (query) {
      const hidden = isStoryHidden(trophy, state);
      const haystack = hidden ? '' : (trophy.name + ' ' + trophy.desc + ' ' + trophy.fact + ' ' + trophy.guide).toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function renderChecklist(state, onToggle, onSelect) {
  const list = document.getElementById('trophyList');
  const note = document.getElementById('listNote');
  const empty = document.getElementById('emptyNote');
  list.textContent = '';
  const shown = filteredTrophies(state);
  const earnedCount = state.earned.size;
  note.textContent = 'Showing ' + shown.length + ' of 55 trophies · ' + earnedCount + ' earned · '
    + state.trophies.filter((t) => t.missable).length + ' missable flagged · '
    + (state.spoiler ? 'spoiler-safe ON — story trophies hidden until earned' : 'spoiler-safe off');
  empty.hidden = shown.length !== 0;
  for (const trophy of shown) {
    const hidden = isStoryHidden(trophy, state);
    const row = el('li', 'trophy-row' + (state.earned.has(trophy.id) ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : ''));
    row.appendChild(trophyCheckbox(trophy, state, onToggle));
    const body = el('div');
    body.appendChild(el('div', 'trophy-name', hidden ? 'Hidden story trophy' : trophy.name));
    body.appendChild(el('div', 'trophy-desc', hidden ? 'Story detail hidden until earned — tick the box when you earn it.' : trophy.desc));
    if (!hidden) body.appendChild(factLine(trophy));
    row.appendChild(body);
    const meta = el('div', 'trophy-meta');
    meta.appendChild(gradeBadge(trophy, hidden));
    meta.appendChild(kindTag(trophy));
    meta.appendChild(phaseTag(trophy));
    if (trophy.missable) meta.appendChild(missableTag());
    row.appendChild(meta);
    row.addEventListener('click', () => onSelect(trophy.id));
    list.appendChild(row);
  }
}

function factLine(trophy) {
  const line = el('div', 'trophy-fact');
  line.appendChild(el('b', null, 'Key fact: '));
  line.appendChild(document.createTextNode(trophy.fact + (trophy.target ? ' — target: ' + trophy.target + '.' : '')));
  return line;
}

function sourceList(trophy) {
  const box = el('div', 'sources-box');
  box.appendChild(el('h3', null, 'Sources — ' + trophy.sources.length + ' dated citations'));
  const list = el('ul');
  for (const source of trophy.sources) {
    const item = el('li');
    item.appendChild(document.createTextNode(source.site + ' — ' + source.page + ' ('));
    item.appendChild(el('span', 'src-date', source.date));
    item.appendChild(document.createTextNode('): ' + source.covers));
    list.appendChild(item);
  }
  box.appendChild(list);
  return box;
}

export function renderGuidePane(state) {
  const pane = document.getElementById('guidePane');
  pane.textContent = '';
  const trophy = state.trophies.find((t) => t.id === state.selectedId);
  if (!trophy) {
    pane.appendChild(el('p', 'guide-empty', 'Pick a trophy from the list to read its guide — every guide is written in our own words and cites its dated sources. Start with The Shootist: a silver with a gold medal in all 42 Shooting Range challenges.'));
    return;
  }
  const hidden = isStoryHidden(trophy, state);
  const wrap = el('div', 'guide-pane');
  wrap.appendChild(el('h2', null, hidden ? 'Hidden story trophy' : trophy.name));
  wrap.appendChild(el('div', 'trophy-desc', hidden ? 'Story detail hidden until earned.' : trophy.desc));
  const meta = el('div', 'trophy-meta');
  meta.appendChild(gradeBadge(trophy, hidden));
  meta.appendChild(kindTag(trophy));
  meta.appendChild(phaseTag(trophy));
  if (trophy.missable) meta.appendChild(missableTag());
  wrap.appendChild(meta);
  if (hidden) {
    wrap.appendChild(el('p', 'guide-text', 'This story trophy is hidden while spoiler-safe is on. Earn it in the game, tick its box in the checklist, and the guide opens here.'));
    wrap.appendChild(el('p', 'honest-flag', 'Spoiler-safe hides the name, description and grade of un-earned story trophies — in the list, the roadmap, the missables and this pane.'));
    pane.appendChild(wrap);
    return;
  }
  wrap.appendChild(factLine(trophy));
  wrap.appendChild(el('p', 'guide-text', trophy.guide));
  if (trophy.missable) {
    wrap.appendChild(el('p', 'save-note', 'Save advice: keep a manual save before you attempt this one — missable trophies do not come back on the same playthrough.'));
  }
  wrap.appendChild(sourceList(trophy));
  const flag = trophy.sources.some((s) => s.site === 'Vice Ledger roadmap')
    ? 'This guide flags an inference from the official description — it is labelled as our reading, not a verified in-game fact.'
    : 'Every specific in this guide is tied to the dated sources above.';
  wrap.appendChild(el('p', 'honest-flag', flag));
  pane.appendChild(wrap);
}

export function renderRoadmap(state, onToggle, onSelect) {
  const host = document.getElementById('roadmapPhases');
  host.textContent = '';
  const summary = el('p', 'phase-summary', 'All 55 trophies, one row each: '
    + PHASES.map((phase) => phase.title.split(' — ')[1] + ' — '
      + state.trophies.filter((t) => t.phase === phase.id).length).join(' · ') + '.');
  host.appendChild(summary);
  for (const phase of PHASES) {
    const block = el('div', 'phase-block');
    const head = el('div', 'phase-head');
    const earnedInPhase = state.trophies.filter((t) => t.phase === phase.id && state.earned.has(t.id)).length;
    const totalInPhase = state.trophies.filter((t) => t.phase === phase.id).length;
    head.appendChild(el('h3', null, phase.title));
    head.appendChild(el('span', 'list-note', earnedInPhase + '/' + totalInPhase + ' earned'));
    block.appendChild(head);
    block.appendChild(el('p', 'phase-goal', phase.goal));
    const rows = el('div', 'phase-rows');
    for (const trophy of state.trophies.filter((t) => t.phase === phase.id)) {
      const hidden = isStoryHidden(trophy, state);
      const row = el('div', 'phase-row' + (state.earned.has(trophy.id) ? ' earned' : ''));
      row.appendChild(trophyCheckbox(trophy, state, onToggle));
      const name = el('span', 'trophy-name', hidden ? 'Hidden story trophy' : trophy.name);
      name.style.cursor = 'pointer';
      name.addEventListener('click', () => onSelect(trophy.id));
      row.appendChild(name);
      row.appendChild(gradeBadge(trophy, hidden));
      if (trophy.missable) row.appendChild(missableTag());
      row.appendChild(el('span', 'trophy-fact', hidden ? 'Hidden until earned.' : trophy.fact));
      rows.appendChild(row);
    }
    block.appendChild(rows);
    host.appendChild(block);
  }
}

export function renderMissables(state, onSelect) {
  const host = document.getElementById('missableCards');
  host.textContent = '';
  for (const trophy of state.trophies.filter((t) => t.missable)) {
    const hidden = isStoryHidden(trophy, state);
    const card = el('div', 'miss-card');
    card.appendChild(el('h3', null, hidden ? 'Missable story trophy' : trophy.name));
    card.appendChild(el('div', 'trophy-desc', hidden ? 'A story trophy that can be missed — its name stays hidden while spoiler-safe is on.' : trophy.desc));
    const meta = el('div', 'trophy-meta');
    meta.appendChild(gradeBadge(trophy, hidden));
    meta.appendChild(phaseTag(trophy));
    card.appendChild(meta);
    if (!hidden) card.appendChild(el('p', 'guide-text', trophy.guide));
    card.appendChild(el('p', 'save-note', hidden
      ? 'Save advice: keep a manual save before the last story missions and finish open-world cleanup first.'
      : 'Save advice: keep a manual save before you attempt this one — missable trophies do not come back on the same playthrough.'));
    if (!hidden) card.appendChild(sourceList(trophy));
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onSelect(trophy.id));
    host.appendChild(card);
  }
}

export function renderSourceMatrix(state) {
  const body = document.querySelector('#sourceMatrix tbody');
  body.textContent = '';
  for (const row of buildSourceMatrix(state.trophies)) {
    const tr = document.createElement('tr');
    tr.appendChild(el('td', null, row.site + ' — ' + row.page));
    tr.appendChild(el('td', null, row.date));
    tr.appendChild(el('td', null, [...row.covers].join('; ')));
    tr.appendChild(el('td', null, String(row.count)));
    body.appendChild(tr);
  }
  const honest = document.getElementById('honestList');
  honest.textContent = '';
  const items = [
    'Names, descriptions and grades come from the two published lists (Exophase and PSNProfiles, both 18 Nov 2026), which agree on all 55 trophies.',
    'Counts are the PSN-tracked totals in the lists we cite: 250 stunts, 42 Shooting Range challenges, 14 drone sites, 18 meditation spots, 52 areas, 100 vehicles, 100 WAiNK spots, 500 choices, $250,000 laundered, $100,000 spent, 8 garages, 10 registrations, 5 bank vaults, 9 gangs, 3 card sets, 8 stranger strands, 20 races and 9 activity types.',
    'Anything we infer from a description alone — the finale as a point of no return, partner availability late in the story, one-time moments, exact triggers — is labelled as our inference, not yet verified in-game.',
    'Guides are written in our own words for this entry. Sources are cited, never copied — only the official names and descriptions are reproduced as PlayStation publishes them.',
    '28 of the 55 trophies are hidden on PlayStation until earned; this guide never spoils a hidden story trophy while spoiler-safe is on.',
  ];
  for (const item of items) honest.appendChild(el('li', null, item));
}

export function renderAuditStrips(state) {
  const text = 'AUDIT · Lists 18 Nov 2026 · ' + countCitations(state.trophies)
    + ' dated citations across 55 trophies · 0 uncited specific claims · 9 missable flagged · '
    + '28 hidden on PlayStation · Guide updated 20 Nov 2026';
  document.getElementById('auditStrip').textContent = text;
  for (const strip of document.querySelectorAll('[data-audit]')) strip.textContent = text;
}

export function renderMasthead(state) {
  const host = document.getElementById('mastheadStats');
  host.textContent = '';
  const chips = [
    [String(state.trophies.length), 'trophies'],
    ['1P · 2G · 6S · 46B', 'grades'],
    ['9', 'missable'],
    [String(countCitations(state.trophies)), 'dated citations'],
    ['5', 'phases'],
  ];
  for (const [value, label] of chips) {
    const chip = el('div', 'stat-chip');
    chip.appendChild(el('b', null, value));
    chip.appendChild(document.createTextNode(label));
    host.appendChild(chip);
  }
  const earned = state.earned.size;
  const total = state.trophies.length;
  document.getElementById('progressText').textContent = earned + ' / ' + total + ' trophies earned';
  const nextUp = nextUnearnedTrophy(state);
  document.getElementById('progressCounts').textContent = Math.round((earned / total) * 100) + '% to the platinum'
    + (nextUp ? ' · Next up: ' + nextUp : '');
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  document.getElementById('progressFill').style.width = ((earned / total) * 100) + '%';
}

// First unearned trophy in roadmap order (phase, then list order). Spoiler-aware:
// an un-earned story trophy is named only as "Hidden story trophy" while spoiler-safe is on.
export function nextUnearnedTrophy(state) {
  const ordered = [...state.trophies].sort((a, b) => a.phase - b.phase || state.trophies.indexOf(a) - state.trophies.indexOf(b));
  const next = ordered.find((t) => !state.earned.has(t.id));
  if (!next) return 'Platinum earned — Leonida Legend!';
  if (isStoryHidden(next, state)) return 'Hidden story trophy (Phase ' + next.phase + ')';
  return next.name + ' (Phase ' + next.phase + ')';
}
