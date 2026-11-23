(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!CSS.supports('clip-path', 'inset(1px round 12px)')) return;
  const guide = document.createElement('span');
  guide.className = 'scroll-edge-guide';
  guide.setAttribute('aria-hidden', 'true');
  document.body.append(guide);
  const nearby = new Set();
  const items = [];
  let frame;

  function reset(item) {
    item.element.classList.remove('scroll-edge-active');
    item.element.style.removeProperty('--scroll-edge-cut');
    item.element.style.removeProperty('--scroll-edge-radius');
    item.element.style.removeProperty('--scroll-edge-strength');
    item.element.style.removeProperty('--scroll-edge-band');
  }
  function update() {
    frame = undefined;
    const edge = guide.getBoundingClientRect().top;
    const paused = motion.matches || !!document.querySelector('dialog[open], body.modal-open');
    const measurements = [...nearby].map(item => ({item, rect: item.element.getBoundingClientRect()}));
    for (const {item, rect} of measurements) {
      const cut = Math.max(0, Math.min(rect.height, edge - rect.top));
      if (paused || !rect.width || cut <= 0 || rect.bottom <= edge) {
        reset(item);
        continue;
      }
      const radius = Math.min(18, (rect.height - cut) / 2, rect.width / 2);
      const strength = Math.min(1, cut / 12);
      item.element.style.setProperty('--scroll-edge-cut', `${cut.toFixed(2)}px`);
      item.element.style.setProperty('--scroll-edge-radius', `${(item.radius + (radius - item.radius) * strength).toFixed(2)}px`);
      item.element.style.setProperty('--scroll-edge-strength', strength.toFixed(3));
      item.element.style.setProperty('--scroll-edge-band', `${Math.min(22, rect.height - cut).toFixed(2)}px`);
      item.element.classList.add('scroll-edge-active');
    }
  }
  function schedule() {
    if (frame === undefined) frame = requestAnimationFrame(update);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const item = items.find(item => item.element === entry.target);
      if (entry.isIntersecting) nearby.add(item);
      else { nearby.delete(item); reset(item); }
    }
    schedule();
  }, {rootMargin: '100px 0px'});

  document.querySelectorAll('.motion-stage, .preview-open, .catalog-media-link, .image-button, .work-icon > div, .case-study-media').forEach(element => {
    if (!element.querySelector('img, video') || element.closest('dialog') || element.parentElement.closest('.motion-stage')) return;
    const style = getComputedStyle(element);
    const item = {element, radius: parseFloat(style.borderTopLeftRadius) || 0};
    const softness = document.createElement('span');
    softness.className = 'scroll-edge-softness';
    softness.setAttribute('aria-hidden', 'true');
    softness.append(document.createElement('span'), document.createElement('span'));
    element.classList.add('scroll-edge-media');
    element.style.setProperty('--scroll-edge-bottom-right', style.borderBottomRightRadius);
    element.style.setProperty('--scroll-edge-bottom-left', style.borderBottomLeftRadius);
    element.append(softness);
    items.push(item);
    observer.observe(element);
  });
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  motion.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(document.body);
  new MutationObserver(schedule).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['open', 'hidden']});
})();
