import { useCallback, useState } from 'react';
import OrigamiStage, { type SurfaceSelection } from './three/OrigamiStage';
import MaterialViewer from './three/MaterialViewer';
import { surfaces } from './data/surfaces';
import { grabientPalettes } from './data/grabientPalettes';
import { grabientAdapter } from './integrations/grabient/adapter';
import { useMaterialWorkspace } from './state/materialWorkspace';

export default function App() {
  const [active, setActive] = useState<SurfaceSelection | null>(null);
  const selected = surfaces.find((surface) => surface.id === active?.id) ?? null;
  const material = useMaterialWorkspace(active?.id ?? 'metal');
  const handleSelect = useCallback((selection: SurfaceSelection) => setActive(selection), []);
  const applyPalette = useCallback((paletteId: string) => {
    const palette = grabientPalettes.find((item) => item.id === paletteId);
    if (!palette) return;
    material.replace(grabientAdapter.applyToMaterial(material.asset, palette));
  }, [material]);

  return (
    <main className={active ? 'app is-open' : 'app'}>
      <section className="workspace" aria-label="Material workspace">
        <header className="masthead"><span>ARMORPAINT × COMFYUI × GRABIENT</span><span>PHASE 04 / GRABIENT MATERIAL SYSTEM</span></header>
        <div className="hero-copy"><span className="eyebrow">MATERIAL WORKSPACE</span><h1>Surface intelligence.</h1><p>Select a facet to expose its material and technical information.</p></div>
        <div className="origami-stage" aria-label="Interactive material facets"><OrigamiStage active={active} onSelect={handleSelect} /></div>
        <div className="cursor-hint">HOVER / SELECT SURFACE</div>
      </section>

      <aside className="detail-panel" aria-hidden={!selected}>
        <button className="close" onClick={() => setActive(null)} aria-label="Close material">×</button>
        {selected && (
          <div className="detail-content">
            <section className="material-showcase">
              <div className="material-label">ULTRA-POLISHED MATERIAL <span>REAL-TIME PBR</span></div>
              <MaterialViewer surface={selected.id} asset={material.asset} />
              <div className="material-caption">LIVE SURFACE / POINTER-RESPONSIVE LIGHTING / ASSET v{material.asset.version}</div>
            </section>
            <section className="information">
              <span className="eyebrow">INFORMATION</span><h2>{selected.title}</h2><p className="subtitle">{selected.subtitle}</p><p className="description">{selected.description}</p>
              <div className="specs">{selected.specs.map((spec) => <span key={spec}>{spec}</span>)}</div>
              <div className="palette-heading"><span>GRABIENT PALETTE</span><small>{material.asset.metadata?.grabientPaletteName ?? 'CHOOSE A COLOR SYSTEM'}</small></div>
              <div className="palette-grid" role="list" aria-label="Grabient palettes">
                {grabientPalettes.map((palette) => {
                  const mapping = grabientAdapter.mapToMaterial(palette);
                  return <button key={palette.id} className="palette-card" onClick={() => applyPalette(palette.id)} title={`Apply ${palette.name}`}><span className="palette-swatch" style={{ background: `linear-gradient(90deg, ${mapping.gradient.join(', ')})` }} /><span>{palette.name}</span></button>;
                })}
              </div>
              <div className="parameter-grid">
                {(['roughness', 'metalness', 'clearcoat', 'transmission'] as const).map((key) => (
                  <label key={key}><span>{key.toUpperCase()} <b>{material.asset.parameters[key].toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={material.asset.parameters[key]} onChange={(e) => material.updateParameter(key, Number(e.target.value))} /></label>
                ))}
              </div>
              <div className="action-row"><button className="primary-action">EXPLORE MATERIAL <span>↗</span></button><button className="secondary-action" onClick={material.reset}>RESET</button></div>
            </section>
          </div>
        )}
      </aside>
    </main>
  );
}
