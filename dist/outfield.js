(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const helmet = new Image();
  helmet.src = '/outfield-camo.png?v=helmet';
  let playing = false;

  async function play() {
    if (playing || reducedMotion.matches) return;
    playing = true;

    try {
      await helmet.decode();
    } catch {
      playing = false;
      return;
    }
    if (reducedMotion.matches) {
      playing = false;
      return;
    }

    const patch = document.createElement('span');
    patch.className = 'outfield-pixels';
    patch.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.width = 42;
    canvas.height = 12;
    const context = canvas.getContext('2d');
    if (!context) {
      playing = false;
      return;
    }
    context.imageSmoothingEnabled = false;
    context.drawImage(helmet, 125, 210, 245, 100, 0, 0, canvas.width, canvas.height);

    const label = document.createElement('span');
    label.textContent = trigger.textContent;
    patch.append(canvas, label);
    trigger.append(patch);

    const animation = patch.animate([
      { clipPath: 'inset(0 100% 0 0)', opacity: 1, easing: 'steps(14, end)' },
      { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: .25 },
      { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: .78 },
      { clipPath: 'inset(0 0 0 0)', opacity: 0 }
    ], { duration: 1650 });
    const restore = () => {
      patch.remove();
      playing = false;
    };
    animation.onfinish = restore;
    animation.oncancel = restore;
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') play();
  });
  trigger.addEventListener('click', play);
})();
