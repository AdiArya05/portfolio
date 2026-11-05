(() => {
  const viewer = document.querySelector('#media-viewer');
  const image = viewer.querySelector('.viewer-stage img');
  const video = viewer.querySelector('.viewer-stage video');
  let opener;
  const dialogMotion = window.PortfolioDialogMotion(viewer, () => { video.pause(); sound('close'); });
  function sound(direction) {
    window.PortfolioSounds?.play('image', direction);
  }

  document.querySelectorAll('.preview-open, .preview-label').forEach(button => {
    button.addEventListener('click', () => {
      if (viewer.open) return;
      const piece = button.closest('.exploration');
      const media = piece.querySelector('.card-media');
      const motion = media.tagName === 'VIDEO';
      opener = button;
      viewer.querySelector('.viewer-stage').style.setProperty('--viewer-ratio', `${media.width / media.height}`);
      image.hidden = motion;
      video.hidden = !motion;
      if (motion) {
        window.PortfolioMotionVideo.prepare(video, media);
      } else {
        image.width = Number(media.getAttribute('width')) || media.naturalWidth;
        image.height = Number(media.getAttribute('height')) || media.naturalHeight;
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
    image.removeAttribute('src');
    image.alt = '';
    window.dispatchEvent(new CustomEvent('portfolio-media-state',{detail:{open:false}}));
    opener?.focus({preventScroll:true});
  });
})();
