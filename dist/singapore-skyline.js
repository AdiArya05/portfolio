(() => {
  const footer = document.querySelector('#singapore-footer');
  const art = document.querySelector('#singapore-skyline');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!footer || !art) return;
  const lens = document.createElement('canvas');
  lens.className = 'skyline-ripple';
  lens.setAttribute('aria-hidden','true');
  footer.append(lens);
  const context = lens.getContext('2d', {alpha:false});
  if (!context) return;
  const size = 160;
  const ratio = Math.min(devicePixelRatio || 1,2);
  lens.width = lens.height = size * ratio;
  context.setTransform(ratio,0,0,ratio,0,0);
  context.imageSmoothingQuality = 'high';
  let frame = 0;
  let lastPaint = -Infinity;
  let x = 0;
  let y = 0;
  let active = false;

  // One cropped image draw in a maximum 320x320 buffer, capped at 30fps.
  // The full-resolution SVG stays static. No full-screen copies or tile loops.
  function paint(now) {
    frame = 0;
    if (!active || reducedMotion.matches || !art.complete || !art.naturalWidth) return;
    if (now-lastPaint < 33) { frame=requestAnimationFrame(paint); return; }
    lastPaint = now;
    const bounds = footer.getBoundingClientRect();
    const image = art.getBoundingClientRect();
    const imageX = image.left-bounds.left;
    const imageY = image.top-bounds.top;
    if (y < imageY || y > imageY+image.height) { lens.style.opacity='0'; return; }
    // Keep the source wheel out of the lens; the animated engraved layer sits
    // above the lens, allowing the existing water hover effect to stay intact.
    if (footer.classList.contains('has-engraved-motion') &&
        (x-imageX)/image.width > .81 && (y-imageY)/image.height > .32 &&
        (y-imageY)/image.height < .76) { lens.style.opacity='0'; return; }
    const scaleX = art.naturalWidth/image.width;
    const scaleY = art.naturalHeight/image.height;
    const zoom = 1.025;
    const wobbleX = Math.sin(x*.018)*1.1;
    const wobbleY = Math.sin(y*.022)*.8;
    context.fillStyle = getComputedStyle(footer).backgroundColor;
    context.fillRect(0,0,size,size);
    context.drawImage(art,
      (x-imageX-size/(2*zoom)+wobbleX)*scaleX,
      (y-imageY-size/(2*zoom)+wobbleY)*scaleY,
      size/zoom*scaleX,size/zoom*scaleY,0,0,size,size);
    lens.style.transform = `translate3d(${x-size/2}px,${y-size/2}px,0)`;
    lens.style.opacity = '.85';
  }
  function reset() {
    active=false;
    if(frame) cancelAnimationFrame(frame);
    frame=0;
    lens.style.opacity='0';
  }
  footer.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType==='touch') return;
    const bounds=footer.getBoundingClientRect();
    x=event.clientX-bounds.left;
    y=event.clientY-bounds.top;
    active=true;
    if(!frame) frame=requestAnimationFrame(paint);
  },{passive:true});
  footer.addEventListener('pointerleave',reset);
  window.addEventListener('blur',reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden) reset();});
  reducedMotion.addEventListener('change',reset);
  new MutationObserver(reset)
    .observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
