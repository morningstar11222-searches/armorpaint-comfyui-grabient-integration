# ArmorPaint × ComfyUI × Grabient Integration

Integrated material workspace combining an ArmorPaint-oriented 3D surface workflow, ComfyUI generation, and Grabient color workflows.

## Phase 1 — UI architecture

Phase 1 establishes the production frontend shell while preserving the approved visual direction:

- React + TypeScript + Vite application structure.
- Three.js scene isolated in `src/three/OrigamiStage.tsx`.
- Interactive origami/octahedral surface with slow rotation, pointer parallax, hover response, raycast selection, and selected-facet extraction.
- Cinematic workspace-to-detail-panel transition.
- Detail panel divided vertically into two equal regions: material showcase above, information below.
- Responsive behavior for desktop, tablet, and mobile widths.
- Surface registry in `src/App.tsx`, ready to move into a domain package during later phases.
- Production-safe dependency bundling through Vite rather than CDN scripts.

## Development

```bash
npm install
npm run dev
```

Validation commands:

```bash
npm run typecheck
npm run build
```

## Phase boundary

Phase 1 does **not** claim the Phase 2 material engine or the ComfyUI/Grabient/ArmorPaint integrations are complete. The current material preview is a UI placeholder; real PBR material rendering begins in Phase 2.

## Next phase

Phase 2 replaces the material preview with a reusable Three.js PBR material viewer and material-definition pipeline while preserving the Phase 1 choreography and information architecture.
