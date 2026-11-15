// main.js only connects the pieces together. No story logic here.
//
//   assets/ + world/                     load the asset files, rooms, models         (Student 1: World)
//   characters/ + lights/ + shaders/     people, hover cards, candles, GLSL flame    (Student 2: Characters & Light)
//   story/ + ui/                         scroll, chapters, camera, subtitles, audio  (Student 3: Story & UI)
//   stories/einstein/       the story itself: 12 sets, chapter texts, glossary

import * as THREE from "three";
import "./styles/base.css";
import "./styles/overlays.css";

import { createRenderer } from "./core/renderer.js";
import { createCamera } from "./core/camera.js";
import { handleResize } from "./core/resize.js";
import { loadAssets } from "./assets/loader.js";

import { createScroll } from "./story/scroll.js";
import { createDirector } from "./story/director.js";

import { createStartScreen } from "./ui/startScreen.js";
import { createTitleCard } from "./ui/titleCard.js";
import { createSubtitles } from "./ui/subtitles.js";
import { createTooltip } from "./ui/tooltip.js";
import { createHover } from "./ui/hover.js";
import { createNarrator } from "./ui/narrator.js";
import { createHud } from "./ui/hud.js";
import { createDebug } from "./ui/debug.js";

import story from "../stories/einstein/story.js";
import glossary from "../stories/einstein/glossary.js";

async function start() {
  // ---------- 1. load every asset file (models, textures, character images) ----------
  const startScreen = createStartScreen();
  await loadAssets((progress) => startScreen.setProgress(progress));
  startScreen.ready();

  // ---------- 2. setup ----------
  const renderer = createRenderer(document.getElementById("app"));
  const camera = createCamera();
  handleResize(renderer, camera);

  const director = createDirector({ renderer, camera, story }); // builds the 12 sets
  const scroll = createScroll(director.totalScreens);

  const titleCard = createTitleCard();
  const subtitles = createSubtitles();
  const narrator = createNarrator();
  const hud = createHud();
  const debug = createDebug(renderer);
  const hover = createHover({ camera, getScene: () => director.current?.set.scene, tooltip: createTooltip(glossary) });

  // when a new chapter starts: new title, new voice-over, new debug sliders
  director.onChapterChange((chapter) => {
    titleCard.show(chapter);
    narrator.play(chapter);
    debug.showScene(chapter.set.scene, chapter.title);
  });

  // ---------- 3. the render loop (runs ~60 times per second) ----------
  const timer = new THREE.Timer();
  timer.connect(document);

  function animate(timestamp) {
    requestAnimationFrame(animate);
    timer.update(timestamp);
    const delta = Math.min(timer.getDelta(), 0.1); // avoid big jumps after the tab was hidden
    const time = timer.getElapsed();

    const screens = scroll.update(delta);
    const { chapter, t } = director.update(screens, time, delta);
    subtitles.update(chapter, t);
    hud.update(screens, director.totalScreens);
    hover.update();
  }
  requestAnimationFrame(animate);

  // ---------- 4. wait for "Begin the story" ----------
  // shortcut for testing / the presentation: ?chapter=5 jumps straight to chapter 5
  const jump = Number(new URLSearchParams(window.location.search).get("chapter"));
  await startScreen.waitForClick();
  if (jump) scroll.jumpTo(director.chapters[jump - 1].start + 0.1);
  narrator.unlock();
  narrator.play(director.current);
}

start();
