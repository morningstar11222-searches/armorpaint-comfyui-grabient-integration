import { useCallback, useMemo, useRef, useState } from 'react';
import type { MaterialAsset, TextureChannel, TextureReference } from '../types/material';
import { comfyUIClient, type ComfyExecutionState, type ComfyWorkflow } from '../integrations/comfyui';

const CHANNELS: TextureChannel[] = ['baseColor', 'normal', 'roughness', 'metallic', 'height', 'mask'];

function replaceTextures(asset: MaterialAsset, textures: Partial<Record<TextureChannel, TextureReference>>): MaterialAsset {
  const next = { ...asset, version: asset.version + 1, textures: { ...asset.textures } };
  for (const channel of CHANNELS) {
    if (textures[channel]) next.textures[channel] = textures[channel];
  }
  return next;
}

export function useComfyGeneration(clientId = `armorpaint-${crypto.randomUUID()}`) {
  const [state, setState] = useState<ComfyExecutionState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (workflow: ComfyWorkflow, onTextures: (textures: Partial<Record<TextureChannel, TextureReference>>) => void) => {
    controllerRef.current?.abort();
    const controller = new AbortController(); controllerRef.current = controller;
    try {
      const queued = await comfyUIClient.queue(workflow, clientId);
      setState({ status: 'queued', promptId: queued.prompt_id });
      setState({ status: 'running', promptId: queued.prompt_id });
      const textures = await comfyUIClient.waitForOutputs(queued.prompt_id, controller.signal);
      onTextures(textures);
      setState({ status: 'complete', promptId: queued.prompt_id, textures });
      return textures;
    } catch (error) {
      if (controller.signal.aborted) return undefined;
      const message = error instanceof Error ? error.message : 'Unknown ComfyUI error';
      setState({ status: 'error', message });
      return undefined;
    }
  }, [clientId]);

  const cancel = useCallback(() => controllerRef.current?.abort(), []);
  const reset = useCallback(() => setState({ status: 'idle' }), []);
  return useMemo(() => ({ state, generate, cancel, reset }), [state, generate, cancel, reset]);
}

export function ingestGeneratedTextures(asset: MaterialAsset, textures: Partial<Record<TextureChannel, TextureReference>>) {
  return replaceTextures(asset, textures);
}
