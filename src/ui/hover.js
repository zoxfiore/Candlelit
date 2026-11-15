// Hover detection with a Raycaster.
// A raycaster shoots an invisible ray from the camera through the mouse position
// and returns every 3D object it touches, nearest first.
// If the object (or one of its parents) has userData.info, we show the tooltip for it
// and make it glow a little.

import * as THREE from "three";

export function createHover({ camera, getScene, tooltip }) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let screenX = 0;
  let screenY = 0;
  let inside = false;
  let highlighted = null;

  window.addEventListener("pointermove", (e) => {
    // convert pixels to "normalized device coordinates": -1..1 on both axes, y up
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    screenX = e.clientX;
    screenY = e.clientY;
    inside = true;
  });
  document.addEventListener("pointerleave", () => (inside = false));

  function findInfo(hit) {
    const obj = hit.object;
    if (obj.userData.noHover) return null;
    // cards: ignore the transparent part around the drawing
    if (obj.userData.isSolidAt && hit.uv && !obj.userData.isSolidAt(hit.uv)) return null;
    // walk up the parents until we find an info key
    for (let o = obj; o; o = o.parent) if (o.userData.info) return { key: o.userData.info, object: obj };
    return { key: null, object: obj }; // a solid object with no info (a wall): stops the ray
  }

  function setHighlight(object) {
    if (highlighted === object) return;
    if (highlighted) highlighted.material.emissiveIntensity = highlighted.userData.baseGlow;
    highlighted = object && object.userData.baseGlow !== undefined ? object : null;
    if (highlighted) highlighted.material.emissiveIntensity = highlighted.userData.baseGlow + 0.35;
  }

  return {
    /** call every frame (the camera moves, so what is under the mouse changes even if the mouse doesn't) */
    update() {
      const scene = getScene();
      if (!inside || !scene) return;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      let found = null;
      for (const hit of hits) {
        const result = findInfo(hit);
        if (result) {
          found = result;
          break;
        }
      }
      if (found && found.key) {
        tooltip.show(found.key, screenX, screenY);
        setHighlight(found.object);
      } else {
        tooltip.hide();
        setHighlight(null);
      }
    },
  };
}
