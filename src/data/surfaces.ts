import type { SurfaceId } from '../three/OrigamiStage';

export type SurfaceDefinition = {
  id: SurfaceId;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string[];
};

export const surfaces: SurfaceDefinition[] = [
  { id: 'metal', label: 'METAL', title: 'Obsidian Metal', subtitle: 'Ultra-polished architectural surface', description: 'Reflective PBR surface prepared for generated texture maps and material controls.', specs: ['PBR-ready', 'Reflective', 'Micro-surface'] },
  { id: 'stone', label: 'STONE', title: 'Black Stone', subtitle: 'Dense mineral surface', description: 'Dense mineral treatment designed for natural variation, roughness breakup, and fine normal detail.', specs: ['Natural', 'Matte-to-satin', 'PBR-ready'] },
  { id: 'glass', label: 'GLASS', title: 'Smoked Glass', subtitle: 'Transparent architectural surface', description: 'Transparent material with transmission, refraction, IOR, and controlled edge reflections.', specs: ['Transmission', 'IOR', 'Reflective'] },
  { id: 'acrylic', label: 'ACRYLIC', title: 'Black Acrylic', subtitle: 'High-gloss polymer surface', description: 'High-gloss polymer treatment with clearcoat and controlled studio reflections.', specs: ['Clearcoat', 'Gloss', 'PBR-ready'] },
  { id: 'pvc', label: 'PVC', title: 'Graphite PVC', subtitle: 'Industrial polymer surface', description: 'Industrial polymer surface with restrained satin response and map-ready structure.', specs: ['Industrial', 'Satin', 'PBR-ready'] },
  { id: 'carbon', label: 'CARBON', title: 'Carbon Composite', subtitle: 'Technical woven surface', description: 'Technical composite slot intended for generated weave normals, roughness breakup, and masks.', specs: ['Normal map', 'Roughness', 'Mask-ready'] },
];
