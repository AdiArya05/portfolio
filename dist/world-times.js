(() => {
  const widget = document.querySelector('#time-zones');
  const button = document.querySelector('#time-zone-toggle');
  const dropdown = document.querySelector('#time-zone-dropdown');
  if (!widget) return;
  const phone = matchMedia('(max-width: 700px)');
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const aliases = { 'Asia/Calcutta': 'Kolkata', 'UTC': 'UTC', 'Etc/UTC': 'UTC' };
  const localName = aliases[localZone] || localZone.split('/').pop().replaceAll('_', ' ');
  const places = [
    ['Singapore', 'Asia/Singapore', [1.35, 103.82]],
    ['NYC', 'America/New_York', [40.71, -74.01]],
    ['Vancouver', 'America/Vancouver', [49.28, -123.12]],
    ['India', 'Asia/Kolkata', [22.57, 88.36]]
  ];
  const timeFormat = zone => new Intl.DateTimeFormat('en-GB', {timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'});
  const offsetFormat = zone => new Intl.DateTimeFormat('en', {timeZone: zone, timeZoneName: 'shortOffset'});
  const getOffset = (format, now) => format.formatToParts(now).find(part => part.type === 'timeZoneName').value.replace('GMT', 'UTC');
  const face = document.querySelector('#local-matrix');
  const visited = document.querySelector('#visited-time-zones');
  widget.classList.add('clock-island');
  face.classList.remove('matrix-row');
  face.innerHTML = '<time><span></span><span class="island-seconds"><span class="island-digit"><span></span><span></span></span><span class="island-digit"><span></span><span></span></span></span></time>';
  const localTime = face.querySelector('time');
  const [localMinutes, localSeconds] = localTime.children;
  const digits = Array.from(localSeconds.children, digit => Array.from(digit.children));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const matchingZones = {
    'Asia/Calcutta': 'Asia/Kolkata',
    'US/Eastern': 'America/New_York',
    'Canada/Pacific': 'America/Vancouver',
    'Singapore': 'Asia/Singapore'
  };
  const visitorZone = matchingZones[localZone] || localZone;
  const otherPlaces = places.filter(([, zone]) => zone !== visitorZone);
  const panel = dropdown.querySelector('.time-zone-panel');
  const canvas = document.createElement('canvas');
  canvas.className = 'island-globe';
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'World globe. Drag, scroll, or use the left and right arrow keys to rotate.');
  panel.prepend(canvas);
  let globe;
  let globeLoading;
  const localPlace = places.find(([, zone]) => zone === visitorZone);
  const pins = [];
  const rows = [[localName, localZone, localPlace?.[2]], ...otherPlaces].map(([name, zone, coordinates], index) => {
    const row = document.createElement(coordinates ? 'button' : 'div');
    row.className = 'island-zone';
    if (coordinates) {
      row.type = 'button';
      row.setAttribute('aria-pressed', 'false');
      pins.push({ index, coordinates });
      row.addEventListener('click', async () => {
        const activeGlobe = await globeLoading;
        if (!activeGlobe || dropdown.inert) return;
        visited.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
        row.setAttribute('aria-pressed', 'true');
        activeGlobe.select(index);
      });
    }
    const label = document.createElement('span');
    label.textContent = name;
    const time = document.createElement('time');
    row.append(label, time);
    visited.append(row);
    return { time, formatter: timeFormat(zone) };
  });
  widget.style.setProperty('--island-rows', rows.length);
  const localFormatter = timeFormat(localZone);
  const localOffset = offsetFormat(localZone);

  const spotify = document.createElement('div');
  spotify.className = 'island-spotify';
  spotify.inert = true;
  const spotifyToggle = document.createElement('button');
  spotifyToggle.type = 'button';
  spotifyToggle.className = 'island-spotify-toggle';
  spotifyToggle.setAttribute('aria-label', 'Spotify Now Playing');
  spotifyToggle.setAttribute('aria-controls', 'island-spotify-details');
  spotifyToggle.setAttribute('aria-expanded', 'false');
  spotifyToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.45-1.16a.75.75 0 0 1-.33-1.46c4.53-1.04 8.4-.6 11.53 1.34.35.2.46.67.25 1.03Zm1.47-3.26a.94.94 0 0 1-1.29.31c-3.2-1.97-8.1-2.54-11.9-1.38a.94.94 0 0 1-.55-1.8c4.33-1.31 9.72-.68 13.43 1.59.44.27.58.85.31 1.28Zm.13-3.4C15.26 8.36 8.94 8.16 5.29 9.27a1.13 1.13 0 0 1-.66-2.16C8.83 5.84 15.79 6.08 20.25 8.73a1.12 1.12 0 1 1-1.15 1.92Z"/></svg>';
  const spotifyLink = document.createElement('a');
  spotifyLink.id = 'island-spotify-details';
  spotifyLink.className = 'island-track';
  spotifyLink.target = '_blank';
  spotifyLink.rel = 'noopener noreferrer';
  spotifyLink.inert = true;
  const trackName = document.createElement('span');
  const trackArtist = document.createElement('span');
  spotifyLink.append(trackName, trackArtist);
  spotify.append(spotifyToggle, spotifyLink);
  widget.insertBefore(spotify, button);

  function setSpotifyOpen(open) {
    spotify.classList.toggle('is-expanded', open);
    spotifyToggle.setAttribute('aria-expanded', String(open));
    spotifyLink.inert = !open;
  }

  function toggleSpotify(open) {
    if (open) {
      setOpen(false);
      checkPlayback();
    }
    setSpotifyOpen(open);
  }

  let checkingPlayback = false;
  let lastPlaybackCheck = 0;

  function updateClockLabel(now) {
    const clockLabel = `${localName}, ${localMinutes.textContent.slice(0, -1)}, ${getOffset(localOffset, now)}. World times`;
    button.setAttribute('aria-label', clockLabel);
  }

  async function checkPlayback() {
    if (phone.matches || document.hidden || checkingPlayback) return;
    checkingPlayback = true;
    let track;
    try {
      const response = await fetch('/api/now-playing', { signal: AbortSignal.timeout(7000) });
      if (!response.ok) throw new Error('Playback unavailable');
      track = (await response.json()).track;
      lastPlaybackCheck = Date.now();
    } catch {
      if (Date.now() - lastPlaybackCheck < 15000) return;
    } finally {
      checkingPlayback = false;
    }
    if (track) {
      if (trackName.textContent !== track.name || trackArtist.textContent !== track.artist) {
        trackName.textContent = track.name;
        trackArtist.textContent = track.artist;
        if (spotify.classList.contains('is-expanded') && !reduceMotion.matches) {
          spotifyLink.animate([{ opacity: .45, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        }
        spotifyLink.setAttribute('aria-label', `Open ${track.name} by ${track.artist} on Spotify`);
      }
      spotifyLink.href = track.url;
    } else {
      setSpotifyOpen(false);
      spotifyLink.removeAttribute('href');
    }
    spotify.inert = !track;
    spotify.classList.toggle('has-track', Boolean(track));
  }

  setInterval(checkPlayback, 5000);
  document.addEventListener('visibilitychange', checkPlayback);
  phone.addEventListener('change', checkPlayback);
  checkPlayback();


  function update() {
    const now = new Date();
    const value = localFormatter.format(now);
    const minutes = value.slice(0, -3);
    if (localMinutes.textContent !== minutes + ':') {
      localMinutes.textContent = minutes + ':';
      updateClockLabel(now);
    }
    const seconds = value.slice(-2);
    digits.forEach(([current, previous], index) => {
      const next = seconds[index];
      if (current.textContent === next) return;

      const outgoing = current.textContent;
      current.textContent = next;
      if (!outgoing || reduceMotion.matches || document.hidden) return;

      previous.textContent = outgoing;
      const timing = { duration: 330, easing: 'cubic-bezier(.22, .75, .24, 1)' };
      previous.animate([
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
        { opacity: 0, transform: 'translateY(-.7em)', filter: 'blur(2px)' }
      ], timing);
      current.animate([
        { opacity: 0, transform: 'translateY(.7em)', filter: 'blur(2px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
      ], timing);
    });
    for (const { time, formatter } of rows) {
      const value = formatter.format(now);
      if (time.textContent !== value) time.textContent = value;
    }
  }

  function setOpen(open) {
    open = open && !phone.matches;
    if (open) setSpotifyOpen(false);
    widget.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    dropdown.inert = !open;
    globe?.setActive(open);
    if (open && !globeLoading) {
      globeLoading = import('/world-globe.mjs?v=3').then(({ createGlobe }) => {
        globe = createGlobe(canvas, pins, reduceMotion);
        globe.setActive(!dropdown.inert);
        return globe;
      }).catch(() => { globeLoading = undefined; });
    }
  }

  function bindIslandPress(control, surface, isOpen, setExpanded) {
    let hold;
    let origin;
    let expandedByHold = false;

    function cancelHold() {
      clearTimeout(hold);
      origin = undefined;
      surface.classList.remove('is-pressing');
    }

    control.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      expandedByHold = false;
      if (isOpen()) return;
      origin = { x: event.clientX, y: event.clientY };
      surface.classList.add('is-pressing');
      hold = setTimeout(() => {
        expandedByHold = true;
        cancelHold();
        setExpanded(true);
      }, 360);
    });
    control.addEventListener('pointermove', event => {
      if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) cancelHold();
    });
    for (const event of ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture']) {
      control.addEventListener(event, cancelHold);
    }
    control.addEventListener('contextmenu', event => event.preventDefault());
    control.addEventListener('click', event => {
      if (expandedByHold && event.detail > 0) {
        expandedByHold = false;
        return;
      }
      setExpanded(!isOpen());
    });
    return cancelHold;
  }

  const cancelClockHold = bindIslandPress(button, widget, () => widget.classList.contains('is-open'), setOpen);
  const cancelSpotifyHold = bindIslandPress(spotifyToggle, spotify, () => spotify.classList.contains('is-expanded'), toggleSpotify);

  function cancelHold() {
    cancelClockHold();
    cancelSpotifyHold();
  }

  document.addEventListener('pointerdown', event => {
    if (!spotify.contains(event.target)) setSpotifyOpen(false);
    if (!widget.contains(event.target)) {
      cancelHold();
      setOpen(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      cancelHold();
      if (spotifyLink.contains(document.activeElement)) spotifyToggle.focus();
      setSpotifyOpen(false);
      if (dropdown.contains(document.activeElement)) button.focus();
      setOpen(false);
    }
  });
  let timer;
  function tick() {
    update();
    timer = setTimeout(tick, 1000 - Date.now() % 1000);
  }
  function syncViewport() {
    clearTimeout(timer);
    if (phone.matches) {
      setSpotifyOpen(false);
      cancelHold();
      setOpen(false);
    } else {
      tick();
    }
  }
  phone.addEventListener('change', syncViewport);
  syncViewport();
})();
