# Candlelit — Project Plan

## 1. The idea
Scroll-driven 3D stories in the browser, built from scratch with three.js.
As the user scrolls, the camera moves through a dark, candle-lit 3D scene and a story plays in chapters:
the camera moves, lights change, objects appear, effects trigger.

The **engine** (everything in `src/`) is the same for every story.
A **story** is just data + a few story-specific objects, in its own folder: `stories/<name>/`.

References: `references/` holds two earlier story videos made with WebGL (Einstein's brain, Mary Shelley).
We rebuild that idea live in the browser, scroll-driven, with the same stack. See `references/CONTEXT.md`.

First story (not final): **Shakespeare's grave** — a dark church, the curse carved on the gravestone,
a radar scan that reveals the skull is missing.

## 2. What is graded (our priorities)
1. **Lighting** — ambient, point, spot, directional; real-time shadows; flickering candles; moonlight; glow
2. **Custom GLSL shaders** — candle flame, radar/scan reveal, film grain + vignette
3. **Post-processing** — bloom, depth of field, vignette/grain
4. **Particles** — dust in the light beams, candle sparks/smoke
5. **Procedural world** — geometry built in code, minimal downloaded assets

Rules: our own three.js code, no editor, no AI-generated assets, no backend. Every line must be explainable by both of us.

## 3. Stack
- Vite (dev server + build)
- three.js
- lil-gui (debug sliders)
- Plain JavaScript (ES modules), no TypeScript, no framework

## 4. Folder structure
```
Candlelit/
├── index.html              page + scroll container
├── package.json
├── src/
│   ├── main.js             renderer, scene, camera, render loop (kept small!)
│   ├── world/              procedural geometry: room, floor, walls, pillars, props    [B]
│   ├── lights/             light setup, candle flicker, moonlight, shadows            [A]
│   ├── shaders/            custom GLSL (.glsl files + the materials that use them)     [A]
│   ├── post/               post-processing: bloom, DoF, vignette/grain                 [A]
│   ├── story/              the story ENGINE: scroll → progress → chapters, camera path [B]
│   └── ui/                 lil-gui debug panel, text overlays                          [shared]
└── stories/
    └── shakespeare/        one story: chapters, texts, story-specific objects         [B]
```
`[A]` / `[B]` = who owns the folder (see section 6). Owning a folder means you are the one who edits it;
the other person can read it and suggest changes in the pull request.

## 5. How the pieces talk to each other (contracts)
Agreeing on these early lets us work in parallel without waiting for each other.

- **Every module exports a `create…()` function** that builds things and adds them to the scene, and
  returns an object. If it animates, that object has an `update(time, delta)` method.
  ```js
  // example
  const candle = createCandle(scene, { position: new THREE.Vector3(0, 1, 0) })
  // in the loop:
  candle.update(time, delta)
  ```
- **`main.js`** only wires things together: create renderer/scene/camera, call the `create…()` functions,
  call every `update()` in the loop. No feature logic in `main.js`.
- **A story** (`stories/<name>/story.js`) exports a list of chapters. Each chapter says, for a scroll range:
  where the camera is and looks, which lights are on/at what intensity, and which events fire.
  ```js
  export default {
    title: 'The Grave',
    chapters: [
      { from: 0.0, to: 0.2, camera: {...}, lights: {...}, text: '...' },
      { from: 0.2, to: 0.5, ..., onEnter: (world) => { /* start radar scan */ } },
    ],
  }
  ```
  The exact format is decided in Milestone 2 by B and reviewed by A.
- **Debug sliders**: each module adds its own folder to the shared lil-gui panel (`ui/debug.js` passes
  the `gui` object in). This keeps `ui/` almost conflict-free.

## 6. Who does what
| Person | Name | Owns | Focus |
|---|---|---|---|
| **A** | Zohair | `src/lights/`, `src/shaders/`, `src/post/` | how it *looks*: light, shadows, GLSL, bloom, DoF, grain, particles |
| **B** | TBD (teammate) | `src/world/`, `src/story/`, `stories/` | what *is there* and *what happens*: geometry, scroll engine, camera path, story |
| both | — | `src/main.js`, `src/ui/`, `index.html`, docs | small edits only, announce them before doing them |

Particles go to **A** (they are shaders + glow). Story-specific objects (gravestone, skull) go to **B**,
their special materials (radar scan shader) to **A**.

## 7. Milestones
Each milestone ends with something **visible in the browser** on `main`.
Dates are filled in once we fix the deadline.

| # | Milestone | Person A | Person B | Target date |
|---|---|---|---|---|
| M0 | **Setup** | Vite + three.js + lil-gui, folders, PLAN, README | clone repo, run it locally, first test PR | |
| M1 | **Dark room, one candle** | point light + flicker, shadows on | procedural room (floor, walls, ceiling) | |
| M2 | **Scroll moves the camera** | debug sliders for all lights | scroll → progress (0..1), camera path, chapter format | |
| M3 | **Full lighting** | moonlight (directional) through a window, spot light, several candles, soft shadows, light tuning | church geometry: pillars, pews, window, gravestone (instancing for repeats) | |
| M4 | **Shaders** | candle flame shader, radar/scan reveal shader | story events can trigger effects (`onEnter`, `onProgress`) | |
| M5 | **Post-processing** | bloom (glow), depth of field, vignette + grain | text overlays per chapter, transitions | |
| M6 | **Particles** | dust in moonlight, candle smoke/sparks | camera polish (easing, look-at targets) | |
| M7 | **Story complete** | lighting moods per chapter | write all chapters of the Shakespeare story | |
| M8 | **Polish + proof of engine** | performance (shadow map sizes, pixel ratio) | a tiny 2nd story folder to prove the engine is reusable | |
| — | **Final**: rehearsal, both can explain every file | both | both | **Deadline: TBD** |

## 8. Git workflow (simple version)
- `main` must **always run**. Nobody pushes broken code to `main`.
- First setup (M0) goes straight to `main`. After that, every task:
  1. `git switch main` then `git pull` — get the latest version
  2. `git switch -c feature/candle-flicker` — make your own branch for the task
  3. code, test in the browser, `git add` + `git commit` (small commits, clear messages)
  4. `git push -u origin feature/candle-flicker` — send the branch to GitHub
  5. open a **Pull Request** on GitHub → the **other person** reviews and merges it
  6. back to step 1
- Branch names: `feature/…`, `fix/…`, `docs/…`
- Stay in your own folders → almost no merge conflicts. If you must touch the other's folder or
  `main.js`, say it first.

## 9. Definition of done (for every task)
- Runs in the browser with no console errors
- Has debug sliders if it has tweakable values
- Both of us can explain the code
- Merged into `main` through a PR

## 10. Open questions
- Deadline: **TBD**
- Teammate name: **TBD**
- Final story: Shakespeare's grave, Einstein's brain, Mary Shelley, or something else?
