/* Keep the native dialog open until its exit finishes, including Escape/backdrop dismissal. */
(() => {
  window.PortfolioDialogMotion = (dialog, onClosing) => {
    let closing = false;
    let closeTimer;
    const close = () => {
      if (!dialog.open || closing) return;
      closing = true;
      onClosing?.();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        dialog.close();
        return;
      }
      dialog.classList.add('is-closing');
      closeTimer = setTimeout(() => dialog.close(), 320);
    };
    dialog.classList.add('animated-media-dialog');
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => {
      clearTimeout(closeTimer);
      closing = false;
      dialog.classList.remove('is-closing');
    });
    return { open() { if (!dialog.open && !closing) dialog.showModal(); }, close };
  };
})();
