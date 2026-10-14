import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Send, ShoppingBag, RotateCcw } from "lucide-react";

/* ── Category aliases (Hindi + English) ─────────────────────── */
const CATEGORY_ALIASES: Array<[string, string[]]> = [
  ["cement",     ["cement", "siment", "ciment", "opc", "ppc"]],
  ["steel",      ["steel", "sariya", "saria", "tmt", "rod", "iron", "lohaa", "lha"]],
  ["sand",       ["sand", "baalu", "balu", "reti", "mitti"]],
  ["aggregate",  ["aggregate", "morang", "gitti", "stone", "kapchi", "chip"]],
  ["bricks",     ["brick", "bricks", "eent", "int", "iint"]],
  ["paint",      ["paint", "rang", "color", "distemper", "primer"]],
  ["tiles",      ["tile", "tiles", "marble", "granite", "ceramic"]],
  ["plumbing",   ["plumbing", "pipe", "pipes", "tap", "faucet", "pvc"]],
  ["electrical", ["electrical", "wire", "wires", "cable", "switch"]],
  ["hardware",   ["hardware", "nail", "screw", "bolt", "nut"]],
  ["wood",       ["wood", "plywood", "lakdi", "timber", "board"]],
  ["safety",     ["safety", "helmet", "gloves", "boot", "vest"]],
  ["tools",      ["tools", "drill", "trowel", "spade", "mixer"]],
];

const WORD_NUMS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100,
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
  bees: 20, pachas: 50, sau: 100,
};

function matchCategory(text: string) {
  const lower = text.toLowerCase();
  for (const [cat, words] of CATEGORY_ALIASES) {
    for (const w of words) {
      const esc = w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      if (new RegExp(`\\b${esc}\\b`, "i").test(lower))
        return { category: cat, matchedWord: w };
    }
  }
  return null;
}

function extractQty(text: string): number {
  const lower = text.toLowerCase();
  const digit = lower.match(/\b(\d{1,4})\b/);
  if (digit) return Math.max(1, Math.min(500, parseInt(digit[1], 10)));
  for (const [w, n] of Object.entries(WORD_NUMS))
    if (new RegExp(`\\b${w}\\b`).test(lower)) return n;
  return 1;
}

/* ── Waveform bar ────────────────────────────────────────────── */
function WaveBar({ active, delay }: { active: boolean; delay: number }) {
  return (
    <motion.div
      className="w-1.5 rounded-full"
      style={{ background: active ? "#2a7a3b" : "#d1fae5" }}
      animate={active
        ? { height: ["12px", "36px", "18px", "44px", "12px"] }
        : { height: "8px" }}
      transition={active
        ? { repeat: Infinity, duration: 0.7, delay, ease: "easeInOut" }
        : { duration: 0.3 }}
    />
  );
}

/* ── Props ───────────────────────────────────────────────────── */
interface VoiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (category: string, label: string, quantity: number) => void;
}

type Stage = "idle" | "listening" | "processing" | "success" | "error" | "nosupport";

export function VoiceOrderModal({ isOpen, onClose, onAddToCart }: VoiceOrderModalProps) {
  const [stage, setStage]         = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const [result, setResult]       = useState<{ category: string; qty: number; label: string } | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const recognitionRef = useRef<any>(null);

  const SR = typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;

  /* reset when dialog closes */
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTimeout(() => { setStage("idle"); setTranscript(""); setFallbackText(""); setResult(null); setErrorMsg(""); }, 300);
    }
  }, [isOpen]);

  const processText = useCallback((text: string) => {
    setTranscript(text);
    setStage("processing");
    setTimeout(() => {
      const match = matchCategory(text);
      const qty   = extractQty(text);
      if (!match) {
        setErrorMsg(`Heard: "${text}" — couldn't find a material. Try: "50 bags cement" or "sariya do ton"`);
        setStage("error");
        return;
      }
      const label = `${match.matchedWord.charAt(0).toUpperCase() + match.matchedWord.slice(1)} (voice × ${qty})`;
      setResult({ category: match.category, qty, label });
      setStage("success");
    }, 600);
  }, []);

  const startListening = useCallback(() => {
    if (!SR) { setStage("nosupport"); return; }
    try {
      const recog = new SR();
      recog.lang = "en-IN";
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.continuous = false;

      recog.onresult = (e: any) => {
        const t = e.results?.[0]?.[0]?.transcript ?? "";
        processText(t.trim() || "");
      };
      recog.onerror = (e: any) => {
        setStage("error");
        const map: Record<string, string> = {
          "not-allowed":         "Microphone permission denied — please allow mic access in browser settings.",
          "service-not-allowed": "Mic permission denied by browser.",
          "no-speech":           "No speech detected. Tap the mic and speak clearly.",
          "audio-capture":       "No microphone found on this device.",
          "network":             "Network issue while transcribing. Check your connection.",
        };
        setErrorMsg(map[e?.error] ?? `Error: ${e?.error}`);
      };
      recog.onend = () => { if (stage === "listening") setStage("idle"); };

      recognitionRef.current = recog;
      recog.start();
      setStage("listening");
    } catch (err) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Could not start voice recognition");
    }
  }, [SR, processText, stage]);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const confirmAdd = () => {
    if (!result) return;
    onAddToCart(result.category, result.label, result.qty);
    onClose();
  };

  const handleFallback = () => {
    if (!fallbackText.trim()) return;
    processText(fallbackText.trim());
  };

  const reset = () => {
    stopListening();
    setStage("idle");
    setTranscript("");
    setFallbackText("");
    setResult(null);
    setErrorMsg("");
  };

  const HINTS = [
    "50 bags cement", "do ton sariya", "100 bricks",
    "10 litres paint", "sand 20 bags", "tile 5 boxes",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: "85dvh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900">Voice Order</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Speak to order construction materials</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="px-5 py-5 overflow-y-auto" style={{ maxHeight: "calc(85dvh - 80px)" }}>

              {/* ── No support ──────────────────────────────── */}
              {stage === "nosupport" && (
                <div className="text-center py-4">
                  <MicOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-black text-gray-700 mb-1">Voice not supported</p>
                  <p className="text-[11px] text-gray-400 mb-4">Your browser doesn't support voice input. Use Chrome on Android for best results, or type your order below.</p>
                </div>
              )}

              {/* ── Idle / Listening / Processing ───────────── */}
              {(stage === "idle" || stage === "listening" || stage === "processing" || stage === "nosupport") && (
                <>
                  {/* Mic button */}
                  <div className="flex flex-col items-center py-4">
                    <motion.button
                      onPointerDown={(e) => { e.preventDefault(); if (stage === "idle") startListening(); }}
                      onPointerUp={(e) => { e.preventDefault(); stopListening(); }}
                      onPointerLeave={() => stage === "listening" && stopListening()}
                      disabled={stage === "nosupport"}
                      whileTap={{ scale: 0.92 }}
                      className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all mb-4 select-none ${
                        stage === "listening"
                          ? "bg-red-500 shadow-red-200"
                          : stage === "processing"
                          ? "bg-amber-400 shadow-amber-200"
                          : stage === "nosupport"
                          ? "bg-gray-200"
                          : "bg-green-600 shadow-green-200 active:scale-95"
                      }`}
                    >
                      {stage === "processing"
                        ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <RotateCcw className="w-10 h-10 text-white" />
                          </motion.div>
                        : <Mic className={`w-10 h-10 ${stage === "nosupport" ? "text-gray-400" : "text-white"}`} />
                      }
                    </motion.button>

                    {/* Waveform */}
                    <div className="flex items-end gap-1.5 h-12 mb-3">
                      {[0, 0.1, 0.2, 0.05, 0.15, 0.25, 0.08, 0.18, 0.12, 0.22].map((d, i) => (
                        <WaveBar key={i} active={stage === "listening"} delay={d} />
                      ))}
                    </div>

                    <p className="text-sm font-black text-gray-700 text-center">
                      {stage === "listening"  ? "🔴 Listening… speak now"
                       : stage === "processing" ? "⚙️ Processing your order…"
                       : stage === "nosupport"  ? "Voice unavailable"
                       : "Tap & Hold to speak"}
                    </p>
                    {stage === "idle" && (
                      <p className="text-[11px] text-gray-400 mt-1 text-center">
                        Say e.g. "50 bags cement" or "2 ton sariya"
                      </p>
                    )}
                  </div>

                  {/* Hint chips */}
                  {stage === "idle" && (
                    <div className="flex flex-wrap gap-2 justify-center mb-5">
                      {HINTS.map(h => (
                        <button key={h} onClick={() => processText(h)}
                          className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold text-green-700 hover:bg-green-100 transition">
                          {h}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Text fallback */}
                  <div className="mt-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Or type your order</p>
                    <div className="flex gap-2">
                      <input
                        value={fallbackText}
                        onChange={e => setFallbackText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleFallback()}
                        placeholder="e.g. 50 bags cement"
                        className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
                      />
                      <button onClick={handleFallback} disabled={!fallbackText.trim()}
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                        style={{ background: "#2a7a3b" }}>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── Success ─────────────────────────────────── */}
              {stage === "success" && result && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-2">
                  {/* transcript */}
                  {transcript && (
                    <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-4 flex items-start gap-2">
                      <Mic className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 italic">"{transcript}"</p>
                    </div>
                  )}

                  {/* parsed result */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-2">Order Detected ✓</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white text-2xl shrink-0">
                        {CATEGORY_ALIASES.find(([c]) => c === result.category)?.[1]?.[0]?.slice(0, 1).toUpperCase() ?? "📦"}
                      </div>
                      <div>
                        <p className="text-base font-black text-gray-900 capitalize">{result.category}</p>
                        <p className="text-sm text-gray-500">Quantity: <span className="font-black text-gray-800">{result.qty}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={reset}
                      className="flex-1 py-3.5 rounded-2xl font-black text-sm border-2 border-gray-200 text-gray-600">
                      Try Again
                    </button>
                    <button onClick={confirmAdd}
                      className="flex-1 py-3.5 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2"
                      style={{ background: "#2a7a3b" }}>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Error ───────────────────────────────────── */}
              {stage === "error" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-2">
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">Could not process</p>
                    <p className="text-sm text-red-600 font-semibold leading-snug">{errorMsg}</p>
                  </div>
                  {transcript && (
                    <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Heard</p>
                      <p className="text-sm text-gray-600 italic">"{transcript}"</p>
                    </div>
                  )}
                  {/* text fallback */}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Type your order instead</p>
                    <div className="flex gap-2">
                      <input value={fallbackText} onChange={e => setFallbackText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleFallback()}
                        placeholder="e.g. 50 bags cement"
                        className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <button onClick={handleFallback} disabled={!fallbackText.trim()}
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                        style={{ background: "#2a7a3b" }}>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button onClick={reset} className="w-full mt-3 py-3 rounded-2xl font-black text-sm border-2 border-gray-200 text-gray-600">
                    ← Try Voice Again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
