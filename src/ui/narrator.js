// Voice-over: one audio file per chapter (public/audio/chapter-01.mp3, ...).
// When a new chapter starts, its audio plays from the beginning and the previous one stops.
// If the file does not exist yet, nothing happens (the subtitles still work).

export function createNarrator() {
  const button = document.getElementById("mute");
  let audio = null;
  let muted = false;
  let unlocked = false; // browsers only allow sound after the user clicked once

  button.addEventListener("click", () => {
    muted = !muted;
    button.textContent = muted ? "🔇" : "🔊";
    if (audio) audio.muted = muted;
  });

  return {
    unlock() {
      unlocked = true;
    },
    play(chapter) {
      if (audio) audio.pause();
      audio = null;
      if (!unlocked || !chapter || !chapter.audio) return;
      audio = new Audio(chapter.audio);
      audio.muted = muted;
      audio.volume = 0.9;
      audio.play().catch(() => {}); // missing file or blocked: ignore
    },
  };
}
