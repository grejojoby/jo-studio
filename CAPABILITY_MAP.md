# Capability Map: Hushline Studio

| Module id | Responsibility | Depends on |
|---|---|---|
| `audio-transport` | Microphone recording, dry-take capture, audio import, synchronized playback, meters, and level mixing | — |
| `vocal-effects` | Safe real-time/offline vocal processing, presets, macros, and detailed settings | `audio-transport` |
| `local-projects` | Browser-local persistence for recordings, backing audio, selected takes, and settings | — |
| `render-export` | Render vocal-only or complete mixes and encode WAV/MP3 downloads | `audio-transport`, `vocal-effects` |
| `studio-interface` | Accessible, minimal recording and editing workflow | All modules above |
| `container-delivery` | Reproducible production image and local run instructions | `studio-interface` |

Build order: `audio-transport` + `local-projects` → `vocal-effects` → `render-export` → `studio-interface` → `container-delivery`.
