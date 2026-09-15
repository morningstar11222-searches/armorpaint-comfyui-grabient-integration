import type { ComfyWorkflow } from './integrations/comfyui';
import type { WorkflowBindings } from './integrations/textureWorkflow';

function parseJsonEnv(name: string): unknown {
  const raw = import.meta.env[name];
  if (!raw) return undefined;
  try { return JSON.parse(raw); }
  catch (error) { throw new Error(`Invalid ${name}: ${error instanceof Error ? error.message : 'invalid JSON'}`); }
}

export function getConfiguredComfyWorkflow(): ComfyWorkflow | undefined {
  const parsed = parseJsonEnv('VITE_COMFY_WORKFLOW_JSON');
  if (!parsed) return undefined;
  if (typeof parsed !== 'object') throw new Error('VITE_COMFY_WORKFLOW_JSON must contain an object');
  return parsed as ComfyWorkflow;
}

export function getConfiguredWorkflowBindings(): WorkflowBindings {
  const parsed = parseJsonEnv('VITE_COMFY_WORKFLOW_BINDINGS_JSON');
  if (!parsed) return {};
  if (typeof parsed !== 'object') throw new Error('VITE_COMFY_WORKFLOW_BINDINGS_JSON must contain an object');
  return parsed as WorkflowBindings;
}
