(() => {
  const button = document.querySelector('#footer-discover');
  const footer = document.querySelector('#singapore-footer');
  const desktop = matchMedia('(min-width: 701px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let settleTimer = 0;
  let scrolling = false;

  function finishScroll() {
    clearTimeout(settleTimer);
    if (!scrolling) return;
    scrolling = false;
    root.classList.remove('is-page-scrolling');
    window.dispatchEvent(new Event('portfolio-scroll-settled'));
  }

  function beginScroll() {
    if (!scrolling) {
      scrolling = true;
      root.classList.add('is-page-scrolling');
      window.dispatchEvent(new Event('portfolio-scroll-start'));
    }
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finishScroll, 160);
  }

  function paint() {
    const hidden = scrollY > Math.min(innerHeight * 0.4, 250) || !desktop.matches;
    button.classList.toggle('is-hidden', hidden);
    button.tabIndex = hidden ? -1 : 0;
  }

  // Native scrolling stays untouched: no wheel interception or hold gesture.
  button.addEventListener('click', () => {
    if (!desktop.matches) return;
    if (!reduced.matches) beginScroll();
    footer.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  });
  window.addEventListener('scroll', () => { beginScroll(); paint(); }, { passive: true });
  // Nested gallery scrollend events bubble too; they must not resume the
  // expensive footer layers while the document itself is still moving.
  window.addEventListener('scrollend', event => {
    if (event.target === document) finishScroll();
  }, { passive: true });
  window.addEventListener('blur', finishScroll);
  window.addEventListener('resize', paint, { passive: true });
  desktop.addEventListener('change', paint);
  paint();
})();
