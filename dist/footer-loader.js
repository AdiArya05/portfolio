(() => {
  const footer = document.querySelector('#singapore-footer');
  if (!footer) return;
  const desktop = matchMedia('(min-width:701px)');
  let loaded = false;
  let scheduled = false;
  function load() {
    scheduled = false;
    if (loaded || !desktop.matches || document.hidden ||
        document.documentElement.classList.contains('is-page-scrolling')) return;
    loaded = true;
    // Prepare offscreen during idle time, not at the exact moment the skyline
    // enters the viewport. Phone visitors still download none of these assets.
    for (const src of ['/singapore-skyline.js', '/skyline-motion.js']) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      document.body.append(script);
    }
    desktop.removeEventListener('change', schedule);
    window.removeEventListener('portfolio-scroll-settled', schedule);
    document.removeEventListener('visibilitychange', schedule);
  }
  function schedule() {
    if (loaded || scheduled || !desktop.matches || document.hidden) return;
    scheduled = true;
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1500 });
    else setTimeout(load, 250);
  }
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  desktop.addEventListener('change', schedule);
  window.addEventListener('portfolio-scroll-settled', schedule);
  document.addEventListener('visibilitychange', schedule);
})();
