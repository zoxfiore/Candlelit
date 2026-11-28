// Fills a room of a floor plan (see layout.js) with furniture that fits the place, and some things
// to use in first person (drawers, a globe, a radio, a typewriter, a bell, a gramophone...).
//
//   rooms: [{ x0, x1, z0, z1, theme: "kitchen", furnish: furnishRoom }]
//
// Things are put against the back wall (z0) and the side walls, the middle stays free to walk.

import * as THREE from "three";
import { placeModel } from "./models.js";
import { createBooks, createDrawers, createRug, createFrame, createPapers, createClock, createGlobe, createRadio, createStandingLamp } from "./props.js";
import { createFilingCabinet, createJar, createBench, createTypewriter, createSink, createShowcase } from "./props2.js";
import { canvasTexture } from "./procedural.js";
import { tick, violin } from "../audio/synth.js";

function landscape(seed) {
  return canvasTexture(320, 240, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, seed % 2 ? "#8aa0b8" : "#c8945a");
    sky.addColorStop(1, "#4a5a3a");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#3a4a30";
    g.beginPath();
    g.moveTo(0, 160);
    g.quadraticCurveTo(w * 0.4, 110 + (seed % 9) * 7, w, 150);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.fill();
  });
}

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra });
function box(w, h, d, color, extra) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(color, extra));
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** a narrow console table with a vase of flowers (click the vase: it wobbles) */
function consoleTable() {
  const g = new THREE.Group();
  const wood = "#4a2e1c";
  g.add(box(0.9, 0.04, 0.32, wood).translateY(0.8));
  for (const [x, z] of [[-0.4, -0.12], [0.4, -0.12], [-0.4, 0.12], [0.4, 0.12]]) g.add(box(0.035, 0.8, 0.035, wood).translateX(x).translateY(0.4).translateZ(z));
  const vase = new THREE.Group();
  vase.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.22, 14), std("#2a4a6a", { roughness: 0.25 })).translateY(0.11));
  for (let i = 0; i < 5; i++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 4), std("#3a6a2a"));
    stem.position.set(Math.sin(i * 1.3) * 0.03, 0.32, Math.cos(i * 1.3) * 0.03);
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), std(["#e8c040", "#e86040", "#f0f0e0"][i % 3]));
    flower.position.set(Math.sin(i * 1.3) * 0.05, 0.45, Math.cos(i * 1.3) * 0.05);
    vase.add(stem, flower);
  }
  vase.position.y = 0.82;
  g.add(vase);
  let wobble = 0;
  vase.userData.interact = () => ((wobble = 1), tick(0.03));
  vase.userData.update = (t, d = 0.016) => {
    wobble = Math.max(0, wobble - d * 0.8);
    vase.rotation.z = Math.sin(t * 14) * 0.12 * wobble;
  };
  return g;
}

/** a table with four chairs */
function diningSet(n = 4) {
  const g = new THREE.Group();
  const wood = "#5a3a24";
  const top = box(1.4, 0.05, 0.9, wood);
  top.position.y = 0.75;
  g.add(top);
  for (const [x, z] of [[-0.62, -0.38], [0.62, -0.38], [-0.62, 0.38], [0.62, 0.38]]) g.add(box(0.05, 0.75, 0.05, wood).translateX(x).translateY(0.375).translateZ(z));
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1;
    const x = i < 2 ? -0.3 : 0.3;
    const chair = new THREE.Group();
    chair.add(box(0.42, 0.04, 0.42, wood).translateY(0.45));
    chair.add(box(0.42, 0.5, 0.04, wood).translateY(0.72).translateZ(0.2));
    for (const [cx, cz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) chair.add(box(0.035, 0.45, 0.035, wood).translateX(cx).translateY(0.225).translateZ(cz));
    chair.position.set(x, 0, side * 0.7);
    chair.rotation.y = side > 0 ? 0 : Math.PI;
    // click a chair: it is pulled out a little (click again: pushed back)
    let out = 0, target = 0;
    chair.userData.interact = () => ((target = target ? 0 : 1), tick(0.03));
    chair.userData.update = (t, d = 0.016) => {
      out += (target - out) * Math.min(1, d * 6);
      chair.position.z = side * (0.7 + out * 0.3);
    };
    g.add(chair);
  }
  return g;
}

/** a kitchen stove with a kettle that whistles when clicked */
function stove() {
  const g = new THREE.Group();
  g.add(box(0.75, 0.9, 0.6, "#e8e4d8", { roughness: 0.35 }).translateY(0.45));
  g.add(box(0.7, 0.02, 0.55, "#222", { metalness: 0.5 }).translateY(0.91));
  const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), std("#c83a2a", { roughness: 0.3, metalness: 0.2 }));
  kettle.scale.y = 0.8;
  kettle.position.set(0.15, 1.0, 0);
  kettle.castShadow = true;
  g.add(kettle);
  const steam = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0 }));
  steam.position.set(0.25, 1.12, 0);
  g.add(steam);
  let puff = 0;
  g.userData.interact = () => {
    puff = 1;
    tick(0.05);
  };
  g.userData.update = (t, d = 0.016) => {
    puff = Math.max(0, puff - d * 0.4);
    steam.material.opacity = puff * 0.5 * (0.6 + 0.4 * Math.sin(t * 9));
    steam.position.y = 1.12 + (1 - puff) * 0.3;
    steam.scale.setScalar(1 + (1 - puff) * 2);
  };
  return g;
}

/** a coat rack with a hat (click: the hat spins on its hook) */
function coatRack() {
  const g = new THREE.Group();
  const wood = "#3a2414";
  g.add(box(0.05, 1.8, 0.05, wood).translateY(0.9));
  for (let i = 0; i < 4; i++) {
    const hook = box(0.25, 0.03, 0.03, wood);
    hook.position.y = 1.7;
    hook.rotation.y = (i * Math.PI) / 2;
    hook.rotation.z = 0.4;
    g.add(hook);
  }
  const hat = new THREE.Group();
  hat.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 16), std("#2b231c")));
  hat.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.11, 14), std("#2b231c")).translateY(0.06));
  hat.position.set(0.12, 1.82, 0);
  g.add(hat);
  const coat = box(0.4, 0.9, 0.15, "#4a4038", { roughness: 0.9 });
  coat.position.set(-0.08, 1.2, 0.05);
  g.add(coat);
  let spin = 0;
  g.userData.interact = () => (spin = 8);
  g.userData.update = (t, d = 0.016) => {
    hat.rotation.y += spin * d;
    spin *= Math.exp(-2 * d);
  };
  return g;
}

/** a gramophone: click it to play a few notes */
function gramophone() {
  const g = new THREE.Group();
  g.add(box(0.4, 0.18, 0.4, "#3a2214", { roughness: 0.4 }).translateY(0.09));
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.01, 24), std("#111", { roughness: 0.2 }));
  disc.position.y = 0.19;
  g.add(disc);
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 18, 1, true), std("#c89a40", { metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide }));
  horn.position.set(0.1, 0.5, -0.05);
  horn.rotation.z = -0.9;
  g.add(horn);
  let playing = 0;
  g.userData.interact = () => {
    playing = 6;
    violin([[62, 1], [65, 1], [69, 2], [67, 1], [65, 1], [64, 2]], 70);
  };
  g.userData.update = (t, d = 0.016) => {
    playing = Math.max(0, playing - d);
    disc.rotation.y += (playing > 0 ? 3.5 : 0) * d;
  };
  return g;
}

/** a reception counter with a bell (click the bell: ding) */
function counter(w = 2.2) {
  const g = new THREE.Group();
  g.add(box(w, 1.05, 0.55, "#4a2e1c", { roughness: 0.45 }).translateY(0.525));
  g.add(box(w + 0.1, 0.05, 0.65, "#2a1a10", { roughness: 0.3 }).translateY(1.075));
  const bell = new THREE.Group();
  bell.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std("#d0a840", { metalness: 1, roughness: 0.25 })));
  bell.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 16), std("#222")));
  bell.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), new THREE.MeshBasicMaterial({ visible: false })));
  bell.position.set(w * 0.3, 1.1, 0);
  bell.userData.interact = () => tick(0.12);
  g.add(bell);
  return g;
}

/** a wall of morgue drawers (click one: it slides out) */
function morgueWall(cols = 3, rows = 3) {
  const g = new THREE.Group();
  const steel = std("#a0a6aa", { metalness: 0.8, roughness: 0.35 });
  g.add(new THREE.Mesh(new THREE.BoxGeometry(cols * 0.65 + 0.1, rows * 0.6 + 0.1, 0.1), steel).translateY(0.35 + (rows * 0.6) / 2));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const d = new THREE.Group();
    d.position.set((c - (cols - 1) / 2) * 0.65, 0.65 + r * 0.6, 0.06);
    const front = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.04), steel);
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 1.2), steel);
    tray.position.z = -0.6;
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.04), std("#555", { metalness: 1 }));
    handle.position.z = 0.03;
    d.add(front, tray, handle);
    let out = 0, target = 0;
    d.userData.interact = () => ((target = target ? 0 : 1), tick(0.06));
    d.userData.update = (t, dt = 0.016) => {
      out += (target - out) * Math.min(1, dt * 3);
      d.position.z = 0.06 + out * 0.8;
    };
    g.add(d);
  }
  return g;
}

export function furnishRoom(set, room) {
  const { x0, x1, z0, z1, theme = "home" } = room;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const W = x1 - x0, D = z1 - z0;
  const doors = room.doorPoints ?? [];
  const add = (o, x, y, z, ry = 0) => {
    // in front of a door (closer than 1 m)? then it does not go there: a doorway stays free
    if (doors.some((d) => Math.hypot(d.x - x, d.z - z) < 1.0)) return o;
    o.position.set(x, y, z);
    o.rotation.y = ry;
    set.add(o);
    return o;
  };
  const model = (name, x, z, opts) => (doors.some((d) => Math.hypot(d.x - x, d.z - z) < 1.2) ? null : placeModel(set, name, x, z, opts));
  const seed = Math.round(Math.abs(cx * 13 + cz * 7));
  // pictures on the back wall
  if (W > 2.2 && theme !== "morgue") add(createFrame(0.7, 0.52, landscape(seed)), cx, 1.75, z0 + 0.08);

  switch (theme) {
    case "kitchen": {
      add(stove(), x0 + 0.5, 0, z0 + 0.4);
      const sink = createSink();
      add(sink, x0 + 1.4, 0, z0 + 0.35);
      add(diningSet(), cx + 0.3, 0, cz + 0.3);
      model("wall-shelf", x1 - 0.9, z0 + 0.12, { y: 1.6 });
      for (const dx of [-0.25, 0, 0.25]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 12), std("#e8e0d0")), x1 - 0.9 + dx, 1.67, z0 + 0.22);
      break;
    }
    case "hall": {
      add(coatRack(), x0 + 0.4, 0, z0 + 0.5);
      add(consoleTable(), x1 - 0.25, 0, cz, -Math.PI / 2);
      add(createFrame(0.4, 0.5, landscape(seed + 3)), x0 + 0.08, 1.7, cz, Math.PI / 2);
      add(createRug(Math.max(0.8, W - 0.8), Math.max(1, D - 1.2), { base: "#3a2a4a" }), cx, 0, cz);
      break;
    }
    case "dining": {
      add(diningSet(), cx, 0, cz);
      add(createDrawers({ rows: 2 }), cx, 0, z0 + 0.3);
      add(gramophone(), cx + 0.6, 0.85, z0 + 0.3);
      add(createRug(Math.min(3, W - 0.6), Math.min(2.4, D - 0.6)), cx, 0, cz);
      break;
    }
    case "bedroom": {
      const bed = new THREE.Group();
      bed.add(box(1.4, 0.4, 2.0, "#5a3a24").translateY(0.2));
      bed.add(box(1.36, 0.15, 1.9, "#e8e0d0", { roughness: 0.9 }).translateY(0.47));
      bed.add(box(1.4, 0.9, 0.08, "#4a2e1c").translateY(0.45).translateZ(-1));
      bed.add(box(0.5, 0.12, 0.3, "#f4f0e8", { roughness: 0.9 }).translateY(0.6).translateZ(-0.75));
      add(bed, cx, 0, z0 + 1.1);
      add(createDrawers({ rows: 3 }), x1 - 0.45, 0, z0 + 0.35);
      add(createClock(), x0 + 0.35, 0, z0 + 0.35);
      break;
    }
    case "office": {
      model("desk", cx, z0 + 0.9);
      model("chair", cx + 0.1, z0 + 0.35);
      add(createTypewriter(), cx - 0.3, 0.786, z0 + 1.0);
      add(createPapers(6, { seed }), cx + 0.35, 0.786, z0 + 1.0);
      add(createFilingCabinet("#5e5a48"), x1 - 0.4, 0, z1 - 0.8, -Math.PI / 2);
      add(createStandingLamp({ intensity: 1.2 }), x0 + 0.4, 0, z0 + 0.4).userData.light.castShadow = false;
      break;
    }
    case "storage": {
      model("moving-boxes", x0 + 0.8, z0 + 0.8);
      model("moving-boxes", x1 - 0.8, z1 - 0.9, { rotationY: 0.6 });
      model("bookshelf", cx, z0 + 0.25);
      add(createBooks(0.9, { seed }), cx, 1.42, z0 + 0.3);
      add(createDrawers({ rows: 3 }), x1 - 0.45, 0, z0 + 0.35);
      break;
    }
    case "lab": {
      model("lab-bench", cx, z0 + 0.8);
      for (const dx of [-0.4, 0, 0.4]) {
        const jar = createJar({ glow: 0.05 });
        jar.scale.setScalar(0.7);
        add(jar, cx + dx, 0.9, z0 + 0.8);
      }
      add(createFilingCabinet("#4a5450"), x1 - 0.35, 0, z1 - 0.8, -Math.PI / 2);
      add(createDrawers({ rows: 3 }), x0 + 0.45, 0, z1 - 0.8, Math.PI / 2);
      break;
    }
    case "darkroom": {
      // a photographer's darkroom: a red safe light and photos drying on a line
      const red = new THREE.PointLight("#ff3020", 1.6, 5, 1.5);
      add(red, cx, 2.4, cz);
      add(box(1.6, 0.9, 0.6, "#2a2a2a").translateY(0.45), cx, 0, z0 + 0.35);
      for (let i = 0; i < 5; i++) add(box(0.18, 0.24, 0.005, "#e8e4d8", { emissive: "#401010", emissiveIntensity: 0.2 }), x0 + 0.5 + i * 0.35, 1.9, cz);
      break;
    }
    case "morgue": {
      add(morgueWall(), cx, 0, z0 + 0.1);
      add(createPapers(3, { seed }), x1 - 0.6, 0.005, z1 - 0.6);
      break;
    }
    case "bank": {
      add(counter(Math.min(2.6, W - 1)), cx, 0, z0 + 0.8);
      add(createTypewriter(), cx - 0.5, 1.1, z0 + 0.8);
      add(diningSet(4), x1 - 1.1, 0, cz + 0.6, Math.PI / 2);
      add(createClock(), x0 + 0.35, 0, z0 + 0.4);
      break;
    }
    case "gallery": {
      const sc = createShowcase();
      add(sc, cx, 0, cz);
      add(createGlobe(), cx, sc.userData.top, cz);
      add(createBench(1.4), cx, 0, z1 - 0.7);
      add(createFrame(0.6, 0.45, landscape(seed + 1)), x0 + 0.08, 1.7, cz, Math.PI / 2);
      add(createFrame(0.6, 0.45, landscape(seed + 2)), x1 - 0.08, 1.7, cz, -Math.PI / 2);
      break;
    }
    default: {
      // a living room / study
      model("bookshelf", cx - 0.6, z0 + 0.25);
      add(createBooks(0.9, { seed }), cx - 0.6, 1.42, z0 + 0.3);
      add(createRug(Math.min(2.6, W - 0.8), Math.min(1.8, D - 0.8)), cx, 0, cz);
      add(createGlobe(), cx + 0.8, 0, z0 + 0.5).scale.setScalar(1.6);
      add(createRadio("This is the news. The weather tonight: cold and clear over New Jersey."), x1 - 0.5, 0, z1 - 0.5, Math.PI);
      add(createStandingLamp({ intensity: 1.2 }), x0 + 0.4, 0, z1 - 0.4).userData.light.castShadow = false;
    }
  }
}
