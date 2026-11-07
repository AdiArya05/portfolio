(() => {
  window.PortfolioMotionVideo = {
    prepare(video, source) {
      video.width = Number(source.getAttribute('width')) || source.videoWidth;
      video.height = Number(source.getAttribute('height')) || source.videoHeight;
      video.poster = source.poster;
      if (source.readyState >= 2 && source.videoWidth) {
        const frame = document.createElement('canvas');
        frame.width = Math.min(540, source.videoWidth);
        frame.height = Math.round(frame.width * source.videoHeight / source.videoWidth);
        const context = frame.getContext('2d');
        if (context) {
          context.drawImage(source, 0, 0, frame.width, frame.height);
          video.poster = frame.toDataURL('image/jpeg', .87);
        }
      }
      video.muted = true;
      const url = source.dataset.src || source.currentSrc || source.src;
      if (video.getAttribute('src') !== url) video.src = url;
      video.currentTime = source.currentTime || 0;
    }
  };

  const videos = [...document.querySelectorAll('.motion-stage video')];
  const workVideos = videos.filter(video => video.closest('.explorations-feed'));
  const phone = matchMedia('(max-width:700px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const visibility = new Map();
  const choices = new Map();
  let modalOpen = false;
  let scrolling = false;
  let scrollTimer;
  let activeWorkVideo;

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
  function wantsPlayback(video) {
    const state = choice(video);
    const automatic = !reduced.matches && !navigator.connection?.saveData;
    return !document.hidden && !modalOpen && !state.paused && (automatic || state.explicit);
  }
  function sync(video, shouldPlay) {
    if (shouldPlay) {
      if (!video.hasAttribute('src')) { video.src = video.dataset.src; }
      if (video.paused) {
        video.play().catch(() => paint(video));
        paint(video);
      }
    } else if (!video.paused) video.pause();
  }
  function syncAll() {
    let nextWorkVideo;
    if (phone.matches && !scrolling) {
      let bestRatio = .55;
      for (const video of workVideos) {
        const ratio = visibility.get(video) || 0;
        if (ratio < bestRatio || (nextWorkVideo && ratio === bestRatio) || !wantsPlayback(video)) continue;
        nextWorkVideo = video;
        bestRatio = ratio;
      }
    }
    if (activeWorkVideo !== nextWorkVideo && phone.matches) activeWorkVideo?.pause();
    activeWorkVideo = nextWorkVideo;
    for (const video of videos) {
      const shouldPlay = phone.matches && workVideos.includes(video)
        ? video === activeWorkVideo
        : (visibility.get(video) || 0) >= .15 && wantsPlayback(video);
      sync(video, shouldPlay);
    }
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibility.set(entry.target, entry.intersectionRatio);
      else visibility.delete(entry.target);
    });
    syncAll();
  }, { threshold:[0,.15,.55,.75,1] });

  if (workVideos.length) {
    window.addEventListener('scroll', () => {
      if (!phone.matches) return;
      if (!scrolling) {
        scrolling = true;
        syncAll();
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        scrolling = false;
        syncAll();
      }, 150);
    }, {passive:true});
  }

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
  phone.addEventListener('change', syncAll);
  window.addEventListener('portfolio-media-state', event => {
    modalOpen = event.detail.open;
    syncAll();
  });
})();
