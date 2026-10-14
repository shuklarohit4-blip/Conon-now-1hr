/* ──────────────────────────────────────────────────────────────────────────
   Tiny, asset-free sound helpers built on the Web Audio API.

   A real shopkeeper needs to *hear* a new order land while they're busy at the
   counter. We synthesize a short two-note chime with an oscillator so there is
   no audio file to ship and no autoplay asset to preload. Browsers only allow
   audio after a user gesture, so this is wired to clicks and live socket events
   that follow the vendor's first interaction.
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

    const notes = [880, 1318.51]; // A5 → E6, a bright "ding-dong"
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
    /* audio not available — silently ignore */
  }
}
