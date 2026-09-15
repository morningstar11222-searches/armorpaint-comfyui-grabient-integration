# ArmorPaint × ComfyUI × Grabient Integration

Integrated material workspace combining an ArmorPaint-oriented 3D surface workflow, ComfyUI generation, and Grabient color workflows.

## Phase 1 — UI architecture

Production frontend shell preserving the approved visual direction: React + TypeScript + Vite, isolated Three.js origami interaction, cinematic detail transition, 50/50 material-information composition, responsive behavior, and bundled dependencies.

## Phase 2 — Realtime PBR material engine

Phase 2 replaces the static material placeholder with a real Three.js `MeshPhysicalMaterial` viewer:

- Centralized PBR definitions for metal, stone, glass, acrylic, PVC, and carbon.
- Realtime 3D material preview with physically based roughness, metalness, clearcoat, transmission, and IOR.
- Procedural micro-surface noise for material breakup.
- Pointer-responsive surface orientation and studio lighting.
- Live roughness, metalness, clearcoat, and transmission controls.
- Material preview remains the hero of the upper 50% panel; information remains below.

## Phase 3 — Material data pipeline

Phase 3 establishes the shared data contract needed before connecting external systems:

- `MaterialAsset` model for PBR parameters and texture channels.
- Versioned material state.
- Explicit texture channels: baseColor, normal, roughness, metallic, height, mask.
- `MaterialRepository` boundary for get/update/reset/serialize operations.
- Persistence-ready JSON serialization.
- Clean separation between material data and renderer/UI code.

## Phase 4 — Grabient adapter

Phase 4 adds a real, deterministic adapter around Grabient's cosine-gradient representation rather than embedding Grabient UI code into the renderer.

- Typed `GrabientPalette` and cosine coefficient contract.
- Deterministic cosine-gradient sampling with bounded stop counts.
- Palette-to-material mapping for base color and accent lighting.
- Palette provenance stored in `MaterialAsset.metadata`.
- Four curated starter palettes for the workspace: Obsidian Aurora, Graphite Mint, Smoked Copper, and Deep Ocean.
- One-click palette application from the material information panel.
- Existing PBR parameters remain intact when a palette is applied.
- Material repository persists palette metadata and serialized material state.
- Adapter unit tests and GitHub Actions validation for typecheck, tests, and production build.

The adapter follows Grabient's documented cosine model: each RGB channel is sampled from offset, amplitude, frequency, and phase coefficients.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## Current phase chain

`main` → `phase-1/ui-architecture` → `phase-2/material-engine` → `phase-3/material-data-pipeline` → `phase-4/grabient-adapter`

## Phase 4 files

- `src/types/grabient.ts` — integration contract.
- `src/integrations/grabient/adapter.ts` — sampling and material mapping.
- `src/data/grabientPalettes.ts` — curated palette presets.
- `src/data/surfaces.ts` — extracted surface registry.
- `src/types/material.ts` — palette provenance metadata.
- `src/material/MaterialRepository.ts` — metadata persistence.
- `src/state/materialWorkspace.ts` — atomic material replacement and surface synchronization.
- `src/three/MaterialViewer.tsx` — palette-driven accent lighting.
- `src/App.tsx` / `src/styles.css` — palette controls and responsive presentation.
- `src/integrations/grabient/adapter.test.ts` — adapter tests.
- `.github/workflows/phase-4-validation.yml` — CI validation.

## Scope boundary

Phase 4 does not claim a live dependency on the Grabient web application or database. It implements the compatible gradient representation and an isolated adapter boundary so Phase 5 can connect ComfyUI generation without coupling the UI to either external system.

Phase 5 is the ComfyUI workflow execution and generated texture-map ingestion layer.
