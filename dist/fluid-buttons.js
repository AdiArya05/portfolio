(() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const paths = {
    'Book a call': 'M7 2h2v3h6V2h2v3h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V2ZM5 10v10h14V10H5Zm3 3h3v2H8v-2Zm5 0h3v2h-3v-2Zm-5 4h3v1H8v-1Z',
    Email: 'M4 4h16a2 2 0 0 1 2 2v1l-10 6L2 7V6a2 2 0 0 1 2-2Zm18 5.5V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5l10 6 10-6Z',
    X: 'M4 3h4.7l4.2 5.7L17.8 3h2.7l-6.3 7.4L21 21h-4.8l-4.6-6.4L6.1 21H3.4l6.9-8.2L4 3Zm3.6 2 9.7 14h1.2L8.8 5H7.6Z'
  };
  for (const link of document.querySelectorAll('.work-contact-actions a')) {
    const path = paths[link.textContent.trim()];
    if (!path) continue;
    const icon = document.createElementNS(svgNS, 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.classList.add('fluid-symbol');
    const shape = document.createElementNS(svgNS, 'path');
    shape.setAttribute('d', path);
    icon.append(shape);
    link.prepend(icon);
  }

  const selector = 'a[data-liquid-glass], button:is(.page-scroll-button,.motion-toggle,.motion-open,.lightbox-close,.modal-close,.island-zone)';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function point(control, event) {
    const bounds = control.getBoundingClientRect();
    return event.detail === 0 ? [bounds.width / 2, bounds.height / 2] :
      [event.clientX - bounds.left, event.clientY - bounds.top];
  }
  function sweep(control, event) {
    if (reduced.matches || !control.animate) return;
    control.querySelector('.fluid-sheen')?.remove();
    const sheen = document.createElement('span');
    sheen.className = 'fluid-sheen';
    sheen.setAttribute('aria-hidden', 'true');
    const bounds = control.getBoundingClientRect();
    const fromLeft = !event || event.clientX < bounds.left + bounds.width / 2;
    const direction = fromLeft ? 1 : -1;
    control.append(sheen);
    const animation = sheen.animate([
      { transform: `translateX(${-direction * 115}%)`, opacity: 0 },
      { opacity: .52, offset: .46 },
      { transform: `translateX(${direction * 115}%)`, opacity: 0 }
    ], { duration: 560, easing: 'cubic-bezier(.2,.65,.25,1)' });
    animation.finished.then(() => sheen.remove(), () => sheen.remove());
  }
  document.addEventListener('pointerover', event => {
    const control = event.target.closest(selector);
    if (control && !control.contains(event.relatedTarget) && event.pointerType !== 'touch') sweep(control, event);
  });
  document.addEventListener('focusin', event => {
    const control = event.target.closest(selector);
    if (control?.matches(':focus-visible')) sweep(control);
  });
  document.addEventListener('click', event => {
    const control = event.target.closest(selector);
    if (!control || reduced.matches || control.disabled || !control.animate) return;
    const [x, y] = point(control, event);
    const ripple = document.createElement('span');
    ripple.className = 'fluid-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    control.append(ripple);
    const animation = ripple.animate([
      { transform: 'translate(-50%, -50%) scale(.04)', opacity: .58 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
    ], { duration: 490, easing: 'cubic-bezier(.2,.7,.25,1)' });
    animation.finished.then(() => ripple.remove(), () => ripple.remove());
  }, { capture: true });
})();
