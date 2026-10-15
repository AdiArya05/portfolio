(() => {
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
    <clipPath id="engraved-wheel-upper"><path d="M1441 526A80 145 0 0 1 1601 526Z"/></clipPath>
    <clipPath id="engraved-flyer-supports"><path d="M1490 514H1548V548H1490ZM1494 535 1508 535 1467 662 1450 660ZM1530 535 1543 535 1582 615 1570 620ZM1493 535H1510V674H1493ZM1529 535H1546V657H1529Z"/></clipPath>
    <mask id="engraved-wheel-center" maskUnits="userSpaceOnUse" x="1390" y="330" width="260" height="390">
      <rect x="1390" y="330" width="260" height="390" fill="white"/><ellipse cx="1518" cy="526" rx="27" ry="28" fill="black"/>
    </mask>
    <mask id="engraved-flyer-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="white"/>
      <path d="${visibleWheel}" transform="scale(${1/1672} ${1/941})" fill="black"/>
    </mask>
    <g id="engraved-upper-source" clip-path="url(#engraved-wheel-upper)" mask="url(#engraved-wheel-center)">${sourceImage}</g>
    <g id="engraved-cabin-source"><image href="${source}#svgView(viewBox(1513,346,24,13.5))" x="-12" y="-7" width="24" height="13.5"/></g>
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
  // Rebuild the continuous rim from a clean section of its original engraved
  // band. The old rim contained attached cabin silhouettes; no part of that
  // mixed artwork is allowed into this independent rotating band.
  for (let index = 0; index < 64; index++) {
    const segment = document.createElementNS(ns, 'g');
    segment.setAttribute('transform', `rotate(${index/64*360}) translate(0 -164)`);
    segment.innerHTML = `<image href="${source}#svgView(viewBox(1510,362,24,13.5))" x="-9" y="-6.75" width="18" height="13.5"/>`;
    rotor.append(segment);
  }
  for (let index = 0; index < 24; index++) {
    const angle = index / 24 * Math.PI * 2;
    const capsule = document.createElementNS(ns, 'g');
    capsule.setAttribute('transform', `translate(${Math.sin(angle)*172} ${-Math.cos(angle)*172})`);
    capsule.innerHTML = `<g class="engraved-cabin-upright"><g transform="scale(${1/.6} 1)"><use href="#engraved-cabin-source"/></g></g>`;
    rotor.append(capsule);
  }
  // Load only when the footer is reached. Phone visitors keep their existing
  // paragraph-only view without downloading an unused boat image.
  let requested = false;
  function mountScene() {
    if (requested) return;
    requested = true;
    const boat = new Image();
    boat.src = '/media/singapore-engraved-bumboat.png';
    Promise.all([art.decode(), boat.decode()]).then(() => {
      footer.append(scene);
      footer.classList.add('has-engraved-motion');
    }).catch(() => { requested = false; }); // Keep the original on failure.
  }
  let visible = false;
  function updatePlayback() {
    footer.classList.toggle('skyline-motion-running', visible && !document.hidden);
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) mountScene();
    updatePlayback();
  }, { threshold: .05 }).observe(footer);
  document.addEventListener('visibilitychange', updatePlayback);
})();
