// Clickable evidence in the 3D world.
//
// installEvidence(set, items): for each item of this chapter
//   - finds the object it is attached to (or lays a new sheet of paper on a surface)
//   - marks it with userData.evidence = item (the click handler looks for that)
//   - adds a "glint": a small pulsing spark of light above it, the classic adventure-game hint.
//     The glint is a Sprite (always faces the camera) with a radial-gradient canvas texture,
//     drawn with additive blending so it glows. It fades out once the item has been inspected.

import * as THREE from "three";

let glintTexture = null;
function getGlintTexture() {
  if (glintTexture) return glintTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,240,200,1)");
  grd.addColorStop(0.25, "rgba(255,200,110,0.55)");
  grd.addColorStop(1, "rgba(255,170,60,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  // a thin four-point star
  g.fillStyle = "rgba(255,245,220,0.9)";
  g.fillRect(31, 4, 2, 56);
  g.fillRect(4, 31, 56, 2);
  glintTexture = new THREE.CanvasTexture(c);
  glintTexture.colorSpace = THREE.SRGBColorSpace;
  return glintTexture;
}

/** a sheet of aged paper with a few lines of "writing" (too small to read: you click it to read it) */
function createPaper(kind) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 340;
  const g = c.getContext("2d");
  g.fillStyle = "#e6d6b4";
  g.fillRect(0, 0, 256, 340);
  g.fillStyle = "rgba(120,80,40,0.12)"; // stains
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 340, 20 + Math.random() * 40, 0, 7);
    g.fill();
  }
  g.strokeStyle = kind === "typed" ? "rgba(30,24,18,0.75)" : "rgba(40,40,90,0.7)";
  g.lineWidth = kind === "typed" ? 3 : 2.5;
  for (let y = 40; y < 300; y += 22) {
    g.beginPath();
    g.moveTo(24, y);
    const w = 120 + Math.random() * 90;
    if (kind === "typed") g.lineTo(24 + w, y);
    else for (let x = 24; x < 24 + w; x += 8) g.lineTo(x, y + Math.sin(x * 0.4) * 2.5);
    g.stroke();
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.21, 0.28),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95, side: THREE.DoubleSide }),
  );
  paper.receiveShadow = true;
  return paper;
}

export function installEvidence(set, items) {
  for (const item of items) {
    let target = null;
    if (item.attach) {
      set.scene.traverse((o) => {
        if (!target && o.userData.info === item.attach) target = o;
      });
      if (!target) {
        console.warn(`evidence "${item.id}": no object with info "${item.attach}"`);
        continue;
      }
    } else {
      const [x, y, z, ry = 0] = item.place;
      target = createPaper(item.kind);
      target.rotation.set(-Math.PI / 2, 0, ry); // lying flat
      target.position.set(x, y, z);
      target.userData.info = null;
      set.add(target);
    }
    target.userData.evidence = item;
    target.traverse((o) => (o.userData.evidence = item));

    // the glint: 25 cm above the object's centre
    const box = new THREE.Box3().setFromObject(target);
    const glint = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: getGlintTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    );
    glint.position.set((box.min.x + box.max.x) / 2, Math.min(box.max.y + 0.12, 2.4), (box.min.z + box.max.z) / 2);
    glint.userData.noHover = true;
    glint.raycast = () => {};
    const seed = Math.random() * 10;
    let fade = 1;
    glint.userData.update = (time, delta) => {
      if (item.found) fade = Math.max(0, fade - delta * 1.5);
      const pulse = 0.55 + 0.45 * Math.sin(time * 2.6 + seed);
      glint.material.opacity = pulse * fade;
      glint.material.rotation = time * 0.4;
      const s = 0.09 + 0.03 * pulse;
      glint.scale.set(s, s, s);
      glint.visible = fade > 0;
    };
    set.add(glint);
  }
}
