// The current task in first person (top of the screen): "Find the combination", "Slides: 2 / 3"...
// A set calls setTask("...") when the viewer makes progress, or setTask(null) to hide it.
// A short "note" (like "Locked." or "Taped shut.") can flash under it: flashNote("Locked.").

let el = null;
function box() {
  if (!el) {
    el = document.createElement("div");
    el.id = "fp-task";
    el.innerHTML = '<span class="ft-label">Task</span><span class="ft-text"></span><span class="ft-note"></span>';
    document.body.append(el);
  }
  return el;
}

export function setTask(text) {
  const b = box();
  b.querySelector(".ft-text").textContent = text ?? "";
  b.classList.toggle("visible", !!text);
}

let noteTimer = 0;
export function flashNote(text) {
  const n = box().querySelector(".ft-note");
  n.textContent = text;
  n.classList.remove("show");
  void n.offsetWidth;
  n.classList.add("show");
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => n.classList.remove("show"), 2600);
}
