// Scroll -> story position.
// The page has a tall empty div (#scroll-space). We read window.scrollY and convert it to
// "screens": 0 = top of the page, 1 = scrolled one window height, etc.
// The value is smoothed (it follows the real scroll a bit late) so the camera moves smoothly.

export function createScroll(totalScreens) {
  const space = document.getElementById("scroll-space");
  // +1 because at the very bottom, one window height is still visible
  space.style.height = `${(totalScreens + 1) * 100}vh`;

  let smooth = 0;

  return {
    /** call every frame: returns the smoothed position in screens */
    update(delta) {
      const target = window.scrollY / window.innerHeight;
      // move 'smooth' a part of the way to 'target' each frame (simple easing, called "lerp")
      smooth += (target - smooth) * Math.min(1, delta * 6);
      return Math.min(smooth, totalScreens - 0.0001);
    },
    /** jump to a position in screens immediately (no smoothing) */
    jumpTo(screens) {
      window.scrollTo(0, screens * window.innerHeight);
      smooth = screens;
    },
  };
}
