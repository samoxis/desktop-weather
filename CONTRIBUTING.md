# Contributing

Useful contributions: compact scene compositions, readable portrait/ultrawide layouts, tested telemetry adapters, accessibility fixes and measured performance improvements.

Run `node scripts/check.mjs` and `node --test` before opening a pull request. Keep unavailable values distinct from zero. Keep demo data explicitly labeled. Do not add analytics, remote telemetry or hardware writes.

For a hardware-support issue, share the OS, display resolution/type, Node.js version and the failing metric. Do not share tokens, serial numbers, IP addresses, process lists or raw personal monitoring logs.

Artwork: include provenance, licensing and whether it is AI-generated. Prefer small local assets with no external font or image requests.

The v0.4 scene uses Three.js meshes rather than raster animation overlays. Vehicle changes must preserve the closed route, tangent heading, wheel-radius rolling relation and steering pivots. Keep waterwheel components on one shaft. Validate motion in a browser recording as well as tests: no route resets, sliding feet, spinning perspective sprites or misplaced rain impacts. Report visual limits honestly.

Three.js is pinned and vendored with its MIT license. Library upgrades must update the renderer modules, matching utility and license together. Avoid adding CDN dependencies.

For sensor adapters, include tests for unsupported readings, sensor resets, stale values and failure recovery. If you cannot test the real hardware, say so in the pull request.
