# Contributing

Useful contributions: compact scene compositions, readable portrait/ultrawide layouts, tested telemetry adapters, accessibility fixes and measured performance improvements.

Run `node scripts/check.mjs` and `node --test` before opening a pull request. Keep unavailable values distinct from zero. Keep demo data explicitly labeled. Do not add analytics, remote telemetry or hardware writes.

For a hardware-support issue, share the OS, display resolution/type, Node.js version and the failing metric. Do not share tokens, serial numbers, IP addresses, process lists or raw personal monitoring logs.

Artwork: include provenance, licensing and whether it is AI-generated. Prefer small local assets with no external font or image requests.

The v0.5 scene preserves a photographic plate and composites Three.js machinery, masked water and photographic animal poses. Keep the approved composition, camera and lighting consistent. Vehicle changes must preserve the closed route, tangent heading, effective wheel-radius rolling relation and steering pivots. Keep waterwheel components on one shaft and water effects inside channel masks. Check foreground occlusion across a full lap. Validate motion in an actual browser recording as well as tests; mechanical tests alone do not establish realistic appearance. Report visual limits honestly.

Three.js is pinned and vendored with its MIT license. Library upgrades must update the renderer modules, matching geometry utility, HDR loader and license together. Avoid adding CDN dependencies.

For sensor adapters, include tests for unsupported readings, sensor resets, stale values and failure recovery. If you cannot test the real hardware, say so in the pull request.
