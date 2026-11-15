// The story director: the brain of the engine.
// Every frame it answers: "which chapter are we in, and how far into it (t = 0..1)?"
// Then it:
//   - renders that chapter's scene (only one scene at a time)
//   - moves the camera (cameraRig)
//   - fades to black near the chapter borders (like a cut in a film)
//   - tells the UI when the chapter changes (title, subtitles, voice-over)

import { createCameraRig } from "./cameraRig.js";
import { faceCamera } from "../characters/billboard.js";

const FADE = 0.06; // part of the chapter used to fade in / out

export function createDirector({ renderer, camera, story }) {
  const rig = createCameraRig(camera);
  const listeners = [];

  // build every chapter's set once at the start, and remember where each chapter starts (in screens)
  let start = 0;
  const chapters = story.chapters.map((chapter, index) => {
    const set = chapter.set();
    const entry = { ...chapter, index, set, start, end: start + chapter.screens, isLast: index === story.chapters.length - 1 };
    start += chapter.screens;
    return entry;
  });
  const totalScreens = start;

  // compile all shaders now, so switching chapters later does not freeze the page
  for (const c of chapters) renderer.compile(c.set.scene, camera);

  const fadeElement = document.getElementById("fade");
  let current = null;

  function chapterAt(screens) {
    return chapters.find((c) => screens >= c.start && screens < c.end) ?? chapters[chapters.length - 1];
  }

  return {
    chapters,
    totalScreens,
    get current() {
      return current;
    },
    /** listen for chapter changes: fn(chapter) */
    onChapterChange(fn) {
      listeners.push(fn);
    },

    update(screens, time, delta) {
      const chapter = chapterAt(screens);
      const t = (screens - chapter.start) / chapter.screens;

      if (chapter !== current) {
        current = chapter;
        listeners.forEach((fn) => fn(chapter));
      }

      rig.update(chapter.camera, t, delta);
      faceCamera(chapter.set.scene, camera);
      chapter.set.update(time, delta, t);

      // fade: black at the edges of a chapter (not at the very start or the very end of the story)
      let fade = 0;
      if (chapter.index > 0) fade = Math.max(fade, 1 - t / FADE);
      if (chapter.index < chapters.length - 1) fade = Math.max(fade, (t - (1 - FADE)) / FADE);
      fadeElement.style.opacity = Math.min(1, Math.max(0, fade));

      renderer.render(chapter.set.scene, camera);
      return { chapter, t };
    },
  };
}
