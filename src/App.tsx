import { useCallback, useMemo, useState } from 'react';
import OrigamiStage, { type SurfaceSelection } from './three/OrigamiStage';
import MaterialViewer from './three/MaterialViewer';
import { surfaces } from './data/surfaces';
import { grabientPalettes } from './data/grabientPalettes';
import { grabientAdapter } from './integrations/grabient/adapter';
import { createArmorPaintImportManifest } from './integrations/armorpaint';
import { materializeArmorPaintManifest, saveMaterializedTexture } from './integrations/materialize';
import { runMaterialPipeline } from './integrations/materialPipeline';
import { getConfiguredComfyWorkflow, getConfiguredWorkflowBindings } from './config';
import { useMaterialWorkspace } from './state/materialWorkspace';

export default function App() {
  const [active, setActive] = useState<SurfaceSelection | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('READY');
  const selected = surfaces.find((surface) => surface.id === active?.id) ?? null;
  const material = useMaterialWorkspace(active?.id ?? 'metal');
  const palette = useMemo(() => material.asset.metadata.grabientPaletteId ? grabientPalettes.find((item) => item.id === material.asset.metadata.grabientPaletteId) : undefined, [material.asset.metadata.grabientPaletteId]);
  const gradient = palette ? grabientAdapter.sample(palette, 9) : [];
  const workflowConfigured = Boolean(import.meta.env.VITE_COMFY_WORKFLOW_JSON);
  const handleSelect = useCallback((selection: SurfaceSelection) => setActive(selection), []);

  const applyPalette = (id: string) => {
    const next = grabientPalettes.find((item) => item.id === id);
    if (!next) return;
    material.updateAsset(grabientAdapter.applyToMaterial(material.asset, next));
    setStatus(`PALETTE / ${next.name.toUpperCase()}`);
  };

  const generateMaps = async () => {
    if (!workflowConfigured) { setStatus('SET VITE_COMFY_WORKFLOW_JSON'); return; }
    setBusy(true); setStatus('PREPARING COMFYUI');
    try {
      const result = await runMaterialPipeline(material.asset, palette, {
        workflow: getConfiguredComfyWorkflow(), workflowBindings: getConfiguredWorkflowBindings(),
        onStatus: (next) => setStatus(next.toUpperCase()),
      });
      material.updateAsset(result.asset);
      setStatus(`GENERATED / ${Object.keys(result.textures).length} MAPS`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message.toUpperCase() : 'GENERATION FAILED');
    } finally { setBusy(false); }
  };

  const exportArmorPaint = async () => {
    const manifest = createArmorPaintImportManifest(material.asset);
    if (!manifest.textures.length) { setStatus('NO GENERATED TEXTURES'); return; }
    setBusy(true); setStatus('MATERIALIZING TEXTURES');
    try {
      const files = await materializeArmorPaintManifest(manifest);
      for (const file of files) await saveMaterializedTexture(file);
      setStatus(`ARMORPAINT READY / ${files.length} MAPS`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message.toUpperCase() : 'EXPORT FAILED');
    } finally { setBusy(false); }
  };

  return (
    <main className={active ? 'app is-open' : 'app'}>
      <section className="workspace" aria-label="Material workspace">
        <header className="masthead"><span>ARMORPAINT × COMFYUI × GRABIENT</span><span>UNIFIED MATERIAL PIPELINE</span></header>
        <div className="hero-copy"><span className="eyebrow">MATERIAL WORKSPACE</span><h1>Surface intelligence.</h1><p>Select a facet to expose its material and technical information.</p></div>
        <div className="origami-stage" aria-label="Interactive material facets"><OrigamiStage active={active} onSelect={handleSelect} /></div>
        <div className="cursor-hint">HOVER / SELECT SURFACE</div>
      </section>
      <aside className="detail-panel" aria-hidden={!selected}>
        <button className="close" onClick={() => setActive(null)} aria-label="Close material">×</button>
        {selected && (
          <div className="detail-content">
            <section className="material-showcase">
              <div className="material-label">LIVE MATERIAL <span>{status}</span></div>
              <MaterialViewer surface={selected.id} asset={material.asset} />
              <div className="material-caption">PBR PREVIEW / GENERATED MAPS / ASSET v{material.asset.version}</div>
            </section>
            <section className="information">
              <span className="eyebrow">INFORMATION</span><h2>{selected.title}</h2><p className="subtitle">{selected.subtitle}</p><p className="description">{selected.description}</p>
              <div className="specs">{selected.specs.map((spec) => <span key={spec}>{spec}</span>)}</div>
              <div className="palette-row" aria-label="Grabient palettes">{grabientPalettes.map((item) => <button key={item.id} onClick={() => applyPalette(item.id)} aria-pressed={palette?.id === item.id}>{item.name}</button>)}</div>
              {gradient.length > 0 && <div className="gradient-strip" aria-label="Selected gradient">{gradient.map((color) => <span key={color} style={{ background: color }} />)}</div>}
              <div className="parameter-grid">{(['roughness','metalness','clearcoat','transmission'] as const).map((key) => <label key={key}><span>{key.toUpperCase()} <b>{material.asset.parameters[key].toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={material.asset.parameters[key]} onChange={(e) => material.updateParameter(key, Number(e.target.value))} /></label>)}</div>
              <div className="action-row"><button className="secondary-action" disabled={busy} onClick={() => void generateMaps()}>GENERATE PBR MAPS</button><button className="primary-action" disabled={busy} onClick={() => void exportArmorPaint()}>MATERIALIZE → ARMORPAINT</button><button className="secondary-action" onClick={material.reset}>RESET</button></div>
            </section>
          </div>
        )}
      </aside>
    </main>
  );
}
