/* Media open/close synthesis from https://recent.design/ (21 October 2026). */
(() => {
  const volume = 0.7;
  const presets = {
    open: { start: 420, end: 760, attack: 0.002, decay: 0.09, release: 0.03, gain: 0.392 },
    close: { start: 720, end: 360, attack: 0.002, decay: 0.08, release: 0.025, gain: 0.408 },
  };

  window.PortfolioMediaSound = (context, direction) => {
    const preset = presets[direction];
    if (!preset) return;

    // Recent waits 16ms after audio activation; schedule the same onset on the audio clock.
    const now = context.currentTime + 0.016;
    const duration = preset.attack + preset.decay + preset.release;
    const gain = context.createGain();
    const tone = context.createOscillator();

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(preset.gain * volume, now + preset.attack);
    // Its zero-sustain envelope decays towards silence, including the 100ms tail.
    gain.gain.setTargetAtTime(0.0001, now + preset.attack, preset.decay / 3);
    tone.type = 'sine';
    tone.frequency.setValueAtTime(preset.start, now);
    tone.frequency.exponentialRampToValueAtTime(preset.end, now + duration);
    tone.connect(gain).connect(context.destination);
    tone.onended = () => {
      tone.disconnect();
      gain.disconnect();
    };
    tone.start(now);
    tone.stop(now + duration + 0.1);
  };
})();
