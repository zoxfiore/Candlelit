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

  return {
    /** where the story is now (smoothed), in screens */
    get current() {
      return smooth;
    },
    /** call every frame: returns the smoothed position in screens */
    update(delta, limit = totalScreens) {
      // a hidden / not-yet-laid-out window can report a height of 0: 0 / 0 = NaN would break everything
      const height = window.innerHeight || 1;
      let target = window.scrollY / height;
      if (target > limit + 0.02) {
        window.scrollTo(0, limit * height); // push the page back to the gate
        target = limit;
      }
      target = Math.min(target, limit);
      // move 'smooth' a part of the way to 'target' each frame (simple easing, called "lerp")
      smooth += (target - smooth) * Math.min(1, delta * 6);
      if (!Number.isFinite(smooth)) smooth = 0; // never stay stuck on a bad value
      return Math.min(smooth, totalScreens - 0.0001);
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
