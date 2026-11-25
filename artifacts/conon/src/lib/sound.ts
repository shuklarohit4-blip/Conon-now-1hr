/* ──────────────────────────────────────────────────────────────────────────
   Tiny, asset-free sound helpers built on the Web Audio API & Web Speech API.
   No audio files needed — zero 404 risk, 100% reliable across all browsers.
   ────────────────────────────────────────────────────────────────────────── */

export function playOrderChime(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const notes = [880, 1318.51]; // A5 → E6 bright ding-dong
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const start = ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.32, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
      osc.start(start);
      osc.stop(start + 0.16);
    });

    window.setTimeout(() => {
      void ctx.close();
    }, 700);
  } catch {
    /* ignore */
  }
}

export function playFlashBuzzer(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    // Two rapid warning pulses (520Hz & 680Hz)
    [520, 680, 520, 680].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
      osc.start(start);
      osc.stop(start + 0.11);
    });

    window.setTimeout(() => {
      void ctx.close();
    }, 800);
  } catch {
    /* ignore */
  }
}

export function playCashoutChime(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    // Ascending arpeggio (C5 -> E5 -> G5 -> C6)
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      osc.start(start);
      osc.stop(start + 0.2);
    });

    window.setTimeout(() => {
      void ctx.close();
    }, 900);
  } catch {
    /* ignore */
  }
}

export function playSosAlarm(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);

    window.setTimeout(() => {
      void ctx.close();
    }, 600);
  } catch {
    /* ignore */
  }
}

export function speakHinglish(text: string, onEnd?: () => void, lang: "en" | "hi" = "hi"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 1500);
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";

    // Try finding voice matching selected language
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;
    if (lang === "hi") {
      preferredVoice =
        voices.find((v) => v.lang.toLowerCase().includes("hi")) ||
        voices.find((v) => v.lang.includes("IN")) ||
        null;
    } else {
      preferredVoice =
        voices.find((v) => v.lang.includes("en-IN") || (v.lang.includes("en") && v.name.toLowerCase().includes("india"))) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null;
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    if (onEnd) setTimeout(onEnd, 1500);
  }
}
