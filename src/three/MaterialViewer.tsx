import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { materialDefinitions } from '../data/materials';
import type { SurfaceId } from './OrigamiStage';

type Props = { surface: SurfaceId };

function createNoiseTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    const value = 112 + Math.floor(Math.random() * 48);
    const p = i * 4;
    data[p] = value; data[p + 1] = value; data[p + 2] = value; data[p + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function MaterialViewer({ surface }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef(surface);
  surfaceRef.current = surface;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.appendChild(renderer.domElement);

    const key = new THREE.DirectionalLight('#ffffff', 4.2); key.position.set(-3, 4, 5); scene.add(key);
    const fill = new THREE.PointLight('#718cff', 18, 14, 2); fill.position.set(4, -1, 3); scene.add(fill);
    const rim = new THREE.PointLight('#68e0bf', 14, 12, 2); rim.position.set(-4, -2, 2); scene.add(rim);
    scene.add(new THREE.AmbientLight('#ffffff', 0.35));

    const geometry = new THREE.IcosahedronGeometry(1.55, 5);
    const noise = createNoiseTexture();
    const material = new THREE.MeshPhysicalMaterial({ map: noise });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    const move = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      target.set(pointer.x, pointer.y);
    };
    renderer.domElement.addEventListener('pointermove', move);

    let raf = 0;
    let disposed = false;
    const resize = () => { const rect = host.getBoundingClientRect(); camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1); camera.updateProjectionMatrix(); renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false); };
    window.addEventListener('resize', resize); resize();

    const tick = () => {
      if (disposed) return;
      const def = materialDefinitions[surfaceRef.current];
      material.color.set(def.baseColor);
      material.roughness = def.roughness;
      material.metalness = def.metalness;
      material.clearcoat = def.clearcoat;
      material.clearcoatRoughness = def.clearcoatRoughness;
      material.transmission = def.transmission;
      material.ior = def.ior;
      material.envMapIntensity = def.envIntensity;
      noise.repeat.set(def.noiseScale, def.noiseScale);
      mesh.rotation.y += 0.0025;
      mesh.rotation.x += (target.y * 0.16 - mesh.rotation.x) * 0.025;
      mesh.rotation.z += (target.x * 0.12 - mesh.rotation.z) * 0.025;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { disposed = true; cancelAnimationFrame(raf); renderer.domElement.removeEventListener('pointermove', move); window.removeEventListener('resize', resize); geometry.dispose(); noise.dispose(); material.dispose(); renderer.dispose(); if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement); };
  }, []);

  return <div ref={hostRef} className="material-viewer" aria-label={`${surface} real-time PBR material preview`} />;
}
