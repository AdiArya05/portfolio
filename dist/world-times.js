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
  const spotifyToggle = document.createElement('button');
  spotifyToggle.type = 'button';
  spotifyToggle.className = 'island-spotify-toggle';
  spotifyToggle.setAttribute('aria-label', 'Spotify Now Playing');
  spotifyToggle.setAttribute('aria-controls', 'island-spotify-details');
  spotifyToggle.setAttribute('aria-expanded', 'false');
  spotifyToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.45-1.16a.75.75 0 0 1-.33-1.46c4.53-1.04 8.4-.6 11.53 1.34.35.2.46.67.25 1.03Zm1.47-3.26a.94.94 0 0 1-1.29.31c-3.2-1.97-8.1-2.54-11.9-1.38a.94.94 0 0 1-.55-1.8c4.33-1.31 9.72-.68 13.43 1.59.44.27.58.85.31 1.28Zm.13-3.4C15.26 8.36 8.94 8.16 5.29 9.27a1.13 1.13 0 0 1-.66-2.16C8.83 5.84 15.79 6.08 20.25 8.73a1.12 1.12 0 1 1-1.15 1.92Z"/></svg>';
  const spotifyDetails = document.createElement('div');
  spotifyDetails.id = 'island-spotify-details';
  spotifyDetails.className = 'island-spotify-details';
  spotifyDetails.inert = true;
  const wave = document.createElement('span');
  wave.className = 'island-wave';
  wave.setAttribute('aria-hidden', 'true');
  wave.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
  spotifyToggle.append(wave);
  const artwork = document.createElement('img');
  artwork.alt = '';
  artwork.className = 'island-artwork';
  artwork.hidden = true;
  artwork.addEventListener('error', () => { artwork.hidden = true; });
  const trackInfo = document.createElement('div');
  trackInfo.className = 'island-track';
  const trackName = document.createElement('span');
  const trackArtist = document.createElement('span');
  trackName.textContent = 'Checking Spotify…';
  trackInfo.append(trackName, trackArtist);
  const timeline = document.createElement('div');
  timeline.className = 'island-timeline';
  timeline.hidden = true;
  timeline.innerHTML = '<span></span><progress max="1" value="0" aria-label="Track progress"></progress><span></span>';
  const [elapsed, progress, remaining] = timeline.children;
  spotifyDetails.append(artwork, trackInfo, timeline);
  spotify.append(spotifyToggle, spotifyDetails);
  widget.insertBefore(spotify, button);

  function setSpotifyOpen(open) {
    widget.classList.toggle('is-spotify-open', open);
    button.inert = open;
    spotifyToggle.setAttribute('aria-expanded', String(open));
    spotifyDetails.inert = !open;
    if (open) updateTimeline(Date.now());
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
  let playingTrack;

  function formatTrackTime(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function updateTimeline(now) {
    const track = playingTrack;
    if (!track?.durationMs || !Number.isFinite(track.progressMs)) {
      timeline.hidden = true;
      return;
    }
    const position = Math.min(track.durationMs, Math.max(0, track.progressMs + now - track.observedAt));
    progress.value = position / track.durationMs;
    elapsed.textContent = formatTrackTime(position);
    remaining.textContent = '−' + formatTrackTime(track.durationMs - position);
    timeline.hidden = false;
  }

  function updateClockLabel(now) {
    const clockLabel = `${localName}, ${localMinutes.textContent.slice(0, -1)}, ${getOffset(localOffset, now)}. World times`;
    button.setAttribute('aria-label', clockLabel);
  }

  async function checkPlayback() {
    if (phone.matches || document.hidden || checkingPlayback) return;
    checkingPlayback = true;
    let track;
    let unavailable = false;
    try {
      const response = await fetch('/api/now-playing', { signal: AbortSignal.timeout(7000) });
      if (!response.ok) throw new Error('Playback unavailable');
      track = (await response.json()).track;
      lastPlaybackCheck = Date.now();
    } catch {
      if (Date.now() - lastPlaybackCheck < 15000) return;
      unavailable = true;
    } finally {
      checkingPlayback = false;
    }
    playingTrack = track;
    spotify.classList.toggle('is-playing', Boolean(track));
    if (!track?.artwork) {
      artwork.hidden = true;
      artwork.removeAttribute('src');
    } else if (artwork.getAttribute('src') !== track.artwork) {
      artwork.hidden = false;
      artwork.src = track.artwork;
    }
    if (widget.classList.contains('is-spotify-open')) updateTimeline(Date.now());
    if (track) {
      if (trackName.textContent !== track.name || trackArtist.textContent !== track.artist) {
        trackName.textContent = track.name;
        trackArtist.textContent = track.artist;
        if (widget.classList.contains('is-spotify-open') && !reduceMotion.matches) {
          trackInfo.animate([{ opacity: .45, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        }
      }
    } else {
      trackName.textContent = unavailable ? 'Spotify is temporarily unavailable' : 'Nothing playing on Spotify';
      trackArtist.textContent = '';
    }
  }

  setInterval(checkPlayback, 5000);
  document.addEventListener('visibilitychange', checkPlayback);
  phone.addEventListener('change', checkPlayback);
  checkPlayback();


  function update() {
    const now = new Date();
    if (widget.classList.contains('is-spotify-open')) updateTimeline(now.getTime());
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
        { opacity: 0, transform: 'translateY(-.35em)' }
      ], timing);
      current.animate([
        { opacity: .35, transform: 'translateY(.35em)' },
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
    spotify.inert = open;
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
  const cancelSpotifyHold = bindIslandPress(spotifyToggle, spotify, () => widget.classList.contains('is-spotify-open'), toggleSpotify);

  function cancelHold() {
    cancelClockHold();
    cancelSpotifyHold();
  }

  function swipeIsland(direction) {
    cancelHold();
    if (widget.classList.contains('is-open') || widget.classList.contains('is-spotify-open')) {
      setOpen(false);
      setSpotifyOpen(false);
    } else if (direction < 0) {
      setOpen(true);
    } else {
      toggleSpotify(true);
    }
  }

  function isIslandGestureTarget(event) {
    if (phone.matches || event.target.closest('.island-globe, .island-zone')) return false;
    if (widget.contains(event.target)) return true;
    const activePill = widget.classList.contains('is-spotify-open') ? spotify : button;
    const primary = activePill.getBoundingClientRect();
    const secondary = spotify.getBoundingClientRect();
    const left = widget.classList.contains('is-open') ? primary.left : Math.min(primary.left, secondary.left);
    return event.clientX >= left - 8 && event.clientX <= primary.right + 8 &&
      event.clientY >= primary.top - 8 && event.clientY <= primary.bottom + 8;
  }

  let swipeStart;
  let suppressClick = false;
  document.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (!event.isPrimary || event.button !== 0 || !isIslandGestureTarget(event)) return;
    swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  window.addEventListener('pointerup', event => {
    if (swipeStart?.id !== event.pointerId) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = undefined;
    if (Math.abs(dx) < 24 || Math.abs(dx) <= Math.abs(dy)) return;
    suppressClick = true;
    swipeIsland(dx);
  });
  window.addEventListener('pointercancel', event => {
    if (swipeStart?.id === event.pointerId) swipeStart = undefined;
  });
  widget.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) return;
    suppressClick = false;
    event.stopPropagation();
  }, true);

  let wheelDistance = 0;
  let lastWheel = 0;
  let wheelHandled = false;
  document.addEventListener('wheel', event => {
    if (!isIslandGestureTarget(event)) return;
    const horizontal = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
    if (!horizontal || (!event.shiftKey && Math.abs(horizontal) <= Math.abs(event.deltaY))) return;
    if (event.cancelable) event.preventDefault();
    const now = performance.now();
    if (now - lastWheel > 160 || Math.sign(horizontal) !== Math.sign(wheelDistance)) {
      wheelDistance = 0;
      wheelHandled = false;
    }
    lastWheel = now;
    if (wheelHandled) return;
    wheelDistance += horizontal * (event.deltaMode === 1 ? 16 : 1);
    if (Math.abs(wheelDistance) < 18) return;
    wheelHandled = true;
    swipeIsland(-wheelDistance);
  }, { capture: true, passive: false });

  widget.addEventListener('keydown', event => {
    if (event.target !== button && event.target !== spotifyToggle) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    swipeIsland(event.key === 'ArrowLeft' ? -1 : 1);
    const control = widget.classList.contains('is-spotify-open') ? spotifyToggle : button;
    control.focus({ preventScroll: true });
  });

  document.addEventListener('pointerdown', event => {
    if (!isIslandGestureTarget(event) && !widget.contains(event.target)) {
      setSpotifyOpen(false);
      cancelHold();
      setOpen(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      cancelHold();
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
