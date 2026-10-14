import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, Phone, MessageSquare, RefreshCw, MapPin,
  Star, Shield, ChevronRight, Share2, Package, Plus,
  Home, Navigation, PenLine, CheckCircle2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/* ── constants ───────────────────────────────────────────────── */
const ORDER_ID  = "CON-28471";
const ORDER_NUM = "#8071668064";
const DRIVER    = { name: "Rajesh Kumar", initials: "RK", rating: 4.8, trips: "1.2k", phone: "+919876543210" };
const VENDOR    = { name: "CONON Warehouse — Charbagh", area: "Charbagh, Lucknow" };
const TOTAL_AMT = 17750;
const DELIVERY_ADDR = "Plot 42, Hazratganj, Lucknow — 226001";
const CONTACT   = "Rohit, 9876XXXX";
const ORDER_ITEMS_STR = "20 × UltraTech PPC 50kg + 5 × Tata Tiscon 12mm + 2 × Havells Lifeline…";
const GREEN     = "#2a7a3b";

type Stage = "placed" | "packing" | "on_way" | "delivered";

const STAGE_LABELS: Record<Stage, { title: string; sub: string }> = {
  placed:    { title: "Order Placed",         sub: "Preparing at warehouse…"           },
  packing:   { title: "Packing your order",   sub: "Arriving in {eta} minutes • On time" },
  on_way:    { title: "Order is on the way",  sub: "Arriving in {eta} minutes • On time" },
  delivered: { title: "Order Delivered!",     sub: "Materials unloaded at your site"    },
};

/* ── route ───────────────────────────────────────────────────── */
const ROUTE_POINTS = [
  { lat: 26.823, lng: 80.902 }, { lat: 26.827, lng: 80.908 },
  { lat: 26.831, lng: 80.914 }, { lat: 26.834, lng: 80.920 },
  { lat: 26.837, lng: 80.925 }, { lat: 26.840, lng: 80.930 },
  { lat: 26.842, lng: 80.934 }, { lat: 26.844, lng: 80.938 },
  { lat: 26.845, lng: 80.942 }, { lat: 26.846, lng: 80.945 },
  { lat: 26.847, lng: 80.946 },
];

/* ── canvas map ──────────────────────────────────────────────── */
function GPSMap({ driverIndex, onExpand }: { driverIndex: number; onExpand: () => void }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 400, h: 220 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const w = el.offsetWidth;
      setDims({ w, h: Math.round(w * 0.58) });
    });
    obs.observe(el);
    setDims({ w: el.offsetWidth, h: Math.round(el.offsetWidth * 0.58) });
    return () => obs.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = dims;
    const pad = 28;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const lats = ROUTE_POINTS.map(p => p.lat);
    const lngs = ROUTE_POINTS.map(p => p.lng);
    const [minLat, maxLat] = [Math.min(...lats) - 0.003, Math.max(...lats) + 0.003];
    const [minLng, maxLng] = [Math.min(...lngs) - 0.004, Math.max(...lngs) + 0.004];
    const toX = (lng: number) => pad + ((lng - minLng) / (maxLng - minLng)) * (w - pad * 2);
    const toY = (lat: number) => h - pad - ((lat - minLat) / (maxLat - minLat)) * (h - pad * 2);

    /* background */
    ctx.fillStyle = "#e8f0e4";
    ctx.fillRect(0, 0, w, h);

    /* subtle grid roads */
    const roads = [
      [{ lat: 26.836, lng: 80.900 }, { lat: 26.836, lng: 80.950 }],
      [{ lat: 26.843, lng: 80.900 }, { lat: 26.843, lng: 80.950 }],
      [{ lat: 26.820, lng: 80.920 }, { lat: 26.850, lng: 80.920 }],
      [{ lat: 26.820, lng: 80.935 }, { lat: 26.850, lng: 80.935 }],
    ];
    ctx.strokeStyle = "#c8d8c4"; ctx.lineWidth = 4;
    roads.forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(toX(a.lng), toY(a.lat)); ctx.lineTo(toX(b.lng), toY(b.lat)); ctx.stroke();
    });

    /* dashed remaining route */
    ctx.setLineDash([7, 5]); ctx.strokeStyle = "#888"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = driverIndex; i < ROUTE_POINTS.length; i++) {
      const p = ROUTE_POINTS[i];
      i === driverIndex ? ctx.moveTo(toX(p.lng), toY(p.lat)) : ctx.lineTo(toX(p.lng), toY(p.lat));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    /* completed route */
    if (driverIndex > 0) {
      ctx.strokeStyle = "#1a6b30"; ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i <= driverIndex; i++) {
        const p = ROUTE_POINTS[i];
        i === 0 ? ctx.moveTo(toX(p.lng), toY(p.lat)) : ctx.lineTo(toX(p.lng), toY(p.lat));
      }
      ctx.stroke();
    }

    /* warehouse pin (square blue) */
    const [wx, wy] = [toX(ROUTE_POINTS[0].lng), toY(ROUTE_POINTS[0].lat)];
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath(); ctx.roundRect(wx - 11, wy - 11, 22, 22, 5); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("W", wx, wy);

    /* destination home pin */
    const [dx, dy] = [toX(ROUTE_POINTS[ROUTE_POINTS.length - 1].lng), toY(ROUTE_POINTS[ROUTE_POINTS.length - 1].lat)];
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#555"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(dx, dy, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.font = "14px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🏠", dx, dy);

    /* driver truck (pulsing ring) */
    const dp = ROUTE_POINTS[Math.min(driverIndex, ROUTE_POINTS.length - 1)];
    const [dpx, dpy] = [toX(dp.lng), toY(dp.lat)];
    ctx.fillStyle = "rgba(26,107,48,0.15)";
    ctx.beginPath(); ctx.arc(dpx, dpy, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a6b30"; ctx.shadowColor = "rgba(26,107,48,0.5)"; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(dpx, dpy, 13, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff"; ctx.font = "14px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🚛", dpx, dpy);

    /* "Google" watermark */
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText("Google", pad, h - 8);
  }, [driverIndex, dims]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden" style={{ background: "#e8f0e4" }}>
      <canvas ref={canvasRef} style={{ width: dims.w, height: dims.h, display: "block" }} />
      {/* expand icon */}
      <button onClick={onExpand}
        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center active:scale-90 transition">
        <span className="text-[10px] font-black text-gray-600">⤢</span>
      </button>
    </div>
  );
}

/* ── tip button ──────────────────────────────────────────────── */
function TipBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${selected ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-800 border-gray-200 hover:border-gray-400"}`}>
      {label}
    </button>
  );
}

/* ── main page ───────────────────────────────────────────────── */
export function DeliveryTracker() {
  const [stage, setStage]           = useState<Stage>("packing");
  const [driverIndex, setDriverIndex] = useState(2);
  const [eta, setEta]               = useState(16);
  const [addSecs, setAddSecs]       = useState(120); // 2-min add-items countdown
  const [selectedTip, setSelectedTip] = useState<string | null>(null);
  const [tipDone, setTipDone]       = useState(false);
  const [, setLocation]             = useLocation();

  /* interactive state for delivery actions */
  const [paid, setPaid]                     = useState(false);
  const [refreshing, setRefreshing]         = useState(false);
  const [safetyOpen, setSafetyOpen]         = useState(false);
  const [isiOpen, setIsiOpen]               = useState(false);
  const [contact, setContact]               = useState(CONTACT);
  const [editingContact, setEditingContact] = useState(false);
  const [deliveryAddr, setDeliveryAddr]     = useState(DELIVERY_ADDR);
  const [editingAddr, setEditingAddr]       = useState(false);
  const [instructions, setInstructions]     = useState("");
  const [editingInstr, setEditingInstr]     = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success(`On time — arriving in ${eta} min`);
    }, 800);
  };

  const handleMessage = () => {
    const body = encodeURIComponent(`Hi ${DRIVER.name}, regarding my CONON order ${ORDER_ID}.`);
    window.location.href = `sms:${DRIVER.phone}?body=${body}`;
  };

  const handleShare = async () => {
    const text = `Track my CONON order ${ORDER_ID} — arriving in ${eta} mins!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "CONON Delivery", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Tracking details copied to clipboard!");
      }
    } catch { /* user dismissed share sheet */ }
  };

  /* simulate movement */
  useEffect(() => {
    const iv = setInterval(() => {
      setDriverIndex(p => {
        const next = p + 1;
        if (next >= ROUTE_POINTS.length - 1) { setStage("delivered"); clearInterval(iv); return p; }
        if (next >= 4 && stage === "packing") setStage("on_way");
        return next;
      });
      setEta(p => Math.max(1, p - 1));
    }, 5000);
    return () => clearInterval(iv);
  }, [stage]);

  /* countdown for add-items */
  useEffect(() => {
    if (addSecs <= 0) return;
    const iv = setInterval(() => setAddSecs(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const label = STAGE_LABELS[stage];
  const subText = label.sub.replace("{eta}", String(eta));
  const addMM = String(Math.floor(addSecs / 60)).padStart(2, "0");
  const addSS = String(addSecs % 60).padStart(2, "0");

  /* order placed confirmation */
  if (stage === "placed") {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-5" style={{ background: GREEN }}>
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <p className="text-xs font-black tracking-widest text-gray-500 uppercase mb-2">Order Placed</p>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Delivering to Site</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">{DELIVERY_ADDR}</p>
        <button onClick={() => setStage("packing")}
          className="px-8 py-3 rounded-2xl text-white font-black text-sm" style={{ background: GREEN }}>
          Track Order
        </button>
      </div>
    );
  }

  /* delivered */
  if (stage === "delivered") {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-5" style={{ background: GREEN }}>
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <p className="text-xs font-black tracking-widest text-gray-500 uppercase mb-2">Delivered</p>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Materials Delivered!</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">Order {ORDER_ID} delivered to your site at Hazratganj.</p>
        <Link href="/home">
          <button className="px-8 py-3 rounded-2xl text-white font-black text-sm" style={{ background: GREEN }}>
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ── Green Header ───────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-12 pb-5 text-white relative" style={{ background: GREEN }}>
        {/* top row */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/home">
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <p className="text-sm font-bold opacity-90 flex-1 text-center">{VENDOR.name}</p>
          <button onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* status */}
        <p className="text-[13px] font-bold opacity-90 text-center">{label.title}</p>
        <h1 className="text-2xl font-black text-center mt-0.5">{subText}</h1>

        {/* ETA pill */}
        <div className="flex items-center justify-center mt-3 gap-2">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-sm font-bold">On time</span>
            <button onClick={handleRefresh} disabled={refreshing}
              className="ml-1 opacity-80 hover:opacity-100 active:scale-90 transition disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Map */}
        <div className="bg-white overflow-hidden" style={{ borderBottom: "1px solid #e5e7eb" }}>
          <GPSMap driverIndex={driverIndex} onExpand={() => setLocation("/live-track")} />
        </div>

        {/* ── Add more items card ────────────────────────────── */}
        {addSecs > 0 && (
          <div className="mx-4 mt-4 bg-amber-50 rounded-2xl p-4" style={{ border: "1px solid #fde68a" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Plus className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Forgot to add something?</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Add more items while your order is being packed</p>
              </div>
            </div>
            <button onClick={() => setLocation("/home")}
              className="w-full py-2.5 rounded-xl text-white text-sm font-black flex items-center justify-center gap-3 active:scale-95 transition"
              style={{ background: GREEN }}>
              <span>Add more items</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">{addMM}:{addSS}</span>
            </button>
          </div>
        )}

        {/* ── Pay on delivery ───────────────────────────────── */}
        <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900">
                {paid
                  ? `₹${TOTAL_AMT.toLocaleString("en-IN")} paid online`
                  : `Pay ₹${TOTAL_AMT.toLocaleString("en-IN")} before or on delivery`}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {paid ? "Payment received — show this screen on delivery" : "Please keep change handy or avoid the hassle by paying online"}
              </p>
            </div>
          </div>
          {paid ? (
            <div className="mt-3 flex items-center gap-1.5 text-sm font-black" style={{ color: GREEN }}>
              <CheckCircle2 className="w-4 h-4" /> Paid online
            </div>
          ) : (
            <button onClick={() => { setPaid(true); toast.success(`Payment successful — ₹${TOTAL_AMT.toLocaleString("en-IN")} paid`); }}
              className="mt-3 text-sm font-black active:scale-95 transition" style={{ color: GREEN }}>Pay online</button>
          )}
        </div>

        {/* ── Driver card ───────────────────────────────────── */}
        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base shrink-0"
              style={{ background: "#d97706" }}>
              {DRIVER.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900">I'm {DRIVER.name}, your delivery partner</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-bold text-gray-500">{DRIVER.rating} · {DRIVER.trips} orders delivered</span>
              </div>
            </div>
            <a href={`tel:${DRIVER.phone}`}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200 transition">
              <Phone className="w-4 h-4 text-gray-600" />
            </a>
          </div>

          {/* green status bubble */}
          <div className="mx-4 mb-4 px-3 py-2 rounded-xl text-[12px] font-semibold" style={{ background: "#d1fae5", color: "#065f46" }}>
            {stage === "packing"
              ? "I've reached the warehouse and will load your order soon"
              : "Your order is loaded and I'm heading to your site!"}
          </div>

          {/* message bar */}
          <div className="px-4 pb-4 flex items-center gap-2">
            <button onClick={handleMessage}
              className="flex-1 flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 active:scale-[0.98] transition">
              <div className="flex items-center gap-2 text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Send a message</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* ── Tip section ───────────────────────────────────── */}
        <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4">
          <p className="text-sm font-black text-gray-900 mb-1">
            {tipDone ? `Thanks for tipping ${DRIVER.name.split(" ")[0]}! 🙏` : `Delivering happiness at your doorstep!`}
          </p>
          <p className="text-[11px] text-gray-500 mb-3">
            {tipDone ? "100% of the tip goes to your delivery partner." : `Thank ${DRIVER.name.split(" ")[0]} by leaving a tip. 100% of the amount will go to them after delivery`}
          </p>
          {!tipDone && (
            <div className="flex gap-2 flex-wrap">
              {["₹20", "₹30", "₹50", "Other"].map(t => (
                <TipBtn key={t} label={t} selected={selectedTip === t} onClick={() => { setSelectedTip(t); setTipDone(true); }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Delivery partner safety ───────────────────────── */}
        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
          <button onClick={() => setSafetyOpen(o => !o)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:scale-[0.98] transition">
            <Shield className="w-5 h-5 text-gray-500 shrink-0" />
            <span className="flex-1 text-sm font-semibold text-gray-800 text-left">Learn about delivery partner safety</span>
            <ChevronRight className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${safetyOpen ? "rotate-90" : ""}`} />
          </button>
          {safetyOpen && (
            <div className="px-4 pb-4 -mt-1 text-[12px] text-gray-600 leading-relaxed space-y-2">
              <p>• All CONON delivery partners are background-verified and trained in safe material handling.</p>
              <p>• Every vehicle is GPS-tracked end to end, and loads are weight-verified at the warehouse before dispatch.</p>
              <p>• Share your live tracking link with family and rate your partner after delivery — your feedback keeps everyone safe.</p>
            </div>
          )}
        </div>

        {/* ── All your delivery details ─────────────────────── */}
        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-orange-100" style={{ background: "#fff7ed" }}>
            <p className="text-sm font-black text-orange-700">All your delivery details in one place 👇</p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* contact */}
            <div className="flex items-start gap-3 px-4 py-3.5">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                {editingContact ? (
                  <input value={contact} onChange={e => setContact(e.target.value)} autoFocus
                    className="w-full text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gray-400" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800">{contact}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-0.5">Delivery partner may call this number</p>
              </div>
              <button
                onClick={() => { if (editingContact) toast.success("Contact number updated"); setEditingContact(v => !v); }}
                className="text-sm font-black shrink-0 active:scale-95 transition" style={{ color: GREEN }}>
                {editingContact ? "Save" : "Edit"}
              </button>
            </div>

            {/* address */}
            <div className="flex items-start gap-3 px-4 py-3.5">
              <Home className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Delivery at Site</p>
                {editingAddr ? (
                  <textarea value={deliveryAddr} onChange={e => setDeliveryAddr(e.target.value)} rows={2} autoFocus
                    className="mt-1 w-full text-[12px] text-gray-600 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gray-400 resize-none" />
                ) : (
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{deliveryAddr}</p>
                )}
              </div>
              <button
                onClick={() => { if (editingAddr) toast.success("Delivery address updated"); setEditingAddr(v => !v); }}
                className="text-sm font-black shrink-0 active:scale-95 transition" style={{ color: GREEN }}>
                {editingAddr ? "Save" : "Edit"}
              </button>
            </div>

            {/* instructions */}
            {editingInstr ? (
              <div className="flex items-start gap-3 px-4 py-3.5">
                <PenLine className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <input value={instructions} onChange={e => setInstructions(e.target.value)} autoFocus
                  placeholder="e.g. Call on arrival, unload at gate 2"
                  className="flex-1 min-w-0 text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gray-400" />
                <button
                  onClick={() => { setEditingInstr(false); toast.success(instructions.trim() ? "Instructions saved" : "Instructions cleared"); }}
                  className="text-sm font-black shrink-0 active:scale-95 transition" style={{ color: GREEN }}>Save</button>
              </div>
            ) : (
              <button onClick={() => setEditingInstr(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:scale-[0.98] transition">
                <PenLine className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="flex-1 text-sm font-semibold text-gray-800 text-left">
                  {instructions.trim() ? instructions : "Add delivery instructions"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* ── Order details card ────────────────────────────── */}
        <div className="mx-4 mb-3 bg-white rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900">{VENDOR.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{VENDOR.area}</p>
            </div>
            <a href={`tel:${DRIVER.phone}`}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-gray-600" />
            </a>
          </div>

          <button onClick={() => setLocation("/orders")}
            className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 active:scale-[0.98] transition">
            <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-black text-green-700">ISI</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[12px] font-bold text-gray-800">Order {ORDER_NUM}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{ORDER_ITEMS_STR}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
          </button>

          <div className="border-b border-gray-100">
            <button onClick={() => setIsiOpen(o => !o)}
              className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 active:scale-[0.98] transition">
              <Shield className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-[12px] font-bold text-gray-800 leading-snug">
                  All materials are ISI-certified & weight-verified at warehouse
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-300 shrink-0 mt-1 transition-transform ${isiOpen ? "rotate-90" : ""}`} />
            </button>
            {isiOpen && (
              <div className="px-4 pb-3.5 text-[12px] text-gray-600 leading-relaxed">
                Every batch is checked against the relevant IS codes (e.g. IS 1786 for steel, IS 1489 for PPC cement) and weighed on calibrated scales before dispatch. The certification reference is printed on your invoice.
              </div>
            )}
          </div>

          <button onClick={() => setLocation("/contact")}
            className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 active:scale-[0.98] transition">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-sm font-black text-gray-800">Need help with your order?</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Get help & support</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
          </button>
        </div>

        {/* bottom spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}
