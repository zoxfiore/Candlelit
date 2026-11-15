// The title screen. While the assets load, the button shows the progress.
// Then it waits for a click (needed anyway: browsers block sound until the user clicks).

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
    ready() {
      button.disabled = false;
      button.textContent = "Begin the story";
    },
    /** returns a Promise that resolves when the user clicks "Begin" */
    waitForClick() {
      return new Promise((resolve) => {
        button.addEventListener("click", () => {
          screen.classList.add("hidden");
          document.body.classList.remove("locked");
          resolve();
        });
      });
    },
  };
}
