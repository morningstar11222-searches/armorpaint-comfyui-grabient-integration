import { describe, expect, it } from 'vitest';
import { createArmorPaintCommandPlan, createArmorPaintImportManifest } from './armorpaint';
import type { MaterialAsset } from '../types/material';

const asset: MaterialAsset = {
  id: 'metal-1',
  surface: 'metal',
  name: 'Brushed Steel / Hero',
  version: 4,
  parameters: {
    baseColor: '#8a8f98',
    roughness: 0.32,
    metalness: 0.95,
    clearcoat: 0.2,
    clearcoatRoughness: 0.15,
    transmission: 0,
    ior: 1.5,
  },
  textures: {
    baseColor: { channel: 'baseColor', url: '/comfy/view?filename=basecolor.png', generated: true },
    normal: { channel: 'normal', url: '/comfy/view?filename=normal.png', generated: true },
    roughness: { channel: 'roughness', url: '/comfy/view?filename=roughness.png', generated: true },
    metallic: { channel: 'metallic', url: '/comfy/view?filename=metallic.png', generated: true },
  },
};

describe('ArmorPaint texture bridge', () => {
  it('creates deterministic import slots from generated texture references', () => {
    const manifest = createArmorPaintImportManifest(asset);

    expect(manifest.version).toBe(1);
    expect(manifest.materialName).toBe('Brushed_Steel_Hero');
    expect(manifest.textures).toEqual([
      { channel: 'baseColor', filename: 'Brushed_Steel_Hero_basecolor.png', sourceUrl: '/comfy/view?filename=basecolor.png' },
      { channel: 'normal', filename: 'Brushed_Steel_Hero_normal.png', sourceUrl: '/comfy/view?filename=normal.png' },
      { channel: 'roughness', filename: 'Brushed_Steel_Hero_roughness.png', sourceUrl: '/comfy/view?filename=roughness.png' },
      { channel: 'metallic', filename: 'Brushed_Steel_Hero_metallic.png', sourceUrl: '/comfy/view?filename=metallic.png' },
    ]);
  });

  it('does not fabricate missing texture channels', () => {
    const manifest = createArmorPaintImportManifest({ ...asset, textures: {} });
    expect(manifest.textures).toEqual([]);
  });

  it('keeps the ArmorPaint command plan separate from texture localization', () => {
    const plan = createArmorPaintCommandPlan(asset, 'C:/Projects/material.arm', 'armorpaint.exe');
    expect(plan.executable).toBe('armorpaint.exe');
    expect(plan.args).toEqual(['C:/Projects/material.arm']);
    expect(plan.manifest.materialId).toBe(asset.id);
  });
});
