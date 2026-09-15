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

### Local ComfyUI requirement

For development, run ComfyUI on its normal local API port (`8188`). The Vite proxy keeps browser requests same-origin at `/comfy` and forwards them to the local ComfyUI process.

Phase 5 does **not** claim an ArmorPaint export/import bridge or Grabient workflow execution. Those remain separate integration boundaries.
