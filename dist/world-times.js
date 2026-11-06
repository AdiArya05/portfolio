(() => {
  const widget = document.querySelector('#time-zones');
  const button = document.querySelector('#time-zone-toggle');
  const dropdown = document.querySelector('#time-zone-dropdown');
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const aliases = { 'Asia/Calcutta': 'Kolkata', 'UTC': 'UTC', 'Etc/UTC': 'UTC' };
  const localName = aliases[localZone] || localZone.split('/').pop().replaceAll('_', ' ');
  const places = [
    ['Singapore', 'Asia/Singapore'],
    ['NYC', 'America/New_York'],
    ['Vancouver', 'America/Vancouver'],
    ['India', 'Asia/Kolkata']
  ];
  const timeFormat = zone => new Intl.DateTimeFormat('en-GB', {timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'});
  const offsetFormat = zone => new Intl.DateTimeFormat('en', {timeZone: zone, timeZoneName: 'shortOffset'});
  const getOffset = (format, now) => format.formatToParts(now).find(part => part.type === 'timeZoneName').value.replace('GMT', 'UTC');
  const face = document.querySelector('#local-matrix');
  const visited = document.querySelector('#visited-time-zones');
  widget.classList.add('clock-island');
  face.classList.remove('matrix-row');
  face.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/></svg><time><span></span><span class="island-seconds"><span class="island-digit"><span></span><span></span></span><span class="island-digit"><span></span><span></span></span></span></time>';
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
  const rows = [[localName, localZone], ...otherPlaces].map(([name, zone]) => {
    const row = document.createElement('div');
    row.className = 'island-zone';
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

  function update() {
    const now = new Date();
    const value = localFormatter.format(now);
    const minutes = value.slice(0, -3);
    if (localMinutes.textContent !== minutes + ':') {
      localMinutes.textContent = minutes + ':';
      button.setAttribute('aria-label', `${localName}, ${minutes}, ${getOffset(localOffset, now)}. World times`);
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
    widget.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    dropdown.inert = !open;
  }

  let hold;
  let origin;
  let expandedByHold = false;
  function cancelHold() {
    clearTimeout(hold);
    origin = undefined;
    widget.classList.remove('is-pressing');
  }

  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    expandedByHold = false;
    if (widget.classList.contains('is-open')) return;
    origin = { x: event.clientX, y: event.clientY };
    widget.classList.add('is-pressing');
    hold = setTimeout(() => {
      expandedByHold = true;
      cancelHold();
      setOpen(true);
    }, 360);
  });
  button.addEventListener('pointermove', event => {
    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) cancelHold();
  });
  for (const event of ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture']) {
    button.addEventListener(event, cancelHold);
  }
  button.addEventListener('contextmenu', event => event.preventDefault());
  button.addEventListener('click', event => {
    if (expandedByHold && event.detail > 0) {
      expandedByHold = false;
      return;
    }
    setOpen(!widget.classList.contains('is-open'));
  });
  document.addEventListener('pointerdown', event => {
    if (!widget.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      cancelHold();
      setOpen(false);
    }
  });
  function tick() {
    update();
    setTimeout(tick, 1000 - Date.now() % 1000);
  }
  tick();
})();
