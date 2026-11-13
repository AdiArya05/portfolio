window.PortfolioNav = {};
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
