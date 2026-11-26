// The inspect view: click a piece of evidence and it comes up close, like in an adventure game.
//
//   - the 3D scene blurs and darkens behind it (CSS backdrop-filter on the overlay)
//   - the document is drawn in HTML: a handwritten letter, a typed report or a photo of the object
//   - it tilts a little toward the mouse (CSS 3D transform), like holding a real sheet of paper
//   - an "EXHIBIT n" stamp: n = the order in which the viewer found it
//   - the case file counter (bottom left) shows how many of the 12 exhibits were found
//
// Also: the click handler. Every frame we cast a ray under the mouse; if it touches an object with
// userData.evidence, the cursor becomes a magnifying glass, and a click opens the inspect view.

import * as THREE from "three";

export function createInspect({ total, camera, getScene, input, isBlocked }) {
  const overlay = document.getElementById("inspect");
  const sheet = overlay.querySelector(".in-sheet");
  const doc = overlay.querySelector(".in-doc");
  const stamp = overlay.querySelector(".in-stamp");
  const title = overlay.querySelector(".in-title");
  const date = overlay.querySelector(".in-date");
  const caption = overlay.querySelector(".in-caption");
  const note = overlay.querySelector(".in-note");
  const counter = document.getElementById("casefile");
  const counterCount = counter.querySelector(".cf-count");

  const raycaster = new THREE.Raycaster();
  let found = 0;
  let open = false;

  const escape = (s) => s.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch]);

  function show(item) {
    if (!item.found) {
      item.found = true;
      item.exhibit = ++found;
      counterCount.textContent = `${found} / ${total}`;
      counter.classList.remove("bump");
      void counter.offsetWidth; // restart the CSS animation
      counter.classList.add("bump");
    }
    sheet.className = `in-sheet kind-${item.kind}`;
    doc.innerHTML =
      item.kind === "photo"
        ? `<img src="assets/props/${item.image}.png" alt="${escape(item.title)}" />`
        : `<div class="in-text">${escape(item.body).replace(/\n/g, "<br />")}</div>`;
    stamp.textContent = `Exhibit ${String(item.exhibit).padStart(2, "0")}`;
    title.textContent = item.title;
    date.textContent = item.date;
    caption.textContent = item.caption;
    note.hidden = !item.reconstructed;
    overlay.classList.add("open");
    document.body.classList.add("inspecting");
    open = true;
  }

  function close() {
    if (!open) return;
    overlay.classList.remove("open");
    document.body.classList.remove("inspecting");
    open = false;
  }

  overlay.addEventListener("click", close);
  window.addEventListener("keydown", (e) => e.key === "Escape" && close());
  // tilt the sheet toward the mouse
  overlay.addEventListener("pointermove", (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    sheet.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    sheet.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
  });
  // no scrolling the story while reading
  window.addEventListener("wheel", (e) => open && e.preventDefault(), { passive: false });

  return {
    get open() {
      return open;
    },
    /** every frame: hover cursor + click */
    update() {
      const scene = getScene();
      if (open || !scene) return;
      raycaster.setFromCamera(input.pointer, camera);
      let item = null;
      for (const hit of raycaster.intersectObjects(scene.children, true)) {
        const o = hit.object;
        if (o.userData.noHover || o.isPoints || o.isSprite) continue;
        if (o.userData.isSolidAt && hit.uv && !o.userData.isSolidAt(hit.uv)) continue;
        item = o.userData.evidence ?? null;
        break; // the first solid thing under the mouse decides
      }
      const blocked = isBlocked();
      document.body.classList.toggle("can-inspect", !!item && !blocked);
      if (item && !blocked && input.clicked) show(item);
    },
  };
}
