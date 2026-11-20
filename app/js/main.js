// Vice Ledger boot: loads the data, wires the tabs, filters, spoiler setting,
// theme, progress tools and hash routing. No network request is made at run time
// beyond the same-origin fetch of data/trophies.json.
import { loadTrophyData, DEMO_EARNED_IDS, KIND_FILTERS, KIND_LABELS } from './data.js';
import {
  loadEarned, saveEarned, loadSpoilerSetting, saveSpoilerSetting,
  loadThemeSetting, saveThemeSetting, exportProgressJson, parseProgressImport,
  downloadTextFile,
} from './store.js';
import {
  renderChecklist, renderGuidePane, renderRoadmap, renderMissables,
  renderSourceMatrix, renderAuditStrips, renderMasthead,
} from './views.js';

const VIEWS = ['checklist', 'roadmap', 'missables', 'sources'];

const state = {
  trophies: [],
  meta: null,
  earned: loadEarned(),
  spoiler: loadSpoilerSetting(),
  theme: loadThemeSetting(),
  kind: 'all',
  grade: 'all',
  search: '',
  hideEarned: false,
  selectedId: 'the-shootist',
  view: 'checklist',
};

function readLaunchParams() {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') === '13') {
    // Demo replaces any stored progress so screenshots are reproducible.
    state.earned = new Set(DEMO_EARNED_IDS);
  }
  if (params.get('spoiler') === 'on') state.spoiler = true;
  if (params.get('spoiler') === 'off') state.spoiler = false;
  if (params.get('theme') === 'night') state.theme = 'night';
  const viewParam = params.get('view');
  if (viewParam && VIEWS.includes(viewParam)) state.view = viewParam;
  const trophyParam = params.get('trophy');
  if (trophyParam) state.selectedId = trophyParam;
  const searchParam = params.get('search');
  if (searchParam) state.search = searchParam;
  const kindParam = params.get('kind');
  if (kindParam && KIND_FILTERS.includes(kindParam)) state.kind = kindParam;
  const hash = location.hash.replace(/^#\/?/, '');
  if (VIEWS.includes(hash)) state.view = hash;
  if (hash.startsWith('trophy/')) {
    state.selectedId = hash.slice('trophy/'.length);
    state.view = 'checklist';
  }
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  document.getElementById('themeToggle').textContent = state.theme === 'night' ? 'Paper theme' : 'Night theme';
}

function renderAll() {
  renderMasthead(state);
  renderAuditStrips(state);
  renderChecklist(state, onToggleEarned, onSelectTrophy);
  renderGuidePane(state);
  renderRoadmap(state, onToggleEarned, onSelectTrophy);
  renderMissables(state, onSelectTrophy);
  renderSourceMatrix(state);
  showView(state.view);
}

function showView(view) {
  state.view = VIEWS.includes(view) ? view : 'checklist';
  for (const name of VIEWS) {
    document.getElementById('view-' + name).hidden = name !== state.view;
    const tab = document.getElementById('tab-' + name);
    if (name === state.view) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
}

function onToggleEarned(id, earned) {
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  renderAll();
}

function onSelectTrophy(id) {
  state.selectedId = id;
  showView('checklist');
  renderChecklist(state, onToggleEarned, onSelectTrophy);
  renderGuidePane(state);
  history.replaceState(null, '', '#trophy/' + id);
}

function buildKindChips() {
  const host = document.getElementById('kindChips');
  for (const kind of KIND_FILTERS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = KIND_LABELS[kind];
    chip.setAttribute('aria-pressed', kind === state.kind ? 'true' : 'false');
    chip.addEventListener('click', () => {
      state.kind = kind;
      for (const other of host.querySelectorAll('.chip')) {
        other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
      }
      renderChecklist(state, onToggleEarned, onSelectTrophy);
    });
    host.appendChild(chip);
  }
}

function wireControls() {
  const searchInput = document.getElementById('searchInput');
  searchInput.value = state.search;
  searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderChecklist(state, onToggleEarned, onSelectTrophy);
  });
  document.getElementById('gradeSelect').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderChecklist(state, onToggleEarned, onSelectTrophy);
  });
  document.getElementById('hideEarned').addEventListener('change', (event) => {
    state.hideEarned = event.target.checked;
    renderChecklist(state, onToggleEarned, onSelectTrophy);
  });
  const spoilerToggle = document.getElementById('spoilerToggle');
  spoilerToggle.checked = state.spoiler;
  spoilerToggle.addEventListener('change', (event) => {
    state.spoiler = event.target.checked;
    saveSpoilerSetting(state.spoiler);
    renderAll();
  });
  document.getElementById('themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'night' ? 'paper' : 'night';
    saveThemeSetting(state.theme);
    applyTheme();
  });
  for (const name of VIEWS) {
    document.getElementById('tab-' + name).addEventListener('click', () => showView(name));
  }
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace(/^#\/?/, '');
    if (VIEWS.includes(hash)) showView(hash);
    if (hash.startsWith('trophy/')) onSelectTrophy(hash.slice('trophy/'.length));
  });
  wireDataTools('exportBtn', 'importFile', 'resetBtn', 'dataNote');
  wireDataTools('exportBtnTop', 'importFileTop', 'resetBtnTop', 'dataNoteTop');
}

function wireDataTools(exportId, importId, resetId, noteId) {
  document.getElementById(exportId).addEventListener('click', () => {
    downloadTextFile('vice-ledger-progress.json', exportProgressJson(state.earned, state.trophies.length));
    document.getElementById(noteId).textContent = 'Exported ' + state.earned.size + ' earned trophies to vice-ledger-progress.json.';
  });
  document.getElementById(importId).addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const note = document.getElementById(noteId);
    try {
      const text = await file.text();
      state.earned = parseProgressImport(text, state.trophies.map((t) => t.id));
      saveEarned(state.earned);
      renderAll();
      note.textContent = 'Imported ' + state.earned.size + ' earned trophies from ' + file.name + '.';
    } catch (err) {
      note.textContent = 'Import failed: ' + err.message;
    }
    event.target.value = '';
  });
  document.getElementById(resetId).addEventListener('click', () => {
    state.earned = new Set();
    saveEarned(state.earned);
    renderAll();
    document.getElementById(noteId).textContent = 'Progress reset — 0 of 55 earned.';
  });
}

async function bootViceLedger() {
  readLaunchParams();
  applyTheme();
  const data = await loadTrophyData();
  state.trophies = data.trophies;
  state.meta = data.meta;
  buildKindChips();
  wireControls();
  renderAll();
}

bootViceLedger().catch((err) => {
  document.getElementById('progressText').textContent = 'Could not load the trophy list: ' + err.message;
});
