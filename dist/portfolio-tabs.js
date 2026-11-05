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
})();
