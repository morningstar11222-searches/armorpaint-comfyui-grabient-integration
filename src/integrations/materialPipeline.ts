import type { ComfyWorkflow } from './comfyui';
import { bindMaterialToWorkflow, type WorkflowBindings } from './textureWorkflow';
import { comfyUIClient } from './comfyui';
import { grabientAdapter } from './grabient/adapter';
import { createArmorPaintImportManifest, type ArmorPaintImportManifest } from './armorpaint';
import type { GrabientPalette } from '../types/grabient';
import type { MaterialAsset, TextureChannel, TextureReference } from '../types/material';

export type MaterialPipelineResult = {
  asset: MaterialAsset;
  textures: Partial<Record<TextureChannel, TextureReference>>;
  armorPaintManifest: ArmorPaintImportManifest;
};

export type MaterialPipelineOptions = {
  workflow?: ComfyWorkflow;
  workflowBindings?: WorkflowBindings;
  clientId?: string;
  signal?: AbortSignal;
  onStatus?: (status: 'palette' | 'queued' | 'generating' | 'complete') => void;
};

export async function runMaterialPipeline(asset: MaterialAsset, palette: GrabientPalette | undefined, options: MaterialPipelineOptions = {}): Promise<MaterialPipelineResult> {
  let nextAsset = asset;
  options.onStatus?.('palette');
  if (palette) nextAsset = grabientAdapter.applyToMaterial(nextAsset, palette);

  let textures: Partial<Record<TextureChannel, TextureReference>> = nextAsset.textures;
  if (options.workflow) {
    const workflow = bindMaterialToWorkflow(options.workflow, nextAsset, options.workflowBindings ?? {});
    options.onStatus?.('queued');
    const queued = await comfyUIClient.queue(workflow, options.clientId);
    options.onStatus?.('generating');
    textures = await comfyUIClient.waitForOutputs(queued.prompt_id, options.signal);
    nextAsset = { ...nextAsset, version: nextAsset.version + 1, textures: { ...nextAsset.textures, ...textures } };
    options.onStatus?.('complete');
  }

  return { asset: nextAsset, textures, armorPaintManifest: createArmorPaintImportManifest(nextAsset) };
}
