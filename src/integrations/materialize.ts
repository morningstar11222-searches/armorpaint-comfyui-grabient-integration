import type { ArmorPaintImportManifest } from './armorpaint';
import type { TextureChannel } from '../types/material';

export type MaterializedTexture = { channel: TextureChannel; filename: string; bytes: Blob };

export async function materializeTexture(url: string, filename: string): Promise<MaterializedTexture> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Texture download failed (${response.status}): ${filename}`);
  return { channel: inferChannel(filename), filename, bytes: await response.blob() };
}

function inferChannel(filename: string): TextureChannel {
  const value = filename.toLowerCase();
  if (value.includes('basecolor')) return 'baseColor';
  if (value.includes('normal')) return 'normal';
  if (value.includes('roughness')) return 'roughness';
  if (value.includes('metallic')) return 'metallic';
  if (value.includes('height')) return 'height';
  return 'mask';
}

export async function materializeArmorPaintManifest(manifest: ArmorPaintImportManifest): Promise<MaterializedTexture[]> {
  return Promise.all(manifest.textures.map((texture) => materializeTexture(texture.sourceUrl, texture.filename)));
}

export async function saveMaterializedTexture(texture: MaterializedTexture): Promise<void> {
  const picker = (window as Window & { showSaveFilePicker?: (options?: unknown) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }> }).showSaveFilePicker;
  if (picker) {
    const handle = await picker({ suggestedName: texture.filename, types: [{ description: 'PNG image', accept: { 'image/png': ['.png'] } }] });
    const writable = await handle.createWritable();
    await writable.write(texture.bytes);
    await writable.close();
    return;
  }
  const href = URL.createObjectURL(texture.bytes);
  const link = document.createElement('a');
  link.href = href; link.download = texture.filename; link.click();
  URL.revokeObjectURL(href);
}
