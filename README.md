# ArmorPaint × ComfyUI × Grabient Integration

Integrated material workspace combining an ArmorPaint-oriented 3D surface workflow, ComfyUI generation, and Grabient color workflows.

## Phase 5 — ComfyUI workflow execution + generated texture-map ingestion

Phase 5 adds the runtime bridge from the material workspace to a local ComfyUI server and routes generated PBR image outputs back into the shared material asset.

### Implemented

- `src/integrations/comfyui.ts` — typed ComfyUI client for `/prompt`, `/history/:promptId`, output URL construction, cancellation, timeout handling, and PBR channel detection.
- `src/state/comfyGeneration.ts` — generation lifecycle state (`idle`, `queued`, `running`, `complete`, `error`) plus texture ingestion.
- `src/integrations/textureWorkflow.ts` — explicit workflow parameter binding so material controls can be injected into a ComfyUI workflow without mutating the source workflow.
- `src/state/materialWorkspace.ts` — generated maps can now be merged into the selected material asset with version increments.
- `src/three/MaterialViewer.tsx` — generated base-color, normal, roughness, metallic, and height maps are loaded into the live Three.js PBR material.
- `vite.config.ts` — development proxy from `/comfy/*` to the standard local ComfyUI server at `127.0.0.1:8188`.
- `src/integrations/comfyui.test.ts` — mocked queue/history integration coverage.

### Expected workflow

1. The UI creates or loads a ComfyUI API-format workflow.
2. Material parameters are bound to explicitly configured workflow inputs.
3. The workflow is queued through `/comfy/prompt`.
4. The client polls `/comfy/history/:promptId` until generated images are available.
5. Output filenames are mapped to `baseColor`, `normal`, `roughness`, `metallic`, `height`, or `mask` when their names are recognizable.
6. Generated texture references are merged into the selected `MaterialAsset`.
7. The Three.js viewer consumes the generated URLs as PBR texture maps.

## Phase 6 — ArmorPaint texture import bridge

Phase 6 establishes the final local handoff from generated texture references into ArmorPaint without changing the shared material contract.

### Implemented

- `src/integrations/armorpaint.ts` — typed ArmorPaint import manifest and command-plan boundary derived from the shared `MaterialAsset`.
- `armorpaint-plugin/comfy_texture_bridge.c` — ArmorPaint plugin UI that accepts local generated-map paths and invokes ArmorPaint's native texture importer for base color, normal, roughness, metallic, height, and mask maps.

The plugin uses ArmorPaint's existing plugin API and native `import_texture_run()` path rather than modifying ArmorPaint internals. ArmorPaint's current source exposes that importer as a callable function and plugin examples use `plugin_create()` / `plugin_notify_on_ui()` for UI extensions.

### Phase 6 handoff

1. ComfyUI generates PBR maps through Phase 5.
2. The shared `MaterialAsset` records each generated texture reference.
3. `createArmorPaintImportManifest()` converts those references into deterministic filenames and source URLs.
4. The generated images are made available as local files for ArmorPaint.
5. In ArmorPaint, the Comfy Texture Bridge plugin is opened and the local paths are supplied to the matching channel fields.
6. `Import Texture Maps` calls ArmorPaint's native texture importer for every supplied map.

Phase 6 deliberately does **not** invent a network-download API inside ArmorPaint or alter ArmorPaint's core importer. The web application remains responsible for obtaining/generated-file localization; the plugin is the native import boundary.

## Remaining integration boundary

Grabient palette generation is implemented at the adapter boundary in Phase 4. Phase 6 does not execute Grabient workflows inside ArmorPaint; it preserves the shared material/palette data flow already established by the earlier phases.
