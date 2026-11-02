(() => {
  const word = document.querySelector('.design-selection-word');
  const label = document.querySelector('.design-selection-size');
  if (!word || !label) return;
  const measure = () => {
    const {width,height} = word.getBoundingClientRect();
    label.textContent = `${Math.round(width)} × ${Math.round(height)}`;
  };
  measure();
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(word);
})();
