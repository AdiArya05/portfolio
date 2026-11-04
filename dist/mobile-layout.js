(() => {
  const mobile = matchMedia('(max-width:700px)');
  const root = document.documentElement;
  const clock = document.querySelector('#time-zone-toggle');
  function fit() {
    if (!mobile.matches) { root.style.removeProperty('--mobile-story-top'); return; }
    root.style.setProperty('--mobile-story-top', `${Math.ceil(clock.getBoundingClientRect().bottom + 28)}px`);
  }
  window.addEventListener('resize',fit,{passive:true});
  mobile.addEventListener('change',fit);
  document.fonts.ready.then(fit);
  fit();
})();
