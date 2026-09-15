# ArmorPaint × ComfyUI × Grabient Integration

Integrated material workspace combining an ArmorPaint-oriented 3D surface workflow, ComfyUI generation, and Grabient color workflows.

## Completed integration chain

**Surface selection → Grabient palette → MaterialAsset → ComfyUI workflow → generated PBR maps → Three.js preview → local texture materialization → ArmorPaint import manifest/plugin**.

### ComfyUI execution

`src/integrations/comfyui.ts` queues API-format workflows through `/prompt`, polls `/history/:promptId`, supports cancellation/timeouts, constructs output URLs, and recognizes baseColor/normal/roughness/metallic/height/mask outputs. `src/state/comfyGeneration.ts` provides generation lifecycle state and texture ingestion. `src/integrations/textureWorkflow.ts` injects explicitly bound material parameters into a cloned workflow. The Vite development proxy exposes `/comfy` to a local ComfyUI instance on `127.0.0.1:8188`.

### Grabient integration

`src/types/grabient.ts`, `src/integrations/grabient/adapter.ts`, and `src/data/grabientPalettes.ts` preserve Grabient's cosine-gradient representation and deterministically sample it into material colors. Palette provenance is stored in explicit `MaterialMetadata`. The UI exposes curated palettes without coupling the application to Grabient's hosted service.

### ArmorPaint bridge

`src/integrations/armorpaint.ts` converts generated texture references into deterministic import manifests. `armorpaint-plugin/comfy_texture_bridge.c` provides the native ArmorPaint import boundary using ArmorPaint's plugin API and native texture importer. The web layer does not pretend that ArmorPaint accepts arbitrary network URLs.

### Unified pipeline

`src/integrations/materialPipeline.ts` composes palette application, optional ComfyUI generation, texture ingestion, and ArmorPaint manifest creation into one orchestration boundary. `src/integrations/materialize.ts` converts generated URLs into local browser files using the File System Access API where available, with a download fallback. The material workspace exposes atomic asset updates so adapters can compose without duplicating state logic.

### Validation

`.github/workflows/integration-validation.yml` runs on pushes to `main`/`integration/**` and pull requests and executes:

```text
npm install
npm run typecheck
npm test
npm run build
```

Local validation can use the same commands.

## Deployment model

The application is a browser frontend. ComfyUI remains an external local service, and ArmorPaint remains a native desktop application. A production desktop distribution should provide a localhost/native-host bridge for process launching and filesystem operations; a normal browser deployment cannot silently launch ArmorPaint or write arbitrary files.

The intended production boundary is therefore:

```text
Browser UI
  ├─ ComfyUI HTTP adapter ──> ComfyUI
  ├─ MaterialAsset state
  └─ local materialization/native host ──> ArmorPaint plugin/native importer
```

## Known limitations

- A real ComfyUI generation still requires a running ComfyUI installation, compatible workflow, models/custom nodes, and sufficient GPU/CPU resources.
- The current ComfyUI client uses history polling rather than websocket progress streaming.
- PBR channel detection remains filename-based unless the workflow supplies explicit channel metadata.
- `MaterialAsset` texture references are URLs until materialized locally; ArmorPaint requires local filesystem paths.
- The browser fallback downloads files individually. A native host can replace this with an atomic project-directory export.
- The ArmorPaint C plugin must be compiled against the target ArmorPaint build/API before runtime use.
- The current command plan opens an ArmorPaint project; the native plugin performs texture import. It does not claim an unsupported CLI texture-import switch.
- The frontend cannot prove a real end-to-end ComfyUI → filesystem → ArmorPaint run until those applications are present in the validation environment.
- Grabient's upstream repository is licensed under FSL-1.1-ALv2; this integration uses its documented cosine-gradient representation rather than copying the hosted service.

## Source projects

- ArmorPaint: `armory3d/armorpaint`
- Grabient: `johnkorzhuk/grabient`
- ComfyUI: `Comfy-Org/ComfyUI`

The integration avoids modifying upstream cores and keeps external behavior behind adapters.
