import type { MaterialAsset } from '../../types/material';
import type { CosineCoefficients, GrabientAdapter, GrabientMaterialMapping, GrabientPalette } from '../../types/grabient';

const TAU = Math.PI * 2;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const hex = (value: number) => Math.round(clamp(value) * 255).toString(16).padStart(2, '0');
const rgbToHex = (r: number, g: number, b: number) => `#${hex(r)}${hex(g)}${hex(b)}`;

function normalizeCoefficients(coefficients: CosineCoefficients, globals?: GrabientPalette['globals']): CosineCoefficients {
  if (!globals) return coefficients;
  const [offset, amplitude, frequency, phase] = globals;
  return coefficients.map((row, index) => row.map((value) => {
    const modifier = [offset, amplitude, frequency, phase][index] ?? 0;
    return index === 0 || index === 3 ? value + modifier : value * modifier;
  }) as [number, number, number]) as CosineCoefficients;
}

export function sampleGrabient(palette: GrabientPalette, steps = 9): string[] {
  const count = Math.max(2, Math.min(64, Math.floor(steps)));
  const [a, b, c, d] = normalizeCoefficients(palette.coefficients, palette.globals);
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    return rgbToHex(
      a[0] + b[0] * Math.cos(TAU * (c[0] * t + d[0])),
      a[1] + b[1] * Math.cos(TAU * (c[1] * t + d[1])),
      a[2] + b[2] * Math.cos(TAU * (c[2] * t + d[2])),
    );
  });
}

function luminance(value: string) {
  const raw = value.slice(1);
  return 0.299 * parseInt(raw.slice(0, 2), 16) + 0.587 * parseInt(raw.slice(2, 4), 16) + 0.114 * parseInt(raw.slice(4, 6), 16);
}

export function mapGrabientToMaterial(palette: GrabientPalette): GrabientMaterialMapping {
  const gradient = sampleGrabient(palette);
  const sorted = [...gradient].sort((a, b) => luminance(b) - luminance(a));
  return { baseColor: gradient[Math.floor(gradient.length / 2)] ?? '#111315', accentColor: sorted[0] ?? '#ffffff', gradient, sourcePaletteId: palette.id };
}

export function applyGrabientToMaterial(asset: MaterialAsset, palette: GrabientPalette): MaterialAsset {
  const mapped = mapGrabientToMaterial(palette);
  return { ...asset, version: asset.version + 1, parameters: { ...asset.parameters, baseColor: mapped.baseColor }, metadata: { ...asset.metadata, grabientPaletteId: palette.id, grabientPaletteName: palette.name, grabientGradient: mapped.gradient, grabientAccentColor: mapped.accentColor } };
}

export const grabientAdapter: GrabientAdapter = { sample: sampleGrabient, mapToMaterial: mapGrabientToMaterial, applyToMaterial: applyGrabientToMaterial };
