# Hushline Studio Tasks

## Foundation

- [x] Bootstrap React/TypeScript/Vite, linting, test harness, and semantic app shell.
  - Acceptance: the empty studio renders and all quality commands pass.
  - Verify: `npm test -- --run && npm run typecheck && npm run lint && npm run build`
  - Files: package/config files, `index.html`, `src/main.tsx`, `src/App.tsx`

## Audio domain

- [x] Implement safe preset/macro mapping and waveform utilities test-first.
  - Acceptance: every preset and user setting remains inside documented safe ranges.
  - Verify: `npm test -- --run src/audio`
  - Files: `src/audio/types.ts`, `src/audio/presets.ts`, colocated tests
- [x] Implement WAV/MP3 encoding preparation test-first.
  - Acceptance: WAV headers/sample data are valid and MP3 receives bounded PCM frames.
  - Verify: `npm test -- --run src/audio/encode.test.ts`
  - Files: `src/audio/encode.ts`, `src/audio/encode.test.ts`

## Session and engine

- [x] Persist and restore the current project in IndexedDB.
  - Acceptance: blobs and settings survive a database reopen; clearing deletes them.
  - Verify: `npm test -- --run src/storage`
  - Files: `src/storage/project-store.ts`, test, domain model
- [ ] Implement dry microphone capture and synchronized vocal/backing playback.
  - Acceptance: user action gates permission, recorded Blob is dry, sources share a clock, tracks stop cleanly.
  - Verify: unit tests plus manual Chrome test.
  - Files: `src/audio/audio-engine.ts`, related tests/types
- [ ] Implement shared live/offline effect graph and render targets.
  - Acceptance: settings drive both paths and exports include effect tails without clipping.
  - Verify: tests plus rendered WAV inspection.
  - Files: `src/audio/effect-graph.ts`, `src/audio/render.ts`, tests

## Interface and delivery

- [ ] Build the complete accessible studio interface.
  - Acceptance: recording/import/take/preset/mix/preview/export path works from keyboard and at target widths.
  - Verify: component tests and real-browser inspection.
  - Files: focused components, hook, stylesheet
- [ ] Add production Docker delivery and user documentation.
  - Acceptance: Compose serves a healthy app at localhost:8080 with required headers.
  - Verify: Docker build, health check, browser smoke test.
  - Files: Docker/nginx/Compose config, README

## Final checkpoint

- [ ] Full tests, type checking, lint, build, dependency audit, browser checks, and Docker smoke test pass.
- [ ] All new project files are staged in Git.
