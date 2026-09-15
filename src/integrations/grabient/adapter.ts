import type { MaterialAsset } from '../../types/material';
import type { CosineCoefficients, GrabientAdapter, GrabientMaterialMapping, GrabientPalette } from '../../types/grabient';

const TAU = Math.PI * 2;

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function hex(value: number) {
  return Math.round(clamp(value) * 255).toString(16).padStart(2, '0');
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function normalizeCoefficients(coefficients: CosineCoefficients, globals?: GrabientPalette['globals']): CosineCoefficients {
  if (!globals) return coefficients;
  const [offset, amplitude, frequency, phase] = globals;
  return coefficients.map((row, index) => {
    const modifier = [offset, amplitude, frequency, phase][index] ?? 0;
    return row.map((value) => {
      if (index === 0 || index === 3) return value + modifier;
      if (index === 1 || index === 2) return value * modifier;
      return value;
    }) as [number, number, number];
  }) as CosineCoefficients;
}

export function sampleGrabient(palette: GrabientPalette, steps = 9): string[] {
  const count = Math.max(2, Math.min(64, Math.floor(steps)));
  const coefficients = normalizeCoefficients(palette.coefficients, palette.globals);
  const [a, b, c, d] = coefficients;
  return Array.from({ length: count }, (_, index) => {
    const t = count > 1 ? index / (count - 1) : 0;
    return rgbToHex(
      (a[0] ?? 0) + (b[0] ?? 0) * Math.cos(TAU * ((c[0] ?? 0) * t + (d[0] ?? 0))),
      (a[1] ?? 0) + (b[1] ?? 0) * Math.cos(TAU * ((c[1] ?? 0) * t + (d[1] ?? 0))),
      (a[2] ?? 0) + (b[2] ?? 0) * Math.cos(TAU * ((c[2] ?? 0) * t + (d[2] ?? 0))),
    );
  });
}

function luminance(hexColor: string) {
  const raw = hexColor.replace('#', '');
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function mapGrabientToMaterial(palette: GrabientPalette): GrabientMaterialMapping {
  const gradient = sampleGrabient(palette, 9);
  const sorted = [...gradient].sort((left, right) => luminance(right) - luminance(left));
  return {
    baseColor: gradient[Math.floor(gradient.length / 2)] ?? '#111315',
    accentColor: sorted[0] ?? '#ffffff',
    gradient,
    sourcePaletteId: palette.id,
  };
}

export function applyGrabientToMaterial(asset: MaterialAsset, palette: GrabientPalette): MaterialAsset {
  const mapped = mapGrabientToMaterial(palette);
  return {
    ...asset,
    version: asset.version + 1,
    parameters: {
      ...asset.parameters,
      baseColor: mapped.baseColor,
    },
    metadata: {
      ...asset.metadata,
      grabientPaletteId: palette.id,
      grabientPaletteName: palette.name,
      grabientGradient: mapped.gradient,
      grabientAccentColor: mapped.accentColor,
    },
  };
}

export const grabientAdapter: GrabientAdapter = {
  sample: sampleGrabient,
  mapToMaterial: mapGrabientToMaterial,
  applyToMaterial: applyGrabientToMaterial,
};
