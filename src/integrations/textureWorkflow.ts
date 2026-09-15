import type { ComfyWorkflow } from './comfyui';
import type { MaterialAsset } from '../types/material';

export type WorkflowBindings = Record<string, { input: string; parameter: keyof MaterialAsset['parameters'] }>;

/** Creates a workflow copy with material parameters injected into configured node inputs. */
export function bindMaterialToWorkflow(workflow: ComfyWorkflow, asset: MaterialAsset, bindings: WorkflowBindings): ComfyWorkflow {
  const next: ComfyWorkflow = structuredClone(workflow);
  for (const [nodeId, binding] of Object.entries(bindings)) {
    const node = next[nodeId];
    if (!node) continue;
    node.inputs ??= {};
    node.inputs[binding.input] = asset.parameters[binding.parameter];
  }
  return next;
}
