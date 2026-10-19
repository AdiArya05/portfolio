(() => {
  const list = document.querySelector('.project-notes-list');
  if (!list) return;
  const links = [...list.querySelectorAll('.project-note')];
  const glass = list.querySelector('.project-link-glass');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width:901px)');
  const state = {x:0,y:0};
  const velocity = {x:0,y:0};
  const target = {x:0,y:0};
  let active = null;
  let frame = 0;
  let previous = 0;
  let initialised = false;
  let pending = null;
  let geometry = null;
  let width = 0;
  let height = 0;

  function measure() {
    const parent = list.getBoundingClientRect();
    geometry = new Map(links.map(link => {
      const bounds = link.getBoundingClientRect();
      return [link,{bounds,left:bounds.left-parent.left,top:bounds.top-parent.top}];
    }));
  }
  function paint() {
    glass.style.transform = `translate3d(${state.x}px,${state.y}px,0)`;
  }
  function updateTarget() {
    if (!pending) return;
    if (!geometry) measure();
    const {link,clientX,clientY} = pending;
    const {bounds,left,top} = geometry.get(link);
    const x = clientX == null ? .5 : Math.max(0,Math.min(1,(clientX-bounds.left)/bounds.width));
    const y = clientY == null ? .5 : Math.max(0,Math.min(1,(clientY-bounds.top)/bounds.height));
    target.x = left + (reduced.matches ? 0 : (x-.5)*4);
    target.y = top + (reduced.matches ? 0 : (y-.5)*3);
    // Sizes only change on entry/resize; the animation moves a composited transform.
    if (width !== bounds.width) glass.style.setProperty('--glass-width', `${width = bounds.width}px`);
    if (height !== bounds.height) glass.style.setProperty('--glass-height', `${height = bounds.height}px`);
    glass.style.setProperty('--glint-x', `${x*100}%`);
    glass.style.setProperty('--glint-y', `${y*100}%`);
    pending = null;
  }
  function animate(timestamp) {
    updateTarget();
    const dt = Math.min(1/30,Math.max(1/240,(timestamp-previous)/1000 || 1/60));
    previous = timestamp;
    let moving = false;
    for (const key of ['x','y']) {
      // Exact critically damped spring: stable at different refresh rates.
      const offset = state[key]-target[key];
      const momentum = velocity[key]+26*offset;
      const decay = Math.exp(-26*dt);
      state[key] = target[key]+(offset+momentum*dt)*decay;
      velocity[key] = (velocity[key]-26*momentum*dt)*decay;
      if (Math.abs(target[key]-state[key])>.02 || Math.abs(velocity[key])>.04) moving = true;
    }
    if (reduced.matches || !moving) {
      Object.assign(state,target);
      velocity.x = velocity.y = 0;
    }
    paint();
    if (moving && !reduced.matches) frame = requestAnimationFrame(animate);
    else previous = frame = 0;
  }
  function move(link,pointer) {
    pending = {link,clientX:pointer?.clientX,clientY:pointer?.clientY};
    if (!initialised || reduced.matches) {
      updateTarget();
      Object.assign(state,target);
      velocity.x = velocity.y = 0;
      paint();
      initialised = true;
    } else if (!frame) frame = requestAnimationFrame(animate);
    list.classList.add('is-engaged');
  }
  function showFocus() {
    if (wide.matches) document.dispatchEvent(new CustomEvent('portfolio-focus',{detail:{owner:'projects',target:list}}));
  }
  function hideFocus() {
    document.dispatchEvent(new CustomEvent('portfolio-focus',{detail:{owner:'projects',target:null}}));
  }
  function engage(link,event) {
    active = link;
    move(link,event);
    showFocus();
  }
  function disengage() {
    active = pending = null;
    list.classList.remove('is-engaged');
    hideFocus();
  }
  links.forEach(link => {
    link.addEventListener('pointerenter',event => { if (event.pointerType !== 'touch') engage(link,event); });
    // Keep only the latest pointer position; read/write once in the next animation frame.
    link.addEventListener('pointermove',event => { if (active === link && event.pointerType !== 'touch') move(link,event); },{passive:true});
    link.addEventListener('focus',() => engage(link));
    link.addEventListener('click',hideFocus);
  });
  list.addEventListener('pointerleave',() => {
    const focused = links.find(link => link === document.activeElement);
    if (focused) engage(focused);
    else disengage();
  });
  list.addEventListener('focusout',event => { if (!list.contains(event.relatedTarget)) disengage(); });
  document.addEventListener('keydown',event => { if (event.key === 'Escape') hideFocus(); });
  function invalidate() {
    geometry = null;
    if (active) move(active);
  }
  window.addEventListener('resize',() => {
    invalidate();
    if (wide.matches && active) showFocus();
    else hideFocus();
  },{passive:true});
  window.addEventListener('scroll',invalidate,{passive:true});
  window.addEventListener('blur',disengage);
  document.fonts.ready.then(invalidate);
  reduced.addEventListener('change',invalidate);
})();
