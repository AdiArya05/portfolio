(() => {
  const root = document.documentElement;
  const viewer = document.querySelector('#media-viewer');
  const image = viewer.querySelector('#modal-image');
  const video = viewer.querySelector('#modal-video');
  const link = viewer.querySelector('#modal-link');
  const appearance = document.querySelector('#appearance');
  let opener;
  let audio;

  function sound(direction) {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      audio.resume().then(() => window.PortfolioMediaSound?.(audio, direction)).catch(() => {});
    } catch {}
  }

  function syncAppearance() {
    const dark = root.dataset.theme === 'dark';
    appearance.textContent = dark ? 'Light appearance' : 'Dark appearance';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#181815' : '#ffffff';
  }
  appearance.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch {}
    syncAppearance();
  });
  window.addEventListener('pageshow', () => {
    try { const saved = localStorage.getItem('portfolio-theme'); if (['light','dark'].includes(saved)) root.dataset.theme = saved; } catch {}
    syncAppearance();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'portfolio-theme' && ['light','dark'].includes(event.newValue)) {
      root.dataset.theme = event.newValue;
      syncAppearance();
    }
  });
  syncAppearance();

  document.querySelectorAll('.preview-open').forEach(button => {
    button.addEventListener('click', () => {
      if (viewer.open) return;
      const piece = button.closest('.exploration');
      const media = button.querySelector('.card-media');
      const motion = media.tagName === 'VIDEO';
      opener = button;
      viewer.querySelector('.viewer-stage').style.setProperty('--viewer-ratio', `${media.width}/${media.height}`);
      image.hidden = motion;
      video.hidden = !motion;
      if (motion) {
        video.poster = media.poster;
        video.src = media.dataset.src;
        video.muted = true;
      } else {
        image.src = media.currentSrc || media.src;
        image.alt = media.alt;
      }
      viewer.querySelector('#modal-title').textContent = piece.dataset.title;
      viewer.querySelector('#modal-description').textContent = piece.dataset.description;
      link.hidden = !piece.dataset.destination;
      link.replaceChildren();
      if (!link.hidden) {
        link.href = piece.dataset.destination;
        link.target = piece.dataset.caseStudy ? '_self' : '_blank';
        link.rel = 'noreferrer';
        if (piece.dataset.caseStudy) {
          const icon = document.createElement('img');
          icon.className = 'modal-app-icon';
          icon.src = piece.dataset.caseStudy.includes('catch') ? '/media/catch-icon.webp' : '/media/soja-note-icon.webp';
          icon.alt = '';
          icon.width = icon.height = 24;
          link.append(icon);
        }
        const label = document.createElement('span');
        label.textContent = piece.dataset.action;
        const arrow = document.createElement('span');
        arrow.className = 'modal-action-arrow';
        arrow.setAttribute('aria-hidden','true');
        arrow.textContent = '↗';
        link.append(label,arrow);
      }
      window.dispatchEvent(new CustomEvent('portfolio-media-state',{detail:{open:true}}));
      viewer.showModal();
      if (motion) video.play().catch(() => {});
      sound('open');
    });
  });
  viewer.querySelector('.modal-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => { if (event.target === viewer) {
    const box = viewer.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
  } });
  viewer.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    image.removeAttribute('src');
    image.alt = '';
    window.dispatchEvent(new CustomEvent('portfolio-media-state',{detail:{open:false}}));
    sound('close');
    opener?.focus({preventScroll:true});
  });
})();
