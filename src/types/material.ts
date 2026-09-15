import type { SurfaceId } from '../three/OrigamiStage';

export type TextureChannel = 'baseColor' | 'normal' | 'roughness' | 'metallic' | 'height' | 'mask';

export type TextureReference = {
  channel: TextureChannel;
  url?: string;
  assetId?: string;
  generated?: boolean;
};

export type MaterialMetadata = {
  grabientPaletteId?: string;
  grabientPaletteName?: string;
  grabientGradient?: string[];
  grabientAccentColor?: string;
};

export type MaterialAsset = {
  id: string;
  surface: SurfaceId;
  name: string;
  version: number;
  parameters: {
    baseColor: string;
    roughness: number;
    metalness: number;
    clearcoat: number;
    clearcoatRoughness: number;
    transmission: number;
    ior: number;
  };
  textures: Partial<Record<TextureChannel, TextureReference>>;
  metadata?: MaterialMetadata;
};
