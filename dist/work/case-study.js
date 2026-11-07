(() => {
  const root = document.documentElement;
  document.querySelectorAll('.next-project').forEach(link => {
    link.addEventListener('pointerenter', () => window.PortfolioSounds?.play('hover'));
    link.addEventListener('focus', () => window.PortfolioSounds?.play('hover'));
  });
  const lightbox = document.querySelector('.lightbox');
  const enlarged = lightbox.querySelector('img');
  let opener;
  const dialogMotion = window.PortfolioDialogMotion(lightbox, () => window.PortfolioSounds?.play('image', 'close'));
  document.querySelectorAll('.image-button').forEach(button => {
    button.addEventListener('click', () => {
      if (matchMedia('(max-width:700px)').matches || lightbox.open) return;
      const image = button.querySelector('img');
      const width = Number(image.getAttribute('width')) || image.naturalWidth;
      enlarged.width = width;
      enlarged.style.width = `${width}px`;
      enlarged.height = Number(image.getAttribute('height')) || image.naturalHeight;
      const preview = image.currentSrc || image.src;
      enlarged.src = preview;
      if (preview !== image.src) {
        const fullSize = new Image();
        fullSize.src = image.src;
        fullSize.decode().then(() => {
          if (lightbox.open && opener === button && enlarged.src === preview) enlarged.src = fullSize.src;
        }).catch(() => {});
      }
      enlarged.alt = image.alt;
      opener = button;
      window.PortfolioSounds?.play('image', 'open');
      dialogMotion.open(image);
      root.classList.add('image-open');
    });
  });
  lightbox.querySelector('button').addEventListener('click', () => dialogMotion.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) dialogMotion.close(); });
  lightbox.addEventListener('close', () => {
    root.classList.remove('image-open');
    enlarged.removeAttribute('src');
    enlarged.alt = '';
    opener?.focus({ preventScroll: true });
  });
})();
