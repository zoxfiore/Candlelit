// Subtitles at the bottom of the screen.
// A chapter has several lines of text. As you scroll through the chapter (t from 0 to 1),
// the lines appear one after another. Words between *stars* are shown in gold.

const START = 0.08; // first line appears after the fade-in
const END = 0.94; // last line stays until the fade-out

export function createSubtitles() {
  const el = document.getElementById("subtitle");
  let shown = null;

  return {
    update(chapter, t) {
      const lines = chapter.lines;
      let html = "";
      const end = chapter.isLast ? 1 : END; // the very last line stays on screen at the end
      if (t >= START && t <= end) {
        const k = Math.min(1, (t - START) / (END - START)); // 0..1 inside the text zone
        const index = Math.min(lines.length - 1, Math.floor(k * lines.length));
        html = lines[index].replace(/\*(.+?)\*/g, "<em>$1</em>");
      }
      if (html === shown) return; // nothing changed: don't touch the page
      shown = html;
      el.classList.remove("visible");
      if (html) {
        el.innerHTML = html;
        // next frame: show it (so the CSS fade runs again)
        requestAnimationFrame(() => el.classList.add("visible"));
      }
    },
  };
}
