/**
 * Software buzzer using Web Audio API.
 * Plays an urgent alarm pattern when a fall is detected.
 */

let audioContext = null;
let alarmInterval = null;

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency, duration, volume = 0.3) {
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function startBuzzer() {
  stopBuzzer();

  let high = true;
  playTone(880, 0.15, 0.35);
  playTone(660, 0.15, 0.35);

  alarmInterval = setInterval(() => {
    playTone(high ? 880 : 660, 0.2, 0.35);
    high = !high;
  }, 250);
}

export function stopBuzzer() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

export function isBuzzerActive() {
  return alarmInterval !== null;
}
