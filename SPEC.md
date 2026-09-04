# Spec: Hushline Studio

## Objective

Build a private, local-first vocal studio for solo singers. Success means a non-engineer can record or import one lead vocal, add one backing track, make a subtle polished sound with a preset and five clear controls, and export it without audio leaving the device.

The approved capability index is [`CAPABILITY_MAP.md`](CAPABILITY_MAP.md). Detailed requirements live in the six `SPEC-*.md` module files.

## Tech Stack

- React 19.2.8 and React DOM 19.2.8
- TypeScript 6.0.3 and Vite 8.2.2
- Native Web Audio, Media Capture, MediaRecorder, OfflineAudioContext, and IndexedDB APIs
- `@breezystack/lamejs` 1.2.7 for in-browser MP3 encoding
- Vitest 5, Testing Library, jsdom, and fake-indexeddb
- Multi-stage Node/nginx Docker image

## Commands

- Install: `npm ci --ignore-scripts`
- Develop: `npm run dev -- --host 0.0.0.0`
- Test: `npm test -- --run`
- Type-check: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Container: `docker compose up --build`

## Project Structure

- `src/audio/`: browser audio graph, transport, rendering, encoders
- `src/storage/`: IndexedDB boundary
- `src/components/`: focused React presentation components
- `src/hooks/`: studio orchestration state
- `src/test/`: test setup and reusable fakes only
- `tasks/`: implementation plan and progress
- `docs/`: intent and durable architectural notes

## Code Style

Use strict TypeScript, named exports, semantic HTML, and explicit domain names. Keep browser APIs behind small classes/functions and keep React components presentation-focused.

```ts
export function clampLevel(value: number): number {
  return Math.min(1, Math.max(0, value));
}
```

## Testing Strategy

- Unit: preset mapping, clamping, waveform peaks, duration formatting, PCM/MP3 preparation.
- Integration: IndexedDB persistence using fake-indexeddb; React workflow states using jsdom.
- Browser: real page load, keyboard path, console, responsive screenshots, upload path, and permission-denied handling.
- Hardware microphone fidelity and perceived latency require final testing on the user's audio device.

## Boundaries

- Always: test behavior first, validate file type/size, release microphone tracks, preserve dry audio, keep data local.
- Ask first: dependencies beyond the approved stack, remote hosting, more tracks, cloud features.
- Never: network audio transfer, analytics, secrets, `innerHTML`, destructive audio edits, or hidden microphone activation.

## Success Criteria

- The full workflow operates locally in Chrome/Edge with one vocal, one backing track, and multiple takes.
- Monitoring, preview, presets, macros, advanced controls, mix levels, WAV, and MP3 behave as specified.
- Refresh restores the session; clearing it removes browser-local data.
- Tests, type checking, lint, production build, Docker health check, and browser accessibility checks pass.

## Open Questions

None for version 1. Hardware-specific latency and microphone quality remain user acceptance checks.
