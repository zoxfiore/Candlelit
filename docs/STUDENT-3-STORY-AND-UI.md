# Student 3 — Story & UI

**Your part: what happens and when.** The render loop, scroll → chapter → camera, the chapter data,
subtitles, voice-over, title cards, start screen, and all the HTML/CSS on top of the 3D.

Your files:
```
index.html                    the page: canvas + overlays
src/main.js                   connects everything + the render loop
src/story/scroll.js           scroll position → "screens" (smoothed)
src/story/director.js         chooses the chapter, renders it, fades, events
src/story/cameraRig.js        moves the camera from shot A to shot B (+ mouse parallax)
stories/einstein/story.js     THE STORY: 12 chapters as data
src/ui/subtitles.js           text lines that appear while scrolling
src/ui/titleCard.js           "Chapter 3 — Permission, Too Late"
src/ui/narrator.js            one audio file per chapter
src/ui/startScreen.js         loading progress + "Begin the story"
src/ui/hud.js                 progress bar + scroll hint
src/styles/*.css              all the overlays
src/core/camera.js, resize.js the camera + window resize
```

## 1. Start & render loop (`main.js`)
1. Load all assets (the start button shows "Loading… 45%")
2. Create renderer, camera, director (it builds the 12 sets), UI
3. `requestAnimationFrame(animate)`: `animate` runs before every screen refresh (~60×/s):
   scroll → director (camera + render) → subtitles → progress bar → hover
4. Wait for the click on "Begin the story" (browsers block sound before a click anyway)

`THREE.Timer` gives `delta` (seconds since last frame): animations run at the same speed on 60 Hz
and 144 Hz screens.

## 2. Scroll → story position (`scroll.js`)
The canvas is `position: fixed`. On top, an empty but very tall div (`#scroll-space`) makes the page
scrollable. `scrollY / innerHeight` = number of **screens** scrolled.
**Smoothing** (lerp): `smooth += (target - smooth) * delta * 6`: the value follows the real scroll
with a small delay, so the camera glides instead of jumping.

## 3. The story is DATA (`story.js`)
```js
{
  title: "The Autopsy",
  place: "Princeton Hospital — April 18, 1955",
  set: buildAutopsy,                          // function building the 3D scene
  screens: 3,                                 // length in screens of scrolling
  camera: { from: { pos, look }, to: { pos, look } },
  audio: "audio/chapter-02.mp3",
  lines: ["...", "...and he *kept it*."],
}
```
To change the story we edit this file, **not the engine**: that's the main idea of the architecture.

## 4. The director (`director.js`)
- Builds the 12 sets once and computes where each chapter starts. `renderer.compile()` prepares
  every shader in advance, so changing chapter doesn't freeze.
- Every frame: find the chapter containing the scroll position,
  `t = (screens - chapter.start) / chapter.screens` (0 → 1 inside the chapter).
- Renders **only the current scene**.
- **Fade**: in the first and last 6% of a chapter the black `#fade` div becomes opaque: it hides the
  switch between scenes, like a cut in a film.
- **Events**: on chapter change it calls the listeners (`onChapterChange`): new title, new audio,
  new debug sliders. This is the *observer pattern*.

## 5. Camera (`cameraRig.js`)
`pos = lerp(from.pos, to.pos, ease(t))`, same for the look-at point, then `camera.lookAt(look)`.
`ease(t) = t²(3 − 2t)` (smoothstep): slow start, slow end, like a real camera operator.
The mouse adds a small offset (parallax): the scene feels alive even without scrolling.

## 6. Subtitles & voice-over
- `subtitles.js`: N lines per chapter, line number = `floor(k × N)` (k = progress in the text zone).
  `*word*` → `<em>word</em>` (gold) with a regular expression.
- `narrator.js`: on chapter change, stop the old `Audio` and play the new one. Missing file = silent.

## 7. Presentation shortcuts
- `?chapter=7` jumps directly to chapter 7 (`scroll.jumpTo`, no smoothing)
- `?debug` opens the light sliders

## TODO (your part)
- [ ] Scroll through the whole story with sound: check that `screens` (~1 screen per 10 s of audio) feels right
- [ ] Re-frame the camera shots (`from` / `to`) once the voice-over timing is fixed
- [ ] Add an end screen with "The End" + our names after the last chapter
- [ ] When scrolling fast, each chapter's audio starts and stops: maybe wait ~0.5 s before playing
