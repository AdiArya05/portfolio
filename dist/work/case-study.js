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
      if (lightbox.open) return;
      const image = button.querySelector('img');
      enlarged.width = Number(image.getAttribute('width')) || image.naturalWidth;
      enlarged.height = Number(image.getAttribute('height')) || image.naturalHeight;
      enlarged.src = image.currentSrc || image.src;
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
