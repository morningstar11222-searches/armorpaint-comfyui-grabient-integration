import { useState } from 'react';

const panels = [
  { id: 'metal', label: 'METAL', title: 'Obsidian Metal', subtitle: 'Ultra-polished architectural surface', description: 'A placeholder material showcase establishing the production composition: material above, information below.', specs: ['PBR-ready', 'Reflective', 'Micro-surface'] },
  { id: 'stone', label: 'STONE', title: 'Black Stone', subtitle: 'Dense mineral surface', description: 'The same cinematic panel choreography can host stone, acrylic, glass, PVC, and other physically based materials.', specs: ['Natural', 'Matte-to-satin', 'PBR-ready'] },
  { id: 'glass', label: 'GLASS', title: 'Smoked Glass', subtitle: 'Transparent architectural surface', description: 'Transmission and refraction will be connected during the material-engine phase.', specs: ['Transmission', 'IOR', 'Reflective'] },
  { id: 'acrylic', label: 'ACRYLIC', title: 'Black Acrylic', subtitle: 'High-gloss polymer surface', description: 'A future material definition will drive the rendered showcase independently from the information layer.', specs: ['Clearcoat', 'Gloss', 'PBR-ready'] },
  { id: 'pvc', label: 'PVC', title: 'Graphite PVC', subtitle: 'Industrial polymer surface', description: 'The material registry is intentionally separated from UI content so it can later consume generated assets.', specs: ['Industrial', 'Satin', 'PBR-ready'] },
  { id: 'carbon', label: 'CARBON', title: 'Carbon Composite', subtitle: 'Technical woven surface', description: 'AI-generated texture maps can later be applied to this material definition through the ComfyUI adapter.', specs: ['Normal map', 'Roughness', 'Mask-ready'] },
];

export default function App() {
  const [active, setActive] = useState<string | null>(null);
  const selected = panels.find((panel) => panel.id === active) ?? null;

  return (
    <main className={active ? 'app is-open' : 'app'}>
      <section className="workspace" aria-label="Material workspace">
        <header className="masthead">
          <span>ARMORPAINT × COMFYUI × GRABIENT</span>
          <span>PHASE 01 / UI ARCHITECTURE</span>
        </header>

        <div className="hero-copy">
          <span className="eyebrow">MATERIAL WORKSPACE</span>
          <h1>Surface intelligence.</h1>
          <p>Select a facet to expose its material and technical information.</p>
        </div>

        <div className="origami-stage" role="list" aria-label="Material facets">
          {panels.map((panel, index) => (
            <button
              key={panel.id}
              className={`facet facet-${index + 1} ${active === panel.id ? 'is-active' : ''}`}
              onClick={() => setActive(panel.id)}
              role="listitem"
              aria-label={`Open ${panel.label}`}
            >
              <span className="facet-index">0{index + 1}</span>
              <span className="facet-label">{panel.label}</span>
            </button>
          ))}
          <div className="stage-core" aria-hidden="true" />
        </div>

        <div className="cursor-hint">HOVER / SELECT SURFACE</div>
      </section>

      <aside className="detail-panel" aria-hidden={!selected}>
        <button className="close" onClick={() => setActive(null)} aria-label="Close material">
          ×
        </button>

        {selected && (
          <div className="detail-content">
            <section className="material-showcase">
              <div className="material-label">ULTRA-POLISHED MATERIAL</div>
              <div className={`material-swatch material-${selected.id}`}>
                <div className="material-sheen" />
                <span>{selected.label}</span>
              </div>
              <div className="material-caption">REAL-TIME PBR VIEWER / PHASE 02</div>
            </section>

            <section className="information">
              <span className="eyebrow">INFORMATION</span>
              <h2>{selected.title}</h2>
              <p className="subtitle">{selected.subtitle}</p>
              <p className="description">{selected.description}</p>

              <div className="specs">
                {selected.specs.map((spec) => <span key={spec}>{spec}</span>)}
              </div>

              <button className="primary-action">EXPLORE MATERIAL <span>↗</span></button>
            </section>
          </div>
        )}
      </aside>
    </main>
  );
}
