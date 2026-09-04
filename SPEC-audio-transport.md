# Spec: Audio Transport

## Objective

Provide a dependable one-vocal/one-backing recording workspace. Users can import audio, record multiple dry vocal takes while a backing track plays, hear processed monitoring, choose a take, and preview both tracks in sync.

## Acceptance Criteria

- Microphone access begins only after a user action and is released after recording stops.
- Recording stores the original microphone stream; monitoring effects never alter the saved take.
- Starting a recording or preview starts backing and vocal sources on the same audio clock.
- Independent vocal and backing gains range from silence to unity.
- Unsupported files, denied permissions, decoding failures, and missing inputs produce actionable UI errors.

## Boundaries

- Always: request audio-only permission, recommend headphones, clamp level values, stop media tracks.
- Ask first: background recording, output-device routing, multitrack layering.
- Never: upload audio, retain microphone access unnecessarily, autoplay audio.
