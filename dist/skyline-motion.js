(() => {
  function initialize() {
  if (document.documentElement.classList.contains('is-page-scrolling')) {
    window.addEventListener('portfolio-scroll-settled', initialize, { once: true });
    return;
  }
  const footer = document.querySelector('#singapore-footer');
  const art = document.querySelector('#singapore-skyline');
  if (!footer || !art) return;
  const ns = 'http://www.w3.org/2000/svg';
  const scene = document.createElementNS(ns, 'svg');
  scene.classList.add('skyline-motion');
  scene.setAttribute('viewBox', '0 0 1672 941');
  scene.setAttribute('aria-hidden', 'true');
  const source = '/media/singapore-engraving.svg';
  const sourceImage = `<image href="${source}" width="1672" height="941"/>`;
  // Preserve the existing engraving: the rotor is cut from the source image,
  // not redrawn with geometric lines. Mirror the unobstructed upper half to
  // recover the lower wheel behind its stationary legs and foreground trees.
  const visibleWheel = 'M1394 325H1650V540L1622 548 1594 579 1570 612 1535 633 1490 651 1440 674 1394 645Z';
  scene.innerHTML = `<defs>
    <clipPath id="engraved-flyer-visible"><path d="${visibleWheel}"/></clipPath>
    <clipPath id="engraved-wheel-upper"><path d="M1417 526A104 168 0 0 1 1625 526Z"/></clipPath>
    <clipPath id="engraved-flyer-supports"><path d="M1490 514H1548V548H1490ZM1494 535 1508 535 1467 662 1450 660ZM1530 535 1543 535 1582 615 1570 620ZM1493 535H1510V674H1493ZM1529 535H1546V657H1529Z"/></clipPath>
    <mask id="engraved-wheel-center" maskUnits="userSpaceOnUse" x="1390" y="330" width="260" height="390">
      <rect x="1390" y="330" width="260" height="390" fill="white"/><ellipse cx="1518" cy="526" rx="27" ry="28" fill="black"/>
    </mask>
    <mask id="engraved-flyer-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="white"/>
      <path d="${visibleWheel}" transform="scale(${1/1672} ${1/941})" fill="black"/>
    </mask>
    <g id="engraved-upper-source" clip-path="url(#engraved-wheel-upper)" mask="url(#engraved-wheel-center)">${sourceImage}</g>
    <g id="engraved-cabin-source"><svg x="-14" y="-8" width="28" height="16" viewBox="1510 346 28 16">${sourceImage}</svg></g>
  </defs>
  <g clip-path="url(#engraved-flyer-visible)">
    <g transform="translate(1521 526) scale(.6 1)">
      <g class="engraved-flyer-rotor">
        <g transform="scale(${1/.6} 1) translate(-1521 -526)">
          <use href="#engraved-upper-source"/>
          <g transform="translate(0 1052) scale(1 -1)"><use href="#engraved-upper-source"/></g>
        </g>
      </g>
    </g>
    <g clip-path="url(#engraved-flyer-supports)">${sourceImage}</g>
  </g>
  <g class="river-traffic">
    <g class="engraved-boat engraved-boat-one"><g class="engraved-boat-bob"><image href="/media/singapore-engraved-bumboat.png" x="-64" y="-48" width="128" height="72"/></g></g>
    <g class="engraved-boat engraved-boat-two"><g transform="scale(-.75 .75)"><g class="engraved-boat-bob"><image href="/media/singapore-engraved-bumboat.png" x="-64" y="-48" width="128" height="72"/></g></g></g>
  </g>`;
  // The actual illustrated capsule is reused, with a counter-rotation so it
  // stays upright rather than stretching or tipping as the ellipse revolves.
  const rotor = scene.querySelector('.engraved-flyer-rotor');
  for (let index = 0; index < 24; index++) {
    const angle = index / 24 * Math.PI * 2;
    const capsule = document.createElementNS(ns, 'g');
    capsule.setAttribute('transform', `translate(${Math.sin(angle)*172} ${-Math.cos(angle)*172})`);
    capsule.innerHTML = `<g class="engraved-cabin-upright"><g transform="scale(${1/.6} 1)"><use href="#engraved-cabin-source"/></g></g>`;
    rotor.append(capsule);
  }
  // The desktop-only loader prepares this scene offscreen, before scrolling.
  let requested = false;
  let assetsReady = false;
  function attachScene() {
    if (!assetsReady || !requested || scene.isConnected ||
        document.documentElement.classList.contains('is-page-scrolling')) return;
    footer.append(scene);
    footer.classList.add('has-engraved-motion');
    window.removeEventListener('portfolio-scroll-settled', attachScene);
  }
  function mountScene() {
    if (requested) return;
    requested = true;
    const boat = new Image();
    boat.src = '/media/singapore-engraved-bumboat.png';
    Promise.all([art.decode(), boat.decode()]).then(() => {
      assetsReady = true;
      if ('requestIdleCallback' in window) requestIdleCallback(attachScene, { timeout: 1500 });
      else setTimeout(attachScene, 0);
    }).catch(() => { requested = false; }); // Keep the original on failure.
  }
  let visible = false;
  window.addEventListener('portfolio-scroll-settled', attachScene);
  mountScene();
  function updatePlayback() {
    footer.classList.toggle('skyline-motion-running', visible && !document.hidden);
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
    if (visible) mountScene();
    updatePlayback();
  }, { threshold: .05 }).observe(footer);
  document.addEventListener('visibilitychange', updatePlayback);
  }
  if ('requestIdleCallback' in window) requestIdleCallback(initialize, { timeout: 1500 });
  else setTimeout(initialize, 0);
})();
