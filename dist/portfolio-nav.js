window.PortfolioNav = {};
for (const nav of document.querySelectorAll('.portfolio-nav')) {
  const current = () => nav.querySelector('[aria-current="page"]');
  if (!current()) continue;

  let active = current();
  function moveGlass(link) {
    active = link;
    nav.style.setProperty('--glass-x', `${link.offsetLeft}px`);
    nav.style.setProperty('--glass-width', `${link.offsetWidth}px`);
  }

  for (const link of nav.querySelectorAll('a')) {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') moveGlass(link);
    });
    link.addEventListener('focus', () => moveGlass(link));
  }
  nav.addEventListener('pointerleave', () => moveGlass(nav.querySelector(':focus-visible') || current()));
  nav.addEventListener('focusout', event => {
    if (!nav.contains(event.relatedTarget)) moveGlass(nav.querySelector('a:hover') || current());
  });
  new ResizeObserver(() => moveGlass(active)).observe(nav);
  window.PortfolioNav.selectCurrent = () => moveGlass(current());
  moveGlass(current());
  requestAnimationFrame(() => nav.classList.add('glass-ready'));
}

window.PortfolioNav.bindStories = () => {
  for (const list of document.querySelectorAll('.story-list')) {
    const glass = list.querySelector('.story-glass');
    function moveGlass(entry) {
      if (entry) {
        glass.style.height = `${entry.offsetHeight}px`;
        glass.style.transform = `translateY(${entry.offsetTop}px)`;
      }
      glass.classList.toggle('is-visible', Boolean(entry));
    }

    for (const entry of list.querySelectorAll('.story-entry')) {
      entry.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') moveGlass(entry);
      });
      entry.addEventListener('focus', () => moveGlass(entry));
    }
    list.addEventListener('pointerleave', () => moveGlass(list.querySelector(':focus-visible')));
    list.addEventListener('focusout', event => {
      if (!list.contains(event.relatedTarget)) moveGlass(list.querySelector('.story-entry:hover'));
    });
  }
};
window.PortfolioNav.bindStories();
