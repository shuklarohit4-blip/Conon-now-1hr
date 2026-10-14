import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    eyebrow:    "MONSOON SPECIAL",
    title:      "Waterproof\nYour Build",
    subtitle:   "Dr. Fixit · Pidilite · Fosroc",
    cta:        "Shop Waterproofing",
    bg:         "linear-gradient(135deg, #0369a1 0%, #0ea5e9 60%, #38bdf8 100%)",
    accentBg:   "rgba(255,255,255,0.12)",
    ctaBg:      "#fff",
    ctaColor:   "#0369a1",
    badge:      "20% OFF",
    badgeBg:    "#fbbf24",
    badgeColor: "#7c3a00",
    decorEmoji: ["🌧️", "🧱", "💧"],
    decorPos:   ["top-3 right-12 text-3xl", "bottom-4 right-6 text-5xl rotate-6", "top-8 right-4 text-xl"],
  },
  {
    id: 2,
    eyebrow:    "BEST PRICE GUARANTEE",
    title:      "Cement\nDirect to Site",
    subtitle:   "ACC · Ambuja · Birla · UltraTech",
    cta:        "View Cement Deals",
    bg:         "linear-gradient(135deg, #b45309 0%, #d97706 55%, #f59e0b 100%)",
    accentBg:   "rgba(255,255,255,0.12)",
    ctaBg:      "#fff",
    ctaColor:   "#92400e",
    badge:      "50 kg",
    badgeBg:    "#1b4366",
    badgeColor: "#fff",
    decorEmoji: ["🏗️", "🪨", "⚙️"],
    decorPos:   ["top-4 right-10 text-4xl", "bottom-3 right-5 text-5xl -rotate-6", "top-6 right-3 text-2xl"],
  },
  {
    id: 3,
    eyebrow:    "TMT STEEL · SAME DAY",
    title:      "Tata Tiscon\n550D Steel",
    subtitle:   "Kamdhenu · SAIL · RINL · JSW",
    cta:        "View Steel Prices",
    bg:         "linear-gradient(135deg, #1b4366 0%, #1e3a5f 55%, #0f2743 100%)",
    accentBg:   "rgba(255,255,255,0.08)",
    ctaBg:      "#f59e0b",
    ctaColor:   "#1b4366",
    badge:      "60 MIN",
    badgeBg:    "#10b981",
    badgeColor: "#fff",
    decorEmoji: ["🏢", "🔩", "⚡"],
    decorPos:   ["top-3 right-10 text-4xl", "bottom-4 right-5 text-5xl rotate-3", "top-8 right-2 text-2xl"],
  },
  {
    id: 4,
    eyebrow:    "BULK ORDER REWARDS",
    title:      "Order 50+ Bags\nSave More",
    subtitle:   "Extra ₹5,000 OFF on ₹50,000+",
    cta:        "Order Bulk",
    bg:         "linear-gradient(135deg, #166534 0%, #16a34a 60%, #4ade80 100%)",
    accentBg:   "rgba(255,255,255,0.12)",
    ctaBg:      "#fff",
    ctaColor:   "#166534",
    badge:      "SAVE BIG",
    badgeBg:    "#fbbf24",
    badgeColor: "#7c3a00",
    decorEmoji: ["📦", "🏆", "💰"],
    decorPos:   ["top-3 right-10 text-4xl", "bottom-4 right-5 text-5xl rotate-6", "top-8 right-2 text-2xl"],
  },
];

const AUTO_PLAY_MS = 3500;

export default function PromoCarousel() {
  const [active, setActive]   = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef              = useRef<HTMLDivElement>(null);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStart             = useRef<number>(0);

  /* ── auto-play ──────────────────────────────────────────────────────── */
  const startTimer = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % SLIDES.length);
    }, AUTO_PLAY_MS);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [startTimer]);

  /* ── sync scroll position when active changes ───────────────────────── */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[active] as HTMLElement;
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  /* ── touch / drag ───────────────────────────────────────────────────── */
  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientX;
    timerRef.current && clearInterval(timerRef.current);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = dragStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      setActive(a => delta > 0
        ? Math.min(a + 1, SLIDES.length - 1)
        : Math.max(a - 1, 0));
    }
    startTimer();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = e.clientX;
    setDragging(true);
    timerRef.current && clearInterval(timerRef.current);
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const delta = dragStart.current - e.clientX;
    if (Math.abs(delta) > 40) {
      setActive(a => delta > 0
        ? Math.min(a + 1, SLIDES.length - 1)
        : Math.max(a - 1, 0));
    }
    setDragging(false);
    startTimer();
  };

  const go = (dir: 1 | -1) => {
    setActive(a => Math.max(0, Math.min(SLIDES.length - 1, a + dir)));
    startTimer();
  };

  const slide = SLIDES[active];

  return (
    <div className="w-full px-4 mt-3 mb-1 select-none">
      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[22px] cursor-grab active:cursor-grabbing"
        style={{ background: slide.bg, minHeight: 168 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={dragging ? onMouseUp : undefined}
        onMouseLeave={() => { if (dragging) { setDragging(false); startTimer(); } }}
      >
        {/* background circle glow */}
        <div
          className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: slide.accentBg }}
        />
        <div
          className="absolute -right-6 -bottom-8 w-36 h-36 rounded-full blur-2xl pointer-events-none"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* decorative emoji art (right side) */}
        {slide.decorEmoji.map((em, i) => (
          <span
            key={i}
            className={`absolute pointer-events-none leading-none ${slide.decorPos[i]}`}
            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}
          >
            {em}
          </span>
        ))}

        {/* content */}
        <div className="relative z-10 p-5 max-w-[65%]">
          {/* eyebrow */}
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[9px] font-black tracking-widest uppercase text-white/70">
              {slide.eyebrow}
            </p>
            {/* badge */}
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full leading-none"
              style={{ background: slide.badgeBg, color: slide.badgeColor }}
            >
              {slide.badge}
            </span>
          </div>

          {/* title — two lines */}
          <h2
            className="font-black text-white leading-[1.1] mb-1"
            style={{ fontSize: 22 }}
          >
            {slide.title.split("\n").map((line, i) => (
              <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
            ))}
          </h2>

          {/* subtitle */}
          <p className="text-[11px] font-semibold text-white/75 mb-4 leading-tight">
            {slide.subtitle}
          </p>

          {/* CTA */}
          <button
            className="text-[11px] font-black px-4 py-2 rounded-full shadow-md active:scale-95 transition-transform"
            style={{ background: slide.ctaBg, color: slide.ctaColor }}
          >
            {slide.cta}
          </button>
        </div>

        {/* slide counter pill */}
        <div
          className="absolute bottom-3 right-4 text-[10px] font-black rounded-full px-2.5 py-0.5"
          style={{ background: "rgba(0,0,0,0.25)", color: "#fff" }}
        >
          {active + 1}/{SLIDES.length}
        </div>
      </div>

      {/* ── Dot indicators ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); startTimer(); }}
            className="rounded-full transition-all duration-300"
            style={{
              width:   i === active ? 18 : 6,
              height:  6,
              background: i === active ? "#1b4366" : "#cbd5e1",
            }}
          />
        ))}
      </div>

      {/* ── Arrow controls (hidden on mobile, visible on larger) ─────── */}
      <div className="hidden sm:flex items-center justify-between absolute inset-x-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <button
          className="w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center pointer-events-auto active:scale-95"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="w-4 h-4 text-slate-700" />
        </button>
        <button
          className="w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center pointer-events-auto active:scale-95"
          onClick={() => go(1)}
        >
          <ChevronRight className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {/* hidden scroll track (used for scrollIntoView sync) */}
      <div
        ref={trackRef}
        className="hidden"
        aria-hidden="true"
      >
        {SLIDES.map((_, i) => <div key={i} data-index={i} />)}
      </div>
    </div>
  );
}
