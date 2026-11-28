// The title screen (as in the first version): the title, one line of story, and one button.
// While the assets load, the button shows the progress; then it waits for the click
// (needed anyway: browsers block sound until the user clicks).
//
// The engine can hold several stories (stories/index.js): the screen opens the one in the address
// (?story=id), or the first one.

export function createStartScreen() {
  const screen = document.getElementById("start-screen");
  const button = document.getElementById("start-button");
  document.body.classList.add("locked"); // no scrolling before the story starts
  window.scrollTo(0, 0);
  button.disabled = true;

  return {
    setProgress(progress) {
      button.textContent = `Loading… ${Math.round(progress * 100)}%`;
    },

    /** waits for "Begin the story", resolves with the story to play */
    pick(stories, preselect) {
      const story = stories.find((s) => s.id === preselect) ?? stories[0];
      button.disabled = false;
      button.textContent = "Begin the story";
      return new Promise((resolve) => {
        button.addEventListener("click", () => resolve(story), { once: true });
      });
    },

    preparing() {
      button.disabled = true;
      button.textContent = "Preparing the rooms…";
    },

    hide() {
      screen.classList.add("hidden");
      document.body.classList.remove("locked");
    },
  };
}
