import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, Mic, MicOff, Search, Sparkles, X } from "lucide-react";
import { useLiveSearchConfig } from "@/services/liveSearchStore";

interface SmartSearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onVoiceTranscript?: (text: string) => void;
  onParchiClick?: () => void;
  onFocusNavigateToSearch?: boolean;
  autoFocus?: boolean;
  isDarkTheme?: boolean;
  compact?: boolean;
  enableGlobalShortcut?: boolean;
}

export function VoiceSearchListenModal({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (transcript: string) => void;
}) {
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef<any>(null);

  const SpeechRecognitionCtor =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const stopRec = () => {
    try {
      recRef.current?.stop?.();
    } catch {}
    setListening(false);
  };

  const startRec = (chosenLang = lang) => {
    if (!SpeechRecognitionCtor) {
      setError("Voice recognition is not supported in this browser. Type your request below.");
      setListening(false);
      return;
    }
    try {
      stopRec();
      const rec = new SpeechRecognitionCtor();
      rec.lang = chosenLang;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      recRef.current = rec;
      setError("");
      setTranscript("");
      setListening(true);

      rec.onresult = (ev: any) => {
        let combined = "";
        for (let i = 0; i < ev.results.length; i++) {
          combined += ev.results[i][0]?.transcript || "";
        }
        setTranscript(combined.trim());
        const last = ev.results[ev.results.length - 1];
        if (last?.isFinal && combined.trim()) {
          setListening(false);
          onResult(combined.trim());
          onClose();
        }
      };

      rec.onerror = (ev: any) => {
        setListening(false);
        if (ev?.error === "not-allowed") {
          setError("Microphone permission denied. Please allow mic access or type below.");
        } else if (ev?.error !== "aborted") {
          setError("Could not hear clearly. Tap mic to try again or type below.");
        }
      };

      rec.onend = () => setListening(false);
      rec.start();
    } catch {
      setListening(false);
      setError("Could not start microphone. Type your search below.");
    }
  };

  useEffect(() => {
    if (open) {
      setManualText("");
      setTranscript("");
      setError("");
      if (SpeechRecognitionCtor) startRec(lang);
    } else {
      stopRec();
    }
    return () => stopRec();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#1848a0] flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">CONON Voice Material Search</h3>
              <p className="text-[11px] text-slate-500">Speak e.g. "UltraTech cement 50 kilo" or "Dr Fixit seelan"</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          {(["en-IN", "hi-IN"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLang(l);
                if (SpeechRecognitionCtor) startRec(l);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition ${
                lang === l
                  ? "bg-[#1848a0] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {l === "en-IN" ? "English (India)" : "हिन्दी / Hinglish"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col items-center text-center gap-3">
          <button
            type="button"
            onClick={() => (listening ? stopRec() : startRec(lang))}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition cursor-pointer shadow-md ${
              listening
                ? "bg-rose-600 text-white ring-8 ring-rose-500/20 animate-pulse"
                : "bg-[#1848a0] text-white hover:bg-blue-800"
            }`}
          >
            {listening ? <Mic className="w-7 h-7" /> : <MicOff className="w-6 h-6" />}
          </button>

          <p className="text-xs font-bold text-slate-700 min-h-[20px]">
            {transcript
              ? `"${transcript}"`
              : listening
                ? "Listening… speak item name & quantity"
                : "Tap microphone to speak"}
          </p>
          {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualText.trim()) {
              onResult(manualText.trim());
              onClose();
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Or type quick search query..."
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#1848a0]"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export function SmartSearchBar({
  value,
  onChange,
  onVoiceTranscript,
  onParchiClick,
  onFocusNavigateToSearch = true,
  autoFocus = false,
  compact = false,
  enableGlobalShortcut = false,
}: SmartSearchBarProps) {
  const [, setLocation] = useLocation();
  const { config } = useLiveSearchConfig();
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalVal, setInternalVal] = useState(value ?? "");
  const query = value !== undefined ? value : internalVal;
  const setQuery = (next: string) => {
    if (onChange) onChange(next);
    else setInternalVal(next);
  };

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const placeholders =
    config.placeholders && config.placeholders.length > 0
      ? config.placeholders
      : ['Search "UltraTech Cement"', 'Search "12mm TMT Sariya"', 'Search "Dr. Fixit Seelan"'];

  const supportsSpeech =
    typeof window !== "undefined" &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [placeholders.length]);

  useEffect(() => {
    if (!enableGlobalShortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (window.location.pathname.startsWith("/admin")) return;
        e.preventDefault();
        if (onFocusNavigateToSearch) setLocation("/search");
        else inputRef.current?.focus();
        return;
      }
      if (!isInput && e.key === "/") {
        e.preventDefault();
        if (onFocusNavigateToSearch) setLocation("/search");
        else inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableGlobalShortcut, onFocusNavigateToSearch, setLocation]);

  const handleOpenSearchPage = (q?: string, mode?: "parchi") => {
    const usp = new URLSearchParams();
    if (q?.trim()) usp.set("q", q.trim());
    if (mode === "parchi") usp.set("mode", "parchi");
    const suffix = usp.toString();
    setLocation(suffix ? `/search?${suffix}` : "/search");
  };

  return (
    <>
      <div
        className={`relative w-full bg-[#F4F6F8] hover:bg-[#EDF1F5] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-[#1848a0] rounded-xl ${
          compact ? "h-9 sm:h-10" : "h-10 sm:h-11"
        } flex items-center pl-3 pr-1.5 border border-slate-200 transition-all`}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" strokeWidth={2.3} />

        {/* Input + Animated Vertical Rolling Placeholder Overlay */}
        <div className="relative flex-1 min-w-0 h-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            autoFocus={autoFocus}
            value={query}
            onFocus={() => {
              if (onFocusNavigateToSearch) {
                handleOpenSearchPage(query);
              }
            }}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onFocusNavigateToSearch) {
                e.preventDefault();
                handleOpenSearchPage(query);
              }
            }}
            aria-label="Search construction materials"
            className="relative z-10 w-full min-w-0 h-full bg-transparent text-[13px] sm:text-[13.5px] font-semibold text-slate-900 focus:outline-none"
          />

          {!query && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholders[placeholderIdx % placeholders.length]}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="text-[12.5px] sm:text-[13.5px] font-semibold text-slate-400 truncate block w-full"
                >
                  {placeholders[placeholderIdx % placeholders.length]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="p-1 text-slate-400 hover:text-slate-700 transition shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        )}

        {/* Keyboard Hint on Desktop */}
        {!query && onFocusNavigateToSearch && (
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-500 text-[10px] font-mono mr-1.5 shrink-0">
            /
          </kbd>
        )}

        {/* Voice Search Mic Button */}
        {config.voiceSearchEnabled && supportsSpeech && (
          <button
            type="button"
            onClick={() => setVoiceOpen(true)}
            aria-label="Voice Search"
            title="Voice Search (Hindi & English)"
            className="p-1.5 rounded-lg text-[#1848a0] hover:bg-blue-50 active:scale-95 transition shrink-0 cursor-pointer"
          >
            <Mic className="w-4 h-4" strokeWidth={2.3} />
          </button>
        )}

        {/* Site Parchi / Quick Multi-Item Magic Button */}
        {config.siteParchiEnabled && (
          <button
            type="button"
            onClick={() => {
              if (onParchiClick) onParchiClick();
              else handleOpenSearchPage(undefined, "parchi");
            }}
            aria-label="Open Site Parchi Multi-Item Matcher"
            title="Site Parchi — Paste material list"
            className="ml-0.5 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/70 flex items-center gap-1 text-[10.5px] font-black shrink-0 active:scale-95 transition cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span className="hidden sm:inline">Parchi</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-700 shrink-0" />
          </button>
        )}
      </div>

      <VoiceSearchListenModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onResult={(spoken) => {
          setQuery(spoken);
          if (onVoiceTranscript) {
            onVoiceTranscript(spoken);
          } else if (onFocusNavigateToSearch) {
            handleOpenSearchPage(spoken);
          }
        }}
      />
    </>
  );
}
