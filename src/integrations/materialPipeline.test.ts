import { describe, expect, it } from 'vitest';
import { grabientAdapter } from './grabient/adapter';
import { grabientPalettes } from '../data/grabientPalettes';
import { createArmorPaintImportManifest } from './armorpaint';
import type { MaterialAsset } from '../types/material';

const asset: MaterialAsset = {
  id: 'material-metal', surface: 'metal', name: 'Obsidian Metal', version: 1,
  parameters: { baseColor: '#111315', roughness: .2, metalness: .9, clearcoat: .4, clearcoatRoughness: .1, transmission: 0, ior: 1.5 },
  textures: { baseColor: { channel: 'baseColor', url: '/base.png', generated: true }, normal: { channel: 'normal', url: '/normal.png', generated: true } }, metadata: {},
};

describe('unified material pipeline contracts', () => {
  it('applies Grabient without mutating the source asset', () => {
    const palette = grabientPalettes[0];
    const next = grabientAdapter.applyToMaterial(asset, palette);
    expect(next).not.toBe(asset);
    expect(next.version).toBe(2);
    expect(next.metadata.grabientPaletteId).toBe(palette.id);
    expect(asset.parameters.baseColor).toBe('#111315');
  });

  it('produces an ArmorPaint manifest from generated texture references', () => {
    const manifest = createArmorPaintImportManifest(asset);
    expect(manifest.textures.map((item) => item.channel)).toEqual(['baseColor', 'normal']);
    expect(manifest.textures[0]?.filename).toBe('Obsidian_Metal_basecolor.png');
  });
});
