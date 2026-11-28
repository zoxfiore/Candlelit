// Textures and shapes made by code (no image file): a canvas is painted with JavaScript,
// then used as a texture. Used by the Tutankhamun story (stone, painted walls, seals, gold).

import * as THREE from "three";

/** paint a canvas with draw(ctx, w, h) and turn it into a texture */
export function canvasTexture(w, h, draw, { repeat = [1, 1], color = true } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 4;
  return t;
}

// a seeded random, so the "random" texture is the same every time
function rng(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

/** rough stone / sandstone: speckles, darker cracks and patches */
export function stoneTexture(base = "#b0875a", { seed = 3, repeat = [1, 1] } = {}) {
  return canvasTexture(512, 512, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = r() < 0.5 ? `rgba(60,35,15,${0.05 + r() * 0.1})` : `rgba(255,235,200,${0.04 + r() * 0.08})`;
      g.beginPath();
      g.ellipse(r() * w, r() * h, 6 + r() * 40, 4 + r() * 24, r() * 3, 0, 7);
      g.fill();
    }
    g.strokeStyle = "rgba(40,22,10,0.35)";
    for (let i = 0; i < 14; i++) {
      g.lineWidth = 0.6 + r() * 1.4;
      g.beginPath();
      let x = r() * w, y = r() * h;
      g.moveTo(x, y);
      for (let k = 0; k < 6; k++) g.lineTo((x += (r() - 0.5) * 70), (y += (r() - 0.3) * 40));
      g.stroke();
    }
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(${r() < 0.5 ? "0,0,0" : "255,240,210"},${r() * 0.12})`;
      g.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
  }, { repeat });
}

/** desert sand: fine grain + soft wind ripples */
export function sandTexture({ seed = 17, repeat = [1, 1] } = {}) {
  return canvasTexture(512, 512, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = "#e4bd88";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 9) {
      g.strokeStyle = `rgba(150,100,50,${0.06 + r() * 0.06})`;
      g.lineWidth = 2 + r() * 2;
      g.beginPath();
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.025 + y * 0.3) * 4);
      g.stroke();
    }
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = r() < 0.5 ? `rgba(120,80,40,${r() * 0.2})` : `rgba(255,245,220,${r() * 0.25})`;
      g.fillRect(r() * w, r() * h, 1.2, 1.2);
    }
  }, { repeat });
}

/** an Egyptian painted wall: ochre plaster, bands of hieroglyphs, a few standing figures */
export function paintedWallTexture({ seed = 7, repeat = [1, 1], figures = true } = {}) {
  return canvasTexture(1024, 512, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = "#d9a85a";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(120,70,20,${r() * 0.08})`;
      g.fillRect(r() * w, r() * h, 3 + r() * 20, 2 + r() * 10);
    }
    // top frieze
    g.fillStyle = "#2f5a6e";
    g.fillRect(0, 18, w, 10);
    g.fillStyle = "#a4372a";
    g.fillRect(0, 30, w, 6);
    // columns of glyphs
    g.strokeStyle = "rgba(42,26,16,0.6)";
    g.fillStyle = "rgba(42,26,16,0.6)";
    g.lineWidth = 2.2;
    const glyph = (x, y, k) => {
      g.beginPath();
      switch (k % 7) {
        case 0: g.ellipse(x, y, 9, 5, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); break; // eye
        case 1: g.moveTo(x - 9, y + 8); g.quadraticCurveTo(x, y - 12, x + 9, y + 8); g.stroke(); break; // hill / bread
        case 2: g.arc(x, y - 4, 5, 0, 7); g.moveTo(x, y + 1); g.lineTo(x, y + 12); g.moveTo(x - 7, y + 4); g.lineTo(x + 7, y + 4); g.stroke(); break; // ankh
        case 3: g.moveTo(x - 10, y + 6); g.lineTo(x - 2, y - 6); g.lineTo(x + 2, y - 3); g.lineTo(x + 9, y + 6); g.stroke(); break; // bird
        case 4: for (let z = -8; z <= 8; z += 4) { g.moveTo(x - 9, y + z); g.lineTo(x + 9, y + z + 2); } g.stroke(); break; // water
        case 5: g.rect(x - 8, y - 8, 16, 16); g.stroke(); break; // house
        default: g.moveTo(x, y - 10); g.lineTo(x, y + 10); g.moveTo(x - 6, y - 4); g.lineTo(x + 6, y - 4); g.stroke(); // reed
      }
    };
    for (let col = 0; col < 26; col++) {
      const x = 30 + col * 38;
      g.globalAlpha = 0.75;
      g.fillRect(x - 17, 50, 1.5, h - 110);
      for (let row = 0; row < 11; row++) glyph(x + 2, 70 + row * 34, Math.floor(r() * 7));
      g.globalAlpha = 1;
      if (figures && col % 6 === 3) {
        // a standing figure in profile (simple silhouette), red skin, white kilt
        const fx = x + 8, fy = h - 60;
        g.fillStyle = "#a4472a";
        g.beginPath(); g.arc(fx, fy - 170, 13, 0, 7); g.fill();
        g.fillRect(fx - 10, fy - 156, 20, 60);
        g.fillStyle = "#efe6d0";
        g.fillRect(fx - 12, fy - 98, 24, 36);
        g.fillStyle = "#a4472a";
        g.fillRect(fx - 9, fy - 62, 7, 60);
        g.fillRect(fx + 3, fy - 62, 7, 60);
        g.fillStyle = "#1c1410";
        g.fillRect(fx - 14, fy - 186, 24, 12);
        g.fillStyle = "#2a1a10";
      }
    }
    // bottom band
    g.fillStyle = "#2a1a10";
    g.fillRect(0, h - 26, w, 26);
  }, { repeat });
}

/** a plastered doorway stamped with oval seals (the necropolis seal: a jackal over nine captives) */
export function sealedPlasterTexture() {
  return canvasTexture(512, 768, (g, w, h) => {
    const r = rng(11);
    g.fillStyle = "#cdb48c";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) {
      g.fillStyle = `rgba(90,60,30,${r() * 0.12})`;
      g.beginPath();
      g.ellipse(r() * w, r() * h, 4 + r() * 30, 3 + r() * 14, r() * 3, 0, 7);
      g.fill();
    }
    g.strokeStyle = "rgba(60,38,18,0.75)";
    g.fillStyle = "rgba(60,38,18,0.6)";
    for (let i = 0; i < 26; i++) {
      const x = 50 + r() * (w - 100), y = 60 + r() * (h - 120), a = (r() - 0.5) * 0.6;
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.lineWidth = 3;
      g.beginPath(); g.ellipse(0, 0, 26, 40, 0, 0, 7); g.stroke();
      // jackal (a crouching shape) over three rows of tiny figures
      g.beginPath(); g.moveTo(-14, -14); g.lineTo(-4, -24); g.lineTo(-2, -16); g.lineTo(14, -16); g.lineTo(14, -10); g.lineTo(-14, -10); g.fill();
      for (let row = 0; row < 3; row++) for (let k = -1; k <= 1; k++) g.fillRect(k * 9 - 2, -2 + row * 11, 4, 8);
      g.restore();
    }
  }, { repeat: [1, 1] });
}

/** stripes of the royal headdress (nemes): gold and blue */
export function nemesTexture() {
  return canvasTexture(64, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 16) {
      g.fillStyle = (y / 16) % 2 ? "#2a5cc8" : "#f0c060";
      g.fillRect(0, y, w, 16);
    }
  }, { repeat: [1, 1] });
}

/**
 * a warm environment for reflections: a gradient sky with a few bright "lamps".
 * Used as scene.environment so GOLD has something to reflect (metal is black without it).
 */
export function warmEnvironment() {
  const t = canvasTexture(512, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#3a2210");
    grd.addColorStop(0.5, "#b07030");
    grd.addColorStop(1, "#1a0e06");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    for (const [x, y, rad] of [[80, 110, 26], [260, 90, 34], [420, 120, 22]]) {
      const b = g.createRadialGradient(x, y, 0, x, y, rad);
      b.addColorStop(0, "rgba(255,230,170,1)");
      b.addColorStop(1, "rgba(255,180,90,0)");
      g.fillStyle = b;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  });
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(1, 1);
  return t;
}

/** a low-poly rock: an icosahedron with its corners pushed in/out (flat shading = faceted look) */
export function createRock({ size = 1, color = "#a8774a", seed = 1, detail = 1, squash = 1 } = {}) {
  const r = rng(seed * 97 + 13);
  const geo = new THREE.IcosahedronGeometry(size, detail);
  const pos = geo.attributes.position;
  const seen = new Map();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    if (!seen.has(key)) seen.set(key, 0.75 + r() * 0.45); // same corner = same push (no cracks)
    const k = seen.get(key);
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * squash, pos.getZ(i) * k);
  }
  geo.computeVertexNormals();
  const rock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true }));
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

/** shiny gold (needs scene.environment to look like gold) */
export function goldMaterial(extra = {}) {
  return new THREE.MeshStandardMaterial({ color: "#f0b94a", metalness: 1, roughness: 0.28, ...extra });
}
