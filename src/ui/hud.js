// Small things on screen: the gold progress bar at the bottom and the "scroll" hint.

export function createHud() {
  const bar = document.getElementById("progress-bar");
  const hint = document.getElementById("hint");

  return {
    update(screens, totalScreens) {
      bar.style.width = `${(100 * screens) / totalScreens}%`;
      hint.style.opacity = screens > 0.5 ? 0 : 1; // hide the hint once the user has started scrolling
    },
  };
}
