// An original parametric line study. It is decorative, not an audio analysis.
// Coordinates are normalized so the same composition adapts to any screen.
export function sampleSignal(u, v, time = 0, pointerX = .5, pointerY = .5) {
  const a = (v - .5) * Math.PI * 1.82;
  const phase = time * .19;
  const bend = Math.sin(phase) * .38;
  const spread = .2 + .15 * Math.cos(a * 1.5 + bend);
  const x = u * spread
    + .2 * Math.sin(a + .5 + Math.sin(phase * .73) * .18)
    + .07 * Math.sin(a * 2.2 + u * 2.7 + Math.sin(phase * .9) * .65)
    + (pointerX - .5) * .13 * Math.cos(a);
  const y = (v - .5) * .77
    + .038 * Math.sin(u * 3.5 + a + bend)
    + (pointerY - .5) * .07 * Math.cos(a * .8);
  return [x + .5, y + .5];
}

export function createSignalField({ canvas, container, xLabel, yLabel, paused = false }) {
  let context;
  try { context = canvas?.getContext('2d', { alpha: true }); } catch {}
  if (!context || !container) return { setPaused() {}, setSuspended() {}, destroy() {} };
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0, height = 0, ratio = 1;
  let lineCount = 60, samples = 80;
  let frame = 0, time = 0, lastDraw = 0;
  let visible = !('IntersectionObserver' in window);
  let suspended = false, destroyed = false;
  let pointerX = .5, pointerY = .5, targetX = .5, targetY = .5;
  let labelX = '', labelY = '';
  // Reused coordinate storage; drawing avoids creating thousands of objects per frame.
  let coordinates = new Float32Array(0);
  const interval = 1000 / 30;

  function fillCoordinates() {
    const phase = time * .19;
    const bend = Math.sin(phase) * .38;
    const shift = Math.sin(phase * .73) * .18;
    const wave = Math.sin(phase * .9) * .65;
    // Invariant calculations run per sample, not per line.
    for (let k = 0; k < samples; k++) {
      const v = k / (samples - 1);
      const a = (v - .5) * Math.PI * 1.82;
      const spread = .2 + .15 * Math.cos(a * 1.5 + bend);
      const baseX = .5 + .2 * Math.sin(a + .5 + shift) + (pointerX - .5) * .13 * Math.cos(a);
      const baseY = .5 + (v - .5) * .77 + (pointerY - .5) * .07 * Math.cos(a * .8);
      for (let j = 0; j < lineCount; j++) {
        const u = j / (lineCount - 1) * 2 - 1;
        const index = (j * samples + k) * 2;
        coordinates[index] = (baseX + u * spread + .07 * Math.sin(a * 2.2 + u * 2.7 + wave)) * width;
        coordinates[index + 1] = (baseY + .038 * Math.sin(u * 3.5 + a + bend)) * height;
      }
    }
  }

  function draw() {
    if (!width || !height || destroyed) return;
    fillCoordinates();
    context.clearRect(0, 0, width, height);
    // Only three stroke batches, with no blur, shadows, compositing, or filters.
    const colors = ['rgba(173,194,200,.46)', 'rgba(173,194,200,.72)', 'rgba(92,167,186,.88)'];
    for (let group = 0; group < 3; group++) {
      context.beginPath();
      for (let j = 0; j < lineCount; j++) {
        const selectedGroup = j % 23 === 5 ? 2 : j % 3 === 0 ? 1 : 0;
        if (selectedGroup !== group) continue;
        let index = j * samples * 2;
        context.moveTo(coordinates[index], coordinates[index + 1]);
        for (let k = 1; k < samples; k++) {
          index += 2;
          context.lineTo(coordinates[index], coordinates[index + 1]);
        }
      }
      context.strokeStyle = colors[group];
      context.lineWidth = group === 2 ? .8 : .65;
      context.stroke();
    }
    context.fillStyle = 'rgba(92,167,186,.85)';
    for (let j = 5; j < lineCount; j += 12) {
      const k = Math.round(samples * (.28 + (j % 3) * .2));
      const index = (j * samples + k) * 2;
      context.fillRect(coordinates[index] - 1.5, coordinates[index + 1] - 1.5, 3, 3);
    }
    const x = pointerX.toFixed(2), y = pointerY.toFixed(2);
    if (x !== labelX && xLabel) { xLabel.textContent = x; labelX = x; }
    if (y !== labelY && yLabel) { yLabel.textContent = y; labelY = y; }
    container.classList.add('canvas-ready');
  }

  function canRun() { return !destroyed && !paused && !suspended && visible && !document.hidden; }
  function tick(now) {
    frame = 0;
    if (!canRun()) return;
    const elapsed = now - lastDraw;
    if (!lastDraw || elapsed >= interval - .5) {
      const delta = lastDraw ? Math.min(elapsed / 1000, .08) : 0;
      time = (time + delta) % 100000;
      const ease = 1 - Math.exp(-delta * 5);
      pointerX += (targetX - pointerX) * ease;
      pointerY += (targetY - pointerY) * ease;
      draw();
      lastDraw = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastDraw = 0;
    if (canRun()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const box = container.getBoundingClientRect();
    if (!box.width || !box.height) return;
    width = box.width;
    height = box.height;
    ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1600 / width, 900 / height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    lineCount = width < 500 ? 48 : 68;
    samples = width < 500 ? 64 : 84;
    coordinates = new Float32Array(lineCount * samples * 2);
    draw();
    sync();
  }
  function move(event) {
    if (!canRun() || !finePointer.matches || event.pointerType === 'touch') return;
    const box = container.getBoundingClientRect();
    targetX = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    targetY = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
  }
  function leave() { targetX = .5; targetY = .5; }
  container.addEventListener('pointermove', move, { passive: true });
  container.addEventListener('pointerleave', leave, { passive: true });
  document.addEventListener('visibilitychange', sync);
  const intersection = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold: .03 }) : null;
  intersection?.observe(container);
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(container);
  if (!resizeObserver) window.addEventListener('resize', resize, { passive: true });
  resize();
  return {
    setPaused(value) { paused = value; sync(); },
    setSuspended(value) { suspended = value; sync(); },
    destroy() {
      destroyed = true;
      sync();
      intersection?.disconnect();
      resizeObserver?.disconnect();
      container.removeEventListener('pointermove', move);
      container.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', resize);
    },
  };
}
