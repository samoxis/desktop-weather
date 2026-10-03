# Contributing

Useful contributions: compact scene compositions, readable portrait/ultrawide layouts, tested telemetry adapters, accessibility fixes and measured performance improvements.

Run `node scripts/check.mjs` and `node --test` before opening a pull request. Keep unavailable values distinct from zero. Keep demo data explicitly labeled. Do not add analytics, remote telemetry or hardware writes.

For a hardware-support issue, share the OS, display resolution/type, Node.js version and the failing metric. Do not share tokens, serial numbers, IP addresses, process lists or raw personal monitoring logs.

Artwork: include provenance, licensing and whether it is AI-generated. Prefer small local assets with no external font or image requests.

For sensor adapters, include tests for unsupported readings, sensor resets, stale values and failure recovery. If you cannot test the real hardware, say so in the pull request.
