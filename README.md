# Hushline

A private, browser-local vocal studio for restrained vocal polish. Record several dry takes, sing against one backing track, choose the best take, add subtle processing, and export a WAV or MP3 without sending audio anywhere.

## Start with Docker

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). **Hear myself** starts off for speakers. Enable it only with headphones. Stop the app with `docker compose down`.

### Prebuilt image

GitHub Actions builds a multi-architecture image (`linux/amd64` and `linux/arm64`) on every push to `main` and on `v*` tags, and publishes it to GitHub Container Registry:

```bash
docker run --rm -p 127.0.0.1:8080:8080 ghcr.io/grejojoby/jo-studio:latest
```

## Local development

```bash
npm ci --ignore-scripts
npm run dev -- --host 0.0.0.0
```

Quality checks:

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
```

## Studio workflow

1. Optionally add a karaoke or backing track.
2. Import a dry vocal, press **Record a take**, or choose **New take**. The backing starts with the recording.
3. Record several full takes and select the strongest one.
4. Pick a vocal preset. Adjust Clarity, Warmth, Smoothness, Room, and Echo with visible sliders. **Advanced controls** groups fine adjustments by tone, smoothness, and space; enable **Show exact values** for engineering units.
5. Balance vocal and backing levels, preview, and export the mix or processed vocal as WAV/MP3.

Recordings, settings, and backing audio are kept in IndexedDB under the `localhost:8080` browser origin. **Clear session** deletes that local session after confirmation. Removing the container does not clear browser storage.

## Browser and audio notes

- Version 1 targets current desktop Chrome and Edge. `localhost` is treated as a secure context for microphone access.
- Browser/hardware latency varies. Hushline uses the interactive Web Audio latency hint and native audio nodes, but a wired audio interface or wired headphones gives the most predictable monitoring.
- The recorded take is always the original microphone stream. Live monitoring applies tone, room, echo, and peak protection; playback and export also apply the full vocal compressor. Monitoring starts off on every session restore.
- Browsers do not natively encode MP3 through WebCodecs, so MP3 is produced locally with `@breezystack/lamejs`. WAV is the lossless choice.
- Maximum imported file size is 250 MB. Supported decode formats depend on the browser and operating system.

## Design reference

The studio uses a warm, restrained console with real waveforms, a labelled transport, readable level sliders, and a separate sound panel. Empty tracks explain how to add audio. During recording, the vocal lane shows the last eight seconds of sampled microphone levels. Playback uses a moving playhead and a shared timeline. See `PRODUCT.md` and `SPEC-studio-interface.md` for the current direction.

## Architecture and primary references

- React client root: https://react.dev/reference/react-dom/client/createRoot
- Vite TypeScript/build behavior: https://vite.dev/guide/features and https://vite.dev/guide/build
- Microphone permission/capture: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Recording: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- Low-latency processing: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Offline rendering: https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/startRendering
- Local Blob storage: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Browser codec limitation: https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Using_the_WebCodecs_API
- Docker multi-stage builds: https://docs.docker.com/build/building/multi-stage/

## Privacy

Hushline has no accounts, backend API, analytics, telemetry, or cloud integration. The nginx container serves static application files only.
