import type { SurfaceId } from '../three/OrigamiStage';

export type MaterialDefinition = {
  id: SurfaceId;
  label: string;
  baseColor: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  ior: number;
  envIntensity: number;
  noiseScale: number;
  noiseStrength: number;
  description: string;
};

export const materialDefinitions: Record<SurfaceId, MaterialDefinition> = {
  metal: { id: 'metal', label: 'OBSIDIAN METAL', baseColor: '#161b20', roughness: 0.14, metalness: 0.96, clearcoat: 1, clearcoatRoughness: 0.06, transmission: 0, ior: 1.5, envIntensity: 1.8, noiseScale: 5, noiseStrength: 0.035, description: 'Polished dark metal with controlled micro-surface breakup.' },
  stone: { id: 'stone', label: 'BLACK STONE', baseColor: '#171817', roughness: 0.42, metalness: 0.02, clearcoat: 0.18, clearcoatRoughness: 0.2, transmission: 0, ior: 1.5, envIntensity: 1.15, noiseScale: 3.2, noiseStrength: 0.18, description: 'Dense mineral surface with natural roughness variation.' },
  glass: { id: 'glass', label: 'SMOKED GLASS', baseColor: '#10161a', roughness: 0.08, metalness: 0.05, clearcoat: 0.9, clearcoatRoughness: 0.05, transmission: 0.82, ior: 1.46, envIntensity: 1.6, noiseScale: 2.4, noiseStrength: 0.02, description: 'Smoked architectural glass with transmission and edge response.' },
  acrylic: { id: 'acrylic', label: 'BLACK ACRYLIC', baseColor: '#0b0e10', roughness: 0.09, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.035, transmission: 0.04, ior: 1.49, envIntensity: 1.7, noiseScale: 4, noiseStrength: 0.025, description: 'High-gloss polymer with a crisp coated reflection.' },
  pvc: { id: 'pvc', label: 'GRAPHITE PVC', baseColor: '#202326', roughness: 0.3, metalness: 0.08, clearcoat: 0.35, clearcoatRoughness: 0.16, transmission: 0, ior: 1.5, envIntensity: 1.25, noiseScale: 7, noiseStrength: 0.06, description: 'Industrial satin polymer with restrained microtexture.' },
  carbon: { id: 'carbon', label: 'CARBON COMPOSITE', baseColor: '#111315', roughness: 0.24, metalness: 0.35, clearcoat: 0.55, clearcoatRoughness: 0.1, transmission: 0, ior: 1.5, envIntensity: 1.4, noiseScale: 18, noiseStrength: 0.11, description: 'Technical composite with a woven-ready directional surface.' },
};
