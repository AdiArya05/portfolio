/* Share the thumbnail spring and the full-viewport video fade. */
(() => {
  window.PortfolioDialogMotion = (dialog, onClosing) => {
    let closing = false;
    let fade;
    const panel = dialog.classList.contains('lightbox') ? dialog.querySelector('img') : dialog;
    const motion = window.PortfolioMediaMotion.create(panel);
    const fadeViewer = (from, to) => {
      fade?.cancel();
      fade = !dialog.animate || matchMedia('(prefers-reduced-motion: reduce)').matches
        ? null
        : dialog.animate([{opacity:from},{opacity:to}], {duration:200,easing:'ease-out',fill:'both'});
      return fade;
    };
    const close = () => {
      if (!dialog.open || closing) return;
      closing = true;
      onClosing?.();
      dialog.classList.add('is-closing');
      if (dialog.classList.contains('is-fullscreen-video')) {
        const exit = fadeViewer(getComputedStyle(dialog).opacity, 0);
        if (exit) exit.finished.then(() => dialog.close(), () => {});
        else dialog.close();
        return;
      }
      motion.close(() => dialog.close());
    };
    dialog.classList.add('animated-media-dialog');
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => {
      fade?.cancel();
      fade = null;
      motion.reset();
      closing = false;
      dialog.classList.remove('is-closing');
    });
    return {open(origin) {
      if (dialog.open || closing) return;
      dialog.showModal();
      if (dialog.classList.contains('is-fullscreen-video')) fadeViewer(0, 1);
      else motion.open(origin);
    },close};
  };
})();
