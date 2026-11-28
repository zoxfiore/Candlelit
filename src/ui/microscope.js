// Looking into the microscope: a round view of a stained brain slice, out of focus.
// Turn the focus knob (mouse wheel, or hold the button and move up / down) until the cells are sharp.
// Hold it sharp for a moment -> onDone().

import { tick } from "../audio/synth.js";

export function openMicroscope(onDone) {
  const view = document.createElement("div");
  view.id = "microscope";
  view.innerHTML = `
    <div class="ms-lens"><canvas width="720" height="720"></canvas><div class="ms-ring"></div></div>
    <div class="ms-help">Turn the focus: <b>mouse wheel</b>, or hold the button and move the mouse up / down</div>
    <div class="ms-meter"><span></span></div>`;
  document.body.append(view);
  document.body.classList.add("inspecting");
  document.exitPointerLock?.();

  // the slice: pale pink tissue, purple neurons with their branches, small dark glial cells
  const canvas = view.querySelector("canvas");
  const c = canvas.getContext("2d");
  c.fillStyle = "#f0d8e0";
  c.fillRect(0, 0, 720, 720);
  for (let i = 0; i < 900; i++) {
    c.fillStyle = `rgba(200,120,160,${Math.random() * 0.12})`;
    c.beginPath();
    c.arc(Math.random() * 720, Math.random() * 720, 4 + Math.random() * 30, 0, 7);
    c.fill();
  }
  for (let n = 0; n < 16; n++) {
    const x = 60 + Math.random() * 600, y = 60 + Math.random() * 600;
    c.strokeStyle = "rgba(90,30,110,0.75)";
    for (let b = 0; b < 6; b++) {
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x, y);
      let px = x, py = y, a = Math.random() * 7;
      for (let s = 0; s < 6; s++) {
        a += (Math.random() - 0.5) * 0.9;
        px += Math.cos(a) * 14;
        py += Math.sin(a) * 14;
        c.lineTo(px, py);
        c.lineWidth = Math.max(0.6, 3 - s * 0.4);
      }
      c.stroke();
    }
    c.fillStyle = "#5a1a6a";
    c.beginPath();
    c.ellipse(x, y, 11, 8, Math.random() * 3, 0, 7);
    c.fill();
  }
  for (let g = 0; g < 160; g++) {
    c.fillStyle = "rgba(40,20,70,0.8)";
    c.beginPath();
    c.arc(Math.random() * 720, Math.random() * 720, 2.5 + Math.random() * 2.5, 0, 7);
    c.fill();
  }

  const target = 0.25 + Math.random() * 0.5;
  let focus = target > 0.5 ? target - 0.3 : target + 0.3; // starts a little out of focus
  let sharpFor = 0, last = performance.now(), done = false, holding = false, lastY = 0;
  const meter = view.querySelector(".ms-meter span");
  const turn = (d) => {
    focus = Math.min(1, Math.max(0, focus + d));
    if (Math.random() < 0.3) tick(0.015);
  };
  const onWheel = (e) => {
    e.preventDefault();
    turn(e.deltaY * 0.0009);
  };
  const onDown = (e) => {
    holding = true;
    lastY = e.clientY;
  };
  const onMove = (e) => {
    if (!holding) return;
    turn((e.clientY - lastY) * 0.0025);
    lastY = e.clientY;
  };
  const onUp = () => (holding = false);
  view.addEventListener("wheel", onWheel, { passive: false });
  view.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const off = Math.abs(focus - target);
    canvas.style.filter = `blur(${(off * 38).toFixed(1)}px)`;
    meter.style.width = `${Math.round((1 - Math.min(1, off * 2.5)) * 100)}%`;
    sharpFor = off < 0.07 ? sharpFor + dt : 0;
    view.classList.toggle("sharp", off < 0.07);
    if (sharpFor > 0.4 && !done) {
      done = true;
      view.classList.add("found");
      setTimeout(close, 1300);
    }
    if (!done || view.isConnected) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  function close() {
    view.classList.add("closing");
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    setTimeout(() => {
      view.remove();
      document.body.classList.remove("inspecting");
      onDone?.();
    }, 600);
  }
}
