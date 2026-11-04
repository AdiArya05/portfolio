(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activePixels;

  function play() {
    if (activePixels || reducedMotion.matches) return;

    const pixels = document.createElement('span');
    pixels.className = 'outfield-pixels';
    pixels.setAttribute('aria-hidden', 'true');
    trigger.append(pixels);
    activePixels = pixels;

    // The leading edge reveals the matrix and the trailing edge restores the text.
    const sweep = pixels.animate([
      { clipPath: 'inset(0 100% 0 0)', offset: 0 },
      { clipPath: 'inset(0 0 0 0)', offset: .53 },
      { clipPath: 'inset(0 0 0 0)', offset: .65 },
      { clipPath: 'inset(0 0 0 100%)', offset: 1 }
    ], { duration: 1050, easing: 'ease-in-out' });

    const restore = () => {
      pixels.remove();
      activePixels = null;
    };
    sweep.onfinish = restore;
    sweep.oncancel = restore;
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') play();
  });
  trigger.addEventListener('click', play);
})();
