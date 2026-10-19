(() => {
  const veil = document.querySelector('#focus-veil');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const projectsVisible = matchMedia('(min-width:901px)');
  let owner = null;
  let target = null;
  let timer = 0;
  let revealFrame = 0;
  let trackingFrame = 0;
  let maskGeometry = '';

  function position() {
    if (!target?.isConnected) return false;
    const bounds = target.getBoundingClientRect();
    if (!bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= innerHeight) return false;
    const geometry = [bounds.left,bounds.top,bounds.width,bounds.height,innerWidth,innerHeight].join(',');
    if (geometry === maskGeometry) return true;
    maskGeometry = geometry;
    veil.style.setProperty('--focus-x', `${bounds.left + bounds.width / 2}px`);
    veil.style.setProperty('--focus-y', `${bounds.top + bounds.height / 2}px`);
    // Keep the clear area close to the two tabs, so the contact line is fully blurred.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${innerWidth}" height="${innerHeight}"><defs><filter id="soft"><feGaussianBlur stdDeviation="3"/></filter><mask id="cut"><rect width="100%" height="100%" fill="white"/><rect x="${bounds.left - 6}" y="${bounds.top - 6}" width="${bounds.width + 12}" height="${bounds.height + 12}" rx="24" fill="black" filter="url(#soft)"/></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#cut)"/></svg>`;
    veil.style.setProperty('--focus-mask', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
    return true;
  }
  function hide(requester) {
    if (requester && requester !== owner) return;
    owner = null;
    target = null;
    cancelAnimationFrame(revealFrame);
    document.body.removeAttribute('data-focus-owner');
    veil.classList.remove('is-visible');
    clearTimeout(timer);
    const close = () => {
      if (typeof veil.hidePopover === 'function' && veil.matches(':popover-open')) veil.hidePopover();
      veil.classList.remove('is-fallback-open');
    };
    if (reduced.matches) close();
    else timer = setTimeout(close, 390);
  }
  function show(element, requester) {
    if (document.body.classList.contains('modal-open')) return;
    if (target === element && owner === requester && (veil.classList.contains('is-visible') || revealFrame)) return;
    target = element;
    owner = requester;
    if (!position()) { hide(requester); return; }
    clearTimeout(timer);
    document.body.dataset.focusOwner = owner;
    if (typeof veil.showPopover === 'function') {
      if (!veil.matches(':popover-open')) veil.showPopover();
    } else veil.classList.add('is-fallback-open');
    cancelAnimationFrame(revealFrame);
    if (reduced.matches) veil.classList.add('is-visible');
    else {
      // Let the transparent popover paint before beginning its opacity transition.
      revealFrame = requestAnimationFrame(() => {
        revealFrame = requestAnimationFrame(() => {
          revealFrame = 0;
          if (target) veil.classList.add('is-visible');
        });
      });
    }
  }
  document.addEventListener('portfolio-focus', event => {
    if (event.detail.owner !== 'projects') return;
    if (event.detail.target) show(event.detail.target, event.detail.owner);
    else hide(event.detail.owner);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  function track() {
    if (trackingFrame) return;
    trackingFrame = requestAnimationFrame(() => {
      trackingFrame = 0;
      if (target && !position()) hide();
    });
  }
  window.addEventListener('scroll', track, {passive:true});
  window.addEventListener('resize', () => { if (!projectsVisible.matches) hide(); else track(); }, {passive:true});
  window.addEventListener('blur', () => hide());
})();
