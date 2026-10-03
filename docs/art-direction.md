# Romanian countryside scene

**Current production: v0.5 photographic composite.** The [approved reference](approved-direction.md), its clean day/night plates, material maps and photographic animals now drive the default scene. See [the implementation, asset provenance and generation instructions](photographic-animation.md). The unmodified approved PNG remains available in the explicitly static art-review view.

**Historical v0.4 notes below:** the owner rejected this procedural appearance. Its modules and earlier assets are retained, but the default app does not load `world.mjs`. These notes document that earlier experiment.

A circular Romanian village on a raised stone terrace, surrounded by continuous countryside. Actual WebGL geometry replaces the earlier illustrated scene and sprite overlays. The camera is fixed; this is a procedural 3D diorama, not an explorable or photorealistic game.

## Current production assets

- Buildings, hip roofs, verandas, carved-style gate, bridges, fences, trees and surrounding terrain are generated in `world-models.mjs` / `world.mjs`.
- Tractor: mesh chassis, bonnet, glazed cab and driver; four tire/rim/tread groups; two front steering pivots. A closed elliptical road supplies world position, tangent heading and curvature. Rolling angles use distance divided by tire radius.
- Waterwheel: rings, spokes, hub and sixteen paddles share an X-axis shaft. The lower paddles meet the water. River shading and wheel rotation use one phase driven by disk activity; this is an artistic mapping, not simulated fluid mechanics.
- Rain: instanced 3D droplets, impact rings, advected river shading and ripples. Roof impact heights are approximate; surfaces become less rough during rain.
- Birds have hinged wing meshes; hens have feather-shaped meshes and alternating stance/swing feet. Sheep are decorative mesh models.
- Day/night use the same geometry with different lighting and emissive windows. Dusk uses warmer sunlight.

`public/assets/terrain-materials.webp` is an AI-generated 3×2 atlas: grass, dirt, masonry, wood, terracotta tiles and lime plaster. Created with the built-in OpenAI image generation tool and converted from PNG to WebP without compositional editing. Browser canvas extracts equal tiles for local texture and bump maps. No runtime image service is used.

Texture prompt: a 3×2 grid of six equal flat photographic surface texture tiles, no borders or labels, subtle natural colors, no perspective or baked shadows; short meadow grass, compacted dusty dirt, weathered stone masonry, old oak boards, terracotta roof tiles and pale lime plaster, for a realistic Romanian rural scene.

## Libraries and provenance

Three.js 0.186.1 is pinned and vendored locally, including its official BufferGeometryUtils helper with its import adjusted to the local module. The MIT license is included under `public/vendor/THREE-LICENSE.txt`. Project models and animation code are authored for this repository.

Earlier AI-generated raster backgrounds and sprite atlases remain as historical experiments but are not loaded by the v0.4 app. Their provenance was recorded in the earlier Git history. The current renderer does not rotate photographed wheel faces or project a wheel sprite.

## Performance and visual limits

Mesh batching and instancing reduce draw calls. Smooth caps at 60 FPS; Eco lowers pixel ratio and shadow-map size. Neither settings nor the local frame-count check establish performance on every sensor-panel PC. Still/reduced-motion freezes animation. Models need further art refinement; realistic volume and mechanically consistent movement do not imply photorealism. Approval or popularity research cannot predict GitHub stars.
