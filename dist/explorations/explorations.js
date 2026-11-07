(() => {
  const viewer = document.querySelector('#media-viewer');
  const image = viewer.querySelector('.viewer-stage img');
  const video = viewer.querySelector('.viewer-stage video');
  const phone = matchMedia('(max-width:700px)');
  const previews = [...document.querySelectorAll('.preview-open, .preview-label')];
  function updatePhonePreviews() {
    for (const button of previews) {
      button.disabled = phone.matches;
      if (phone.matches) button.removeAttribute('aria-haspopup');
      else button.setAttribute('aria-haspopup', 'dialog');
    }
    if (phone.matches && viewer.open) dialogMotion.close();
  }
  let opener;
  const dialogMotion = window.PortfolioDialogMotion(viewer, () => { video.pause(); sound('close'); });
  function sound(direction) {
    window.PortfolioSounds?.play('image', direction);
  }

  phone.addEventListener('change', updatePhonePreviews);
  updatePhonePreviews();
  previews.forEach(button => {
    button.addEventListener('click', () => {
      if (phone.matches || viewer.open) return;
      const piece = button.closest('.exploration');
      const media = piece.querySelector('.card-media');
      const motion = media.tagName === 'VIDEO';
      viewer.classList.toggle('is-fullscreen-video', piece.hasAttribute('data-landscape-video'));
      opener = button;
      const width = (motion ? media.videoWidth : media.naturalWidth) || Number(media.getAttribute('width'));
      const height = (motion ? media.videoHeight : media.naturalHeight) || Number(media.getAttribute('height'));
      viewer.querySelector('.viewer-stage').style.setProperty('--viewer-ratio', width && height ? String(width / height) : '4/3');
      image.hidden = motion;
      video.hidden = !motion;
      if (motion) {
        window.PortfolioMotionVideo.prepare(video, media);
      } else {
        image.width = width;
        image.height = height;
        image.src = media.currentSrc || media.src;
        image.alt = media.alt;
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
    if (viewer.classList.contains('is-fullscreen-video')) {
      const source = opener?.closest('.exploration')?.querySelector('video');
      if (source?.readyState && video.readyState) source.currentTime = video.currentTime;
      video.removeAttribute('src');
      video.load();
      viewer.classList.remove('is-fullscreen-video');
    }
    image.removeAttribute('src');
    image.alt = '';
    window.dispatchEvent(new CustomEvent('portfolio-media-state',{detail:{open:false}}));
    opener?.focus({preventScroll:true});
  });
})();
