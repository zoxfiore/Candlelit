// The little info card that follows the mouse when you hover a character or an object.

export function createTooltip(glossary) {
  const el = document.getElementById("tooltip");
  const name = el.querySelector(".tt-name");
  const role = el.querySelector(".tt-role");
  const text = el.querySelector(".tt-text");
  let currentKey = null;

  return {
    show(key, x, y) {
      const entry = glossary[key];
      if (!entry) return this.hide();
      if (key !== currentKey) {
        currentKey = key;
        name.textContent = entry.name;
        role.textContent = entry.role;
        text.textContent = entry.text;
      }
      // keep the card inside the window
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const left = Math.min(x + 18, window.innerWidth - w - 12);
      const top = Math.min(y + 18, window.innerHeight - h - 12);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.classList.add("visible");
      document.body.classList.add("hovering");
    },
    hide() {
      currentKey = null;
      el.classList.remove("visible");
      document.body.classList.remove("hovering");
    },
  };
}
