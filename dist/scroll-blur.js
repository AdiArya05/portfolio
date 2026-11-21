(() => {
  const blur = document.createElement('div');
  blur.className = 'scroll-blur';
  blur.setAttribute('aria-hidden', 'true');
  for (let layer = 0; layer < 3; layer++) blur.append(document.createElement('span'));
  document.body.append(blur);

  let frame;
  function update() {
    frame = undefined;
    const remaining = document.documentElement.scrollHeight - innerHeight - scrollY;
    blur.style.opacity = String(Math.min(1, Math.max(0, remaining / 96)));
  }
  function schedule() {
    if (frame === undefined) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('popstate', schedule);
  new ResizeObserver(schedule).observe(document.body);
  update();
})();
