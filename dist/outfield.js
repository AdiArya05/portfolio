(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

  const phrase = trigger.textContent.toLowerCase();
  const glyphs = {
    a:[0,0,14,1,15,17,15], c:[0,0,14,17,16,17,14], e:[0,0,14,17,31,16,14],
    i:[4,0,12,4,4,4,14], l:[12,4,4,4,4,4,14], n:[0,0,22,25,17,17,17],
    o:[0,0,14,17,17,17,14], r:[0,0,22,25,16,16,16], s:[0,0,15,16,14,1,30],
    t:[4,4,31,4,4,5,2], v:[0,0,17,17,17,10,4], x:[0,0,17,10,4,10,17],
    z:[0,0,31,2,4,8,31], m:[0,0,26,21,21,17,17], u:[0,0,17,17,17,19,13]
  };
  const alphabet = Object.keys(glyphs);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const helmet = new Image();
  helmet.src = '/outfield-camo.png?v=helmet';
  let active = false;

  function play() {
    if (active || reducedMotion.matches) return;

    const overlay = document.createElement('span');
    overlay.className = 'outfield-pixels';
    overlay.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    canvas.width = phrase.length * 24;
    canvas.height = 28;
    overlay.append(canvas);
    const context = canvas.getContext('2d');
    if (!context) return;
    active = true;
    overlay.style.clipPath = 'inset(0 100% 0 0)';
    trigger.append(overlay);

    const duration = 720;
    const start = performance.now();
    const ease = progress => progress * progress * (3 - 2 * progress);
    const fallback = ['#61d8a4', '#a5de79', '#f6dc80', '#38bb86'];

    function drawFrame(frame, opacity) {
      context.globalAlpha = opacity;
      for (let index = 0; index < phrase.length; index++) {
        if (phrase[index] === ' ') continue;
        const letter = alphabet[(index * 7 + frame * 11) % alphabet.length];
        glyphs[letter].forEach((bits, row) => {
          for (let col = 0; col < 5; col++) {
            if (!(bits & (1 << (4 - col)))) continue;
            const x = index * 24 + col * 4 + 2;
            const y = row * 4;
            if (helmet.complete && helmet.naturalWidth) {
              const sampleX = 125 + (x * 3 + frame * 7) % 240;
              const sampleY = 215 + (row * 15 + index * 7) % 100;
              context.drawImage(helmet, sampleX, sampleY, 5, 5, x, y, 3.85, 3.85);
            } else {
              context.fillStyle = fallback[(col + row + index) % fallback.length];
              context.fillRect(x, y, 3.85, 3.85);
            }
          }
        });
      }
      context.globalAlpha = 1;
    }

    function tick(now) {
      const elapsed = now - start;
      if (elapsed >= duration) {
        overlay.remove();
        active = false;
        return;
      }

      // Sweep in and out continuously while the glyphs change at a readable rate.
      const leading = ease(Math.min(1, elapsed / 240));
      const trailing = ease(Math.max(0, (elapsed - 450) / 270));
      overlay.style.clipPath = `inset(0 ${(1 - leading) * 100}% 0 ${trailing * 100}%)`;
      const frame = Math.floor(elapsed / 43);
      const blend = ease(Math.min(1, (elapsed % 43) / 20));
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (frame > 0 && blend < 1) drawFrame(frame - 1, 1 - blend);
      drawFrame(frame, frame === 0 ? 1 : blend);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') play();
  });
  trigger.addEventListener('click', play);
})();
