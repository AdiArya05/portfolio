(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.next-project,[data-liquid-glass]').forEach(card => {
    const state = {x:0,y:0};
    const velocity = {x:0,y:0};
    const target = {x:0,y:0};
    let frame = 0;
    let previous = 0;
    function paint() {
      card.style.setProperty('--story-glass-x', `${state.x}px`);
      card.style.setProperty('--story-glass-y', `${state.y}px`);
    }
    function animate(timestamp) {
      const dt = Math.min(1/30, Math.max(1/240, (timestamp - previous)/1000 || 1/60));
      previous = timestamp;
      let moving = false;
      for (const key of ['x','y']) {
        velocity[key] += ((target[key] - state[key])*420 - velocity[key]*32)*dt;
        state[key] += velocity[key]*dt;
        if (Math.abs(target[key] - state[key]) > .02 || Math.abs(velocity[key]) > .04) moving = true;
      }
      paint();
      if (moving && !reduced.matches) frame = requestAnimationFrame(animate);
      else {
        Object.assign(state,target);
        velocity.x = velocity.y = previous = frame = 0;
        paint();
      }
    }
    function move(x,y) {
      target.x = reduced.matches ? 0 : (x-.5)*4;
      target.y = reduced.matches ? 0 : (y-.5)*3;
      card.style.setProperty('--story-glint-x', `${x*100}%`);
      card.style.setProperty('--story-glint-y', `${y*100}%`);
      if (!frame) frame = requestAnimationFrame(animate);
    }
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const bounds = card.getBoundingClientRect();
      move(Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width)),Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height)));
    },{passive:true});
    card.addEventListener('pointerleave', () => move(.5,.5));
    card.addEventListener('focus', () => move(.5,.5));
    card.addEventListener('blur', () => move(.5,.5));
    reduced.addEventListener('change', () => move(.5,.5));
  });
})();
