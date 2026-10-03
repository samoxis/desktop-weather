# Desktop Weather

**Turn your PC sensor screen into a living miniature world.**

A lively circular Romanian village that responds to CPU, GPU, memory, network and disk activity. Built for the small screen inside your case, the extra display on your desk, or a browser tab you leave open.

![Desktop Weather — live 3D village with simulated telemetry](docs/preview-3d.png)

[Try the browser demo](https://samoxis.github.io/desktop-weather/?demo=idle) · [Telemetry explained](docs/telemetry.md) · [Research & decisions](docs/research.md) · [Contribute a scene](CONTRIBUTING.md)

> **v0.4 replaces the illustrated prototype with a real WebGL 3D scene.** Buildings, machinery and animals are procedural meshes with textured materials and shadows. This remains an early prototype, not a photorealistic game. Browser demos use clearly labeled simulated values; live readings require the local companion.

## What moves?

| Your computer | The little world |
|---|---|
| CPU utilization | Tractor speed, acceleration, four rotating tires and steering on a continuous village road |
| GPU utilization | Wooden windmill rotation |
| Memory utilization | Hay bales fill the barn courtyard |
| Download + upload rate | 3D rain droplets, ground/roof impacts, river ripples and wetter materials, with a configurable scale |
| Disk read + write rate | A wooden waterwheel on a fixed 3D axle, synchronized with flowing river shading and foam |

Birds with hinged wings, sheep and articulated chickens add ambient life; these are decorative and do not represent sensors. Tractor and mill motion stop at zero or unavailable load.

The tractor follows a closed road loop, turns with the road tangent and steers its front wheels. Tire rotation uses traveled distance divided by each tire's radius; tread, rims and hubs rotate together. Bridges connect both river crossings. The wheel's rims, spokes and paddles rotate around one shared shaft. River shading and machinery share an animation phase; this is an artistic telemetry mapping rather than a fluid or vehicle physics simulation.

Morning, golden-hour and moonlight appearances are selectable. Day and night change lighting in the same 3D world, with warm windows at night. Hills, trees, fields and a stream fill the surroundings. Automatic lighting follows your local clock, without location lookup. Usage drives the scene; **it is not a temperature gauge or thermal alarm**. The GPU temperature is shown separately.

## Run locally

Requires **Node.js 22 or newer**, plus a browser with **WebGL 2 and hardware acceleration**. No npm installation, account, API key or administrator permission needed. Three.js is bundled locally.

```sh
git clone https://github.com/samoxis/desktop-weather.git
cd desktop-weather
node server.mjs
```

Open **http://127.0.0.1:4783**. On Windows you can also double-click `Start-Desktop-Weather.cmd` from the downloaded project folder.

Move the browser onto the sensor screen. Use **F11** for the browser's fullscreen mode, then **K** to hide app controls. Press **K** again or use the faint exit button to restore them. The app's Fullscreen button is also available where supported.

- **Settings → Data source** switches between live readings and four simulated scenarios.
- **Settings → Animation** offers Smooth (60 FPS cap, default), Eco (30 FPS cap with lower resolution), Balanced (30 FPS cap) and Still.
- **Settings → GPU** selects an NVIDIA GPU on multi-GPU systems.
- **Settings → Show readings in screen mode** lets you keep only the village.
- **Settings → Rain at** calibrates the visual response to your connection speed. This is an animation scale, not a measurement of your connection's maximum speed.
- `http://127.0.0.1:4783/?screen=1` opens directly in screen mode.

The app pauses polling and drawing when its tab is hidden and respects reduced-motion preferences. Startup at Windows login, a native monitor picker and a packaged `.exe` are planned; this version does not configure them.

## Telemetry support

| Metric | Windows | Other operating systems |
|---|---|---|
| CPU utilization, used/total RAM | Yes, Node.js OS APIs | Available via OS APIs; not hardware-tested here |
| Upload/download, disk read/write | Windows CIM raw counters | Not implemented yet |
| NVIDIA GPU load, temperature, VRAM, power, fan percentage | Existing `nvidia-smi`, where supported | Collector can use existing `nvidia-smi`; not hardware-tested here |
| AMD / Intel GPU sensors | Not implemented yet | Not implemented yet |
| CPU temperature, coolant, pumps, motherboard fans | Not implemented yet | Not implemented yet |

Missing, warming-up and unsupported sensors show **—**, not a made-up zero. GPU fan percentage can legitimately be zero when fans are stopped. It is not fan RPM.

The GPU collector does **not** install NVIDIA drivers or change HWiNFO settings. Disable it with:

```sh
node server.mjs --no-gpu
```

Network defaults to the busiest measured adapter, rather than adding physical and virtual adapters together. This avoids naive double-counting but is not total traffic across all interfaces. Pin an exact CIM adapter name with `DW_INTERFACE`; see [telemetry details](docs/telemetry.md).

## Display compatibility

Any screen recognized as a monitor by the OS can show the browser: HDMI, DisplayPort or a USB graphics display. Layouts were checked at 800×480, 480×800 and 1920×480, as well as regular desktop and small mobile widths. This is browser-layout validation, not a physical screen test.

USB-only smart screens with proprietary protocols and cooler/AIO LCDs are **not supported in v0.4**. They need device-specific adapters. The camera adjusts to keep the circular scene visible in portrait layouts. Dedicated compositions remain on the roadmap.

The 3D renderer consumes GPU resources itself. Smooth caps drawing at 60 FPS; Eco reduces resolution and shadow detail. These are targets, not performance guarantees. Resource budgets on low-power PCs still need measurement.

## Local by design

The companion listens only on `127.0.0.1`. It sends readings only to your local browser, rejects foreign hosts/origins and serves only the `public/` directory. No analytics, cloud telemetry, process names, IP addresses, serial numbers or persistent sensor history. The static demo works without a companion and reads no hardware. GitHub links are ordinary links you can choose to open.

Preferences are stored in the browser. Sensor readings are not. This release does not create scheduled tasks, modify startup entries, change fan curves or write system configuration.

## Development

```sh
node scripts/check.mjs
node --test
```

No dependency installation or build step. `public/` is also the complete static demo, including pinned Three.js 0.186.1. GitHub Actions checks JavaScript and tests on Windows and Linux; a separate Pages workflow publishes the demo. See [validation](docs/validation.md) for what was actually exercised.

## Next places to take it

- Purpose-built compact, portrait and ultrawide compositions.
- Read-only LibreHardwareMonitor adapter with explicit sensor mapping and source freshness.
- AMD/Intel GPU support with hardware-backed validation.
- Native monitor selection and an optional desktop wrapper.
- Higher-detail art and scene packs with preview thumbnails and community contributions.
- Measured renderer/collector resource budgets on small PCs.
- Carefully selected adapters for USB smart screens.

## Credits & license

Project code and included project artwork are offered under MIT terms. Three.js and its BufferGeometryUtils helper are bundled under their own [MIT license](public/vendor/THREE-LICENSE.txt), copyright the Three.js authors. The surface texture atlas was created with OpenAI image generation; the models and animation are code-generated. Earlier raster scene and sprite assets remain in the repository but are not used by v0.4. See [art provenance](docs/art-direction.md) and [research notes](docs/research.md).

