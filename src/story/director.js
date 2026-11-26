// The story director: the brain of the engine.
// Every frame it answers: "which chapter are we in, and how far into it (t = 0..1)?"
// Then it:
//   - renders that chapter's scene (only one scene at a time) through the post-processing
//   - moves the camera (cameraRig)
//   - fades to black near the chapter borders (like a cut in a film)
//   - tells the UI when the chapter changes (title, subtitles, voice-over)
//   - stops the scroll at INTERACTION GATES until the viewer does something
//
// A gate is chapter data:  gates: [{ id: "candle", at: 0.2, prompt: "Move the candle…" }]
// The set receives ctx.gate = "candle" while the story waits, and calls ctx.resolve("candle").

import { createCameraRig } from "./cameraRig.js";
import { faceCamera } from "../characters/billboard.js";
import { installEvidence } from "../world/evidence.js";

const FADE = 0.06; // part of the chapter used to fade in / out

export function createDirector({ renderer, camera, story, post, input, prompt, evidence = [] }) {
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
    for (const g of chapter.gates ?? []) gates.push({ ...g, chapter: entry, screens: start + g.at * chapter.screens, done: false });
    start += chapter.screens;
    return entry;
  });
  const totalScreens = start;

  // compile all shaders now, so switching chapters later does not freeze the page
  for (const c of chapters) renderer.compile(c.set.scene, camera);

  const fadeElement = document.getElementById("fade");
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
      for (const g of gates) if (!g.done && g.screens >= screens - 0.05 && g.screens < max) max = g.screens;
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
      const waiting = gates.find((g) => !g.done && g.chapter === chapter && screens >= g.screens - 0.08 && screens <= g.screens + 0.05) ?? null;
      if (waiting !== activeGate) {
        activeGate = waiting;
        gateListeners.forEach((fn) => fn(waiting));
      }

      rig.update(chapter.camera, t, delta);
      chapter.set.update(time, delta, t, { input, camera, rig, gate: activeGate?.id ?? null, resolve, progress: (p) => prompt?.progress(p), done: (id) => gates.some((g) => g.id === id && g.done) });
      faceCamera(chapter.set.scene, camera);

      // fade: black at the edges of a chapter (not at the very start or the very end of the story)
      let fade = 0;
      if (chapter.index > 0) fade = Math.max(fade, 1 - t / FADE);
      if (chapter.index < chapters.length - 1) fade = Math.max(fade, (t - (1 - FADE)) / FADE);
      fadeElement.style.opacity = Math.min(1, Math.max(0, fade));

      post.render(chapter.set.scene, time);
      return { chapter, t };
    },
  };
}
