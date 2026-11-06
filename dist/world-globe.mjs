const radians = Math.PI / 180;
const tilt = 16 * radians;
const tiltSin = Math.sin(tilt);
const tiltCos = Math.cos(tilt);

function point(latitude, longitude) {
  const lat = latitude * radians;
  return { y: Math.sin(lat), radius: Math.cos(lat), lon: longitude * radians };
}

export function createGlobe(canvas, pins, reducedMotion) {
  const context = canvas.getContext('2d');
  const size = 180;
  const center = size / 2;
  const radius = 82;
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = canvas.height = size * scale;
  context.scale(scale, scale);
  const markers = pins.map(pin => ({ ...pin, ...point(...pin.coordinates) }));
  let land = [];
  let angle = markers[0]?.lon ?? 0;
  let target;
  let selected;
  let frame = 0;
  let last = 0;
  let active = false;
  let drag;
  let lastPulse = -Infinity;

  function project({ y, radius: parallel, lon }) {
    const relative = lon - angle;
    const depth = parallel * Math.cos(relative);
    return {
      x: center + radius * parallel * Math.sin(relative),
      y: center - radius * (y * tiltCos - depth * tiltSin),
      front: depth * tiltCos + y * tiltSin
    };
  }

  const ocean = context.createRadialGradient(64, 49, 6, center, center, radius);
  ocean.addColorStop(0, '#282828');
  ocean.addColorStop(.65, '#1b1b1b');
  ocean.addColorStop(1, '#121212');

  function draw() {
    context.clearRect(0, 0, size, size);
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.fillStyle = ocean;
    context.fill();
    context.strokeStyle = '#ffffff20';
    context.stroke();

    context.fillStyle = '#f5f5f5';
    for (const dot of land) {
      const { x, y, front } = project(dot);
      if (front <= 0) continue;
      context.globalAlpha = .9 * Math.sqrt(front);
      context.beginPath();
      context.arc(x, y, .48 + .4 * front, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;

    for (const marker of markers) {
      const { x, y, front } = project(marker);
      if (front <= 0) continue;
      context.globalAlpha = Math.min(1, front * 5);
      const pinSize = marker.index === selected ? 1.2 : 1;
      context.save();
      context.translate(x, y);
      context.scale(pinSize, pinSize);
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(-2, -3, -5.5, -6, -5.5, -10);
      context.arc(0, -10, 5.5, Math.PI, 0);
      context.bezierCurveTo(5.5, -6, 2, -3, 0, 0);
      context.closePath();
      context.fillStyle = '#ff9f0a';
      context.shadowColor = '#000b';
      context.shadowBlur = 4;
      context.fill();
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(0, -10, 2, 0, Math.PI * 2);
      context.fillStyle = '#382109';
      context.fill();
      context.restore();
    }
    context.globalAlpha = 1;
    context.lineWidth = 1;
  }

  function tick(now) {
    frame = 0;
    const elapsed = last ? Math.min(now - last, 32) : 0;
    last = now;
    if (target !== undefined) {
      angle += (target - angle) * (1 - Math.exp(-elapsed / 105));
      if (Math.abs(target - angle) < .002) {
        angle = target;
        target = undefined;
      }
    } else if (drag === undefined) {
      angle += elapsed * .00027;
    }
    draw();
    schedule();
  }

  function schedule() {
    if (active && !document.hidden && !reducedMotion.matches && !frame) frame = requestAnimationFrame(tick);
  }

  function rotate(delta) {
    target = undefined;
    angle += delta;
    draw();
  }

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = event.clientX;
    target = undefined;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!event.isPrimary || drag === undefined) return;
    rotate((drag - event.clientX) * .012);
    drag = event.clientX;
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(event, () => { drag = undefined; });
  }
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    const delta = event.deltaX || event.deltaY;
    rotate(Math.max(-60, Math.min(60, delta)) * .009);
    const now = performance.now();
    if (drag !== undefined && delta && now - lastPulse >= 90 && navigator.vibrate) {
      navigator.vibrate(8);
      lastPulse = now;
    }
  }, { passive: false });
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    rotate(event.key === 'ArrowLeft' ? -.22 : .22);
  });

  // The dots sample Natural Earth's 1:110m public-domain land polygons.
  fetch('/media/world-land-dots.json?v=2').then(response => response.json()).then(data => {
    for (let i = 0; i < data.length; i += 2) land.push(point(data[i], data[i + 1]));
    if (active) draw();
  }).catch(() => { /* The pins remain usable if the map asset fails to load. */ });

  document.addEventListener('visibilitychange', () => { last = 0; schedule(); });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      if (target !== undefined) angle = target;
      target = undefined;
      draw();
    } else {
      last = 0;
      schedule();
    }
  });

  return {
    setActive(open) {
      active = open;
      last = 0;
      if (open) {
        draw();
        schedule();
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        drag = undefined;
      }
    },
    select(index) {
      const marker = markers.find(pin => pin.index === index);
      if (!marker) return;
      selected = index;
      const difference = marker.lon - angle;
      target = angle + Math.atan2(Math.sin(difference), Math.cos(difference));
      if (reducedMotion.matches) {
        angle = target;
        target = undefined;
        draw();
      }
    }
  };
}
