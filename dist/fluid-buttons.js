(() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const paths = {
    Index: 'M3 11 12 3l9 8-1.5 1.7L12 6l-7.5 6.7L3 11Zm3 2 6-5.3 6 5.3v6a1 1 0 0 1-1 1h-3.4v-4.5h-3.2V20H7a1 1 0 0 1-1-1Z',
    Work: 'M9 4h6a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v2H2v-2a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2Zm0 4h6V6H9v2Zm13 6v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4h8v1h4v-1Z',
    Explorations: 'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5v2h8V8H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z',
    Icons: 'M4 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm11 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM4 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Zm11 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z',
    'Book a call': 'M7 2h2v3h6V2h2v3h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V2ZM5 10v10h14V10H5Zm3 3h3v2H8v-2Zm5 0h3v2h-3v-2Zm-5 4h3v1H8v-1Z',
    Email: 'M4 4h16a2 2 0 0 1 2 2v1l-10 6L2 7V6a2 2 0 0 1 2-2Zm18 5.5V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5l10 6 10-6Z',
    X: 'M4 3h4.7l4.2 5.7L17.8 3h2.7l-6.3 7.4L21 21h-4.8l-4.6-6.4L6.1 21H3.4l6.9-8.2L4 3Zm3.6 2 9.7 14h1.2L8.8 5H7.6Z'
  };
  for (const link of document.querySelectorAll('.portfolio-nav a, .work-contact-actions a')) {
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

  const selector = '.portfolio-nav a, a[data-liquid-glass], button:is(.page-scroll-button,.motion-toggle,.motion-open,.lightbox-close,.modal-close,.island-zone)';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function point(control, event) {
    const bounds = control.getBoundingClientRect();
    return event.detail === 0 ? [bounds.width / 2, bounds.height / 2] :
      [event.clientX - bounds.left, event.clientY - bounds.top];
  }
  document.addEventListener('pointermove', event => {
    const control = event.target.closest(selector);
    if (!control || event.pointerType === 'touch' || reduced.matches) return;
    const bounds = control.getBoundingClientRect();
    control.style.setProperty('--fluid-x', `${event.clientX - bounds.left}px`);
    control.style.setProperty('--fluid-y', `${event.clientY - bounds.top}px`);
  }, { passive: true });
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
