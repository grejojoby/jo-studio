# Spec: Local Projects

## Objective

Restore the current studio session after a refresh without accounts or a server. IndexedDB stores metadata and audio blobs under the page origin.

## Acceptance Criteria

- Backing audio, vocal takes, selected take, settings, and levels survive refresh.
- The UI clearly states that data stays in this browser.
- A user can clear the local session through an explicit confirmation.
- Storage failures do not discard the in-memory session and surface a useful warning.

## Boundaries

- Always: use asynchronous IndexedDB transactions and schema versioning.
- Ask first: multiple named projects, filesystem access, backup archives.
- Never: localStorage for audio blobs or network synchronization.
