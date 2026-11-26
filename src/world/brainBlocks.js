// The 240 brain blocks, drawn with ONE InstancedMesh.
// Instancing = the GPU draws the same small box 240 times in ONE draw call,
// each copy with its own position (a matrix) and its own colour.
// 240 normal meshes would need 240 draw calls: much slower.
//
// blocks.userData.setProgress(p):
//   p = 0  -> the blocks are packed together in the shape of a brain (an ellipsoid)
//   p = 1  -> they are laid out in rows on the bench, ready for the jars
//   between -> every block flies along an arc, each one starting a bit later (stagger)

import * as THREE from "three";

export function createBrainBlocks(count = 240) {
  const geometry = new THREE.BoxGeometry(0.045, 0.03, 0.045);
  const material = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 });
  const blocks = new THREE.InstancedMesh(geometry, material, count);
  blocks.castShadow = true;
  blocks.receiveShadow = true;

  const dummy = new THREE.Object3D(); // helper to build each matrix
  const color = new THREE.Color();
  const columns = 20;
  const brain = []; // start positions (inside the brain)
  const grid = []; // end positions (rows on the bench)
  const delay = [];

  // points inside an ellipsoid, picked with a golden-angle spiral so they are evenly spread
  for (let i = 0; i < count; i++) {
    const k = (i + 0.5) / count;
    const r = Math.cbrt((i * 0.618) % 1) * 0.9 + 0.1;
    const phi = Math.acos(1 - 2 * k);
    const theta = i * 2.39996;
    brain.push(new THREE.Vector3(Math.sin(phi) * Math.cos(theta) * 0.2 * r, 0.16 + Math.cos(phi) * 0.13 * r, Math.sin(phi) * Math.sin(theta) * 0.26 * r));

    const x = (i % columns) - columns / 2;
    const z = Math.floor(i / columns) - 6;
    grid.push(new THREE.Vector3(x * 0.06, 0.015, z * 0.06));
    delay.push((brain[i].z + 0.26) / 0.52 * 0.6); // the cut goes from the back to the front

    color.setHSL(0.03 + Math.sin(i * 7.7) * 0.02, 0.45, 0.6 + Math.sin(i * 3.1) * 0.08);
    blocks.setColorAt(i, color);
  }

  const position = new THREE.Vector3();
  blocks.userData.setProgress = (p) => {
    for (let i = 0; i < count; i++) {
      const local = THREE.MathUtils.clamp((p * 1.6 - delay[i]) / 0.6, 0, 1);
      const e = local * local * (3 - 2 * local);
      position.lerpVectors(brain[i], grid[i], e);
      position.y += Math.sin(e * Math.PI) * 0.22; // arc through the air
      dummy.position.copy(position);
      const spin = Math.sin(e * Math.PI); // tumble in the air, land flat
      dummy.rotation.set(spin * 2.5 * Math.sin(i), Math.sin(i * 12.9) * 0.15 + spin * 1.5, 0);
      dummy.updateMatrix();
      blocks.setMatrixAt(i, dummy.matrix);
    }
    blocks.instanceMatrix.needsUpdate = true;
  };
  blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  blocks.userData.setProgress(0);
  return blocks;
}
