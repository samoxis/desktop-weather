# Romanian countryside scene

Approved direction: realistic game materials, a circular Romanian village on a raised stone terrace, surrounded by a continuous countryside. Morning and cinematic night versions share the same geometry. Neither popularity research nor approval predicts GitHub stars.

Generated with the built-in OpenAI image generation tool. Production assets: `public/assets/romanian-day.webp` and `public/assets/romanian-night.webp`. These are raster backgrounds. Tractor, mill blades, waterwheel, hay, weather and animals are Canvas overlays.

Day prompt: One full-bleed wide 16:9 scene based on the approved middle concept. Romanian circular raised stone terrace, realistic materials and morning light. Countryside fills every edge with hills, forests, meadows, paths and a river. Three houses, central barn, carved gate, upper-right windmill and riverside mill. Bare mill axles, empty road and barn courtyard for animation compositing. No text, labels, UI, tractor, hay, foreground animals, windmill blades or waterwheel. No cartoon styling.

Night edit prompt: Change only lighting to cinematic blue-hour night. Preserve camera, framing, buildings, paths, terrace, axles, vegetation, mountains and stream for shared animation coordinates. Cool blue sky, soft moonlight, warm windows and sparse practical lanterns. Keep landscape visible. No added UI, text or foreground machinery.

The extended portrait/ultrawide background is a blurred cover of the same artwork, behind the complete scene. Purpose-built layouts remain future work.

## Tractor revision

`public/assets/tractor-real.webp` replaces the geometric tractor with a transparent photographic sprite. Generated with the built-in OpenAI image generation tool, then converted to WebP preserving alpha. Prompt: a mechanically credible classic Romanian red farm tractor inspired by a 1980s Universal 650, worn painted steel, deep chevron tire treads, large rear and small front wheels, glass cab with driver, detailed engine/chassis, elevated three-quarter view, nose facing right, warm upper-left illumination. Entire vehicle isolated with transparent padding, no ground, baked shadow, text, logos or trailer; no cartoon or toy styling.

Canvas adds a contact shadow, CPU-driven travel, slight body movement, travel-dependent dust and night shading. The tractor is a 2D sprite, not a rigged 3D vehicle. Its photographed wheel faces now rotate inside perspective masks, with the front wheels rotating faster than the larger rear wheel. Tire silhouettes and tread geometry remain part of the photograph.

## Motion and river revision

The road uses a sampled smooth spline with distance-based travel, limited to the front road where the camera angle matches the tractor. Acceleration, approach braking and a pause before reversing replace constant-speed ping-pong movement. The cab stays upright with no mirrored turn. The tractor backs up slowly. Wheel-face rotation and projected tread grooves follow travel using a 21-artwork-pixel rear rolling radius. This is still a layered 2D animation rather than a full 3D steering model.

`public/assets/waterwheel-real.webp` provides the wood grain texture, generated with the built-in OpenAI image generation tool and converted to WebP preserving alpha. Prompt: authentic old Romanian undershot mill wheel, straight-on circular centered face, weathered wet oak rim and radial spokes, iron bolts, paddle ends, transparent spoke gaps, natural upper-left lighting, no river/building/shadow/text. The current renderer projects centered rim/spoke/paddle geometry with fixed depth and axle. It no longer rotates the perspective photograph. Windmill blades also use textured wooden slats.

The river uses hand-mapped visible channel sections, with gaps around bridges. Two blended offset layers move the existing water texture within narrow channel masks; downstream foam strokes and wheel drips share the waterwheel phase. Disk I/O drives the common visual speed. Still/reduced-motion freezes it. This is an artistic telemetry mapping, not fluid simulation or actual river measurement.

## Farm assets and frame pacing

The built-in image generation tool produced two new transparent atlases, converted to WebP preserving alpha:

- `public/assets/hens-real.webp`: a 3-by-2 sheet of one realistic brown farm hen, consistent slightly elevated camera, four walking poses, standing and pecking, articulated orange legs, detailed feathers, natural warm lighting. No cartoon styling, scenery, captions or grid lines. Walking frames blend; the bird walks briefly, then rests or pecks.
- `public/assets/farm-real.webp`: three equal cells, a realistic cream-wool sheep grazing, the same sheep with head raised, and a rolled dry hay bale with straw texture, consistent elevated camera and warm lighting. Transparent background without captions or scenery. Replaces geometric sheep and bales.

Smooth mode targets 60 FPS by default. Eco and Balanced cap at 30 FPS; Still and reduced-motion stop motion. Telemetry easing uses elapsed time instead of a frame-dependent fixed fraction. Earlier stored animation preferences migrate to Smooth once, except Still; subsequently selected preferences persist. No external rendering libraries or network asset dependencies were added.
