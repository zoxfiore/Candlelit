// The chapter title at the top left: "Chapter 2 / The Autopsy / Princeton Hospital — April 18, 1955"

export function createTitleCard() {
  const el = document.getElementById("title-card");
  const number = el.querySelector(".tc-number");
  const title = el.querySelector(".tc-title");
  const place = el.querySelector(".tc-place");
  let latest = null;
  let timer = null;

  return {
    show(chapter) {
      latest = chapter;
      // hide, change the text, then show again: the CSS transition makes it fade.
      // If the user scrolls fast through several chapters, only the last one is shown.
      el.classList.remove("visible");
      clearTimeout(timer);
      timer = setTimeout(() => {
        number.textContent = `Chapter ${latest.index + 1}`;
        title.textContent = latest.title;
        place.textContent = latest.place;
        el.classList.add("visible");
      }, 300);
    },
  };
}
