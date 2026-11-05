(() => {
  const intro = document.querySelector('#intro-heading');
  const words = [...document.querySelectorAll('[data-design-target]')];
  const frame = document.querySelector('.design-selection-frame');
  const label = document.querySelector('.design-selection-size');
  if (!intro || !words.length || !frame || !label) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const axes = ['x','y','width','height'];
  let active = words[0], current, target, animation = 0, layoutFrame = 0, lastTime = 0;
  const velocity = {x:0,y:0,width:0,height:0};

  function paint() {
    frame.hidden = false;
    frame.style.transform = `translate3d(${current.x}px,${current.y}px,0)`;
    frame.style.width = `${current.width}px`;
    frame.style.height = `${current.height}px`;
    label.textContent = `${Math.round(current.width - 6)} × ${Math.round(current.height - 4)} px`;
  }

  function settle() {
    cancelAnimationFrame(animation);
    animation = 0;
    current = {...target};
    axes.forEach(axis => velocity[axis] = 0);
    frame.classList.remove('is-moving');
    paint();
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;
    let resting = true;
    for (const axis of axes) {
      velocity[axis] += ((target[axis] - current[axis]) * 600 - velocity[axis] * 43) * dt;
      current[axis] += velocity[axis] * dt;
      if (Math.abs(target[axis] - current[axis]) > .08 || Math.abs(velocity[axis]) > .5) resting = false;
    }
    paint();
    if (resting) settle();
    else animation = requestAnimationFrame(tick);
  }

  function measure(animate = false) {
    const word = active.querySelector('.design-selection-text').getBoundingClientRect();
    const origin = intro.getBoundingClientRect();
    target = {x:word.left-origin.left-3,y:word.top-origin.top-2,width:word.width+6,height:word.height+4};
    if (!current || !animate || reduced.matches) return settle();
    frame.classList.add('is-moving');
    // Retarget the existing spring, preserving its position and velocity.
    if (!animation) {
      lastTime = performance.now();
      animation = requestAnimationFrame(tick);
    }
  }

  for (const word of words) {
    const select = event => {
      if (event.pointerType === 'touch') return;
      if (active === word) return;
      active = word;
      measure(true);
    };
    word.addEventListener('pointerenter', select);
  }

  function scheduleLayout() {
    if (layoutFrame) return;
    layoutFrame = requestAnimationFrame(() => { layoutFrame = 0; measure(); });
  }
  const observer = new ResizeObserver(scheduleLayout);
  [intro,...words].forEach(element => observer.observe(element));
  window.addEventListener('resize', scheduleLayout, {passive:true});
  reduced.addEventListener('change', () => { if (target) settle(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && target) settle(); });
  document.fonts.ready.then(scheduleLayout);
  measure();
})();
