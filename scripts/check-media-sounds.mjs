import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dist = new URL('../dist/', import.meta.url);
const window = {};
vm.runInNewContext(fs.readFileSync(new URL('media-sounds.js', dist), 'utf8'), { window });

// Verify the audio automation against Recent's published presets and engine,
// including the zero-sustain decay, which is not a conventional ADSR release.
for (const [direction, start, end, peak, decay, duration] of [
  ['open', 420, 760, 0.392, 0.09, 0.122],
  ['close', 720, 360, 0.408, 0.08, 0.107],
]) {
  const events = [];
  const record = name => (...args) => events.push([name, ...args]);
  const gain = {
    gain: {
      setValueAtTime: record('gain.initial'),
      linearRampToValueAtTime: record('gain.attack'),
      setTargetAtTime: record('gain.decay'),
    },
    connect: record('gain.connect'),
    disconnect: record('gain.disconnect'),
  };
  const tone = {
    frequency: {
      setValueAtTime: record('frequency.initial'),
      exponentialRampToValueAtTime: record('frequency.sweep'),
    },
    connect(node) { assert.equal(node, gain); return gain; },
    start: record('start'),
    stop: record('stop'),
    disconnect: record('tone.disconnect'),
  };
  const destination = {};
  const context = { currentTime: 10, destination, createGain: () => gain, createOscillator: () => tone };
  window.PortfolioMediaSound(context, direction);
  assert.equal(tone.type, 'sine');
  const expected = [
    ['gain.initial', 0.0001, 10.016],
    ['gain.attack', peak * 0.7, 10.018],
    ['gain.decay', 0.0001, 10.018, decay / 3],
    ['frequency.initial', start, 10.016],
    ['frequency.sweep', end, 10.016 + duration],
    ['gain.connect', destination],
    ['start', 10.016],
    ['stop', 10.016 + duration + 0.1],
  ];
  assert.equal(events.length, expected.length);
  events.forEach((event, i) => event.forEach((value, j) => {
    if (typeof value === 'number') assert(Math.abs(value - expected[i][j]) < 1e-12, `${direction}: ${event[0]}`);
    else assert.equal(value, expected[i][j]);
  }));
  tone.onended();
  assert.deepEqual(events.slice(-2), [['tone.disconnect'], ['gain.disconnect']]);
}

for (const route of ['index.html', 'work/catch/index.html', 'work/soja/index.html']) {
  const html = fs.readFileSync(new URL(route, dist), 'utf8');
  assert(html.includes('/media-sounds.js?v=20261021-v28'), `${route}: load shared synthesis`);
  if (route !== 'index.html') {
    assert(html.indexOf('/media-sounds.js') < html.indexOf('/interface-sounds.js'), 'Load synthesis before the deferred consumer');
    assert(html.includes('/interface-sounds.js?v=20261021-v27'), 'Refresh cached story audio');
  }
}
console.log('Media audio verified: exact pitch, envelope, gain, onset, tail, cleanup and all three entry points.');
