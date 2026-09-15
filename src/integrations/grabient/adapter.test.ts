import { describe, expect, it } from 'vitest';
import { applyGrabientToMaterial, mapGrabientToMaterial, sampleGrabient } from './adapter';
import { grabientPalettes } from '../../data/grabientPalettes';
import type { MaterialAsset } from '../../types/material';

describe('Grabient adapter', () => {
  const palette = grabientPalettes[0]!;

  it('samples a deterministic palette with the requested number of stops', () => {
    expect(sampleGrabient(palette, 5)).toHaveLength(5);
    expect(sampleGrabient(palette, 5)).toEqual(sampleGrabient(palette, 5));
    expect(sampleGrabient(palette, 5).every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
  });

  it('maps a palette to material color data', () => {
    const mapping = mapGrabientToMaterial(palette);
    expect(mapping.sourcePaletteId).toBe(palette.id);
    expect(mapping.gradient).toHaveLength(9);
    expect(mapping.baseColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(mapping.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('applies palette metadata without destroying PBR parameters', () => {
    const asset: MaterialAsset = {
      id: 'material-metal', surface: 'metal', name: 'Obsidian Metal', version: 2,
      parameters: { baseColor: '#161b20', roughness: 0.14, metalness: 0.96, clearcoat: 1, clearcoatRoughness: 0.06, transmission: 0, ior: 1.5 },
      textures: {},
    };
    const next = applyGrabientToMaterial(asset, palette);
    expect(next.version).toBe(3);
    expect(next.parameters.roughness).toBe(asset.parameters.roughness);
    expect(next.parameters.metalness).toBe(asset.parameters.metalness);
    expect(next.metadata?.grabientPaletteId).toBe(palette.id);
    expect(next.parameters.baseColor).not.toBe(asset.parameters.baseColor);
  });
});
