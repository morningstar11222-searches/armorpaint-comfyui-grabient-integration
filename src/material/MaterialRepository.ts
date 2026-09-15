import type { MaterialAsset, TextureChannel, TextureReference } from '../types/material';
import type { SurfaceId } from '../three/OrigamiStage';

export type MaterialPatch = Partial<MaterialAsset['parameters']> & { textures?: Partial<Record<TextureChannel, TextureReference>> };

export interface MaterialRepository {
  get(surface: SurfaceId): MaterialAsset;
  update(surface: SurfaceId, patch: MaterialPatch): MaterialAsset;
  reset(surface: SurfaceId): MaterialAsset;
  serialize(surface: SurfaceId): string;
}

export function createMaterialRepository(initial: Record<SurfaceId, MaterialAsset>): MaterialRepository {
  const assets = structuredClone(initial);
  return {
    get: (surface) => structuredClone(assets[surface]),
    update: (surface, patch) => {
      const current = assets[surface];
      assets[surface] = { ...current, version: current.version + 1, parameters: { ...current.parameters, ...patch }, textures: { ...current.textures, ...(patch.textures ?? {}) } };
      delete (assets[surface].parameters as Record<string, unknown>).textures;
      return structuredClone(assets[surface]);
    },
    reset: (surface) => {
      assets[surface] = structuredClone(initial[surface]);
      return structuredClone(assets[surface]);
    },
    serialize: (surface) => JSON.stringify(assets[surface], null, 2),
  };
}
