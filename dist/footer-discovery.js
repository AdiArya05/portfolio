(() => {
  const button = document.querySelector('#footer-discover');
  const footer = document.querySelector('#singapore-footer');
  const desktop = matchMedia('(min-width: 701px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function paint() {
    const hidden = scrollY > Math.min(innerHeight * 0.4, 250) || !desktop.matches;
    button.classList.toggle('is-hidden', hidden);
    button.tabIndex = hidden ? -1 : 0;
  }

  // Native scrolling stays untouched: no wheel interception or hold gesture.
  button.addEventListener('click', () => {
    if (!desktop.matches) return;
    window.dispatchEvent(new Event('portfolio-footer-reveal'));
    footer.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  });
  window.addEventListener('scroll', paint, { passive: true });
  window.addEventListener('resize', paint, { passive: true });
  desktop.addEventListener('change', paint);
  paint();
})();
