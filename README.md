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

This is intentionally an adapter boundary: ComfyUI, Grabient, and ArmorPaint are not falsely represented as connected yet.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Current phase chain

`main` → `phase-1/ui-architecture` → `phase-2/material-engine` → `phase-3/material-data-pipeline`

Open pull requests:

- Phase 1: UI architecture
- Phase 2: realtime PBR material engine
- Phase 3: material data pipeline

## Next

Phase 4 should implement the Grabient adapter and palette-to-material mapping, followed by Phase 5 for ComfyUI workflow execution and generated texture-map ingestion.
