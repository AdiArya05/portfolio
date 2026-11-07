/* Share the thumbnail spring across native phone and case-study viewers. */
(() => {
  window.PortfolioDialogMotion = (dialog, onClosing) => {
    let closing = false;
    const panel = dialog.classList.contains('lightbox') ? dialog.querySelector('img') : dialog;
    const motion = window.PortfolioMediaMotion.create(panel);
    const close = () => {
      if (!dialog.open || closing) return;
      closing = true;
      onClosing?.();
      dialog.classList.add('is-closing');
      motion.close(() => dialog.close());
    };
    dialog.classList.add('animated-media-dialog');
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => {
      motion.reset();
      closing = false;
      dialog.classList.remove('is-closing');
    });
    return {open(origin) {
      if (dialog.open || closing) return;
      dialog.showModal();
      motion.open(origin);
    },close};
  };
})();
