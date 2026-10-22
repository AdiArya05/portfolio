(() => {
  const videos = [...document.querySelectorAll('.motion-stage video')];
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const visible = new Set();
  const choices = new Map();
  let modalOpen = false;

  function choice(video) {
    if (!choices.has(video.dataset.src)) choices.set(video.dataset.src, { paused:false, explicit:false });
    return choices.get(video.dataset.src);
  }
  function paint(video) {
    const button = video.closest('.motion-stage').querySelector('.motion-toggle');
    const playing = !video.paused;
    button.dataset.playing = String(playing);
    button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${video.dataset.name} preview`);
  }
  function sync(video) {
    const state = choice(video);
    const automatic = !reduced.matches && !navigator.connection?.saveData;
    const shouldPlay = visible.has(video) && !document.hidden && !modalOpen && !state.paused && (automatic || state.explicit);
    if (shouldPlay) {
      if (!video.hasAttribute('src')) { video.src = video.dataset.src; video.load(); }
      if (video.paused) video.play().catch(() => paint(video));
    } else video.pause();
    paint(video);
  }
  function syncAll() { videos.forEach(sync); }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= .15) visible.add(entry.target);
      else visible.delete(entry.target);
      sync(entry.target);
    });
  }, { threshold:[0,.15] });

  videos.forEach(video => {
    video.muted = true;
    video.addEventListener('playing', () => paint(video));
    video.addEventListener('pause', () => paint(video));
    const button = video.closest('.motion-stage').querySelector('.motion-toggle');
    button.addEventListener('click', event => {
      event.stopPropagation();
      const state = choice(video);
      state.paused = !video.paused;
      state.explicit = true;
      syncAll();
    });
    observer.observe(video);
    paint(video);
  });
  document.addEventListener('visibilitychange', syncAll);
  reduced.addEventListener('change', syncAll);
  window.addEventListener('portfolio-media-state', event => {
    modalOpen = event.detail.open;
    syncAll();
  });
})();
