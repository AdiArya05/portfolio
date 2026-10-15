(() => {
  const button = document.querySelector('#footer-discover');
  const footer = document.querySelector('#singapore-footer');
  const desktop = matchMedia('(min-width: 701px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let charge = 0;
  let lastInput = 0;
  let frame = 0;
  let holding = false;
  let revealing = false;
  let revealFrame = 0;
  let previous = 0;

  function paint() {
    button.style.setProperty('--pull',String(charge));
    const hidden = scrollY > Math.min(innerHeight*0.4,250) || !desktop.matches;
    button.classList.toggle('is-hidden',hidden);
    button.tabIndex = hidden ? -1 : 0;
  }
  function reveal() {
    if (revealing || !desktop.matches) return;
    revealing = true;
    holding = false;
    charge = 1;
    paint();
    window.dispatchEvent(new Event('portfolio-footer-reveal'));
    const start = scrollY;
    const destination = footer.offsetTop;
    const started = performance.now();
    const duration = reduced.matches ? 0 : 1050;
    function move(now) {
      const t = duration ? Math.min(1,(now-started)/duration) : 1;
      const ease = (1-Math.cos(Math.PI*t))/2;
      scrollTo({top:start+(destination-start)*ease,behavior:'instant'});
      paint();
      if(t<1) revealFrame=requestAnimationFrame(move);
      else {revealing=false;charge=0;paint();}
    }
    revealFrame=requestAnimationFrame(move);
  }
  function tick(now) {
    const elapsed = previous ? Math.min(40,now-previous) : 16;
    previous = now;
    if(holding) charge = Math.min(1,charge+elapsed/420);
    else if(now-lastInput>450 && !revealing) charge = Math.max(0,charge-elapsed/1000);
    paint();
    if(charge>=1 && !revealing) reveal();
    if(holding || charge>0 && !revealing) frame=requestAnimationFrame(tick);
    else {frame=0;previous=0;}
  }
  function animate() {if(!frame) frame=requestAnimationFrame(tick);}
  window.addEventListener('wheel',event => {
    if(!desktop.matches || event.ctrlKey || document.body.classList.contains('modal-open') || event.target.closest('#gallery, #time-zones')) return;
    if(revealing) {
      if(event.deltaY<0) {cancelAnimationFrame(revealFrame);revealing=false;charge=0;}
      else if(event.cancelable) event.preventDefault();
      return;
    }
    if(scrollY>2) return;
    if(event.deltaY<=0) {charge=0;paint();return;}
    // A short, elastic pull instead of an abrupt jump into the next section.
    // Scrolling a gallery never contributes to the page's reveal gesture.
    if(!event.cancelable) return;
    event.preventDefault();
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    charge=Math.min(1,charge+Math.min(180,delta)/180);
    lastInput=performance.now();
    paint();
    if(charge>=1) reveal(); else animate();
  },{passive:false});
  button.addEventListener('click',reveal);
  button.addEventListener('pointerdown',event => {
    if(event.button!==0) return;
    holding=true;
    lastInput=performance.now();
    button.setPointerCapture(event.pointerId);
    animate();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type => button.addEventListener(type,() => {holding=false;lastInput=performance.now();animate();}));
  window.addEventListener('scroll',paint,{passive:true});
  window.addEventListener('resize',paint,{passive:true});
  window.addEventListener('keydown',event => {
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key) && revealing) {
      cancelAnimationFrame(revealFrame);revealing=false;charge=0;paint();
    }
  });
  desktop.addEventListener('change',() => {holding=false;charge=0;paint();});
  paint();
})();
