import type { ComfyWorkflow } from './integrations/comfyui';

export function getConfiguredComfyWorkflow(): ComfyWorkflow | undefined {
  const raw = import.meta.env.VITE_COMFY_WORKFLOW_JSON;
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('Workflow must be an object');
    return parsed as ComfyWorkflow;
  } catch (error) {
    throw new Error(`Invalid VITE_COMFY_WORKFLOW_JSON: ${error instanceof Error ? error.message : 'invalid JSON'}`);
  }
}
