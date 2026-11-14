(() => {
  const nav = document.querySelector('.portfolio-nav');
  const links = [...nav.querySelectorAll('[data-portfolio-tab]')];
  const panels = new Map([...document.querySelectorAll('[data-portfolio-panel]')]
    .map(panel => [panel.dataset.portfolioPanel, panel]));
  const footer = document.querySelector('#singapore-footer');
  const footerButton = document.querySelector('#footer-discover');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 'index';
  let entrance;

  function reveal(panel) {
    if (reduced.matches) return;
    const frames = [
      {opacity: .4, transform: 'translateY(4px)'},
      {opacity: 1, transform: 'translateY(0px)'}
    ];
    if (!phone.matches) {
      frames[0].filter = 'blur(2px)';
      frames[1].filter = 'blur(0px)';
    }
    entrance = panel.animate(frames, {duration: 330, easing: 'cubic-bezier(.25,.65,.3,1)'});
  }

  reduced.addEventListener('change', () => entrance?.cancel());
  const phone = matchMedia('(max-width:700px)');
  const content = document.querySelector('.portfolio-content');
  let fitFrame;

  function fitIndex() {
    content.style.removeProperty('--portfolio-copy-size');
    if (!phone.matches || current !== 'index') return;
    const intro = document.querySelector('#intro-heading');
    const available = content.clientHeight;
    const top = content.getBoundingClientRect().top;
    let low = 12;
    let high = parseFloat(getComputedStyle(intro).fontSize);
    if (intro.getBoundingClientRect().bottom - top <= available - 12) return;
    for (let step = 0; step < 10; step++) {
      const size = (low + high) / 2;
      content.style.setProperty('--portfolio-copy-size', size + 'px');
      if (intro.getBoundingClientRect().bottom - top <= available - 12) low = size;
      else high = size;
    }
    content.style.setProperty('--portfolio-copy-size', low + 'px');
  }
  window.addEventListener('resize', () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fitIndex);
  }, {passive: true});

  function warmWork() {
    if (phone.matches || reduced.matches || navigator.connection?.saveData) return;
    const video = panels.get('work').querySelector('.motion-stage video[data-src]');
    if (!video || video.hasAttribute('src')) return;
    video.preload = 'auto';
    video.src = video.dataset.src;
  }

  function select(name, animate = true) {
    if (!panels.has(name) || name === current) return;
    entrance?.cancel();

    const previous = panels.get(current);
    if (name === 'work') warmWork();
    for (const popover of document.querySelectorAll(':popover-open')) popover.hidePopover();
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    previous.hidden = true;
    if (current === 'work') window.dispatchEvent(new Event('portfolio-work-leave'));
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
    if (animate) reveal(panel);
  }

  for (const link of links) {
    if (link.dataset.portfolioTab === 'work') {
      for (const event of ['pointerenter', 'pointerdown', 'focus']) {
        link.addEventListener(event, warmWork, {once: true, passive: true});
      }
    }
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const name = link.dataset.portfolioTab;
      if (name === (location.hash.slice(1) || 'index')) return;
      history.pushState(null, '', name === 'index' ? '/' : '#' + name);
      select(name);
    });
  }
  const selectHash = () => select(location.hash.slice(1) || 'index');
  window.addEventListener('hashchange', selectHash);
  window.addEventListener('popstate', selectHash);
  select(location.hash.slice(1) || 'index', false);
  fitIndex();
  delete document.documentElement.dataset.initialPanel;
})();
