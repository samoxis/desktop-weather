# v0.5 validation

Local Windows / Microsoft Edge validation, 2026-10-03. The default view uses the approved photographic composition with independently moving machinery. Screenshots in the README and `preview-photographic*.png` come from the running app with explicitly simulated telemetry.

- JavaScript syntax checks and **25 Node tests passed**. Four new tests exercise the photo-calibrated closed route, continuous turning, distance-based tire rotation with perspective scaling, Still/missing CPU behavior, coordinate/contact calibration and independent tractor/waterwheel pivots. The other 21 include telemetry/security and retained earlier renderers; those tests do not prove photographic fidelity.
- An actual **65-second canvas recording** followed the new app: 45 seconds of rendering telemetry, 12 seconds of download/rain, then 8 seconds of night. The tractor traveled about 79 units during the first 45 seconds, exceeding the roughly 73-unit closed-route length. Heading, steering and both tire angles changed. About 2,700 frames were rendered in that segment on this PC; this is not a low-power hardware benchmark.
- Recorded frames and running-app morning/rain/night screenshots were visually inspected. Machinery scale, exposure, contact shadows and western tree occlusion were adjusted. The far circuit is intentionally hidden behind photographic buildings/vegetation rather than exposing a vehicle above the landscape.
- Browser checks exercised moving tires/rotors/flow; Still froze all tracked phases including animal time; reduced-motion froze movement; Eco remained functional; download mode produced over 200 small animated droplets.
- Screen-mode keyboard recovery and 800×480, 480×800, 1920×480 and 320×640 widths were checked for overflow. The contained village and softened exterior use aligned day/night imagery.
- A simulated local HTTP 503 cleared CPU to unavailable, removed stored hay/rain and stopped tractor activity. Missing material assets produced a visible initialization failure rather than silently drawing a partial scene.
- No unhandled errors occurred on the normal new-renderer path. Microsoft Edge's GPU compiler emitted an X4122 precision warning from a generated Three.js shader; rendering completed. Asset-failure errors were intentionally induced in a separate check.

The telemetry collector is unchanged from the earlier hardware checks below. This release is a fixed-camera photographic composite, not fully reconstructed 3D scenery, physical fluid dynamics or fully articulated 3D animals. The procedural tractor is mechanically animated but remains visually different from the photographed reference vehicle. Physical screen hardware and sustained performance on low-power PCs remain untested.

## Historical v0.4 checks

The following apply to the retained earlier procedural renderer, whose appearance was rejected. They are not claims about the v0.5 photographic renderer.

- JavaScript syntax checks and 21 Node tests passed. Five tests exercise the new 3D driving geometry, independent tire/steering groups, shared waterwheel axle, rain instances/impacts and alternating hen foot contact. The remaining 16 cover telemetry/security and retained legacy 2D modules; those legacy tests do not prove the new scene's visual quality.
- A headless Microsoft Edge recording followed the tractor for 60 seconds, including a full closed-road lap. Heading and tire rotations changed continuously. About 3,600 rendered frames were counted; this checks local frame pacing, not performance on other hardware.
- Morning, rain and night screenshots were inspected. Missing roofs, floating exterior rocks, sparse foliage and an overly dark night were corrected during inspection.
- Rain mode produced 1,100 3D droplet instances with ground/roof impact rings. Tests check their presence and animation, not fluid accuracy.
- Still froze tractor travel, tire angles, windmill, waterwheel and river phase. Reduced-motion uses the same stopped animation path.
- 800×480, 480×800, 1920×480 and 320×640 layouts were checked for horizontal overflow and keyboard recovery from screen mode.
- Live local readings were reached in the browser. Simulated HTTP 503 failure cleared CPU readings to unavailable rather than substituting demo data.
- No unhandled browser errors or Three.js warnings were observed on the normal local path.

Earlier collector checks verified live Windows CPU/RAM, network/disk counter deltas and queries to an existing NVIDIA driver for load, temperature, VRAM, power and fan percentage. The v0.4 changes affect rendering, not collection. No stress test, driver change or HWiNFO configuration change was performed.

The scene contains procedural 3D models with generated surface textures. It is a diorama prototype, not photorealistic art, a vehicle dynamics simulator or a fluid simulation. Mechanical tests do not establish that the artwork meets a particular aesthetic standard.

Not physically tested: internal/USB displays, AMD/Intel GPUs, multiple NVIDIA GPUs, other operating systems, thermal adapters, native packaging or Windows auto-start. Resource budgets and sustained frame times on low-power hardware remain unmeasured. CI on Windows/Linux tests code rather than hardware compatibility.

## Approved photographic reference view

The owner approved the photographic reference on 2026-10-03. Its in-app art-review mode was checked in Microsoft Edge: the actual image was drawn and visually inspected, simulated CPU/GPU readings appeared, source switching and screen-mode recovery worked, and the four compact/portrait/ultrawide layouts above had no horizontal overflow. The view did not request Three.js or the procedural world module. The PNG hash matches the approved original exactly. It is explicitly static; this check makes no claim about photographic animation.
