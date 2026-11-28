// (The candle-shaped pointer is hidden in CSS: the normal pointer is used.)
// The mouse pointer is a little candle (HTML + SVG drawn above the canvas).
// It follows the mouse with a soft lag, its flame flickers, and when it passes over a PERSON in the
// scene, the flame grows and glows, and the person is lit a little more (as if you brought the
// candle close to their face).
//
// Hidden in first person (you aim with the dot in the middle of the screen there).

import * as THREE from "three";

export function createCandleCursor({ camera, getScene, input }) {
  const el = document.createElement("div");
  el.id = "candle-cursor";
  el.innerHTML = `
    <svg viewBox="0 0 40 72" width="30" height="54" aria-hidden="true">
      <defs>
        <radialGradient id="cc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffd890" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#ff9a30" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cc-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#ff8a20"/>
          <stop offset="55%" stop-color="#ffd060"/>
          <stop offset="100%" stop-color="#fff6d8"/>
        </linearGradient>
      </defs>
      <circle class="cc-halo" cx="20" cy="14" r="16" fill="url(#cc-glow)"/>
      <path class="cc-flame" d="M20 2 C26 10 27 16 20 24 C13 16 14 10 20 2 Z" fill="url(#cc-flame)"/>
      <line x1="20" y1="24" x2="20" y2="28" stroke="#2a1a10" stroke-width="1.5"/>
      <rect x="13" y="28" width="14" height="40" rx="2" fill="#efe2c8"/>
      <rect x="13" y="28" width="14" height="5" rx="2" fill="#fff6e6"/>
      <path d="M15 33 q1 6 0 10" stroke="#e2d0b0" stroke-width="2" fill="none"/>
    </svg>`;
  document.body.append(el);

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const goal = { ...pos };
  window.addEventListener("pointermove", (e) => {
    goal.x = e.clientX;
    goal.y = e.clientY;
  });

  const ray = new THREE.Raycaster();
  let people = null, peopleScene = null;
  let lit = 0;
  let hovered = null;

  return {
    update(delta) {
      // follow the mouse with a little lag (the candle has weight)
      const k = 1 - Math.exp(-22 * delta);
      pos.x += (goal.x - pos.x) * k;
      pos.y += (goal.y - pos.y) * k;
      el.style.transform = `translate(${pos.x - 15}px, ${pos.y - 8}px) rotate(${(goal.x - pos.x) * 0.15}deg)`;

      // over a person?
      const scene = getScene();
      if (scene !== peopleScene) {
        people = [];
        scene?.traverse((o) => o.userData.isPerson && people.push(o));
        peopleScene = scene;
      }
      let person = null;
      if (people.length && !document.body.classList.contains("first-person")) {
        ray.setFromCamera(input.pointer, camera);
        for (const hit of ray.intersectObjects(people, true)) {
          let p = hit.object;
          while (p && !p.userData.isPerson) p = p.parent;
          if (hit.object.userData.isSolidAt && hit.uv && !hit.object.userData.isSolidAt(hit.uv)) continue;
          person = p;
          break;
        }
      }
      lit += ((person ? 1 : 0) - lit) * Math.min(1, delta * 6);
      el.style.setProperty("--lit", lit.toFixed(3));
      el.classList.toggle("lit", lit > 0.5);
      // the person under the candle catches its light
      if (hovered && hovered !== person) setGlow(hovered, 0);
      if (person) setGlow(person, lit);
      hovered = person ?? (lit > 0.02 ? hovered : null);
    },
  };
}

function setGlow(person, amount) {
  person.traverse((o) => {
    const m = o.material;
    if (!m || m.emissiveIntensity === undefined) return;
    const base = o.userData.baseGlow ?? 0;
    m.emissiveIntensity = base + 0.28 * amount;
    if (!o.userData.glowTinted && m.emissive) {
      o.userData.glowTinted = true;
      if (m.emissive.getHex() === 0) m.emissive.set("#ffb070");
    }
  });
}
