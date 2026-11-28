// Scroll -> story position.
// The page has a tall empty div (#scroll-space). We read window.scrollY and convert it to
// "screens": 0 = top of the page, 1 = scrolled one window height, etc.
// The value is smoothed (it follows the real scroll a bit late) so the camera moves smoothly.
// `limit` = how far the viewer may go (an interaction gate stops the scroll there).

export function createScroll(totalScreens) {
  const space = document.getElementById("scroll-space");
  // +1 because at the very bottom, one window height is still visible
  space.style.height = `${(totalScreens + 1) * 100}vh`;

  let smooth = 0;
  // autoplay: the story plays on by itself (after a task), until the viewer scrolls again
  let auto = null; // { from, to, t, duration }
  const cancelAuto = () => (auto = null);
  window.addEventListener("wheel", cancelAuto, { passive: true });
  window.addEventListener("touchstart", cancelAuto, { passive: true });
  window.addEventListener("keydown", (e) => ["ArrowUp", "ArrowDown", "PageUp", "PageDown", " "].includes(e.key) && cancelAuto());

  return {
    /** where the story is now (smoothed), in screens */
    get current() {
      return smooth;
    },
    /** call every frame: returns the smoothed position in screens */
    update(delta, limit = totalScreens) {
      // a hidden / not-yet-laid-out window can report a height of 0: 0 / 0 = NaN would break everything
      const height = window.innerHeight || 1;
      if (auto) {
        // move the page itself, smoothly (ease in-out), so the scrollbar and the story stay in sync
        auto.t = Math.min(1, auto.t + delta / auto.duration);
        const k = auto.t * auto.t * (3 - 2 * auto.t);
        window.scrollTo(0, (auto.from + (auto.to - auto.from) * k) * height);
        if (auto.t >= 1) auto = null;
      }
      let target = window.scrollY / height;
      if (target > limit + 0.02) {
        window.scrollTo(0, limit * height); // push the page back to the gate
        target = limit;
      }
      target = Math.min(target, limit);
      // move 'smooth' a part of the way to 'target' each frame (simple easing, called "lerp")
      // a low rate = more inertia: the story glides on after the wheel stops, like a film
      smooth += (target - smooth) * Math.min(1, delta * 3.2);
      if (!Number.isFinite(smooth)) smooth = 0; // never stay stuck on a bad value
      return Math.min(smooth, totalScreens - 0.0001);
    },
    /** play the story on by itself up to `screens` (in `duration` seconds); any scroll by the viewer takes over */
    autoplay(screens, duration = 4) {
      auto = { from: window.scrollY / (window.innerHeight || 1), to: Math.min(screens, totalScreens), t: 0, duration };
    },
    /** jump to a position in screens immediately (no smoothing) */
    jumpTo(screens) {
      window.scrollTo(0, screens * window.innerHeight);
      smooth = screens;
    },
    /** glide to a position (used by the chapter rail) */
    goTo(screens) {
      window.scrollTo({ top: screens * window.innerHeight, behavior: "instant" });
      smooth = screens;
    },
  };
}
