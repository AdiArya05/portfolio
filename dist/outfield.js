(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

  const touchLayout = matchMedia('(hover: none)');
  trigger.addEventListener('click', event => {
    if (event.pointerType === 'touch' || touchLayout.matches) {
      trigger.classList.toggle('is-saluting');
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!trigger.contains(event.target)) trigger.classList.remove('is-saluting');
  });
})();
