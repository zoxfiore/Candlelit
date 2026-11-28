// main.js only connects the pieces together. No story logic here.
//
//   assets/ + world/                     load the asset files, rooms, models         (Student 1: World)
//   characters/ + lights/ + shaders/     people, candles, GLSL flame    (Student 2: Characters & Light)
//   story/ + ui/                         scroll, chapters, camera, subtitles, audio  (Student 3: Story & UI)
//   stories/<id>/           each story: its sets, chapter texts, evidence (stories/index.js lists them)

import * as THREE from "three";
import "./styles/base.css";
import "./styles/overlays.css";

import { createRenderer } from "./core/renderer.js";
import { createPost } from "./core/post.js";
import { createCamera } from "./core/camera.js";
import { handleResize } from "./core/resize.js";
import { loadAssets } from "./assets/loader.js";

import { createScroll } from "./story/scroll.js";
import { createDirector } from "./story/director.js";
import { createInput } from "./story/input.js";
import { createFirstPerson } from "./story/firstPerson.js";
import { createInspect } from "./ui/inspect.js";
import { createCandleCursor } from "./ui/cursor.js";
import { startMusic } from "./audio/music.js";

import { createStartScreen } from "./ui/startScreen.js";
import { createTitleCard } from "./ui/titleCard.js";
import { createSubtitles } from "./ui/subtitles.js";
import { createNarrator } from "./ui/narrator.js";
import { createHud } from "./ui/hud.js";
import { createDebug } from "./ui/debug.js";
import { createPrompt } from "./ui/prompt.js";
import { createRail } from "./ui/rail.js";

import stories from "../stories/index.js";

async function start() {
  // ---------- 1. load every asset file (models, textures, character images) ----------
  const startScreen = createStartScreen();
  await loadAssets((progress) => startScreen.setProgress(progress));

  // ---------- 2. the viewer picks a story (?story=id preselects it) ----------
  const params = new URLSearchParams(window.location.search);
  const picked = await startScreen.pick(stories, params.get("story"));
  startScreen.preparing();
  const { story, evidence, caseFile } = (await picked.load()).default;
  document.title = `Candlelit — ${picked.title} ${picked.subtitle}`;
  document.querySelector("#casefile .cf-label").textContent = caseFile;
  document.querySelector("#casefile .cf-count").textContent = `0 / ${evidence.length}`;

  // ---------- 3. setup ----------
  const renderer = createRenderer(document.getElementById("app"));
  const camera = createCamera();
  handleResize(renderer, camera);

  const post = createPost(renderer, camera); // bloom + film grain
  const input = createInput();
  const prompt = createPrompt();
  const firstPerson = createFirstPerson({ camera, canvas: renderer.domElement }); // walk with the candle
  const director = createDirector({ renderer, camera, story, post, input, prompt, evidence, firstPerson }); // builds every set of the story
  const scroll = createScroll(director.totalScreens);
  // ?dev: handles for testing / rehearsing (the director: every chapter, its set and its scene)
  if (params.has("dev")) Object.assign((window.candlelitDev ??= {}), { director, scroll });
  director.onGate((gate) => prompt.show(gate));

  const inspect = createInspect({
    total: evidence.length,
    camera,
    input,
    getScene: () => director.current?.set.scene,
    // clues are found in first person only: walking to them with the candle IS the task
    isBlocked: () => !document.body.classList.contains("started") || !firstPerson.active,
  });
  const cursor = createCandleCursor({ camera, input, getScene: () => director.current?.set.scene });
  const rail = createRail({ chapters: director.chapters, onJump: (c) => scroll.goTo(c.start + 0.08) });

  const titleCard = createTitleCard();
  const subtitles = createSubtitles();
  const narrator = createNarrator();
  const hud = createHud();
  const debug = createDebug(renderer);

  // when a new chapter starts: new title, new voice-over, new debug sliders
  director.onChapterChange((chapter) => {
    titleCard.show(chapter);
    rail.show(chapter);
    narrator.play(chapter);
    debug.showScene(chapter.set.scene, chapter.title);
  });

  // While you PLAY (an interaction, first person, reading), the page cannot scroll at all:
  // no scroll fighting the gate, no drifting into the next chapter, no lag.
  const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);
  const playing = () => ["waiting", "first-person", "inspecting"].some((c) => document.body.classList.contains(c));
  const block = (e) => playing() && e.cancelable && e.preventDefault();
  window.addEventListener("wheel", block, { passive: false });
  window.addEventListener("touchmove", block, { passive: false });
  window.addEventListener("keydown", (e) => SCROLL_KEYS.has(e.key) && block(e));
  new MutationObserver(() => document.documentElement.classList.toggle("no-scroll", playing())).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // when a first-person task is done, the film continues on its own (scroll again to take over)
  window.addEventListener("candlelit:taskdone", (e) => {
    const chapter = e.detail;
    document.documentElement.classList.remove("no-scroll"); // never stay locked after a task
    setTimeout(() => scroll.autoplay(chapter.end + 0.35, 5), 900); // after the camera is back in the film
  });

  // ---------- 4. the render loop (runs ~60 times per second) ----------
  const timer = new THREE.Timer();
  timer.connect(document);

  function animate(timestamp) {
    requestAnimationFrame(animate);
    timer.update(timestamp);
    const delta = Math.min(timer.getDelta(), 0.1); // avoid big jumps after the tab was hidden
    const time = timer.getElapsed();

    // while reading a document, the story does not move
    const paused = inspect.open;
    if (paused && Math.abs(window.scrollY / (window.innerHeight || 1) - scroll.current) > 0.01) scroll.jumpTo(scroll.current);
    const screens = paused ? scroll.current : scroll.update(delta, director.limit(scroll.current));
    const { chapter, t } = director.update(screens, time, delta);
    if (firstPerson.active) input.pointer.set(0, 0); // in first person you aim with the centre of the screen
    const wasOpen = inspect.open;
    inspect.update();
    if (inspect.open && !wasOpen) firstPerson.release(); // free the mouse to read
    input.endFrame();
    subtitles.update(chapter, t);
    hud.update(screens, director.totalScreens);
    cursor.update(delta);
  }
  requestAnimationFrame(animate);

  // ---------- 5. begin (the click on the story card already unlocked the sound) ----------
  // shortcut for testing / the presentation: ?story=einstein&chapter=3 jumps straight to chapter 3
  const jump = Number(params.get("chapter"));
  startScreen.hide();
  if (jump && director.chapters[jump - 1]) scroll.jumpTo(director.chapters[jump - 1].start + 0.1);
  document.body.classList.add("started");
  narrator.unlock();
  startMusic(); // the dark theme: starts now, never stops between chapters
  narrator.play(director.current);
}

start();
