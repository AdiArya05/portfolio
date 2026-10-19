/* Homepage sound effects, shared with the reading pages. */
(() => {
let audioContext = null;
let audioResumePromise = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ||= new AudioContextClass();
  return audioContext;
}

function ensureAudioReady(event) {
  const context = getAudioContext();
  if (!context) return Promise.resolve(null);
  const isTrustedActivation = Boolean(event?.isTrusted && ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'].includes(event.type));
  if (!isTrustedActivation) return Promise.resolve(context);
  if (context.state === 'running') {
    document.documentElement.dataset.audioReady = 'true';
    return Promise.resolve(context);
  }
  if (audioResumePromise) return audioResumePromise;

  audioResumePromise = context.resume()
    .catch(() => context)
    .then(() => {
      if (context.state === 'running') document.documentElement.dataset.audioReady = 'true';
      return context;
    })
    .finally(() => {
      audioResumePromise = null;
    });
  return audioResumePromise;
}

function scheduleAudioEffect(effect, freshness = 600) {
  const requestedAt = performance.now();
  const context = getAudioContext();
  if (!context) return;

  const ready = context.state === 'running'
    ? Promise.resolve(context)
    : navigator.userActivation?.hasBeenActive
      ? context.resume().then(() => context).catch(() => context)
      : Promise.resolve(context);

  ready.then((context) => {
    if (!context || context.state !== 'running') return;
    document.documentElement.dataset.audioReady = 'true';
    if (performance.now() - requestedAt > freshness) return;
    effect(context);
    document.documentElement.dataset.audioEffects = String(Number(document.documentElement.dataset.audioEffects || 0) + 1);
  });
}

['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach((eventName) => {
  document.addEventListener(eventName, ensureAudioReady, { capture: true, passive: true });
});

function playInterfaceSound(direction) {
  scheduleAudioEffect((context) => {
    const now = context.currentTime;

    function softTap(at, frequency, level, duration) {
      const frameCount = Math.ceil(context.sampleRate * duration);
      const buffer = context.createBuffer(1, frameCount, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < frameCount; index += 1) {
        const progress = index / frameCount;
        samples[index] = (Math.random() * 2 - 1) * Math.pow(1 - progress, 7.5);
      }

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency, at);
      filter.Q.setValueAtTime(0.8, at);
      gain.gain.setValueAtTime(level, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      source.connect(filter).connect(gain).connect(context.destination);
      source.start(at);
      source.stop(at + duration);
    }

    function softTone(at, startFrequency, endFrequency, level, duration, type = 'sine') {
      const tone = context.createOscillator();
      const gain = context.createGain();
      tone.type = type;
      tone.frequency.setValueAtTime(startFrequency, at);
      tone.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(level, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      tone.connect(gain).connect(context.destination);
      tone.start(at);
      tone.stop(at + duration + 0.01);
    }

    const isOpen = direction === 'open';
    softTap(now, isOpen ? 1850 : 1450, 0.045, 0.052);
    softTone(now, isOpen ? 330 : 440, isOpen ? 440 : 330, 0.065, 0.19);
    softTone(now + 0.012, isOpen ? 660 : 880, isOpen ? 880 : 660, 0.018, 0.14, 'triangle');
  });
}

function playThemeSound(theme) {
  scheduleAudioEffect((context) => {
    const now = context.currentTime;

    function switchImpact(at, centerFrequency, level, duration = 0.032) {
      const frameCount = Math.ceil(context.sampleRate * duration);
      const buffer = context.createBuffer(1, frameCount, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < frameCount; index += 1) {
        const progress = index / frameCount;
        const snap = index < 4 ? (index % 2 === 0 ? 1 : -0.82) : Math.random() * 2 - 1;
        samples[index] = snap * Math.pow(1 - progress, 9.5);
      }

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(centerFrequency, at);
      filter.Q.setValueAtTime(0.72, at);
      gain.gain.setValueAtTime(level, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      source.connect(filter).connect(gain).connect(context.destination);
      source.start(at);
      source.stop(at + duration);
    }

    function switchBody(at, frequency, level, duration = 0.034) {
      const click = context.createOscillator();
      const gain = context.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(level, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      click.connect(gain).connect(context.destination);
      click.start(at);
      click.stop(at + duration + 0.004);
    }

    const isLight = theme === 'light';
    switchImpact(now, isLight ? 1480 : 1180, 0.12, 0.036);
    switchBody(now, isLight ? 238 : 196, 0.072, 0.042);
    switchImpact(now + 0.029, isLight ? 760 : 680, 0.044, 0.024);
    switchBody(now + 0.029, isLight ? 154 : 132, 0.028, 0.028);
  });
}

let lastHoverTickAt = 0;

function playHoverTick(step = 0) {
  const timestamp = performance.now();
  if (timestamp - lastHoverTickAt < 58) return;
  lastHoverTickAt = timestamp;
  scheduleAudioEffect((context) => {
    const now = context.currentTime;
    const tone = context.createOscillator();
    const toneGain = context.createGain();
    const clickLength = 0.034;
    tone.type = 'triangle';
    tone.frequency.setValueAtTime(860 + step * 105, now);
    tone.frequency.exponentialRampToValueAtTime(620 + step * 82, now + clickLength);
    toneGain.gain.setValueAtTime(0.052, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + clickLength);
    tone.connect(toneGain).connect(context.destination);
    tone.start(now);
    tone.stop(now + clickLength + 0.004);
  });
}

// Short high-passed impacts: crisp flap chatter without a low buzzing body.
function playSplitFlapRefresh() {
  scheduleAudioEffect((context) => {
    const duration = .48;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let flap = 0; flap < 15; flap += 1) {
      const start = .008 + flap * .021 + Math.pow(flap / 15, 3) * .10 + Math.random() * .004;
      const amplitude = .15 + Math.random() * .07;
      for (let frame = 0; frame < context.sampleRate * .012; frame += 1) {
        const index = Math.floor(start * context.sampleRate) + frame;
        if (index >= samples.length) break;
        const t = frame / context.sampleRate;
        const crack = (Math.random() * 2 - 1) * Math.exp(-t * 900);
        const secondFlap = t > .004 ? (Math.random() * 2 - 1) * Math.exp(-(t - .004) * 1100) * .55 : 0;
        samples[index] += amplitude * (crack + secondFlap);
      }
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1650;
    filter.Q.value = .5;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 8500;
    source.connect(filter).connect(lowpass).connect(context.destination);
    source.start();
  }, 250);
}



  function play(kind, value) {
    if (kind === 'theme') playThemeSound(value);
    else if (kind === 'clock') playSplitFlapRefresh();
    else if (kind === 'hover') playHoverTick(value || 0);
    else playInterfaceSound(value);
  }
  window.PortfolioSounds = {play};
  window.addEventListener('portfolio-clock-hover', () => play('clock'));
})();
