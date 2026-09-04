# Spec: Container Delivery

## Objective

Serve the production application locally through one reproducible Docker image.

## Acceptance Criteria

- `docker compose up --build` serves the app at `http://localhost:8080`.
- A multi-stage build runs the production build and ships only static output.
- The runtime includes a health check, SPA fallback, security headers, and microphone permission for self.
- No backend endpoint accepts or stores audio.

## Boundaries

- Always: pin major base images and exclude development artifacts.
- Ask first: TLS termination or remote hosting.
- Never: add telemetry or cloud dependencies.
