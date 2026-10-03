# Research and product decisions

Research date: 2026-10-03. These references establish implementation direction; they do not imply compatibility with every piece of hardware.

## Related projects

- [Metropolis](https://github.com/5c0/metropolis): a terminal city driven by system activity. Evidence that the general metaphor already exists. Desktop Weather differentiates through a calm illustrated scene, a browser renderer and sensor-screen layouts; we do not claim to invent visual system monitoring.
- [Turing Smart Screen Python](https://github.com/mathoudebine/turing-smart-screen-python): supports specific USB screen protocols and community themes. Useful research for future display adapters; a browser app alone cannot speak every USB LCD protocol.
- [InfoPanel](https://github.com/habibrehmansg/infopanel): sensor visualization using HWiNFO and external displays. Useful reference for expectations around sensor source availability. No code was copied.
- [AIDA64 external display support](https://www.aida64.com/products/features/external-display-support): distinguishes device-specific LCD support from Windows desktop panels. Our first target is a screen that Windows already recognizes as a monitor.

## Technical sources

- [Node.js OS APIs](https://nodejs.org/api/os.html): CPU time counters and memory quantities. This lets the core companion avoid third-party packages and additional drivers.
- [Windows network performance counters](https://learn.microsoft.com/en-us/previous-versions/aa394293(v=vs.85)): network byte counters. We use raw deltas with elapsed time, not accumulated bytes labeled as speed.
- [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html): driver-provided GPU queries. Unsupported fields and unavailable executables must remain unavailable.
- [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor): optional future source for temperatures, fans and hardware-specific data. Hardware support and privileges vary.
- [HWiNFO shared-memory limit](https://www.hwinfo.com/forum/threads/shared-memory-12-hour-limit-popup.8326/): the free shared-memory path is time-limited. We avoid making it a required dependency.

## Improvements chosen for v0.1

1. A gentle visual vocabulary: no fire, ominous storms or inferred overheating.
2. Honest data states: labeled demo; unavailable sensors shown as unavailable; no silent fallback.
3. Two layers: zero-install browser demo, plus a local companion for real readings.
4. GPU as a first-class metric, including source-specific temperature, VRAM and power.
5. Adaptive layout, fullscreen and a recoverable screen mode for dedicated displays.
6. Low-motion options, frame caps and suspension in hidden tabs.
7. Local-only collection and no dependency installation, for a reviewable first prototype.

## Deliberate limits

The scene is layered illustration, not realtime 3D. One shared background is cropped by display shape; dedicated format-specific scenes would improve readability. GPU hardware validation covered NVIDIA only. No USB smart-screen protocol, AIO display integration, CPU thermal alarm, native `.exe`, auto-start or custom sensor mapping is claimed. Those are separate work items requiring hardware-backed testing.
