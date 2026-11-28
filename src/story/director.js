// The story director: the brain of the engine.
// Every frame it answers: "which chapter are we in, and how far into it (t = 0..1)?"
// Then it:
//   - renders that chapter's scene (only one scene at a time) through the post-processing
//   - moves the camera (cameraRig)
//   - blends into the next chapter at the end of each one (both scenes drawn, soft dissolve: no cut)
//   - tells the UI when the chapter changes (title, subtitles, voice-over)
//   - stops the scroll at INTERACTION GATES until the viewer does something
//
// A gate is chapter data:  gates: [{ id: "candle", at: 0.2, prompt: "Move the candle…" }]
// The set receives ctx.gate = "candle" while the story waits, and calls ctx.resolve("candle").

import * as THREE from "three";
import { createCameraRig } from "./cameraRig.js";
import { faceCamera } from "../characters/billboard.js";
import { installEvidence } from "../world/evidence.js";
import { setTask } from "../ui/task.js";

const BLEND = 0.08; // the last 8 % of a chapter blends into the next one
const smooth = (x) => x * x * (3 - 2 * x);

export function createDirector({ renderer, camera, story, post, input, prompt, evidence = [] , firstPerson }) {
  const rig = createCameraRig(camera);
  const listeners = [];
  const gateListeners = [];

  // build every chapter's set once at the start, and remember where each chapter starts (in screens)
  let start = 0;
  const gates = [];
  const chapters = story.chapters.map((chapter, index) => {
    const set = chapter.set();
    installEvidence(set, evidence.filter((e) => e.chapter === index + 1));
    const entry = { ...chapter, index, set, start, end: start + chapter.screens, isLast: index === story.chapters.length - 1 };
    // the film's small interactions (swing the lamp, cut the brain...) no longer stop the scroll:
    // they play by themselves when the story reaches them ("auto"). Only the first-person part stops it.
    for (const g of chapter.gates ?? []) gates.push({ ...g, chapter: entry, screens: start + g.at * chapter.screens, done: false, auto: true });
    // first-person investigation near the end of the chapter: walk with the candle and find its clue
    // the LAST clue of the chapter ends the investigation (a chapter can have steps before it)
    const clue = evidence.filter((e) => e.chapter === index + 1).at(-1);
    if (firstPerson && clue && !chapter.noExplore) {
      gates.push({
        id: `explore-${index + 1}`, kind: "explore", clue, chapter: entry, screens: start + 0.89 * chapter.screens, done: false,
        prompt: chapter.explorePrompt ?? "Click to take the candle. Walk with W A S D (Z Q S D), look with the mouse, and find the glowing clue.",
      });
    }
    start += chapter.screens;
    return entry;
  });
  const totalScreens = start;
  // ?nogates: every interaction counts as done (to rehearse the presentation or test the transitions)
  const url = new URLSearchParams(window.location.search);
  if (url.has("nogates")) for (const g of gates) g.done = true;
  // ?nofilm: skip the film interactions, keep the first-person puzzles (to rehearse / test them)
  if (url.has("nofilm")) for (const g of gates) if (g.kind !== "explore") g.done = true;

  // compile all shaders now, so switching chapters later does not freeze the page
  for (const c of chapters) renderer.compile(c.set.scene, camera);

  // what a chapter's set receives while it is only previewed (during a transition): no input, no gate
  const previewCtx = {
    input: { pointer: new THREE.Vector2(), down: false, clicked: false, keys: new Set() },
    camera: post.nextCamera,
    rig: { offset: new THREE.Vector3() },
    gate: null,
    resolve() {},
    progress() {},
    done: () => false,
  };
  let current = null;
  let activeGate = null;

  function chapterAt(screens) {
    return chapters.find((c) => screens >= c.start && screens < c.end) ?? chapters[chapters.length - 1];
  }

  function resolve(id) {
    const g = gates.find((x) => x.id === id && x.chapter === current);
    if (g && !g.done) {
      g.done = true;
      gateListeners.forEach((fn) => fn(null));
    }
  }

  return {
    chapters,
    totalScreens,
    rig,
    get current() {
      return current;
    },
    /** listen for chapter changes: fn(chapter) */
    onChapterChange(fn) {
      listeners.push(fn);
    },
    /** listen for gates: fn(gate) when the story starts waiting, fn(null) when it continues */
    onGate(fn) {
      gateListeners.push(fn);
    },

    /** how far the viewer may scroll right now: the first unsolved gate ahead of them */
    limit(screens) {
      let max = totalScreens;
      for (const g of gates) if (!g.done && !g.auto && g.screens >= screens - 0.05 && g.screens < max) max = g.screens;
      return max;
    },

    update(screens, time, delta) {
      const chapter = chapterAt(screens);
      const t = (screens - chapter.start) / chapter.screens;

      if (chapter !== current) {
        current = chapter;
        rig.offset.set(0, 0, 0);
        listeners.forEach((fn) => fn(chapter));
      }

      // is the story waiting for the viewer?
      // automatic moments happen as soon as the story reaches them
      for (const g of gates) if (g.auto && !g.done && screens >= g.screens) g.done = true;
      const waiting = gates.find((g) => !g.done && !g.auto && g.chapter === chapter && screens >= g.screens - 0.08 && screens <= g.screens + 0.05) ?? null;
      if (waiting !== activeGate) {
        activeGate = waiting;
        gateListeners.forEach((fn) => fn(waiting));
      }

      rig.update(chapter.camera, t, delta);
      // an investigation gate: hand the camera to the viewer (first person, candle in hand)
      if (activeGate?.kind === "explore" && !firstPerson.active && !activeGate.entered) {
        activeGate.entered = true;
        const g = activeGate;
        setTask(chapter.task ?? "Find the glowing clue");
        firstPerson.enter(chapter.set, g.clue, () => {
          setTask(null);
          resolve(g.id);
          // the task is done: the film plays on by itself into the next chapter
          window.dispatchEvent(new CustomEvent("candlelit:taskdone", { detail: chapter }));
        }, { candle: chapter.candle !== false });
      }
      firstPerson?.update(time, delta);
      chapter.set.update(time, delta, t, { input, camera, rig, gate: activeGate?.id ?? null, resolve, progress: (p) => prompt?.progress(p), done: (id) => gates.some((g) => g.id === id && g.done) });
      faceCamera(chapter.set.scene, camera);

      // transition: at the end of a chapter the NEXT one is already alive (its set animates, filmed
      // from its first shot) and the two pictures dissolve into each other. When the blend is complete
      // the chapter switches, and the camera is exactly where the next picture was: no cut.
      let next = null;
      const following = chapters[chapter.index + 1];
      if (following && t > 1 - BLEND && !firstPerson?.active) {
        const mix = smooth((t - (1 - BLEND)) / BLEND);
        rig.place(post.nextCamera, following.camera);
        following.set.update(time, delta, 0, previewCtx);
        faceCamera(following.set.scene, post.nextCamera);
        next = { scene: following.set.scene, mix };
      }
      // ambient occlusion fades in at the start of a chapter and out during a blend
      const ao = Math.min(chapter.index > 0 ? Math.min(1, t / 0.04) : 1, 1 - (next?.mix ?? 0));
      post.render(chapter.set.scene, time, next, ao);
      return { chapter, t };
    },
  };
}
