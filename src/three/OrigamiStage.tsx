import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

export type SurfaceId = 'metal' | 'stone' | 'glass' | 'acrylic' | 'pvc' | 'carbon';

export type SurfaceSelection = {
  id: SurfaceId;
  index: number;
};

const SURFACES: SurfaceId[] = ['metal', 'stone', 'glass', 'acrylic', 'pvc', 'carbon'];

function createFacetMaterial(index: number) {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(index % 2 ? '#111417' : '#080a0c'),
    metalness: 0.88,
    roughness: 0.17,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    reflectivity: 1,
  });
  return material;
}

export default function OrigamiStage({
  active,
  onSelect,
}: {
  active: SurfaceSelection | null;
  onSelect: (selection: SurfaceSelection) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050607');

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.15, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute('aria-label', 'Interactive material origami surface');
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.set(-0.12, 0.38, 0.05);
    scene.add(group);

    const geometry = new THREE.OctahedronGeometry(2.15, 0);
    const positions = geometry.getAttribute('position');
    const index = geometry.getIndex();
    if (!index) return;

    const facets: THREE.Mesh[] = [];
    const seen = new Set<string>();
    const triangleMaterial = SURFACES.map((_, i) => createFacetMaterial(i));

    for (let face = 0; face < index.count / 3 && facets.length < SURFACES.length; face += 1) {
      const a = index.getX(face * 3);
      const b = index.getX(face * 3 + 1);
      const c = index.getX(face * 3 + 2);
      const key = [a, b, c].sort((x, y) => x - y).join(':');
      if (seen.has(key)) continue;
      seen.add(key);

      const local = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        positions.getX(a), positions.getY(a), positions.getZ(a),
        positions.getX(b), positions.getY(b), positions.getZ(b),
        positions.getX(c), positions.getY(c), positions.getZ(c),
      ]);
      local.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      local.computeVertexNormals();

      const mesh = new THREE.Mesh(local, triangleMaterial[facets.length]);
      mesh.userData.surfaceIndex = facets.length;
      facets.push(mesh);
      group.add(mesh);
    }

    const backLight = new THREE.PointLight('#6a8fff', 22, 18, 2);
    backLight.position.set(-4, 3, 5);
    scene.add(backLight);
    const rimLight = new THREE.PointLight('#5fe0ba', 15, 14, 2);
    rimLight.position.set(4, -2, 3);
    scene.add(rimLight);
    scene.add(new THREE.AmbientLight('#ffffff', 0.45));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(10, 10);
    const targetParallax = new THREE.Vector2();
    let pointerActive = false;
    let disposed = false;
    let raf = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetParallax.set(pointer.x * 0.12, pointer.y * 0.08);
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointer.set(10, 10);
      targetParallax.set(0, 0);
      pointerActive = false;
    };

    const onClick = () => {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(facets, false)[0];
      if (!hit) return;
      const selectedIndex = hit.object.userData.surfaceIndex as number;
      onSelect({ id: SURFACES[selectedIndex], index: selectedIndex });
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('click', onClick);
    window.addEventListener('resize', resize);
    resize();

    const tick = () => {
      if (disposed) return;
      const isOpen = active !== null;
      const rotationSpeed = isOpen ? 0.0012 : 0.0032;
      group.rotation.y += rotationSpeed;
      group.rotation.x += (targetParallax.y - group.rotation.x * 0.08) * 0.025;
      group.rotation.z += (targetParallax.x * 0.35 - group.rotation.z * 0.08) * 0.025;

      raycaster.setFromCamera(pointer, camera);
      const hit = pointerActive ? raycaster.intersectObjects(facets, false)[0] : undefined;
      facets.forEach((facet) => {
        const isHit = hit?.object === facet;
        const isSelected = active?.index === facet.userData.surfaceIndex;
        const material = facet.material as THREE.MeshPhysicalMaterial;
        gsap.to(material, { roughness: isHit || isSelected ? 0.11 : 0.17, metalness: isHit || isSelected ? 0.94 : 0.88, duration: 0.25, overwrite: true });
        gsap.to(facet.scale, { x: isHit ? 1.035 : 1, y: isHit ? 1.035 : 1, z: isHit ? 1.035 : 1, duration: 0.35, overwrite: true });
        gsap.to(facet.position, { z: isSelected ? 0.28 : 0, duration: 0.65, ease: 'power3.out', overwrite: true });
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('click', onClick);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      facets.forEach((facet) => { facet.geometry.dispose(); });
      triangleMaterial.forEach((material) => material.dispose());
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [active, onSelect]);

  return <div ref={hostRef} className="origami-canvas" />;
}
