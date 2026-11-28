// Voice-over: one audio file per chapter (public/audio/chapter-01.mp3, ...).
// When a new chapter starts, its audio plays from the beginning and the previous one stops.
// A chapter with no audio file (a new story not recorded yet) is read aloud by the browser's
// speech synthesis (Web Speech API), with a calm English voice, line by line.

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const english = voices.filter((v) => v.lang?.startsWith("en"));
  const preferred = ["Google UK English Male", "Daniel", "Microsoft Ryan", "Microsoft George", "Microsoft Guy", "Arthur"];
  return english.find((v) => preferred.some((p) => v.name.includes(p))) ?? english.find((v) => v.lang === "en-GB") ?? english[0] ?? null;
}

export function createNarrator() {
  const button = document.getElementById("mute");
  const speech = window.speechSynthesis ?? null;
  let audio = null;
  let muted = false;
  let unlocked = false; // browsers only allow sound after the user clicked once
  let voice = null;
  speech?.addEventListener?.("voiceschanged", () => (voice = pickVoice()));

  const stopAll = () => {
    if (audio) audio.pause();
    audio = null;
    speech?.cancel();
  };

  function speak(chapter) {
    if (!speech) return;
    voice ??= pickVoice();
    for (const line of chapter.lines ?? []) {
      const u = new SpeechSynthesisUtterance(line.replace(/\*/g, ""));
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "en-GB";
      u.rate = 0.92;
      u.pitch = 0.9;
      u.volume = 0.9;
      speech.speak(u); // queued: the lines are read one after the other
    }
  }

  button.addEventListener("click", () => {
    muted = !muted;
    button.textContent = muted ? "🔇" : "🔊";
    if (audio) audio.muted = muted;
    if (muted) speech?.cancel();
  });

  return {
    unlock() {
      unlocked = true;
    },
    play(chapter) {
      stopAll();
      if (!unlocked || !chapter || muted) return;
      if (!chapter.audio) {
        speak(chapter);
        return;
      }
      audio = new Audio(chapter.audio);
      audio.volume = 0.9;
      audio.play().catch(() => {}); // missing file or blocked: ignore
    },
  };
}
