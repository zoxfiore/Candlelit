// Debug panel (lil-gui). Open the page with  ?debug  at the end of the URL to see it.
// It shows global settings + a slider for every light of the current chapter,
// so we can tune the lighting live and then copy the good values into the set files.

import GUI from "lil-gui";

export function createDebug(renderer) {
  if (!new URLSearchParams(window.location.search).has("debug")) {
    return { showScene() {} };
  }

  const gui = new GUI({ title: "Debug" });
  gui.add(renderer, "toneMappingExposure", 0.2, 3, 0.01).name("exposure");
  let lightsFolder = null;

  return {
    /** rebuild the "lights" folder for the scene now on screen */
    showScene(scene, name) {
      if (lightsFolder) lightsFolder.destroy();
      lightsFolder = gui.addFolder(`Lights — ${name}`);
      let n = 0;
      scene.traverse((obj) => {
        if (!obj.isLight) return;
        n++;
        const folder = lightsFolder.addFolder(`${obj.type} ${n}`);
        // candles and lamps change their intensity every frame from baseIntensity: edit that one
        const owner = obj.parent?.userData.baseIntensity !== undefined ? obj.parent.userData : obj;
        const key = owner === obj ? "intensity" : "baseIntensity";
        folder.add(owner, key, 0, 100, 0.1).name("intensity");
        folder.addColor(obj, "color");
        folder.add(obj, "visible");
        folder.close();
      });
    },
  };
}
