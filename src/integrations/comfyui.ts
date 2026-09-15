import type { TextureChannel, TextureReference } from '../types/material';

export type ComfyWorkflow = Record<string, { class_type?: string; inputs?: Record<string, unknown> }>;

export type ComfyOutput = {
  filename: string;
  subfolder?: string;
  type?: string;
  channel?: TextureChannel;
};

export type ComfyPromptResult = { prompt_id: string; number?: number; node_errors?: Record<string, unknown> };

export type ComfyExecutionState =
  | { status: 'idle' }
  | { status: 'queued'; promptId: string }
  | { status: 'running'; promptId: string }
  | { status: 'complete'; promptId: string; textures: Partial<Record<TextureChannel, TextureReference>> }
  | { status: 'error'; message: string; promptId?: string };

const DEFAULT_BASE_URL = '/comfy';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '');
}

function channelFromName(filename: string): TextureChannel | undefined {
  const name = filename.toLowerCase();
  if (/base.?color|albedo|diffuse/.test(name)) return 'baseColor';
  if (/normal|nrm/.test(name)) return 'normal';
  if (/rough/.test(name)) return 'roughness';
  if (/metal|metallic/.test(name)) return 'metallic';
  if (/height|displace|depth/.test(name)) return 'height';
  if (/mask|ao|ambient.?occlusion/.test(name)) return 'mask';
  return undefined;
}

function outputUrl(baseUrl: string, output: ComfyOutput) {
  const params = new URLSearchParams({ filename: output.filename, subfolder: output.subfolder ?? '', type: output.type ?? 'output' });
  return `${normalizeBaseUrl(baseUrl)}/view?${params.toString()}`;
}

export class ComfyUIClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseUrl = DEFAULT_BASE_URL, fetchImpl: typeof fetch = fetch) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.fetchImpl = fetchImpl;
  }

  async queue(workflow: ComfyWorkflow, clientId: string): Promise<ComfyPromptResult> {
    const response = await this.fetchImpl(`${this.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    });
    if (!response.ok) throw new Error(`ComfyUI queue failed (${response.status})`);
    const result = (await response.json()) as ComfyPromptResult;
    if (!result.prompt_id) throw new Error('ComfyUI returned no prompt_id');
    return result;
  }

  async history(promptId: string): Promise<Record<string, { outputs?: Record<string, { images?: ComfyOutput[] }> }>> {
    const response = await this.fetchImpl(`${this.baseUrl}/history/${encodeURIComponent(promptId)}`);
    if (!response.ok) throw new Error(`ComfyUI history failed (${response.status})`);
    return (await response.json()) as Record<string, { outputs?: Record<string, { images?: ComfyOutput[] }> }>;
  }

  async waitForOutputs(promptId: string, signal?: AbortSignal, timeoutMs = 10 * 60_000): Promise<Partial<Record<TextureChannel, TextureReference>>> {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (signal?.aborted) throw new DOMException('ComfyUI execution cancelled', 'AbortError');
      const history = await this.history(promptId);
      const entry = history[promptId];
      if (entry?.outputs) {
        const textures: Partial<Record<TextureChannel, TextureReference>> = {};
        for (const nodeOutput of Object.values(entry.outputs)) {
          for (const image of nodeOutput.images ?? []) {
            const channel = image.channel ?? channelFromName(image.filename);
            if (!channel) continue;
            textures[channel] = {
              channel,
              url: outputUrl(this.baseUrl, image),
              assetId: `${promptId}:${image.subfolder ?? ''}/${image.filename}`,
              generated: true,
            };
          }
        }
        if (Object.keys(textures).length > 0) return textures;
      }
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(resolve, 750);
        signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('ComfyUI execution cancelled', 'AbortError')); }, { once: true });
      });
    }
    throw new Error('Timed out waiting for ComfyUI outputs');
  }

  async execute(workflow: ComfyWorkflow, clientId: string, signal?: AbortSignal) {
    const queued = await this.queue(workflow, clientId);
    const textures = await this.waitForOutputs(queued.prompt_id, signal);
    return { ...queued, textures };
  }
}

export const comfyUIClient = new ComfyUIClient();
