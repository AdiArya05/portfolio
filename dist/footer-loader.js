(() => {
  const footer = document.querySelector('#singapore-footer');
  if (!footer) return;
  const desktop = matchMedia('(min-width:701px)');
  let loaded = false;
  let nearFooter = false;
  function load() {
    if (loaded || !desktop.matches || !nearFooter) return;
    loaded = true;
    // Keep the approved effects, without constructing/downloading unused
    // engraving layers on phones or before a desktop visitor nears the footer.
    for (const src of ['/singapore-skyline.js', '/skyline-motion.js']) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      document.body.append(script);
    }
    observer.disconnect();
    desktop.removeEventListener('change', load);
  }
  const observer = new IntersectionObserver(entries => {
    nearFooter = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
    load();
  }, { rootMargin: '150px', threshold: 0 });
  observer.observe(footer);
  desktop.addEventListener('change', load);
})();
