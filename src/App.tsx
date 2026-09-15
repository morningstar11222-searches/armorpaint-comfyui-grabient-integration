import { useCallback, useState } from 'react';
import OrigamiStage, { type SurfaceId, type SurfaceSelection } from './three/OrigamiStage';
import MaterialViewer from './three/MaterialViewer';
import { materialDefinitions } from './data/materials';
import { useMaterialWorkspace } from './state/materialWorkspace';

export type SurfaceDefinition = { id: SurfaceId; label: string; title: string; subtitle: string; description: string; specs: string[] };
export const surfaces: SurfaceDefinition[] = [
  { id: 'metal', label: 'METAL', title: 'Obsidian Metal', subtitle: 'Ultra-polished architectural surface', description: 'Reflective PBR surface prepared for generated texture maps and material controls.', specs: ['PBR-ready', 'Reflective', 'Micro-surface'] },
  { id: 'stone', label: 'STONE', title: 'Black Stone', subtitle: 'Dense mineral surface', description: 'Dense mineral treatment designed for natural variation, roughness breakup, and fine normal detail.', specs: ['Natural', 'Matte-to-satin', 'PBR-ready'] },
  { id: 'glass', label: 'GLASS', title: 'Smoked Glass', subtitle: 'Transparent architectural surface', description: 'Transparent material with transmission, refraction, IOR, and controlled edge reflections.', specs: ['Transmission', 'IOR', 'Reflective'] },
  { id: 'acrylic', label: 'ACRYLIC', title: 'Black Acrylic', subtitle: 'High-gloss polymer surface', description: 'High-gloss polymer treatment with clearcoat and controlled studio reflections.', specs: ['Clearcoat', 'Gloss', 'PBR-ready'] },
  { id: 'pvc', label: 'PVC', title: 'Graphite PVC', subtitle: 'Industrial polymer surface', description: 'Industrial polymer surface with restrained satin response and map-ready structure.', specs: ['Industrial', 'Satin', 'PBR-ready'] },
  { id: 'carbon', label: 'CARBON', title: 'Carbon Composite', subtitle: 'Technical woven surface', description: 'Technical composite slot intended for generated weave normals, roughness breakup, and masks.', specs: ['Normal map', 'Roughness', 'Mask-ready'] },
];

export default function App() {
  const [active, setActive] = useState<SurfaceSelection | null>(null);
  const selected = surfaces.find((surface) => surface.id === active?.id) ?? null;
  const material = useMaterialWorkspace(active?.id ?? 'metal');
  const handleSelect = useCallback((selection: SurfaceSelection) => setActive(selection), []);

  return (
    <main className={active ? 'app is-open' : 'app'}>
      <section className="workspace" aria-label="Material workspace">
        <header className="masthead"><span>ARMORPAINT × COMFYUI × GRABIENT</span><span>PHASE 02–03 / MATERIAL SYSTEM</span></header>
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
