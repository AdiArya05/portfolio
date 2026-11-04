(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

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
    canvas.width = 112;
    canvas.height = 20;
    overlay.append(canvas);
    const context = canvas.getContext('2d');
    const texture = document.createElement('canvas');
    texture.width = canvas.width;
    texture.height = canvas.height;
    const ink = texture.getContext('2d');
    if (!context || !ink) return;

    // Use the actual lowercase lettering as a mask for the uniform texture.
    const style = getComputedStyle(trigger);
    ink.font = `600 16px ${style.fontFamily}`;
    ink.textAlign = 'center';
    ink.textBaseline = 'middle';
    const phrase = trigger.textContent;
    const scale = (texture.width - 2) / ink.measureText(phrase).width;
    ink.translate(texture.width / 2, 0);
    ink.scale(scale, 1);
    ink.fillText(phrase, 0, 10);
    ink.setTransform(1, 0, 0, 1, 0, 0);
    ink.globalCompositeOperation = 'source-in';
    if (helmet.complete && helmet.naturalWidth) {
      ink.drawImage(helmet, 125, 210, 250, 100, 0, 0, texture.width, texture.height);
    } else {
      ink.fillStyle = '#65a67a';
      ink.fillRect(0, 0, texture.width, texture.height);
    }

    active = true;
    trigger.append(overlay);
    const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    const duration = 1120;
    const waveWidth = 82;
    const start = performance.now();

    function tick(now) {
      const progress = (now - start) / duration;
      if (progress >= 1) {
        overlay.remove();
        active = false;
        return;
      }

      const head = progress * (canvas.width + waveWidth);
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let x = Math.max(0, Math.floor(head - waveWidth)); x < head && x < canvas.width; x++) {
        const phase = (head - x) / waveWidth;
        const strength = Math.sin(Math.PI * Math.min(1, phase)) ** .55;
        const bend = Math.round(Math.sin(phase * Math.PI * 2) * 3 * strength);
        context.globalAlpha = Math.min(1, strength * 2);
        context.fillStyle = paper;
        context.fillRect(x, 0, 1, canvas.height);
        context.drawImage(texture, x, 0, 1, texture.height, x, bend, 1, texture.height);
      }
      context.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') play();
  });
  trigger.addEventListener('click', play);
})();
