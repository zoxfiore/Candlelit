// Chapter 3 — The burial chamber. Painted walls, a stone sarcophagus, and inside: the golden king.
//
// INTERACTION, gate "lid": hold the mouse button: two workmen pull on the ropes of the pulley,
// the heavy granite lid rises, and a golden light comes up from inside onto Carter's face.
// Then (first person) walk to the coffin and click the golden mask.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { createAmbient } from "../../../src/lights/lamps.js";
import { createCandle } from "../../../src/lights/candle.js";
import { placePerson } from "../../../src/characters/figure.js";
import { paintedWallTexture, stoneTexture, nemesTexture, goldMaterial, warmEnvironment } from "../../../src/world/procedural.js";
import { PEOPLE } from "../people.js";

export function buildChamber() {
  const set = createSet({ background: "#040302", dust: { count: 300, size: [6, 3, 4], color: "#ffd090", opacity: 0.18 } });
  set.scene.environment = warmEnvironment();
  set.scene.environmentIntensity = 0.55;

  // ---- the room: painted walls on three sides, open toward the camera ----
  const W = 6.4, D = 4.2, H = 3.2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D + 2), new THREE.MeshStandardMaterial({ map: stoneTexture("#9a7a58", { seed: 8, repeat: [3, 2] }), roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 0;
  floor.receiveShadow = true;
  set.add(floor);
  const wallMat = (seed, rx) => new THREE.MeshStandardMaterial({ map: paintedWallTexture({ seed, repeat: [rx, 1] }), roughness: 0.9 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat(7, 1));
  back.position.set(0, H / 2, -D / 2);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(D + 2, H), wallMat(12, 1));
  left.position.set(-W / 2, H / 2, 0);
  left.rotation.y = Math.PI / 2;
  const right = left.clone();
  right.material = wallMat(19, 1);
  right.position.x = W / 2;
  right.rotation.y = -Math.PI / 2;
  const top = new THREE.Mesh(new THREE.PlaneGeometry(W, D + 2), new THREE.MeshStandardMaterial({ color: "#1a120c" }));
  top.rotation.x = Math.PI / 2;
  top.position.y = H;
  for (const m of [back, left, right]) m.receiveShadow = true;
  set.add(back, left, right, top);

  // ---- the quartzite sarcophagus, open at the top ----
  const quartz = new THREE.MeshStandardMaterial({ map: stoneTexture("#a0503a", { seed: 30 }), roughness: 0.6 });
  const SL = 2.5, SW = 1.15, SH = 1.05, wall = 0.14;
  const sarc = new THREE.Group();
  sarc.position.set(0, 0, -0.6);
  set.add(sarc);
  set.scene.userData.noWalk = [{ minX: -SL / 2 - 0.35, maxX: SL / 2 + 0.35, minZ: -0.6 - SW / 2 - 0.35, maxZ: -0.6 + SW / 2 + 0.35 }];
  const box = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), quartz);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    sarc.add(m);
  };
  box(SL, 0.12, SW, 0, 0.06, 0);
  box(SL, SH, wall, 0, SH / 2, SW / 2 - wall / 2);
  box(SL, SH, wall, 0, SH / 2, -SW / 2 + wall / 2);
  box(wall, SH, SW, SL / 2 - wall / 2, SH / 2, 0);
  box(wall, SH, SW, -SL / 2 + wall / 2, SH / 2, 0);
  // the granite lid (painted to look like quartzite, as in the tomb)
  const lid = new THREE.Mesh(new THREE.BoxGeometry(SL + 0.08, 0.22, SW + 0.08), new THREE.MeshStandardMaterial({ map: stoneTexture("#8a5a44", { seed: 31 }), roughness: 0.7 }));
  lid.position.set(0, SH + 0.11, 0);
  lid.castShadow = lid.receiveShadow = true;
  sarc.add(lid);
  // the pulley above and its ropes
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 0.16), new THREE.MeshStandardMaterial({ color: "#5a3c22", roughness: 0.9 }));
  beam.position.set(0, H - 0.25, -0.6);
  beam.castShadow = true;
  set.add(beam);
  const ropeMat = new THREE.MeshStandardMaterial({ color: "#c8a878", roughness: 1 });
  const ropes = [-0.9, 0.9].map((x) => {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 5), ropeMat);
    rope.position.x = x;
    set.add(rope);
    return rope;
  });

  // ---- the golden coffin inside, with the face of the king ----
  const gold = goldMaterial();
  const coffin = new THREE.Group();
  coffin.position.set(0, 0.42, -0.6);
  set.add(coffin);
  // the body: a lathe (a profile turned around an axis), laid down along x
  const profile = [[0, 0], [0.2, 0.02], [0.3, 0.3], [0.33, 0.9], [0.3, 1.4], [0.24, 1.7], [0.26, 1.85], [0.2, 2.0], [0, 2.05]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 18), gold);
  body.rotation.z = Math.PI / 2;
  body.position.x = 1.0;
  body.scale.set(1, 1, 0.75);
  coffin.add(body);
  // the arms crossed on the chest, holding the crook and the flail (blue and gold)
  const blue = new THREE.MeshStandardMaterial({ color: "#2a5cc8", metalness: 0.4, roughness: 0.3 });
  for (const sgn of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.5, 8), gold);
    arm.position.set(-0.3, 0.27, 0);
    arm.rotation.set(Math.PI / 2, 0, sgn * 0.75);
    coffin.add(arm);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.45, 6), blue);
    staff.position.set(-0.42, 0.33, sgn * 0.07);
    staff.rotation.z = Math.PI / 2 + sgn * 0.25;
    coffin.add(staff);
  }
  // bands of inlay along the body
  for (const x of [0.05, 0.35, 0.65]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.015, 6, 20, Math.PI), blue);
    band.rotation.y = Math.PI / 2;
    band.position.set(x, 0.02, 0);
    band.scale.set(1, 1, 0.78);
    coffin.add(band);
  }
  // the face / mask at the head end (-x): face, nemes headdress, beard, cobra
  const mask = new THREE.Group();
  mask.position.set(-0.78, 0.3, 0);
  coffin.add(mask);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), gold);
  face.scale.set(0.75, 1, 0.95);
  face.rotation.z = Math.PI / 2;
  face.position.y = 0.08;
  const nemes = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.32, 0.42, 14, 1, true, Math.PI * 0.5, Math.PI), new THREE.MeshStandardMaterial({ map: nemesTexture(), metalness: 0.45, roughness: 0.35, side: THREE.DoubleSide }));
  nemes.rotation.z = Math.PI / 2;
  nemes.position.set(-0.04, 0.02, 0);
  const beard = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 6), new THREE.MeshStandardMaterial({ color: "#1d3f8a", metalness: 0.6, roughness: 0.3 }));
  beard.rotation.z = Math.PI / 2;
  beard.position.set(0.2, 0.06, 0);
  const cobra = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 6), gold);
  cobra.position.set(-0.12, 0.2, 0);
  mask.add(face, nemes, beard, cobra);
  // the face looks up: nose, kohl-lined eyes, lips
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 5), gold);
  nose.position.set(0.05, 0.23, 0);
  const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.045, 3, 6), new THREE.MeshStandardMaterial({ color: "#c8823a", metalness: 1, roughness: 0.35 }));
  lips.rotation.x = Math.PI / 2;
  lips.position.set(0.11, 0.21, 0);
  mask.add(nose, lips);
  for (const z of [-0.05, 0.05]) {
    const kohl = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.05, 3, 6), new THREE.MeshStandardMaterial({ color: "#14244a", roughness: 0.4 }));
    kohl.rotation.x = Math.PI / 2;
    kohl.position.set(0.0, 0.222, z);
    mask.add(kohl);
  }
  for (const z of [-0.05, 0.05]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshStandardMaterial({ color: "#f4f0e8", roughness: 0.2 }));
    eye.position.set(0.02, 0.2, z);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 4), new THREE.MeshStandardMaterial({ color: "#050505" }));
    pupil.position.set(0.025, 0.215, z);
    mask.add(eye, pupil);
  }
  mask.traverse((o) => (o.userData.info = "mask"));
  mask.userData.info = "mask";
  coffin.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  // the glow coming up from the gold when the lid is raised
  const glow = new THREE.PointLight("#ffc060", 0, 4, 1.6);
  glow.position.set(-0.3, 1.0, -0.6);
  set.add(glow);

  // ---- people: Carter leaning over, two workmen on the ropes ----
  const carter = placePerson(set, "carter", -1.65, 0.35, { look: PEOPLE.carter, rotationY: 2.3 });
  const w1 = placePerson(set, "worker", -1.25, -1.6, { look: PEOPLE.worker, rotationY: 0.6 });
  const w2 = placePerson(set, "worker", 1.3, -1.6, { look: PEOPLE.worker, rotationY: -0.6 });
  carter.userData.lookAt = new THREE.Vector3(-0.8, 0.8, -0.6);

  // oil lamps / candles on the floor
  for (const [x, z] of [[-2.4, -1.4], [2.4, -1.3], [2.1, 1.0]]) {
    const c = createCandle({ height: 0.2, intensity: 2.2, distance: 6, shadows: x < 0 });
    c.position.set(x, 0, z);
    set.add(c);
  }
  set.add(createAmbient(0.16, "#e0b070", "#120a04"));

  let lift = 0;
  set.onUpdate((time, delta, t, ctx) => {
    const holding = ctx.gate === "lid" && ctx.input.down;
    if (holding) lift = Math.min(1, lift + delta / 3.5);
    if (ctx.done("lid")) lift = Math.min(1, lift + delta / 2);
    if (ctx.gate === "lid") {
      ctx.progress(lift);
      if (lift >= 1) ctx.resolve("lid");
    }
    const working = holding || (lift > 0 && lift < 1);
    w1.userData.pose = w2.userData.pose = working ? "pull" : "idle";
    carter.userData.pose = lift > 0.5 ? "lean" : "idle";
    // the lid rises toward the beam and swings a little on its ropes
    const k = lift * lift * (3 - 2 * lift);
    lid.position.y = SH + 0.11 + k * 1.15;
    lid.rotation.z = Math.sin(time * 1.3) * 0.02 * k;
    for (const rope of ropes) {
      const top = H - 0.33, bottom = sarc.position.y + lid.position.y + 0.11;
      rope.scale.y = Math.max(0.01, top - bottom);
      rope.position.set(rope.position.x, (top + bottom) / 2, -0.6);
    }
    glow.intensity = k * (2 + Math.sin(time * 2.1) * 0.15);
    ctx.rig.offset.set(0, holding ? (Math.random() - 0.5) * 0.003 : 0, 0);
  });
  return set;
}
