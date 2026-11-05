(() => {
  const nav = document.querySelector('.portfolio-nav');
  const links = [...nav.querySelectorAll('[data-portfolio-tab]')];
  const panels = new Map([...document.querySelectorAll('[data-portfolio-panel]')]
    .map(panel => [panel.dataset.portfolioPanel, panel]));
  const footer = document.querySelector('#singapore-footer');
  const footerButton = document.querySelector('#footer-discover');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 'index';
  let animation;
  const phone = matchMedia('(max-width:700px)');
  const content = document.querySelector('.portfolio-content');
  let fitFrame;

  function fitIndex() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
      content.style.removeProperty('--portfolio-copy-size');
      if (!phone.matches || current !== 'index') return;
      const available = window.visualViewport?.height || innerHeight;
      const maximum = parseFloat(getComputedStyle(document.querySelector('#intro-heading')).fontSize);
      let low = 12;
      let high = maximum;
      for (let step = 0; step < 10; step++) {
        const size = (low + high) / 2;
        content.style.setProperty('--portfolio-copy-size', size + 'px');
        if (content.scrollHeight <= available + 1) low = size;
        else high = size;
      }
      content.style.setProperty('--portfolio-copy-size', low + 'px');
    });
  }
  window.addEventListener('resize', fitIndex, {passive: true});
  window.visualViewport?.addEventListener('resize', fitIndex, {passive: true});
  document.fonts.ready.then(fitIndex);

  function select(name, animate = true) {
    if (!panels.has(name) || name === current) return;
    animation?.cancel();
    for (const popover of document.querySelectorAll(':popover-open')) popover.hidePopover();
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    panels.get(current).hidden = true;
    const panel = panels.get(name);
    panel.hidden = false;
    footer.hidden = footerButton.hidden = name !== 'index';
    current = name;
    fitIndex();
    for (const link of links) {
      if (link.dataset.portfolioTab === name) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    window.PortfolioNav.selectCurrent();
    if (animate && !reduced.matches) {
      animation = panel.animate(
        [{opacity: .45}, {opacity: 1}],
        {duration: 180, easing: 'cubic-bezier(.2,.65,.3,1)'}
      );
    }
  }

  for (const link of links) {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const name = link.dataset.portfolioTab;
      if (name === current) return;
      history.pushState(null, '', name === 'index' ? '/' : '#' + name);
      select(name);
    });
  }
  const selectHash = () => select(location.hash.slice(1) || 'index');
  window.addEventListener('hashchange', selectHash);
  window.addEventListener('popstate', selectHash);
  select(location.hash.slice(1) || 'index', false);
  fitIndex();
})();
