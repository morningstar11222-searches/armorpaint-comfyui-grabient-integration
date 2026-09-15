import type { MaterialAsset, TextureChannel } from '../types/material';

export type ArmorPaintTextureSlot = {
  channel: TextureChannel;
  filename: string;
  sourceUrl: string;
};

export type ArmorPaintImportManifest = {
  version: 1;
  materialId: string;
  materialName: string;
  projectSurface: MaterialAsset['surface'];
  textures: ArmorPaintTextureSlot[];
};

export type ArmorPaintCommandPlan = {
  executable: string;
  args: string[];
  manifest: ArmorPaintImportManifest;
};

const IMPORTABLE_CHANNELS: TextureChannel[] = [
  'baseColor',
  'normal',
  'roughness',
  'metallic',
  'height',
  'mask',
];

const channelSuffix: Record<TextureChannel, string> = {
  baseColor: 'basecolor',
  normal: 'normal',
  roughness: 'roughness',
  metallic: 'metallic',
  height: 'height',
  mask: 'mask',
};

function safeName(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'material';
}

export function createArmorPaintImportManifest(asset: MaterialAsset): ArmorPaintImportManifest {
  const materialName = safeName(asset.name);
  const textures = IMPORTABLE_CHANNELS.flatMap((channel) => {
    const reference = asset.textures[channel];
    if (!reference?.url) return [];
    return [{
      channel,
      filename: `${materialName}_${channelSuffix[channel]}.png`,
      sourceUrl: reference.url,
    }];
  });

  return {
    version: 1,
    materialId: asset.id,
    materialName,
    projectSurface: asset.surface,
    textures,
  };
}

/**
 * Produces the documented ArmorPaint CLI invocation for an existing project.
 * Texture import itself is intentionally represented by the manifest because
 * ArmorPaint's documented CLI exposes project/script/export controls rather
 * than a direct texture-import argument.
 */
export function createArmorPaintCommandPlan(
  asset: MaterialAsset,
  projectPath: string,
  executable = 'armorpaint',
): ArmorPaintCommandPlan {
  const manifest = createArmorPaintImportManifest(asset);
  return {
    executable,
    args: [projectPath],
    manifest,
  };
}

export function createArmorPaintTextureDropUrls(asset: MaterialAsset) {
  return createArmorPaintImportManifest(asset).textures.map(({ channel, sourceUrl }) => ({
    channel,
    sourceUrl,
  }));
}
