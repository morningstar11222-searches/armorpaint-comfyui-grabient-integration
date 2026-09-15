import { describe, expect, it } from 'vitest';
import { ComfyUIClient } from './comfyui';

function response(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), { ok, status, headers: { 'Content-Type': 'application/json' } });
}

describe('ComfyUIClient', () => {
  it('queues a workflow and ingests named PBR outputs', async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      if (String(input).endsWith('/prompt')) return response({ prompt_id: 'abc123' });
      return response({ abc123: { outputs: { '10': { images: [
        { filename: 'stone_baseColor.png', subfolder: '', type: 'output' },
        { filename: 'stone_normal.png', subfolder: 'materials', type: 'output' },
        { filename: 'stone_roughness.png', subfolder: '', type: 'output' },
        { filename: 'stone_metallic.png', subfolder: '', type: 'output' },
      ] } } } });
    };
    const client = new ComfyUIClient('/comfy', fetchImpl as typeof fetch);
    const result = await client.execute({ '1': { class_type: 'SaveImage', inputs: {} } }, 'client-1');
    expect(result.prompt_id).toBe('abc123');
    expect(result.textures.baseColor?.generated).toBe(true);
    expect(result.textures.normal?.url).toContain('/view?');
    expect(result.textures.roughness?.generated).toBe(true);
    expect(result.textures.metallic?.generated).toBe(true);
    expect(calls[0].init?.method).toBe('POST');
  });
});
