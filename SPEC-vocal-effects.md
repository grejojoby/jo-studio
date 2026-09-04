# Spec: Vocal Effects

## Objective

Make exposed vocals sound finished through a deliberately restrained chain: high-pass filtering, warmth/presence EQ, gentle dynamics, sibilance control, short reverb, subtle delay, and final limiting.

## Acceptance Criteria

- Five presets cover neutral, male, and female starting points without extreme settings.
- Default UI exposes Clarity, Warmth, Smoothness, Reverb, and Delay from 0–100.
- Advanced controls expose filter, EQ, compressor, de-esser, limiter, reverb, and delay parameters.
- Presets update both macro and advanced views; all values are clamped to safe ranges.
- The same settings drive live monitoring, preview playback, and offline export.

## Boundaries

- Always: preserve headroom and use conservative wet levels.
- Ask first: pitch correction, third-party plug-ins, mastering loudness targets.
- Never: destructive processing or settings capable of unstable feedback.
