# Implementation Plan: Hushline Studio

## Overview

Build risk-first: validate deterministic audio-domain logic and the live browser transport, then add local persistence, rendering/export, the complete studio interface, and container delivery.

## Architecture Decisions

- All audio data remains in browser memory or IndexedDB; nginx only serves static files.
- A shared effect-parameter model configures both live and offline audio graphs.
- Browser-native APIs handle capture/processing; one small local library encodes MP3 because major browsers do not provide MP3 encoding.
- React owns view state while an imperative audio engine owns short-lived Web Audio nodes.

## Task List

1. Bootstrap the typed, tested application shell.
2. Add tested preset, parameter, waveform, and PCM encoding logic.
3. Add IndexedDB session persistence.
4. Implement microphone recording and synchronized playback engine.
5. Implement live/offline vocal processing and export.
6. Build the accessible studio workflow and visual system.
7. Add Docker delivery, documentation, and end-to-end verification.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Browser/hardware latency varies | High | Use `latencyHint: interactive`, native nodes, no ScriptProcessor, and require headphones |
| MediaRecorder formats vary | Medium | Detect MIME support and decode the browser-produced Blob before reuse |
| Large audio consumes memory/storage | Medium | Validate file size/duration and release object URLs, streams, and AudioContexts |
| Live/offline sound diverges | High | Share the parameter model and graph construction |
| MP3 is not natively encodable | Medium | Isolate the local LGPL encoder and keep WAV as the primary lossless path |

## Verification Checkpoints

- Foundation: tests, type checking, lint, and build pass.
- Audio core: pure tests pass and live browser preview has no console errors.
- Complete: persistence/export workflows pass, responsive/a11y checks pass, Docker image is healthy.

## Open Questions

None. The user pre-approved routine implementation decisions and will conduct final hardware acceptance testing.
