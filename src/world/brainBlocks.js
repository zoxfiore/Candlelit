// The 240 brain blocks, drawn with ONE InstancedMesh.
// Instancing = the GPU draws the same small box 240 times in ONE draw call,
// each copy with its own position (a matrix) and its own colour.
// 240 normal meshes would need 240 draw calls: much slower.

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

  for (let i = 0; i < count; i++) {
    const x = (i % columns) - columns / 2;
    const z = Math.floor(i / columns) - 6;
    dummy.position.set(x * 0.06, 0.015, z * 0.06);
    dummy.rotation.y = Math.sin(i * 12.9) * 0.15; // a little bit crooked
    dummy.updateMatrix();
    blocks.setMatrixAt(i, dummy.matrix);

    color.setHSL(0.07, 0.4, 0.55 + Math.sin(i * 3.1) * 0.08); // slightly different shade per block
    blocks.setColorAt(i, color);
  }
  return blocks;
}
