// Vice Ledger entry program (Node 22, standard library only).
// Copies app/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
// The build is deterministic: the same repository always writes the same bytes.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// The gate's limits for this competition (see kit.json / competition.yaml).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyEntryTree(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) throw new Error('Missing entry directory: ' + sourceDir);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(dirname(targetDir), { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function buildViceLedgerEntry() {
  // Pre-flight: the entry is not handed in with a missing page or no screenshots.
  const indexHtml = join(REPO_ROOT, 'app', 'index.html');
  if (!existsSync(indexHtml) || !statSync(indexHtml).isFile()) {
    throw new Error('Missing entry page: app/index.html');
  }
  const shots = readdirSync(join(REPO_ROOT, 'screenshots')).filter((name) => !name.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    throw new Error('screenshots/ must hold 3 or 4 images, found ' + shots.length);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyEntryTree(join(REPO_ROOT, 'app'), join(OUTPUT_DIR, 'app'));
  copyEntryTree(join(REPO_ROOT, 'screenshots'), join(OUTPUT_DIR, 'screenshots'));
  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log('Vice Ledger: wrote ' + OUTPUT_DIR + ' (dossier ' + dossier.length + ' bytes, ' + shots.length + ' screenshots)');
}

buildViceLedgerEntry();
