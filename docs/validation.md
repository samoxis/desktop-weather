# v0.4 validation

Local Windows validation, 2026-10-03. Screenshots come from the running browser using explicitly simulated values.

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
