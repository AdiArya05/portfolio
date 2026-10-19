(() => {
  const root = document.documentElement;
  const appearance = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    appearance.querySelectorAll('[data-select-theme]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.selectTheme === (dark ? 'dark' : 'light')));
    });
    themeMeta.content = dark ? '#181815' : '#fbf8ef';
  };
  appearance.addEventListener('click', event => {
    const nextTheme = event.target.closest('[data-select-theme]')?.dataset.selectTheme;
    if (!['light', 'dark'].includes(nextTheme) || root.dataset.theme === nextTheme) return;
    root.dataset.theme = nextTheme;
    try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch {}
    syncTheme();
    window.PortfolioSounds?.play('theme', nextTheme);
  });
  window.addEventListener('storage', event => {
    if (event.key === 'portfolio-theme' && ['light', 'dark'].includes(event.newValue)) {
      root.dataset.theme = event.newValue;
      syncTheme();
    }
  });
  window.addEventListener('pageshow', () => {
    let saved;
    try { saved = localStorage.getItem('portfolio-theme'); } catch {}
    if (['light', 'dark'].includes(saved)) root.dataset.theme = saved;
    syncTheme();
  });
  syncTheme();
  document.querySelectorAll('.next-project').forEach(link => {
    link.addEventListener('pointerenter', () => window.PortfolioSounds?.play('hover'));
    link.addEventListener('focus', () => window.PortfolioSounds?.play('hover'));
  });
  const lightbox = document.querySelector('.lightbox');
  const enlarged = lightbox.querySelector('img');
  let opener;
  document.querySelectorAll('.image-button').forEach(button => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      enlarged.src = image.currentSrc || image.src;
      enlarged.alt = image.alt;
      opener = button;
      window.PortfolioSounds?.play('image', 'open');
      lightbox.showModal();
      root.classList.add('image-open');
    });
  });
  lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => {
    root.classList.remove('image-open');
    window.PortfolioSounds?.play('image', 'close');
    enlarged.removeAttribute('src');
    enlarged.alt = '';
    opener?.focus({ preventScroll: true });
  });
})();
