/* Notification utility — request permission and show browser notifications */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result;
  }
  return Notification.permission;
}

export function showNotification(title, body, options = {}) {
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon: '/alarm-icon.svg',
    badge: '/alarm-icon.svg',
    tag: options.tag || 'smart-alarm',
    renotify: true,
    ...options,
  });
  return n;
}

/* ── Web Audio Alarm Synth ──────────────────────────────── */
let audioCtx = null;
let alarmNodes = [];

function getCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

const SOUND_GENERATORS = {
  'Classic Alarm': (ctx, gain) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.5);
    osc.connect(gain);
    osc.start();
    return [osc];
  },
  'Android Alarm': (ctx, gain) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.6);
    osc.connect(gain);
    osc.start();
    return [osc];
  },
  'Soft Bell': (ctx, gain) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 523;
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc.connect(gain);
    osc.start();
    return [osc];
  },
  'Temple Bell': (ctx, gain) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 392;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 440;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.connect(gain); osc2.connect(gain);
    osc.start(); osc2.start();
    return [osc, osc2];
  },
  'Nature Birds': (ctx, gain) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1600, ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.connect(gain);
    osc.start();
    return [osc];
  },
  'Rain Sound': (ctx, gain) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.1;
    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;
    source.connect(filter);
    filter.connect(gain);
    source.start();
    return [source];
  },
  'Piano Reminder': (ctx, gain) => {
    const freqs = [262, 330, 392, 523];
    const nodes = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      g2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.8);
      osc.connect(g2); g2.connect(gain);
      osc.start(ctx.currentTime + i * 0.15);
      return osc;
    });
    return nodes;
  },
  'Gentle Wake Up': (ctx, gain) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2);
    osc.connect(gain);
    osc.start();
    return [osc];
  },
  'Focus Alert': (ctx, gain) => {
    [0, 0.2, 0.4].forEach(t => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 750;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.3, ctx.currentTime + t);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
      osc.connect(g2); g2.connect(gain);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.2);
    });
    return [];
  },
  'Emergency Alert': (ctx, gain) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
    gain.gain.value = 0.6;
    osc.connect(gain);
    osc.start();
    return [osc];
  },
};

export const SOUND_NAMES = Object.keys(SOUND_GENERATORS);

export function previewSound(name, volume = 0.5) {
  stopAlarm();
  try {
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    const gen = SOUND_GENERATORS[name] || SOUND_GENERATORS['Classic Alarm'];
    alarmNodes = gen(ctx, gain);
    alarmNodes.push(gain);
    setTimeout(() => stopAlarm(), 3000);
  } catch (e) { console.error('Sound error:', e); }
}

export function playAlarm(name, volume = 0.7) {
  stopAlarm();
  try {
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    const gen = SOUND_GENERATORS[name] || SOUND_GENERATORS['Classic Alarm'];
    alarmNodes = gen(ctx, gain);
    alarmNodes.push(gain);
  } catch (e) { console.error('Alarm error:', e); }
}

export function stopAlarm() {
  alarmNodes.forEach(n => {
    try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch {}
  });
  alarmNodes = [];
}
