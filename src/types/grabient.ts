import type { MaterialAsset } from './material';

export type CosineCoefficients = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

export type GrabientPalette = {
  id: string;
  name: string;
  coefficients: CosineCoefficients;
  globals?: [number, number, number, number];
};

export type GrabientMaterialMapping = {
  baseColor: string;
  accentColor: string;
  gradient: string[];
  sourcePaletteId: string;
};

export type GrabientAdapter = {
  sample(palette: GrabientPalette, steps?: number): string[];
  mapToMaterial(palette: GrabientPalette): GrabientMaterialMapping;
  applyToMaterial(asset: MaterialAsset, palette: GrabientPalette): MaterialAsset;
};
