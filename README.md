# makefun-gta6-trophy-guide-01-v3

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/RieryBuild/makefun-gta6-trophy-guide-01-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/RieryBuild/makefun-gta6-trophy-guide-01-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Vice Ledger** — a free, open-source, offline trophy guide and tracker for
all 55 PlayStation 5 trophies of Grand Theft Auto VI. It pairs a checklist
that saves in the browser with a five-phase roadmap to the platinum, a
missables page with a save warning on every risky trophy, and a guide for
each trophy in our own words with dated sources shown beside it.

## What is inside

- `app/` — the guide itself: static files, no build step, no network at
  run time. `app/data/trophies.json` holds the official list (names,
  descriptions and grades as PlayStation publishes them), our own key
  facts and guides, and 121 dated citations.
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the kit's
  `buildDossier`.
- `screenshots/` — four real renders of the guide running in desktop
  Chrome: checklist with a guide open, night theme with a filter on,
  the full five-phase roadmap, and spoiler-safe mode on the missables
  page.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Run it

```sh
node main.ts
```

That writes the handed-in dossier to `/output` (or to
`$MAKEFUN_OUTPUT_DIR` outside the grader). To try the guide in a
browser instead, serve `app/` with any static file server and open
`index.html` — it works with the network off.

## The guide at a glance

- **55 trophies, 1 platinum · 2 gold · 6 silver · 46 bronze**, list as
  of 2026-11-18, 28 hidden on PlayStation until earned.
- **Tracker:** check trophies off, watch the progress bar and the
  next-up trophy, filter by kind and grade, search, hide what you
  have earned, export and import your progress as JSON.
- **Spoiler-safe:** one toggle hides a story trophy's name,
  description and grade everywhere — list, guide pane, roadmap,
  missables, hero and screen-reader labels — until you earn it.
- **Roadmap:** five phases covering all 55 trophies, each with its
  own key fact and a goal line per phase.
- **Missables:** all 9 flagged, each with its own save advice.
- **Sources & audit:** every citation dated (121 in total), a source
  matrix, and an audit strip on every view. Zero uncited specific
  claims. Where a reading of a description is our inference, the
  guide says so in plain words.

---

<sub>Entered on [make.fun](https://make.fun/?ref=wa8s3t3t&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
