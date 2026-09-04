# Spec: Render and Export

## Objective

Create downloadable, processed audio entirely in the browser.

## Acceptance Criteria

- Export targets either the processed selected vocal or the vocal/backing mix.
- WAV export is 16-bit PCM; MP3 export uses a local encoder dependency.
- Offline rendering includes effect tails and applies the current levels/settings.
- Export is disabled until a vocal take exists and reports progress/errors accessibly.

## Boundaries

- Always: revoke temporary object URLs and avoid clipping.
- Ask first: additional formats, metadata tagging, batch export.
- Never: send audio to an encoding service.
