(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;

  let salute;
  let expiry;

  function show() {
    if (salute) return;

    salute = document.createElement('span');
    salute.className = 'outfield-salute';
    salute.setAttribute('aria-hidden', 'true');
    salute.textContent = '🫡';
    trigger.append(salute);
    expiry = window.setTimeout(clear, 1050);
  }

  function clear() {
    window.clearTimeout(expiry);
    salute?.remove();
    salute = null;
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') show();
  });
  trigger.addEventListener('click', show);
})();
