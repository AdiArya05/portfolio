(() => {
  const trigger = document.querySelector('.outfield-trigger');
  if (!trigger) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const greens = ['#426632', '#63813c', '#87a34b', '#a9ba61', '#526943'];
  let burst;

  trigger.addEventListener('click', () => {
    burst?.remove();
    if (reducedMotion.matches) return;

    const bounds = trigger.getBoundingClientRect();
    const layer = document.createElement('div');
    layer.className = 'outfield-burst';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    burst = layer;

    for (let index = 0; index < 26; index++) {
      const particle = document.createElement('span');
      particle.className = index % 3 === 0 ? 'outfield-particle is-grass' : 'outfield-particle';
      particle.style.left = `${bounds.left + bounds.width / 2}px`;
      particle.style.top = `${bounds.top + bounds.height / 2}px`;
      particle.style.backgroundColor = greens[index % greens.length];
      layer.append(particle);

      const angle = (index / 26) * 2 * Math.PI;
      const distance = 35 + Math.random() * 80;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 34;
      const spin = (Math.random() - .5) * 600;
      particle.animate([
        { transform: 'translate(-50%, -50%) scale(.25)', opacity: 0, easing: 'cubic-bezier(.24,.52,.45,1)' },
        { transform: `translate(${x * .8}px, ${y}px) rotate(${spin * .55}deg)`, opacity: 1, offset: .37, easing: 'cubic-bezier(.38,0,.75,.65)' },
        { transform: `translate(${x}px, ${y + 76}px) rotate(${spin}deg) scale(.65)`, opacity: 0 }
      ], { duration: 1350 + Math.random() * 300, delay: index * 5, fill: 'forwards' });
    }
    setTimeout(() => layer.remove(), 1800);
  });
})();
