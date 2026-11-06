(() => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'page-scroll-button back-to-top is-hidden';
  button.innerHTML = '<svg class="down-arrow" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="currentColor"/><path d="M12 6.8v10.4m-4.2-4.1 4.2 4.2 4.2-4.2" fill="none" stroke="var(--paper)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Back to top</span>';
  document.body.append(button);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function updateVisibility() {
    button.classList.toggle('is-hidden', scrollY <= Math.min(innerHeight * 0.4, 250));
  }

  function goToTop(event) {
    if (event.detail === 0) {
      const nav = document.querySelector('.portfolio-nav');
      (nav?.querySelector('[aria-current="page"]') || nav?.querySelector('a'))?.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  button.addEventListener('click', goToTop);
  const explorationsActions = document.querySelector('.explorations-scroll-actions');
  if (explorationsActions) {
    const inlineButton = button.cloneNode(true);
    inlineButton.className = 'page-scroll-button explorations-back-to-top';
    inlineButton.addEventListener('click', goToTop);
    explorationsActions.append(inlineButton);
  }
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility);
  window.addEventListener('pageshow', updateVisibility);
  updateVisibility();
})();
