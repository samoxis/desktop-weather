# Photographic animation — v0.5

The accepted image is the source of the composition. Buildings, vegetation, stone walls and distant countryside are kept photographic. Their camera stays fixed. The default renderer is a **2.5D composite**: an aligned day/night image, independent Three.js machinery, masked water motion, photographic animal pose sprites and photo-space rain. It cannot rotate the camera or reconstruct hidden scenery from the original photograph.

## Assets and provenance

All generated raster assets below were created with the built-in OpenAI image generation tool on 2026-10-03. PNG-to-WebP conversion preserved the composition; the animal atlas keeps transparency. No image service is used at runtime. The unchanged original remains `public/assets/romanian-approved-reference.png`; its original prompt is in [approved-direction.md](approved-direction.md).

| Asset | Purpose |
|---|---|
| `public/assets/romanian-live-plate.webp` | 1672×941 clean photographic background; moving tractor, rotors, animals and stored hay removed |
| `public/assets/romanian-live-night.webp` | Aligned blue-hour version, with warm existing windows |
| `public/assets/machinery-materials.webp` | Six local paint, rubber, iron, oak, steel and straw surface maps |
| `public/assets/village-life.webp` | Transparent 4×3 atlas: hen walk/stand/peck, sheep stand/graze, swallow wing poses, hay bale |
| `public/assets/rural-landscape-1k.hdr` | Natural lighting/reflection map; Sergej Majboroda, [Poly Haven Rural Landscape](https://polyhaven.com/a/rural_landscape), CC0 |

Three.js 0.186.1, its official BufferGeometryUtils and HDRLoader are bundled locally. The utility/loader imports are adjusted to local modules; their MIT license is included in `public/vendor/THREE-LICENSE.txt`. The project machinery geometry and compositor are authored code.

## Generation instructions

The following are the generation specifications, grouped by resulting file. They record the intended edits and constraints; generated pixels must still be inspected.

**Clean plate:** precise object edit of the approved photograph. Preserve its camera, framing, color, lighting, houses, roofs, terrain, trees, river and surrounding landscape. Remove only the foreground tractor and its shadow, the waterwheel rotor while leaving its fixed shaft, windmill sails while leaving the hub, hens, sheep and stored hay. Reconstruct dirt-road ruts and the previously occluded local background. No new objects, stylization or composition change. Keep the same resolution.

**Night plate:** change only the clean plate's lighting to natural blue-hour moonlight. Warm light in existing windows; readable vegetation, road and machinery locations. Preserve the exact camera, geometry and absence of moving machinery/animals/hay. Natural photographic contrast; no black silhouettes or bright cyan water.

**Material atlas:** six equal flat photographic material swatches in a 3×2 layout, with no labels, borders, perspective or baked highlights. Dusty aged red paint with restrained rust scratches; charcoal rubber with microtexture; oily dirty cast iron; weathered wet oak; dull galvanized steel with rust speckles; buff straw fibers. Natural colors and locally repeatable surface detail.

**Life atlas:** a padded transparent 4×3 grid. First row: the same anatomically credible russet hen in four walking poses. Second row: hen standing, hen pecking, sheep standing, sheep grazing. Third row: swallow wings up, wings down, gliding, and one hay bale. Slightly elevated photographic camera, upper-left light, realistic anatomy and scale consistency. No ground or baked shadows. Browser canvas clips low-alpha color bleed before displaying cells; the original atlas remains unchanged.

## Motion and limitations

`photo-course.mjs` calibrates the road to photo coordinates. Position and tangent heading remain continuous around the loop. The tractor gets smaller toward the far side; angular tire motion integrates distance divided by the effective scaled tire radius. Four tire/tread/rim groups rotate independently; front wheels have steering pivots. A foreground matte occludes the far circuit behind trees, buildings and retaining walls. This is a hand-calibrated fixed-camera route, not a terrain/vehicle dynamics solver.

`photo-machinery.mjs` provides real 3D rotating parts. The waterwheel's rims, spokes, paddles and hub share a fixed X-axis. Stream movement and wheel motion use the same telemetry-driven flow rate. Channel masks keep the animated photographic highlights inside the water. The windmill has a separate rotor. Material maps, HDR lighting and contact shadows help fit the machinery to the photo; the models remain procedurally authored and may look different from the original photographed tractor.

Rain uses small depth-scaled drops with velocity/acceleration, expanding ground-impact rings, short splash particles and restrained road wetness. It does not simulate physical cloud cover, roof runoff or liquid dynamics. Hens/birds use photographic pose frames, and sheep alternate standing/grazing poses; they are not fully articulated 3D animals. These effects preserve the fixed view but have visible limits at very large magnification.

Still and reduced-motion freeze drive, tire angles, rotors, flow phase, animals and rain impacts. Missing sensor readings clear the corresponding activity rather than starting demo values. Day/night plates crossfade; the machinery lighting changes with them. The complete village stays visible on portrait/ultrawide layouts, with a blurred photographic cover filling the exterior.

Full motion and source-failure checks are recorded in [validation.md](validation.md). Neither mechanical tests nor photographic textures prove perfect realism or predict GitHub stars.
