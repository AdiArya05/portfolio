for (const nav of document.querySelectorAll('.portfolio-nav')) {
  const current = nav.querySelector('[aria-current="page"]');
  if (!current) continue;

  let active = current;
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
  nav.addEventListener('pointerleave', () => moveGlass(nav.querySelector(':focus-visible') || current));
  nav.addEventListener('focusout', event => {
    if (!nav.contains(event.relatedTarget)) moveGlass(nav.querySelector('a:hover') || current);
  });
  new ResizeObserver(() => moveGlass(active)).observe(nav);
  moveGlass(current);
  requestAnimationFrame(() => nav.classList.add('glass-ready'));
}
