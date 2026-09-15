import { useCallback, useMemo, useRef, useState } from 'react';
import { materialDefinitions } from '../data/materials';
import { createMaterialRepository, type MaterialRepository } from '../material/MaterialRepository';
import type { SurfaceId } from '../three/OrigamiStage';
import type { MaterialAsset } from '../types/material';

function assetFromSurface(surface: SurfaceId): MaterialAsset {
  const def = materialDefinitions[surface];
  return { id: `material-${surface}`, surface, name: def.label, version: 1, parameters: { baseColor: def.baseColor, roughness: def.roughness, metalness: def.metalness, clearcoat: def.clearcoat, clearcoatRoughness: def.clearcoatRoughness, transmission: def.transmission, ior: def.ior }, textures: {} };
}

function createInitialAssets(): Record<SurfaceId, MaterialAsset> {
  return { metal: assetFromSurface('metal'), stone: assetFromSurface('stone'), glass: assetFromSurface('glass'), acrylic: assetFromSurface('acrylic'), pvc: assetFromSurface('pvc'), carbon: assetFromSurface('carbon') };
}

export function useMaterialWorkspace(surface: SurfaceId) {
  const repositoryRef = useRef<MaterialRepository | null>(null);
  if (!repositoryRef.current) repositoryRef.current = createMaterialRepository(createInitialAssets());
  const repository = repositoryRef.current;
  const [asset, setAsset] = useState(() => repository.get(surface));

  const updateParameter = useCallback(<K extends keyof MaterialAsset['parameters']>(key: K, value: MaterialAsset['parameters'][K]) => {
    setAsset(repository.update(surface, { [key]: value }));
  }, [repository, surface]);
  const reset = useCallback(() => setAsset(repository.reset(surface)), [repository, surface]);

  return useMemo(() => ({ asset, updateParameter, reset, serialize: () => repository.serialize(surface) }), [asset, reset, repository, surface, updateParameter]);
}
