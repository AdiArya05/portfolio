(() => {
  const root = document.documentElement;
  const viewer = document.querySelector('#media-viewer');
  const image = viewer.querySelector('#modal-image');
  const video = viewer.querySelector('#modal-video');
  const link = viewer.querySelector('#modal-link');
  const appearance = document.querySelector('#theme-toggle');
  let opener;
  const dialogMotion = window.PortfolioDialogMotion(viewer, () => { video.pause(); sound('close'); });
  function sound(direction) {
    window.PortfolioSounds?.play('image', direction);
  }

  function syncAppearance() {
    const dark = root.dataset.theme === 'dark';
    appearance.querySelectorAll('[data-select-theme]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.selectTheme === (dark ? 'dark' : 'light')));
    });
    document.querySelector('meta[name="theme-color"]').content = dark ? '#181815' : '#fbf8ef';
  }
  appearance.addEventListener('click', event => {
    const next = event.target.closest('[data-select-theme]')?.dataset.selectTheme;
    if (!['light','dark'].includes(next) || root.dataset.theme === next) return;
    root.dataset.theme = next;
    try { localStorage.setItem('portfolio-theme', next); } catch {}
    syncAppearance();
    window.PortfolioSounds?.play('theme', next);
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
        video.width = media.width;
        video.height = media.height;
        video.currentTime = media.currentTime || 0;
      } else {
        image.width = Number(media.getAttribute('width')) || media.naturalWidth;
        image.height = Number(media.getAttribute('height')) || media.naturalHeight;
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
      dialogMotion.open(media);
      if (motion) video.play().catch(() => {});
      sound('open');
    });
  });
  viewer.querySelector('.modal-close').addEventListener('click', () => dialogMotion.close());
  viewer.addEventListener('click', event => { if (event.target === viewer) {
    const box = viewer.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialogMotion.close();
  } });
  viewer.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    image.removeAttribute('src');
    image.alt = '';
    window.dispatchEvent(new CustomEvent('portfolio-media-state',{detail:{open:false}}));
    opener?.focus({preventScroll:true});
  });
})();
