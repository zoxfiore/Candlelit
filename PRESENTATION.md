# Presentation brief

This file describes the final presentation of the project: what to present, in which order, and who presents
each part. Give this file + the repository to Claude to generate the slide deck.

## Instructions for generating the deck
- Read this file, then the code and docs it points to (`README.md`, `docs/*.md`, `stories/einstein/story.js`).
  Use the real code: short snippets (5–15 lines) copied from the files, never invented code.
- One section per student, in the order below. Every slide shows who presents it.
- Style: dark background, warm candle colours (gold `#e8b860`, cream `#f2e6d4`, near-black `#070505`),
  serif titles (Cormorant Garamond), like the project's start screen.
- Screenshots: run `npm run dev` and capture the chapters listed under "Visuals" (use `?chapter=N`).
- Keep text short: one idea per slide, the student explains the rest out loud.
- Fill the placeholders below (names, date, duration) if they are known; otherwise leave them visible.

## Context
| | |
|---|---|
| Project | **Candlelit — The Stolen Brain of Albert Einstein** |
| What | A scroll-driven 3D story in the browser (three.js / WebGL) |
| Course | WebGL — ENSAM |
| Team | Student 1: `<name>` · Student 2: `<name>` · Student 3: `<name>` |
| Date | `<date>` |
| Duration | `<total minutes>` (suggested: ~5 min per student + 3 min demo) |

## Plan of the presentation

### 1. Introduction — all three (1–2 slides)
- The story in one sentence: in 1955 a doctor took Einstein's brain, kept it for 43 years, hid it in a cider
  box, drove it across America... and today pieces of it are in a museum.
- The idea: a story you **scroll** through: 12 chapters, 12 small candle-lit 3D sets, narration, hover cards.
- Inspiration: our earlier rendered short video (`references/`), rebuilt live and interactive in the browser.
- The team and the split: World / Characters & Light / Story & UI.
- Architecture in one picture: `src/` = the engine (knows nothing about Einstein), `stories/einstein/` = the
  story (data + sets), `public/` = assets (models, textures, characters, audio).

### 2. Student 1 — The World
Guide: `docs/STUDENT-1-WORLD.md`
- **Assets**: glTF models (`.glb`), textures, images in `public/assets/` (AI-generated, see `CREDITS.md`).
  Loading with `GLTFLoader` + `TextureLoader` + `LoadingManager` (the "Loading… %" button).
  Code: `src/assets/loader.js`, `src/assets/manifest.js`.
- **Rooms**: floor + walls from planes, repeated textures (`RepeatWrapping`), tinted with `material.color`.
  Code: `src/world/room.js`.
- **Placing models**: `placeModel()`, `.clone()` so a model can be reused. Code: `src/world/models.js`.
- **InstancedMesh**: the 240 brain blocks in one draw call, appearing while scrolling (`blocks.count`).
  Code: `src/world/brainBlocks.js`, `stories/einstein/sets/05-lab.js`.
- **A set = one scene**: the recipe of a set file. Code: `src/world/set.js`, `stories/einstein/sets/01-study.js`.
- **Trick**: chapter 9, the car doesn't move, the road texture and the poles do. Code: `sets/09-road.js`.
- Visuals: chapter 1 (study), chapter 5 (blocks), chapter 9 (road).

### 3. Student 2 — Characters & Light
Guide: `docs/STUDENT-2-CHARACTERS-AND-LIGHT.md`
- **Cut-out characters**: a PNG on a plane, `alphaTest`, feet at y = 0, proportions kept.
  Code: `src/characters/cutout.js`, `src/characters/cast.js`.
- **Shadows with the character's shape**: `customDepthMaterial` / `customDistanceMaterial`.
- **Billboarding**: cut-outs turn toward the camera around Y. Code: `src/characters/billboard.js`.
- **Hover cards**: Raycaster, mouse → NDC, ignore transparent pixels, `userData.info` → glossary.
  Code: `src/ui/hover.js`, `src/ui/tooltip.js`, `stories/einstein/glossary.js`.
- **Lights**: hemisphere, point (candles), spot (lamps, museum, headlights), directional (moon, sun);
  real-time shadows, flicker made of sine waves. Code: `src/lights/*.js`.
- **GLSL flame shader**: vertex = sway, fragment = teardrop + colours + halo, uniforms, additive blending.
  Code: `src/shaders/flame/vertex.glsl`, `fragment.glsl`, `src/shaders/flameMaterial.js`.
- **Live tuning**: `?debug` panel (lil-gui), tone mapping. Code: `src/ui/debug.js`, `src/core/renderer.js`.
- Visuals: chapter 1 (candle + shadows), chapter 2 (hanging lamp), a hover card open, the `?debug` panel.

### 4. Student 3 — Story & UI
Guide: `docs/STUDENT-3-STORY-AND-UI.md`
- **Render loop**: `requestAnimationFrame`, `THREE.Timer`, delta time. Code: `src/main.js`.
- **Scroll → story**: tall empty div, canvas fixed, `scrollY / innerHeight` = screens, smoothing (lerp).
  Code: `src/story/scroll.js`.
- **The story is data**: one object per chapter (title, set, screens, camera, audio, lines).
  Code: `stories/einstein/story.js`.
- **Director**: which chapter, `t` from 0 to 1, one scene rendered at a time, fade between chapters,
  chapter-change events (observer pattern). Code: `src/story/director.js`.
- **Camera**: from shot A to shot B with smoothstep easing + mouse parallax. Code: `src/story/cameraRig.js`.
- **Subtitles, title cards, voice-over**: lines appear with the scroll, one audio track per chapter
  (narration + music + sound effects). Code: `src/ui/subtitles.js`, `titleCard.js`, `narrator.js`.
- **Start screen**: loading progress, click needed for sound. Code: `src/ui/startScreen.js`.
- Visuals: the start screen, a chapter with subtitles + title card, chapter 12 (museum, ending).

### 5. Live demo — Student 3 drives, all comment (2–3 min)
- Open `http://localhost:5173`, click "Begin the story", scroll chapters 1 → 2 (sound on).
- Jump: `?chapter=5` (blocks appearing), `?chapter=7` (cider box), `?chapter=9` (road).
- Hover a character and an object to show the cards.
- Open `?debug&chapter=2` and move a light slider.
- Backup if something fails: screenshots in the deck.

### 6. Conclusion — all three (1 slide)
- What we learned: scene graph, loaders, lights & shadows, a GLSL shader, raycasting, scroll-driven animation.
- Limits / next steps: the TODO lists in `docs/` (touch support for hover cards, end screen, smaller assets...).
- Credits: assets and narration are AI-generated (`public/assets/CREDITS.md`); sources of the story in
  `docs/STORY.md`.

## Numbers for the slides
- 12 chapters · 12 sets · ~5 minutes of narration · 33.5 screens of scrolling
- 23 3D models · 15 character images · 6 2D props · 8 textures · 12 audio tracks
- 4 light types · 1 custom GLSL shader · 240 instanced blocks · 25 hover cards

## Visuals to capture
| Slide | URL | What to show |
|---|---|---|
| Intro / cover | `/` | start screen |
| Student 1 | `?chapter=1` | the study (room + furniture) |
| Student 1 | `?chapter=5` | the 240 blocks (scroll to the middle of the chapter) |
| Student 1 | `?chapter=9` | the car on the road at night |
| Student 2 | `?chapter=1` | candle light and shadows on the wall |
| Student 2 | `?chapter=2` | hanging lamp, Harvey's shadow |
| Student 2 | any | a hover card open on a character |
| Student 2 | `?debug&chapter=2` | the lil-gui panel |
| Student 3 | `?chapter=3` | title card + subtitles |
| Student 3 | `?chapter=12` | the museum, last line "Scientists are still arguing." |
