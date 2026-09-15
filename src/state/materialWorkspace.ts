import { useCallback, useMemo, useState } from 'react';
import { materialDefinitions } from '../data/materials';
import type { SurfaceId } from '../three/OrigamiStage';
import type { MaterialAsset, TextureChannel, TextureReference } from '../types/material';

function assetFromSurface(surface: SurfaceId): MaterialAsset {
  const def = materialDefinitions[surface];
  return {
    id: `material-${surface}`, surface, name: def.label, version: 1,
    parameters: { baseColor: def.baseColor, roughness: def.roughness, metalness: def.metalness, clearcoat: def.clearcoat, clearcoatRoughness: def.clearcoatRoughness, transmission: def.transmission, ior: def.ior },
    textures: {}, metadata: {},
  };
}

export function useMaterialWorkspace(surface: SurfaceId) {
  const [assets, setAssets] = useState<Record<SurfaceId, MaterialAsset>>(() => ({
    metal: assetFromSurface('metal'), stone: assetFromSurface('stone'), glass: assetFromSurface('glass'), acrylic: assetFromSurface('acrylic'), pvc: assetFromSurface('pvc'), carbon: assetFromSurface('carbon'),
  }));
  const asset = assets[surface];
  const updateAsset = useCallback((next: MaterialAsset) => setAssets((current) => ({ ...current, [surface]: next })), [surface]);
  const updateParameter = useCallback(<K extends keyof MaterialAsset['parameters']>(key: K, value: MaterialAsset['parameters'][K]) => {
    setAssets((current) => ({ ...current, [surface]: { ...current[surface], version: current[surface].version + 1, parameters: { ...current[surface].parameters, [key]: value } } }));
  }, [surface]);
  const ingestTextures = useCallback((textures: Partial<Record<TextureChannel, TextureReference>>) => {
    setAssets((current) => ({ ...current, [surface]: { ...current[surface], version: current[surface].version + 1, textures: { ...current[surface].textures, ...textures } } }));
  }, [surface]);
  const reset = useCallback(() => setAssets((current) => ({ ...current, [surface]: assetFromSurface(surface) })), [surface]);
  return useMemo(() => ({ asset, updateAsset, updateParameter, ingestTextures, reset }), [asset, ingestTextures, reset, updateAsset, updateParameter]);
}
