(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

  const phrase = trigger.textContent.toUpperCase();
  const glyphs = {
    A:[14,17,17,31,17,17,17],
    C:[15,16,16,16,16,16,15],
    D:[30,17,17,17,17,17,30],
    E:[31,16,16,30,16,16,31],
    G:[15,16,16,23,17,17,15],
    I:[14,4,4,4,4,4,14],
    N:[17,25,25,21,19,19,17],
    O:[14,17,17,17,17,17,14],
    P:[30,17,17,30,16,16,16],
    R:[30,17,17,30,20,18,17],
    S:[15,16,16,14,1,1,30],
    U:[17,17,17,17,17,17,14],
    V:[17,17,17,17,17,10,4],
    Y:[17,17,10,4,4,4,4],
    B:[30,17,17,30,17,17,30],
    F:[31,16,16,30,16,16,16],
    H:[17,17,17,31,17,17,17],
    J:[7,2,2,2,18,18,12],
    K:[17,18,20,24,20,18,17],
    L:[16,16,16,16,16,16,31],
    M:[17,27,21,21,17,17,17],
    Q:[14,17,17,17,21,18,13],
    T:[31,4,4,4,4,4,4],
    W:[17,17,17,21,21,27,17],
    X:[17,17,10,4,10,17,17],
    Z:[31,1,2,4,8,16,31]
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
    let lastFrame = -1;
    const fallback = ['#61d8a4', '#a5de79', '#f6dc80', '#38bb86'];

    function tick(now) {
      const elapsed = now - start;
      if (elapsed >= duration) {
        overlay.remove();
        active = false;
        return;
      }

      // Sweep in and out continuously while the glyphs change at a readable rate.
      const leading = Math.min(1, elapsed / 240);
      const trailing = Math.max(0, (elapsed - 450) / 270);
      overlay.style.clipPath = `inset(0 ${(1 - leading) * 100}% 0 ${trailing * 100}%)`;
      const frame = Math.floor(elapsed / 43);
      if (frame !== lastFrame) {
        lastFrame = frame;
        context.clearRect(0, 0, canvas.width, canvas.height);
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
                context.drawImage(helmet, sampleX, sampleY, 5, 5, x, y, 3.1, 3.1);
              } else {
                context.fillStyle = fallback[(col + row + index) % fallback.length];
                context.fillRect(x, y, 3.1, 3.1);
              }
            }
          });
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
