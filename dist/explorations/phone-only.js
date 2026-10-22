(() => {
  // Coarse-pointer phones keep this page in landscape as well as portrait.
  const desktop = matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)');
  const returnToWork = () => { if (desktop.matches) location.replace('/'); };
  desktop.addEventListener('change', returnToWork);
  returnToWork();
})();
