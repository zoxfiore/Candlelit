// The chapter rail on the right: one dot per chapter, with its year.
// The current chapter's dot is gold; clicking a dot jumps to that chapter.

export function createRail({ chapters, onJump }) {
  const el = document.getElementById("rail");
  const dots = chapters.map((chapter) => {
    const year = chapter.place.match(/\d{4}/)?.[0] ?? "";
    const dot = document.createElement("button");
    dot.className = "rail-dot";
    dot.innerHTML = `<span class="rail-label"><b>${year}</b> ${chapter.title}</span>`;
    dot.addEventListener("click", () => onJump(chapter));
    el.appendChild(dot);
    return dot;
  });

  return {
    show(chapter) {
      dots.forEach((d, i) => {
        d.classList.toggle("current", i === chapter.index);
        d.classList.toggle("past", i < chapter.index);
      });
    },
  };
}
