// The interaction prompt: when the story waits for the viewer (an interaction gate),
// a small glowing card in the middle-bottom tells them what to do.

export function createPrompt() {
  const el = document.getElementById("prompt");
  const text = el.querySelector(".pr-text");
  const icon = el.querySelector(".pr-icon");
  const bar = el.querySelector(".pr-bar span");
  const ICONS = { move: "🕯", drag: "✋", hold: "◉", click: "👆", keys: "⇆" };

  return {
    show(gate) {
      if (!gate) {
        el.classList.remove("visible");
        el.classList.add("solved");
        setTimeout(() => el.classList.remove("solved"), 900);
        document.body.classList.remove("waiting");
        return;
      }
      text.textContent = gate.prompt;
      icon.textContent = ICONS[gate.kind] ?? "✦";
      bar.style.width = "0%";
      el.classList.add("visible");
      document.body.classList.add("waiting");
    },
    /** 0..1 progress of the current interaction (hold, drive...) */
    progress(p) {
      bar.style.width = `${Math.round(p * 100)}%`;
    },
  };
}
