// Vice Ledger — entrypoint for the gta6-trophy-guide-01 bounty.
//
// The job is small and deliberate: copy the guide (app/) and its four
// screenshots into the output directory, then write the dossier the
// judge reads with the kit's buildDossier library. Standard library
// only, no network, deterministic: the same repository bytes always
// produce the same output bytes.
//
// The grader mounts /output itself, so this program never removes
// that directory — it only clears what sits inside it.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The repository root is where this file lives; the output directory
// is /output in the grader and MAKEFUN_OUTPUT_DIR anywhere else.
const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The gate's own caps for this bounty: the dossier text at most
// 163,840 bytes, 3 to 4 screenshots of at most 256 KiB each, app/
// at most 993 files and directories and 48 MiB in all.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
} as const;

// Empty a directory without removing the directory itself.
function wipeContents(dir: string): void {
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function handIn(): void {
  mkdirSync(OUT_DIR, { recursive: true });
  wipeContents(OUT_DIR);

  const appSource = join(REPO_ROOT, "app");
  const shotsSource = join(REPO_ROOT, "screenshots");
  if (!existsSync(appSource)) throw new Error("hand-in failed: app/ is missing");
  if (!existsSync(shotsSource)) {
    throw new Error("hand-in failed: screenshots/ is missing");
  }
  // Fail fast on the wrong screenshot count instead of letting the
  // dossier builder refuse it with a less direct message. Sorted so
  // the list is in a deterministic order whatever the filesystem says.
  const shotFiles = readdirSync(shotsSource)
    .filter((name) => !name.startsWith("."))
    .sort();
  if (shotFiles.length < 3 || shotFiles.length > 4) {
    throw new Error(
      `hand-in failed: screenshots/ holds ${shotFiles.length} images, need 3 or 4`,
    );
  }

  cpSync(appSource, join(OUT_DIR, "app"), { recursive: true });
  cpSync(shotsSource, join(OUT_DIR, "screenshots"), { recursive: true });

  const dossier = buildDossier(OUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUT_DIR, "dossier.json"), dossier);
  console.log(
    `Vice Ledger handed in: app/ + ${shotFiles.length} screenshots, dossier ${dossier.length} bytes.`,
  );
}

handIn();
