(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

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
  const fallback = ['#61d8a4', '#a5de79', '#f6dc80', '#38bb86'];
  let active = false;

  function play() {
    if (active || reducedMotion.matches) return;

    const text = trigger.firstChild;
    const bounds = trigger.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const range = document.createRange();
    const letters = [...text.textContent].map((letter, index) => {
      range.setStart(text, index);
      range.setEnd(text, index + 1);
      const rect = range.getBoundingClientRect();
      return { letter, x: rect.left - bounds.left, width: rect.width };
    }).filter(({letter}) => glyphs[letter]);

    const overlay = document.createElement('span');
    overlay.className = 'outfield-pixels';
    overlay.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    const density = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(bounds.width * density);
    canvas.height = Math.ceil(bounds.height * density);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(density, density);

    const camo = document.createElement('canvas');
    camo.width = 120;
    camo.height = 48;
    const texture = camo.getContext('2d');
    const hasTexture = texture && helmet.complete && helmet.naturalWidth;
    if (hasTexture) {
      texture.filter = 'brightness(1.6) saturate(1.75)';
      texture.drawImage(helmet, 125, 215, 240, 96, 0, 0, camo.width, camo.height);
    }

    const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    const cellHeight = bounds.height * .5;
    const start = performance.now();
    active = true;
    overlay.append(canvas);
    trigger.append(overlay);

    function draw(letter, cell, y, index) {
      const dot = Math.min(cell.width / 5.5, cellHeight / 7);
      const left = cell.x + (cell.width - 5 * dot) / 2;
      glyphs[letter].forEach((bits, row) => {
        for (let col = 0; col < 5; col++) {
          if (!(bits & (1 << (4 - col)))) continue;
          const x = left + col * dot;
          const top = y + row * dot;
          if (hasTexture) {
            context.drawImage(camo, (index * 13 + col * 7) % 116, row * 6, 4, 4, x, top, dot * .86, dot * .86);
          } else {
            context.fillStyle = fallback[(index + row + col) % fallback.length];
            context.fillRect(x, top, dot * .86, dot * .86);
          }
        }
      });
    }

    const reels = letters.map(({letter}) => {
      const choices = alphabet.filter(candidate => candidate !== letter);
      return Array.from({length:4}, () => choices[Math.floor(Math.random() * choices.length)]);
    });
    const stagger = 27;
    const rollTime = 260;

    function tick(now) {
      const elapsed = now - start;
      if (elapsed >= (letters.length - 1) * stagger + rollTime) {
        overlay.remove();
        active = false;
        return;
      }
      context.clearRect(0, 0, bounds.width, bounds.height);
      letters.forEach((cell, index) => {
        const age = elapsed - index * stagger;
        if (age < 0 || age >= rollTime) return;

        const frame = age / (rollTime / 4);
        const step = Math.floor(frame);
        const fraction = frame - step;
        const offset = fraction * fraction * (3 - 2 * fraction) * cellHeight;
        const center = (bounds.height - cellHeight) / 2;
        context.save();
        context.beginPath();
        context.rect(cell.x, 0, cell.width, bounds.height);
        context.clip();
        context.fillStyle = paper;
        context.fillRect(cell.x, 0, cell.width, bounds.height);
        draw(reels[index][step], cell, center - offset, index);
        draw(reels[index][step + 1] || cell.letter, cell, center + cellHeight - offset, index);
        context.restore();
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') play();
  });
  trigger.addEventListener('click', play);
})();
