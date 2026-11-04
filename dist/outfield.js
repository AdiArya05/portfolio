(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const helmet = new Image();
  helmet.src = '/outfield-camo.png?v=helmet';
  const fallback = ['#61d8a4', '#a5de79', '#f6dc80', '#38bb86'];
  let active = false;

  function play() {
    if (active || reducedMotion.matches) return;

    const overlay = document.createElement('span');
    overlay.className = 'outfield-pixels';
    overlay.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 48;
    overlay.append(canvas);
    const context = canvas.getContext('2d');
    if (!context) return;

    active = true;
    trigger.append(overlay);

    const duration = 570;
    const trail = 108;
    const cell = 6;
    const start = performance.now();

    function tick(now) {
      const progress = (now - start) / duration;
      if (progress >= 1) {
        overlay.remove();
        active = false;
        return;
      }

      const head = progress * (canvas.width + trail);
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (let x = Math.max(0, Math.floor((head - trail) / cell) * cell); x < head && x < canvas.width; x += cell) {
        const age = (head - x) / trail;
        const center = 24 + Math.sin(x / 32 - progress * 8) * 8;
        const radius = 20 * Math.sin(Math.PI * Math.min(1, age) ** .65) ** .45;
        for (let y = 0; y < canvas.height; y += cell) {
          if (Math.abs(y + cell / 2 - center) > radius) continue;
          if (helmet.complete && helmet.naturalWidth) {
            const sampleX = 125 + (x * 2 + y) % 240;
            const sampleY = 215 + (x + y * 3) % 100;
            context.drawImage(helmet, sampleX, sampleY, 6, 6, x, y, cell, cell);
          } else {
            context.fillStyle = fallback[(x / cell + y / cell) % fallback.length];
            context.fillRect(x, y, cell, cell);
          }
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') play();
  });
  trigger.addEventListener('click', play);
})();
