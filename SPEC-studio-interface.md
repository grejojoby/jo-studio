# Spec: Studio Interface

## Objective

Offer a professional, simple studio for recording and polishing vocals, with controls that behave as they look and values that explain the audible result.

## Acceptance Criteria

- The primary path (add backing, record/import vocal, choose take, adjust, preview, export) remains available in one desktop viewport at 1024×700 and above.
- Five visible native sliders replace decorative knobs. Each has a label, audible-purpose description, percentage, keyboard access, and visible focus.
- Advanced controls occupy the sound panel, with full-width rows grouped into Tone, Smoothness, and Room & echo. The panel scrolls independently and has a persistent return control. Escape returns focus to the toggle.
- Advanced values use descriptions and readable percentages by default. Exact units are available on request. Changing a simple effect preserves unrelated advanced adjustments.
- Empty tracks contain instructions, never invented waveforms. Imported/recorded audio uses measured peaks. Recording shows a rolling eight-second input-level history; playback shows actual transport position on a shared track scale.
- Record, stop, play, and level controls have visible labels. Starting/finishing operations prevent duplicate actions. A late microphone grant is released after the studio unmounts.
- Hear myself is explicit, labelled for headphones, and off at startup, including restored sessions. Live monitoring skips the extra vocal compressor while retaining peak protection; playback and export use the full effects chain.
- Unrelated effect adjustments preserve the active reverb buffer. Track-level changes use short gain ramps.
- Layout remains readable at 320, 768, 1024, and 1440 CSS pixels, with structural stacking below desktop sizes. Desktop Chrome and Edge remain the recording target.

## Visual Direction

A singer working at a desktop needs a calm, low-glare workspace while concentrating on a take. Retain Hushline's warm dark palette, with clearer text, restrained amber sound accents, a distinct red record button, flat controls, and minimal decoration.
