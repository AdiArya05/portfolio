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
  const sweeps = new WeakMap();
  function sweep(control, event) {
    if (reduced.matches || control.disabled) return;
    for (const node of Array.from(control.childNodes)) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
      const label = document.createElement('span');
      label.className = 'fluid-label';
      node.replaceWith(label);
      label.append(node);
    }
    const label = [...control.children].find(child =>
      child.matches('span') && child.textContent.trim() && child.getClientRects().length);
    if (!label?.animate) return;

    const bounds = label.getBoundingClientRect();
    const forward = !event || event.clientX < bounds.left + bounds.width / 2;
    sweeps.get(label)?.cancel();
    label.classList.add('fluid-text-sheen');
    const animation = label.animate([
      { backgroundPosition: forward ? '100% 0' : '0% 0' },
      { backgroundPosition: forward ? '0% 0' : '100% 0' }
    ], { duration: 550, easing: 'cubic-bezier(.2,.65,.25,1)' });
    sweeps.set(label, animation);
    animation.finished.then(() => {
      if (sweeps.get(label) === animation) label.classList.remove('fluid-text-sheen');
    }, () => {});
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
    if (control) sweep(control, event.detail ? event : null);
  }, { capture: true });
})();
