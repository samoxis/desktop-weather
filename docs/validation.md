# v0.1 validation

Local validation on Windows, 2026-10-03:

- JavaScript syntax checks passed.
- All 10 Node.js tests passed: CPU aggregation and warmup, counter resets, network selection, unsupported NVIDIA fields, null semantics, source freshness, selected-GPU scene response and HTTP security/static serving.
- Live CPU and memory readings verified through the local HTTP endpoint and browser.
- Live Windows network/disk counter deltas verified; these were not forced with a benchmark or stress test.
- Existing NVIDIA driver queried successfully for utilization, temperature, used/total VRAM, power and fan percentage. No driver or HWiNFO configuration changes.
- Headless Microsoft Edge interaction checks passed at 1440×1060, 800×480, 480×800, 1920×480 and 320×640 without horizontal overflow.
- Demo source switching, lighting, screen-mode keyboard recovery and GPU-driven scene state verified.
- Eco mode drew 30 frames during a 2.1-second observation, consistent with the 15 FPS cap. This is a frame-count check, not a full GPU/CPU/memory benchmark.
- Simulated collector HTTP failure changed the source to unavailable and cleared the readings; no silent demo fallback.
- Reduced-motion/still-mode controls exercised. No unhandled browser script errors.

The README image is a screenshot of the actual browser prototype using labeled simulated readings. The background itself is AI-generated illustration.

Not physically tested: internal/USB displays, AMD/Intel GPUs, multiple NVIDIA GPUs, other operating systems, thermal adapters, native packaging, Windows auto-start. The GitHub CI matrix checks core code on Windows and Linux but does not establish hardware support.
