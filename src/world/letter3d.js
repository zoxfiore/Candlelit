// Einstein's last wish: a real sheet of paper in 3D.
//
// On the desk it lies FOLDED IN THREE. When you click it (first person), it rises toward your eyes,
// UNFOLDS (a vertex-shader fold: the top and bottom thirds rotate around their creases), and the
// words WRITE THEMSELVES in ink, letter by letter, lit by the candle in your hand.
// Click again: it folds back and flies into your case file.
//
//   const letter = createLetter3D({ lines: ["No grave.", ...], signature: "A. Einstein" })
//   letter.position.set(...); set.add(letter)
//   letter.userData.interact = () => letter.userData.open(camera)

import * as THREE from "three";
import { rustle, burnSound } from "../audio/synth.js";

const W = 0.21, H = 0.297; // an A4 sheet
const ease = (t) => t * t * (3 - 2 * t);

export function createLetter3D({ lines, signature = "", date = "", ending = "file" }) {
  // ending: "file" = it flies into the case file; "burn" = it burns away in your hands (the last chapter)
  // ---- the paper and the writing: two canvases (full text, and the part written so far) ----
  const CW = 840, CH = 1188;
  const paper = document.createElement("canvas");
  paper.width = CW;
  paper.height = CH;
  const pg = paper.getContext("2d");
  pg.fillStyle = "#efe3c6";
  pg.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 40; i++) {
    pg.fillStyle = `rgba(140,100,50,${0.03 + Math.random() * 0.05})`;
    pg.beginPath();
    pg.ellipse(Math.random() * CW, Math.random() * CH, 30 + Math.random() * 120, 20 + Math.random() * 80, Math.random() * 3, 0, 7);
    pg.fill();
  }
  // the creases of the folds
  pg.strokeStyle = "rgba(90,60,30,0.25)";
  pg.lineWidth = 3;
  for (const y of [CH / 3, (2 * CH) / 3]) {
    pg.beginPath();
    pg.moveTo(0, y);
    pg.lineTo(CW, y);
    pg.stroke();
  }
  const ink = document.createElement("canvas"); // the whole text, drawn once
  ink.width = CW;
  ink.height = CH;
  const view = document.createElement("canvas"); // paper + the text revealed so far
  view.width = CW;
  view.height = CH;
  const vg = view.getContext("2d");
  const texture = new THREE.CanvasTexture(view);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  // where each line is, to reveal them in order
  const rows = [];
  const drawInk = () => {
    const g = ink.getContext("2d");
    g.clearRect(0, 0, CW, CH);
    g.fillStyle = "#121a30";
    g.strokeStyle = "rgba(18,26,48,0.55)"; // a thin outline makes the pen stroke look wetter, thicker
    g.lineWidth = 1.2;
    g.textBaseline = "alphabetic";
    let y = 210;
    if (date) {
      g.font = '34px "Homemade Apple", cursive';
      const w = g.measureText(date).width;
      g.fillText(date, CW - 80 - w, 120);
      rows.push({ y: 120, w: CW, h: 70, x: CW - 90 - w });
    }
    g.font = '52px "Homemade Apple", cursive';
    for (const line of lines) {
      const w = g.measureText(line).width;
      g.fillText(line, 80, y);
      g.strokeText(line, 80, y);
      rows.push({ y, w: Math.min(CW - 80, w + 20), h: 80 });
      y += line ? 104 : 60;
    }
    if (signature) {
      g.font = '58px "Homemade Apple", cursive';
      const w = g.measureText(signature).width;
      g.fillText(signature, CW - 100 - w, y + 60);
      g.strokeText(signature, CW - 100 - w, y + 60);
      rows.push({ y: y + 60, w: CW, h: 90, x: CW - 100 - w - 10 });
    }
  };
  // wait for the handwriting font, so the canvas does not draw with a fallback font
  (document.fonts?.load('52px "Homemade Apple"') ?? Promise.resolve()).then(drawInk, drawInk);

  let written = 0; // 0..1
  const redraw = () => {
    vg.drawImage(paper, 0, 0);
    let chars = written * rows.length;
    for (const r of rows) {
      const k = Math.min(1, Math.max(0, chars));
      if (k > 0) {
        const x0 = r.x ?? 70;
        const w = (r.w - (x0 - 70)) * k;
        vg.drawImage(ink, x0, r.y - r.h + 20, w, r.h, x0, r.y - r.h + 20, w, r.h);
      }
      chars -= 1;
    }
    texture.needsUpdate = true;
  };
  redraw();

  // ---- the mesh: a plane with many rows, folded in the vertex shader ----
  const geometry = new THREE.PlaneGeometry(W, H, 8, 48);
  // in your hands the paper must stay readable whatever lights are around: it "glows" with its own
  // warm light (emissive = the paper itself) and reacts only a little to the lamps (color scaled down)
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, side: THREE.DoubleSide, emissive: "#ffe8c8", emissiveMap: texture, emissiveIntensity: 0 });
  const setReading = (r) => {
    material.color.setScalar(1 - 0.85 * r);
    material.emissiveIntensity = 0.62 * r;
  };
  const uFold = { value: 1 };
  const uBurn = { value: 0 };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFold = uFold;
    shader.uniforms.uBurn = uBurn;
    // burning: each point of the paper gets a "burn time" from a noise (+ the bottom edge first);
    // past it the pixel is gone (discard), just before it the paper glows like an ember
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
        uniform float uBurn;
        float bHash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float bNoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(bHash(i), bHash(i + vec2(1, 0)), f.x), mix(bHash(i + vec2(0, 1)), bHash(i + vec2(1, 1)), f.x), f.y);
        }`)
      .replace("#include <dithering_fragment>", `#include <dithering_fragment>
        if (uBurn > 0.0) {
          float n = bNoise(vMapUv * 7.0) * 0.6 + bNoise(vMapUv * 19.0) * 0.25 + (1.0 - vMapUv.y) * 0.35;
          float level = uBurn * 1.3 - 0.1;
          if (n < level) discard;
          float edge = 1.0 - smoothstep(level, level + 0.07, n);
          float char = 1.0 - smoothstep(level, level + 0.2, n);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.25, char);
          gl_FragColor.rgb += vec3(1.0, 0.42, 0.08) * edge * 2.4;
        }`);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
        uniform float uFold;
        // rotate a point / a normal of one third of the sheet around its crease (a line along x)
        vec3 foldAround(vec3 p, float pivotY, float angle) {
          float c = cos(angle), s = sin(angle);
          vec2 q = vec2(p.y - pivotY, p.z);
          return vec3(p.x, pivotY + q.x * c - q.y * s, q.x * s + q.y * c);
        }`)
      .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>
        {
          float h3 = ${(H / 6).toFixed(5)};
          if (position.y < -h3) objectNormal = foldAround(objectNormal, 0.0, -uFold * 3.08);
          else if (position.y > h3) objectNormal = foldAround(objectNormal, 0.0, uFold * 3.02);
        }`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        {
          float h3 = ${(H / 6).toFixed(5)};
          if (position.y < -h3) transformed = foldAround(transformed, -h3, -uFold * 3.08) + vec3(0.0, 0.0, 0.0012 * uFold);
          else if (position.y > h3) transformed = foldAround(transformed, h3, uFold * 3.02) + vec3(0.0, 0.0, 0.0024 * uFold);
        }`);
  };
  const sheet = new THREE.Mesh(geometry, material);
  sheet.castShadow = true;
  sheet.receiveShadow = true;
  // custom depth for its shadow (folded or not) would need the same fold: we skip it, shadows stay right on the desk
  const letter = new THREE.Group();
  letter.add(sheet);
  // an invisible, bigger "hit zone" so the folded letter is easy to aim at (material.visible = false:
  // not drawn, but the raycaster still finds it)
  const hitZone = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.08), new THREE.MeshBasicMaterial({ visible: false }));
  letter.add(hitZone);

  // ---- the animation: rest on the desk -> in your hands -> back into the case file ----
  let state = "rest"; // rest | rising | reading | leaving | gone
  let clock = 0;
  let camera = null;
  let onClose = null;
  const restPos = new THREE.Vector3();
  const restQuat = new THREE.Quaternion();
  const fromPos = new THREE.Vector3();
  const fromQuat = new THREE.Quaternion();
  const hold = new THREE.Vector3();
  const holdQuat = new THREE.Quaternion();
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0, 0.03));

  const closeOnClick = (e) => {
    if (state !== "reading" || clock < 0.4) return;
    if (e.type === "keydown" && e.key !== "Escape") return;
    state = "leaving";
    clock = 0;
    fromPos.copy(letter.position);
    fromQuat.copy(letter.quaternion);
    if (ending === "burn") burnSound();
    else rustle();
  };
  window.addEventListener("pointerdown", closeOnClick);
  window.addEventListener("keydown", closeOnClick);

  letter.userData.open = (cam, done) => {
    if (state !== "rest") return;
    camera = cam;
    onClose = done;
    restPos.copy(letter.position);
    restQuat.copy(letter.quaternion);
    fromPos.copy(letter.position);
    fromQuat.copy(letter.quaternion);
    state = "rising";
    clock = 0;
    document.body.classList.add("inspecting", "reading-letter");
    document.exitPointerLock?.();
    rustle();
  };
  letter.userData.isBusy = () => state === "rising" || state === "reading" || state === "leaving";

  letter.userData.update = (time, delta = 0.016) => {
    hitZone.visible = state === "rest";
    if (state === "rest" || state === "gone") return;
    clock += delta;
    // where "in your hands" is: 55 cm in front of the eyes, facing you
    hold.set(0, -0.005, -0.55).applyQuaternion(camera.quaternion).add(camera.position);
    holdQuat.copy(camera.quaternion).multiply(tilt);
    if (state === "rising") {
      const k = ease(Math.min(1, clock / 1.0));
      letter.position.lerpVectors(fromPos, hold, k);
      letter.position.y += Math.sin(k * Math.PI) * 0.08; // a little arc, as if picked up
      letter.quaternion.slerpQuaternions(fromQuat, holdQuat, k);
      uFold.value = 1 - ease(THREE.MathUtils.clamp((clock - 0.5) / 0.9, 0, 1));
      setReading(ease(Math.min(1, clock / 1.0)));
      if (clock > 1.4) {
        state = "reading";
        clock = 0;
      }
    } else if (state === "reading") {
      // follow the head softly, with a tiny breathing sway
      letter.position.lerp(hold, 1 - Math.exp(-8 * delta));
      letter.position.y += Math.sin(time * 1.4) * 0.0004;
      letter.quaternion.slerp(holdQuat, 1 - Math.exp(-8 * delta));
      const before = written;
      written = Math.min(1, written + delta / (0.45 * (lines.length + 1)));
      if (written !== before) redraw();
    } else if (state === "leaving" && ending === "burn") {
      // the last time: the paper catches fire from the bottom and burns away in your hands
      letter.position.lerp(hold, 1 - Math.exp(-8 * delta));
      letter.quaternion.slerp(holdQuat, 1 - Math.exp(-8 * delta));
      uBurn.value = Math.min(1, clock / 3.2);
      if (clock > 3.4) {
        state = "gone";
        letter.visible = false;
        document.body.classList.remove("inspecting", "reading-letter");
        onClose?.();
      }
    } else if (state === "leaving") {
      // fold, then fly down-left into the case file (bottom left of the screen) and vanish
      uFold.value = ease(Math.min(1, clock / 0.6));
      setReading(1 - ease(Math.min(1, clock / 0.8)));
      const target = new THREE.Vector3(-0.85, -0.85, 0.5).unproject(camera);
      const dir = target.sub(camera.position).normalize();
      const caseFile = camera.position.clone().addScaledVector(dir, 0.5);
      const k = ease(THREE.MathUtils.clamp((clock - 0.45) / 0.6, 0, 1));
      letter.position.lerpVectors(hold, caseFile, k);
      letter.quaternion.copy(holdQuat);
      letter.scale.setScalar(1 - 0.8 * k);
      if (clock > 1.1) {
        state = "gone";
        letter.visible = false;
        document.body.classList.remove("inspecting", "reading-letter");
        onClose?.();
      }
    }
  };
  return letter;
}
