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
  const workVideos = videos.filter(video => video.closest('main.explorations-page'));
  const phone = matchMedia('(max-width: 700px)');
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
    const shouldPlay = visible.has(video) && !video.closest('[data-portfolio-panel][hidden]') &&
      !document.hidden && !modalOpen && !state.paused && (automatic || state.explicit);
    if (shouldPlay) {
      if (!video.hasAttribute('src')) {
        video.src = (phone.matches && video.dataset.phoneSrc) || video.dataset.src;
      }
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

  function rewindWork() {
    for (const video of workVideos) {
      visible.delete(video);
      video.pause();
      if (video.hasAttribute('src')) video.currentTime = 0;
      observer.unobserve(video);
      observer.observe(video);
      paint(video);
    }
  }

  videos.forEach(video => {
    video.muted = true;
    const stage = video.closest('.motion-stage');
    if (stage.querySelector('.motion-poster')) {
      let frameRequest;
      video.addEventListener('playing', () => {
        if (video.hasAttribute('data-frame-ready') || frameRequest !== undefined) return;
        const reveal = () => {
          frameRequest = undefined;
          if (video.readyState >= 2 && !video.error) video.dataset.frameReady = '';
        };
        if (video.requestVideoFrameCallback) frameRequest = video.requestVideoFrameCallback(reveal);
        else reveal();
      });
      const resetPoster = () => {
        if (frameRequest !== undefined) video.cancelVideoFrameCallback(frameRequest);
        frameRequest = undefined;
        delete video.dataset.frameReady;
      };
      video.addEventListener('emptied', resetPoster);
      video.addEventListener('error', resetPoster);
    }
    video.addEventListener('playing', () => paint(video));
    video.addEventListener('pause', () => paint(video));
    const button = stage.querySelector('.motion-toggle');
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
  window.addEventListener('portfolio-work-leave', rewindWork);
  window.addEventListener('pagehide', rewindWork);
  reduced.addEventListener('change', syncAll);
  window.addEventListener('portfolio-media-state', event => {
    modalOpen = event.detail.open;
    syncAll();
  });
})();
