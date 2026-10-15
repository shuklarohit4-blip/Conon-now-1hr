import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, Package, BookOpen, Truck, Tag, Users,
  LogOut, Bell, ShieldCheck, TrendingUp, AlertTriangle,
  IndianRupee, Activity, CheckCircle, Clock, MessageSquare,
  Download, X, RefreshCw, User, Edit3, ToggleLeft, ToggleRight,
  Search, FileText, Ban, UserCheck, MapPin, Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { JWT_STORAGE_KEY } from "@/lib/authApi";
import { apiUrl as resolveApiUrl } from "@/lib/apiBase";

/* ── Brand tokens ───────────────────────────────────────────── */
const Y  = "#FBBF24";   // Safety Yellow
const DK = "#1F2937";   // Dark Gray
const MID = "#374151";
const GN = "#10B981";
const RD = "#EF4444";
const BL = "#3B82F6";
const PU = "#8B5CF6";

/* ── Types ──────────────────────────────────────────────────── */
interface Analytics {
  totalRevenue: number; activeOrders: number; slaBreaches: number; khataCredit: number;
  sevenDayHistory: { date: string; orders: number; revenue: number }[];
}
interface AdminOrder {
  id: string; shortId: string; site: string; items: string; vendor: string;
  total: number; status: string; deliveryAddress: string; phone: string;
  minsLeft: number; slaBreached: boolean; malba: boolean;
}
interface Khata {
  id: string; name: string; creditLimit: number; utilized: number;
  pending: number; overdueDays: number; phone: string;
}
interface Driver {
  id: string; name: string; vehicle: string; tripsThisWeek: number;
  earnings: number; status: string; settled: boolean;
}
interface MandiPrice {
  id: number; material: string; unit: string; currentPrice: string;
  previousPrice: string; change: string; trend: string;
}
interface AppUser {
  id: string; role: "contractor" | "vendor" | "driver";
  name: string; phone: string; email: string; zone: string;
  pincode: string; category: string; status: "active" | "pending" | "banned";
  joinedAt: string; ordersCount: number; rating: number;
}

/* ── Fetch helper ────────────────────────────────────────────── */
const apiUrl = resolveApiUrl;

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = localStorage.getItem(JWT_STORAGE_KEY);
  const r = await fetch(apiUrl(path), {
    credentials: "include",
    ...opts,
    headers: {
      ...(opts?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json() as Promise<T>;
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: LucideIcon; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: DK }}>{value}</p>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── SLA Timer ──────────────────────────────────────────────── */
function SlaTimer({ minsLeft, breached }: { minsLeft: number; breached: boolean }) {
  const [m, setM] = useState(minsLeft);
  useEffect(() => { setM(minsLeft); }, [minsLeft]);
  useEffect(() => {
    if (breached) return;
    const t = setInterval(() => setM(v => Math.max(-9999, v - 1)), 60000);
    return () => clearInterval(t);
  }, [breached]);
  const color = breached || m < 0 ? RD : m < 10 ? Y : GN;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
      style={{ background: color + "18", color }}>
      <Clock className="w-2.5 h-2.5" />
      {breached || m < 0 ? `${Math.abs(m)}m overdue` : `${m}m left`}
    </span>
  );
}

/* ── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string }> = {
    placed:    { c: BL,  l: "Active"    },
    delivered: { c: GN,  l: "Delivered" },
    cancelled: { c: RD,  l: "Cancelled" },
    active:    { c: GN,  l: "Active"    },
    pending:   { c: Y,   l: "Pending"   },
    banned:    { c: RD,  l: "Banned"    },
  };
  const d = map[status] ?? { c: MID, l: status };
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
      style={{ background: d.c + "18", color: d.c }}>{d.l}</span>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE 1 – GOD-EYE
═══════════════════════════════════════════════════════════════ */
function GodEyeModule() {
  const [data, setData] = useState<Analytics | null>(null);
  useEffect(() => { api<Analytics>("/api/admin/analytics").then(setData).catch(() => {}); }, []);

  const d: Analytics = data ?? {
    totalRevenue: 420000, activeOrders: 24, slaBreaches: 3, khataCredit: 2840000,
    sevenDayHistory: [
      { date: "Mon", orders: 18, revenue: 310000 }, { date: "Tue", orders: 22, revenue: 380000 },
      { date: "Wed", orders: 15, revenue: 260000 }, { date: "Thu", orders: 31, revenue: 520000 },
      { date: "Fri", orders: 28, revenue: 460000 }, { date: "Sat", orders: 35, revenue: 590000 },
      { date: "Sun", orders: 24, revenue: 420000 },
    ],
  };

  const fleet = [
    { id: "T-01", driver: "Ravi Kumar",  status: "on-route",  x: 68, y: 45, item: "50 Bags OPC"  },
    { id: "T-02", driver: "Suresh B.",   status: "loading",   x: 38, y: 62, item: "2T Sariya"     },
    { id: "T-03", driver: "Kartik R.",   status: "delivered", x: 82, y: 28, item: "500 Bricks"    },
    { id: "T-04", driver: "Deepak M.",   status: "delayed",   x: 22, y: 38, item: "3T Morang"     },
    { id: "T-05", driver: "Rahul Y.",    status: "on-route",  x: 55, y: 70, item: "River Sand"    },
  ];
  const sc = (s: string) => s === "delivered" ? GN : s === "delayed" ? RD : s === "loading" ? Y : BL;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Daily Revenue" value={`₹${(d.totalRevenue/1000).toFixed(0)}K`} icon={IndianRupee} color={GN} sub="Today's completed orders" />
        <KpiCard label="Active Orders" value={String(d.activeOrders)} icon={Package} color={BL} sub="Currently in delivery" />
        <KpiCard label="SLA Breaches" value={String(d.slaBreaches)} icon={AlertTriangle} color={RD} sub="60-min SLA exceeded" />
        <KpiCard label="Khata Credit" value={`₹${(d.khataCredit/100000).toFixed(1)}L`} icon={BookOpen} color={PU} sub="Total outstanding dues" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="font-black text-sm mb-1" style={{ color: DK }}>Orders Completed</p>
          <p className="text-xs text-gray-400 mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={d.sevenDayHistory} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: DK, border: "none", borderRadius: 8, color: "white", fontSize: 11 }} cursor={{ fill: Y + "20" }} />
              <Bar dataKey="orders" fill={Y} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="font-black text-sm mb-1" style={{ color: DK }}>Daily Revenue (₹)</p>
          <p className="text-xs text-gray-400 mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={d.sevenDayHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${Math.round(v/1000)}K`} />
              <Tooltip contentStyle={{ background: DK, border: "none", borderRadius: 8, color: "white", fontSize: 11 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
              <Line dataKey="revenue" stroke={GN} strokeWidth={2.5} dot={{ fill: GN, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SVG Fleet Map */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-black text-sm" style={{ color: DK }}>Live Fleet Map — Lucknow</p>
            <p className="text-xs text-gray-400">{fleet.length} vehicles tracked in real-time</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> LIVE
          </span>
        </div>
        <div className="relative" style={{ height: 200 }}>
          <svg viewBox="0 0 100 80" className="w-full h-full rounded-xl" style={{ background: "#EFF6FF" }}>
            {[20,40,60,80].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="80" stroke="#BFDBFE" strokeWidth="0.5" />)}
            {[20,40,60].map(y => <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#BFDBFE" strokeWidth="0.5" />)}
            <line x1="0" y1="40" x2="100" y2="40" stroke="#93C5FD" strokeWidth="1.2" />
            <line x1="50" y1="0" x2="50" y2="80" stroke="#93C5FD" strokeWidth="1.2" />
            <line x1="0" y1="10" x2="100" y2="70" stroke="#93C5FD" strokeWidth="0.8" strokeDasharray="2,2" />
            <circle cx="50" cy="40" r="4" fill={DK} />
            <text x="50" y="43" textAnchor="middle" fontSize="2.5" fill="white" fontWeight="900">HUB</text>
            <text x="4" y="5" fontSize="2.8" fill={DK} fontWeight="800" opacity="0.5">LUCKNOW</text>
            {[
              { x: 15, y: 18, l: "Indira Nagar" }, { x: 76, y: 18, l: "Gomti Nagar" },
              { x: 15, y: 64, l: "Alambagh"     }, { x: 76, y: 64, l: "Aliganj"     },
            ].map(a => <text key={a.l} x={a.x} y={a.y} fontSize="2.2" fill="#6B7280" textAnchor="middle" opacity="0.7">{a.l}</text>)}
            {fleet.map((v, i) => (
              <g key={v.id}>
                <circle cx={v.x} cy={v.y} r="3.5" fill={sc(v.status)} opacity="0.9" />
                <text x={v.x} y={v.y + 1.2} textAnchor="middle" fontSize="2.5" fill="white" fontWeight="900">{i + 1}</text>
                {v.status === "delayed" && (
                  <circle cx={v.x} cy={v.y} r="5" fill="none" stroke={RD} strokeWidth="0.5" strokeDasharray="1.5,1" opacity="0.7">
                    <animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            ))}
          </svg>
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            {[{ c: BL, l: "On Route" }, { c: Y, l: "Loading" }, { c: GN, l: "Delivered" }, { c: RD, l: "Delayed" }].map(lg => (
              <div key={lg.l} className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 shadow-sm">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: lg.c }} />
                <span className="text-[9px] font-bold text-gray-500">{lg.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {fleet.map((v, i) => (
            <div key={v.id} className="flex items-center gap-1.5 p-2 rounded-xl" style={{ background: sc(v.status) + "12" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0" style={{ background: sc(v.status) }}>{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[9px] font-black truncate" style={{ color: DK }}>{v.driver}</p>
                <p className="text-[8px] text-gray-400 truncate">{v.item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE 2 – ORDERS
═══════════════════════════════════════════════════════════════ */
function OrdersModule() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "breached" | "delivered">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api<AdminOrder[]>("/api/admin/orders").then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (filter === "active"    && o.status !== "placed")    return false;
    if (filter === "breached"  && !o.slaBreached)           return false;
    if (filter === "delivered" && o.status !== "delivered") return false;
    const q = search.toLowerCase();
    if (q && !o.shortId.toLowerCase().includes(q) && !o.site.toLowerCase().includes(q) && !o.items.toLowerCase().includes(q)) return false;
    return true;
  });

  const whatsapp = (o: AdminOrder) => toast.success(`WhatsApp sent to ${o.phone || "contractor"}`, {
    description: `"Order ${o.shortId} is on the way — ETA ${o.minsLeft}m. — CONON Infrabuilt"`,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input type="text" placeholder="Search order, site, or item…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-yellow-400 transition" />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(["all","active","breached","delivered"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
              style={{ background: filter === f ? (f === "breached" ? RD : DK) : "transparent", color: filter === f ? "white" : "#9CA3AF" }}>
              {f === "breached" ? "⚠ SLA" : f}
            </button>
          ))}
        </div>
        <button onClick={() => { setLoading(true); api<AdminOrder[]>("/api/admin/orders").then(setOrders).catch(() => {}).finally(() => setLoading(false)); }}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-yellow-400 transition">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",     value: orders.length,                              color: BL },
          { label: "Active",    value: orders.filter(o => o.status === "placed").length,    color: Y  },
          { label: "SLA Breach",value: orders.filter(o => o.slaBreached).length,  color: RD },
          { label: "🚜 Malba",  value: orders.filter(o => o.malba).length,        color: PU },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Order ID","Site","Items","Status","SLA","Total","Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-300 text-sm">Loading orders…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-300 text-sm">No orders match</td></tr>}
            {!loading && filtered.map(o => (
              <tr key={o.id} className={`border-b border-gray-50 last:border-0 transition-colors ${o.slaBreached ? "bg-red-50" : "hover:bg-gray-50"}`}>
                <td className="px-4 py-3 font-black text-[11px]" style={{ color: DK }}>{o.shortId}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-sm text-gray-800 max-w-[120px] truncate">{o.site}</p>
                  <p className="text-[10px] text-gray-400 max-w-[120px] truncate">{o.deliveryAddress}</p>
                </td>
                <td className="px-4 py-3 max-w-[160px]">
                  <p className="text-xs text-gray-600 font-semibold truncate">{o.items}</p>
                  {o.malba && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700">🚜 MALBA</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3"><SlaTimer minsLeft={o.minsLeft} breached={o.slaBreached} /></td>
                <td className="px-4 py-3 font-black text-sm" style={{ color: DK }}>₹{o.total.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => whatsapp(o)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-white bg-green-500 hover:bg-green-600 transition">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE 3 – CONON KHATA
═══════════════════════════════════════════════════════════════ */
function KhataModule() {
  const [khata, setKhata] = useState<Khata[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Khata | null>(null);
  const [payAmt, setPayAmt] = useState("");
  const [payMode, setPayMode] = useState<"Cash" | "UPI" | "RTGS">("UPI");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api<Khata[]>("/api/admin/khata").then(setKhata).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const recordPayment = async () => {
    if (!modal) return;
    const amt = Number(payAmt);
    if (!payAmt || isNaN(amt) || amt <= 0) { toast.error("Enter a valid payment amount"); return; }
    if (amt > modal.pending) {
      toast.error(`Amount exceeds pending dues of ₹${modal.pending.toLocaleString("en-IN")}`);
      return;
    }
    setPaying(true);
    try {
      await api(`/api/admin/khata/${modal.id}/payment`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, mode: payMode }),
      });
      setKhata(prev => prev.map(k => k.id === modal.id
        ? { ...k, pending: Math.max(0, k.pending - amt) } : k));
      toast.success(`₹${amt.toLocaleString("en-IN")} via ${payMode} recorded for ${modal.name}`);
      setModal(null); setPayAmt("");
    } catch { toast.error("Payment recording failed"); }
    finally { setPaying(false); }
  };

  const openInvoice = (k: Khata) => {
    window.open(apiUrl(`/api/admin/khata/${k.id}/invoice`), "_blank");
    toast.success(`Invoice for ${k.name} opened — use browser Print to save as PDF`);
  };

  const exportCsv = () => {
    const a = document.createElement("a");
    a.href = apiUrl("/api/admin/export/csv"); a.download = "CONON_Sales.csv"; a.click();
    toast.success("Monthly sales CSV downloading…");
  };

  const total = khata.reduce((s, k) => s + k.pending, 0);
  const overdue = khata.filter(k => k.overdueDays > 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Outstanding" value={`₹${(total/100000).toFixed(1)}L`} icon={IndianRupee} color={RD} />
        <KpiCard label="Credit Accounts" value={String(khata.length)} icon={User} color={BL} />
        <KpiCard label="Overdue Accounts" value={String(overdue)} icon={AlertTriangle} color={Y} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm" style={{ color: DK }}>Contractor Credit Ledger</h3>
        <button onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-black hover:opacity-90 transition"
          style={{ background: DK }}>
          <Download className="w-4 h-4" /> Export GST / CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Contractor","Credit Limit","Utilized","Pending Dues","Overdue","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-300">Loading ledger…</td></tr>}
            {khata.map(k => {
              const pct = Math.round((k.utilized / k.creditLimit) * 100);
              return (
                <tr key={k.id} className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 ${k.overdueDays > 14 ? "bg-red-50" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-black text-sm text-gray-800">{k.name}</p>
                    <p className="text-[10px] text-gray-400">📞 +91 {k.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-sm text-gray-700">₹{(k.creditLimit/1000).toFixed(0)}K</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-sm text-gray-700">₹{(k.utilized/1000).toFixed(0)}K</p>
                    <div className="mt-1 h-1.5 rounded-full bg-gray-100 w-20">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 85 ? RD : Y }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`font-black text-sm ${k.pending > 0 ? "text-red-600" : "text-green-600"}`}>
                      {k.pending > 0 ? `₹${(k.pending/1000).toFixed(0)}K` : "✓ Clear"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {k.overdueDays > 0
                      ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: RD + "18", color: RD }}>{k.overdueDays}d overdue</span>
                      : <span className="text-[10px] font-black text-green-600">✓ On Time</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openInvoice(k)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition">
                        <FileText className="w-3 h-3" /> PDF
                      </button>
                      {k.pending > 0 && (
                        <button onClick={() => { setModal(k); setPayAmt(""); }}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-black text-white hover:opacity-90 transition"
                          style={{ background: GN }}>
                          Record Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg" style={{ color: DK }}>Record Payment</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="font-black text-sm" style={{ color: DK }}>{modal.name}</p>
              <p className="text-xs text-gray-400">Pending: ₹{modal.pending.toLocaleString("en-IN")}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Amount (₹)</label>
                <input type="number" placeholder="Enter amount" value={payAmt} onChange={e => setPayAmt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-lg focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Cash","UPI","RTGS"] as const).map(m => (
                    <button key={m} onClick={() => setPayMode(m)}
                      className="py-2.5 rounded-xl text-sm font-black border-2 transition-all"
                      style={{ borderColor: payMode === m ? Y : "#E5E7EB", background: payMode === m ? Y + "18" : "white", color: payMode === m ? "#92400E" : MID }}>
                      {m === "Cash" ? "💵" : m === "UPI" ? "📱" : "🏦"} {m}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={recordPayment} disabled={paying || !payAmt}
                className="w-full py-3 rounded-xl text-white font-black text-sm disabled:opacity-50 transition"
                style={{ background: DK }}>
                {paying ? "Recording…" : "✓ Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE 4 – FLEET & DRIVERS
═══════════════════════════════════════════════════════════════ */
function FleetModule() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState<string | null>(null);

  useEffect(() => {
    api<Driver[]>("/api/admin/drivers").then(setDrivers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const settle = async (d: Driver) => {
    setSettling(d.id);
    try {
      await api(`/api/admin/drivers/${d.id}/settle`, { method: "POST" });
      setDrivers(prev => prev.map(x => x.id === d.id ? { ...x, settled: true } : x));
      toast.success(`₹${d.earnings.toLocaleString("en-IN")} payout sent to ${d.name}`);
    } catch { toast.error("Payout failed — try again"); }
    finally { setSettling(null); }
  };

  const settleAll = async () => {
    for (const d of drivers.filter(x => !x.settled)) await settle(d);
  };

  const totalPending = drivers.filter(d => !d.settled).reduce((s, d) => s + d.earnings, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Active Drivers" value={String(drivers.filter(d => d.status === "active").length)} icon={Truck} color={BL} />
        <KpiCard label="Total Trips This Week" value={String(drivers.reduce((s, d) => s + d.tripsThisWeek, 0))} icon={Activity} color={GN} />
        <KpiCard label="Pending Payouts" value={`₹${(totalPending/1000).toFixed(1)}K`} icon={IndianRupee} color={Y} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm" style={{ color: DK }}>Driver Earnings — This Week</h3>
        {totalPending > 0 && (
          <button onClick={settleAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-black hover:opacity-90 transition"
            style={{ background: GN }}>
            <CheckCircle className="w-4 h-4" /> Settle All (₹{totalPending.toLocaleString("en-IN")})
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Driver","Vehicle","Status","Trips","Rate","Total Earned","Payout"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-300">Loading…</td></tr>}
            {drivers.map(d => (
              <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ background: d.status === "active" ? GN : MID }}>{d.name.charAt(0)}</div>
                    <p className="font-bold text-sm text-gray-800">{d.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-semibold">{d.vehicle}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {d.status === "active" ? "🟢 Active" : "🔴 Off Duty"}
                  </span>
                </td>
                <td className="px-4 py-3 font-black text-sm" style={{ color: DK }}>{d.tripsThisWeek}</td>
                <td className="px-4 py-3 text-xs text-gray-400">₹600/trip</td>
                <td className="px-4 py-3 font-black text-sm" style={{ color: DK }}>₹{d.earnings.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  {d.settled
                    ? <span className="flex items-center gap-1 text-[10px] font-black text-green-600"><CheckCircle className="w-3 h-3" /> Cleared</span>
                    : <button onClick={() => settle(d)} disabled={settling === d.id}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black disabled:opacity-50 hover:opacity-90 transition"
                        style={{ background: Y, color: DK }}>
                        {settling === d.id ? "…" : "Settle Payout"}
                      </button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
        <p className="text-xs font-black text-yellow-700 uppercase tracking-wider mb-1">Payout Structure</p>
        <p className="text-xs text-yellow-600 font-semibold">
          ₹600 per delivery trip · Settled weekly every Sunday · UPI transfer to registered driver accounts.
          Equipment operators (JCB/Loader) earn ₹800/trip.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE 5 – CATALOG & MANDI RATES
═══════════════════════════════════════════════════════════════ */
const FALLBACK_MANDI = [
  { id: 1, material: "Cement OPC 53 (Per Bag)", unit: "50kg bag", currentPrice: "410", previousPrice: "395", change: "+15", trend: "up"    },
  { id: 2, material: "TMT Steel Fe500",          unit: "Per MT",   currentPrice: "68000", previousPrice: "67000", change: "+1000", trend: "up" },
  { id: 3, material: "River Sand (M-Sand)",      unit: "Per MT",   currentPrice: "1200", previousPrice: "1250", change: "-50",  trend: "down"  },
  { id: 4, material: "Morang (Aggregate)",       unit: "Per MT",   currentPrice: "950",  previousPrice: "920",  change: "+30",  trend: "up"    },
  { id: 5, material: "Red Clay Bricks",          unit: "Per 1000", currentPrice: "7500", previousPrice: "7500", change: "0",    trend: "stable"},
];

function MandiRow({ m, onSaved }: { m: MandiPrice; onSaved: (mat: string, price: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(m.currentPrice);
  const [saving, setSaving] = useState(false);
  const change = parseFloat(String(m.change));
  const tc = m.trend === "up" ? RD : m.trend === "down" ? GN : MID;
  const ti = m.trend === "up" ? "▲" : m.trend === "down" ? "▼" : "–";

  const save = async () => {
    const price = Number(val);
    if (!price || isNaN(price)) return;
    setSaving(true);
    try {
      await api(`/api/admin/mandi/${encodeURIComponent(m.material)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      onSaved(m.material, price);
      setEditing(false);
      toast.success(`${m.material} updated to ₹${price}`);
    } catch { toast.error("Rate update failed"); }
    finally { setSaving(false); }
  };

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-bold text-sm text-gray-800">{m.material}</td>
      <td className="px-4 py-3 text-xs text-gray-400">{m.unit}</td>
      <td className="px-4 py-3 font-black text-sm" style={{ color: DK }}>₹{parseFloat(m.currentPrice).toLocaleString("en-IN")}</td>
      <td className="px-4 py-3 text-xs text-gray-400">₹{parseFloat(m.previousPrice).toLocaleString("en-IN")}</td>
      <td className="px-4 py-3"><span className="text-xs font-black" style={{ color: tc }}>{change > 0 ? "+" : ""}{change}</span></td>
      <td className="px-4 py-3 text-sm font-black" style={{ color: tc }}>{ti}</td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex items-center gap-1">
            <input type="number" value={val} onChange={e => setVal(e.target.value)} autoFocus
              className="w-24 px-2 py-1 border border-yellow-300 rounded-lg text-xs font-bold focus:outline-none" />
            <button onClick={save} disabled={saving}
              className="px-2 py-1 rounded-lg text-[10px] font-black text-white disabled:opacity-50" style={{ background: GN }}>
              {saving ? "…" : "✓"}
            </button>
            <button onClick={() => setEditing(false)} className="px-1.5 py-1 rounded-lg hover:bg-gray-100">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        ) : (
          <button onClick={() => { setVal(m.currentPrice); setEditing(true); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black border border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition">
            <Edit3 className="w-3 h-3" /> Update
          </button>
        )}
      </td>
    </tr>
  );
}

function CatalogModule() {
  const [mandi, setMandi] = useState<MandiPrice[]>([]);
  const [inventory, setInventory] = useState([
    { id: "i1", name: "OPC 53 Grade — 50kg bag",   category: "Cement",    inStock: true  },
    { id: "i2", name: "PPC — 50kg bag",             category: "Cement",    inStock: true  },
    { id: "i3", name: "TMT Steel Fe500 — 12mm",     category: "Steel",     inStock: true  },
    { id: "i4", name: "River Sand — per MT",         category: "Sand",      inStock: false },
    { id: "i5", name: "Red Clay Bricks — per 1000", category: "Bricks",    inStock: true  },
    { id: "i6", name: "Morang Aggregate — per MT",  category: "Aggregate", inStock: true  },
  ]);
  const [equipment, setEquipment] = useState([
    { id: "e1", name: "JCB 3DX Excavator",   rate: 2500, available: true  },
    { id: "e2", name: "Transit Mixer (6m³)",  rate: 3200, available: false },
    { id: "e3", name: "Tower Crane (50T)",    rate: 8000, available: true  },
    { id: "e4", name: "Mobile Batching Plant",rate: 6500, available: true  },
  ]);

  useEffect(() => { api<MandiPrice[]>("/api/admin/mandi").then(setMandi).catch(() => setMandi(FALLBACK_MANDI as any)); }, []);

  const handleSaved = (material: string, price: number) => {
    setMandi(prev => prev.map(m => {
      if (m.material !== material) return m;
      const prevPrice = parseFloat(m.currentPrice);
      const change = +(price - prevPrice).toFixed(2);
      return {
        ...m,
        previousPrice: m.currentPrice,
        currentPrice: String(price),
        change: String(change),
        trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      };
    }));
  };

  const rows = mandi.length > 0 ? mandi : FALLBACK_MANDI as MandiPrice[];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-black text-sm mb-1" style={{ color: DK }}>Live Mandi Rate Controller</p>
        <p className="text-xs text-gray-400 mb-3">Changes here update the app's live price ticker instantly</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Material","Unit","Current Price","Prev Price","Change","Trend","Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(m => <MandiRow key={m.material} m={m} onSaved={handleSaved} />)}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="font-black text-sm mb-3" style={{ color: DK }}>Inventory Status</p>
        <div className="grid grid-cols-3 gap-3">
          {inventory.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl p-4 border transition-all ${item.inStock ? "border-green-100" : "border-red-100"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${item.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {item.category}
                </span>
                <button onClick={() => setInventory(prev => prev.map(i => i.id === item.id ? { ...i, inStock: !i.inStock } : i))}>
                  {item.inStock
                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                    : <ToggleLeft  className="w-6 h-6 text-gray-300" />}
                </button>
              </div>
              <p className="text-xs font-bold text-gray-700 leading-snug">{item.name}</p>
              <p className={`text-[10px] font-black mt-1 ${item.inStock ? "text-green-600" : "text-red-500"}`}>
                {item.inStock ? "✓ In Stock" : "✗ Out of Stock"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-black text-sm mb-3" style={{ color: DK }}>Equipment Rentals</p>
        <div className="grid grid-cols-2 gap-3">
          {equipment.map(eq => (
            <div key={eq.id} className={`bg-white rounded-2xl p-4 border ${eq.available ? "border-blue-100" : "border-gray-100"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-sm text-gray-800">{eq.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">₹{eq.rate.toLocaleString("en-IN")}/day</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${eq.available ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                    {eq.available ? "Available" : "Booked"}
                  </span>
                  <button onClick={() => setEquipment(prev => prev.map(e => e.id === eq.id ? { ...e, available: !e.available } : e))}
                    className="text-[9px] font-black px-2 py-0.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition">
                    Toggle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE 6 – USER & VENDOR ACCESS CONTROL
═══════════════════════════════════════════════════════════════ */
function UsersModule() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"contractor" | "vendor" | "driver">("contractor");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "banned">("all");
  const [pincodeModal, setPincodeModal] = useState<AppUser | null>(null);
  const [newPincode, setNewPincode] = useState("");
  const [newZone, setNewZone] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api<AppUser[]>("/api/admin/users").then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const changeStatus = async (user: AppUser, status: "active" | "banned") => {
    setSaving(user.id);
    try {
      await api(`/api/admin/users/${user.id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status } : u));
      toast.success(`${user.name} ${status === "active" ? "approved" : "banned"}`);
    } catch { toast.error("Action failed"); }
    finally { setSaving(null); }
  };

  const assignPincode = async () => {
    if (!pincodeModal) return;
    setSaving(pincodeModal.id);
    try {
      await api(`/api/admin/users/${pincodeModal.id}/pincode`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: newPincode, zone: newZone }),
      });
      setUsers(prev => prev.map(u => u.id === pincodeModal.id ? { ...u, pincode: newPincode, zone: newZone } : u));
      toast.success(`Zone assigned to ${pincodeModal.name}`);
      setPincodeModal(null);
    } catch { toast.error("Assignment failed"); }
    finally { setSaving(null); }
  };

  const filtered = users.filter(u => {
    if (u.role !== tab) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.zone.toLowerCase().includes(q) && !u.pincode.includes(q)) return false;
    return true;
  });

  const counts = {
    contractor: users.filter(u => u.role === "contractor").length,
    vendor:     users.filter(u => u.role === "vendor").length,
    driver:     users.filter(u => u.role === "driver").length,
    pending:    users.filter(u => u.status === "pending").length,
    banned:     users.filter(u => u.status === "banned").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Contractors" value={String(counts.contractor)} icon={User} color={BL} />
        <KpiCard label="Vendors" value={String(counts.vendor)} icon={Tag} color={GN} />
        <KpiCard label="Drivers" value={String(counts.driver)} icon={Truck} color={PU} />
        <KpiCard label="Pending Approval" value={String(counts.pending)} icon={AlertTriangle} color={Y} sub={counts.banned > 0 ? `${counts.banned} banned` : undefined} />
      </div>

      {/* Tabs + filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(["contractor","vendor","driver"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-xs font-black uppercase transition-all capitalize"
              style={{ background: tab === t ? DK : "transparent", color: tab === t ? "white" : "#9CA3AF" }}>
              {t === "contractor" ? `🏗 Contractors (${counts.contractor})` : t === "vendor" ? `🏪 Vendors (${counts.vendor})` : `🚛 Drivers (${counts.driver})`}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input type="text" placeholder={`Search ${tab}s…`} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-yellow-400 transition" />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(["all","active","pending","banned"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
              style={{ background: statusFilter === f ? (f === "banned" ? RD : f === "pending" ? Y : DK) : "transparent", color: statusFilter === f ? "white" : "#9CA3AF" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Name","Contact","Zone / Pincode","Category","Orders","Rating","Status","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-300">Loading users…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-300">No {tab}s found</td></tr>}
            {!loading && filtered.map(u => (
              <tr key={u.id} className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 ${u.status === "pending" ? "bg-yellow-50" : u.status === "banned" ? "bg-red-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ background: u.status === "banned" ? RD : u.status === "pending" ? Y : GN }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-800">{u.name}</p>
                      <p className="text-[9px] text-gray-400">Since {u.joinedAt}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-600">📞 {u.phone}</p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-bold text-gray-700">{u.zone}</p>
                  <p className="text-[10px] text-gray-400">📍 {u.pincode}</p>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-500">{u.category}</td>
                <td className="px-4 py-3 font-black text-sm" style={{ color: DK }}>{u.ordersCount}</td>
                <td className="px-4 py-3">
                  {u.rating > 0
                    ? <span className="text-xs font-black text-yellow-500">★ {u.rating}</span>
                    : <span className="text-[10px] text-gray-300">New</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {u.status !== "active" && (
                      <button onClick={() => changeStatus(u, "active")} disabled={saving === u.id}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black text-white disabled:opacity-50 hover:opacity-90 transition"
                        style={{ background: GN }}>
                        <UserCheck className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {u.status !== "banned" && (
                      <button onClick={() => changeStatus(u, "banned")} disabled={saving === u.id}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black text-white disabled:opacity-50 hover:opacity-90 transition"
                        style={{ background: RD }}>
                        <Ban className="w-3 h-3" /> Ban
                      </button>
                    )}
                    {u.role === "vendor" && (
                      <button onClick={() => { setPincodeModal(u); setNewPincode(u.pincode); setNewZone(u.zone); }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition">
                        <MapPin className="w-3 h-3" /> Zone
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pincode Modal */}
      {pincodeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPincodeModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base" style={{ color: DK }}>Assign Loading Zone</h3>
              <button onClick={() => setPincodeModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="font-black text-sm" style={{ color: DK }}>{pincodeModal.name}</p>
              <p className="text-xs text-gray-400">Currently: {pincodeModal.zone} · {pincodeModal.pincode}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Zone / Area Name</label>
                <input type="text" placeholder="e.g. Gomti Nagar" value={newZone} onChange={e => setNewZone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Pincode</label>
                <input type="text" placeholder="e.g. 226010" maxLength={6} value={newPincode} onChange={e => setNewPincode(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-yellow-400" />
              </div>
              <button onClick={assignPincode} disabled={saving === pincodeModal.id || (!newPincode && !newZone)}
                className="w-full py-2.5 rounded-xl text-white font-black text-sm disabled:opacity-50 transition"
                style={{ background: DK }}>
                {saving === pincodeModal.id ? "Saving…" : "✓ Assign Zone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE – VENDOR PAYOUTS
═══════════════════════════════════════════════════════════════ */
interface AdminPayout {
  id: string;
  vendorStore: string;
  amount: number;
  status: "pending" | "approved";
  requestedAt: string;
  approvedAt: string | null;
}

function PayoutsModule() {
  const [rows, setRows] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api<AdminPayout[]>("/api/admin/payouts")
      .then(setRows)
      .catch(() => toast.error("Failed to load payout requests"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (p: AdminPayout) => {
    setBusy(p.id);
    try {
      const updated = await api<AdminPayout>(`/api/admin/payouts/${p.id}/approve`, { method: "POST" });
      setRows(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      toast.success(`Payout approved · ${p.vendorStore}`);
    } catch {
      toast.error("Could not approve payout");
    } finally {
      setBusy(null);
    }
  };

  const pending = rows.filter(r => r.status === "pending");
  const totalPending = pending.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Pending Requests" value={String(pending.length)} icon={Clock} color={Y} />
        <KpiCard label="Pending Amount" value={`₹${totalPending.toLocaleString("en-IN")}`} icon={IndianRupee} color={RD} />
        <KpiCard label="Total Requests" value={String(rows.length)} icon={FileText} color={BL} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-sm" style={{ color: DK }}>Vendor Payout Requests</h3>
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-bold text-gray-300">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm font-bold text-gray-300">No payout requests yet</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-50">
                <th className="px-5 py-3">Vendor Store</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3.5 text-sm font-bold" style={{ color: DK }}>{p.vendorStore}</td>
                  <td className="px-5 py-3.5 text-sm font-black" style={{ color: DK }}>₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(p.requestedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                      style={{ background: (p.status === "approved" ? GN : Y) + "18", color: p.status === "approved" ? GN : Y }}>
                      {p.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {p.status === "pending" ? (
                      <button onClick={() => approve(p)} disabled={busy === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black text-white transition active:scale-95 disabled:opacity-60"
                        style={{ background: GN }}>
                        <CheckCircle className="w-3.5 h-3.5" /> {busy === p.id ? "…" : "Approve"}
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-300">
                        {p.approvedAt ? new Date(p.approvedAt).toLocaleDateString("en-IN") : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT LAYOUT
═══════════════════════════════════════════════════════════════ */
type Module = "overview" | "orders" | "khata" | "fleet" | "catalog" | "users" | "payouts" | "settings";

function SettingsModule() {
  const LABELS = {
    emailAlerts: "Email alerts",
    slaAlerts: "SLA breach alerts",
    autoApprove: "Auto-approve new vendors",
    compact: "Compact table density",
  } as const;
  type SKey = keyof typeof LABELS;
  const [settings, setSettings] = useState<Record<SKey, boolean>>(() => ({
    emailAlerts: localStorage.getItem("conon_admin_emailAlerts") !== "false",
    slaAlerts: localStorage.getItem("conon_admin_slaAlerts") !== "false",
    autoApprove: localStorage.getItem("conon_admin_autoApprove") === "true",
    compact: localStorage.getItem("conon_admin_compact") === "true",
  }));
  const toggle = (k: SKey) =>
    setSettings(prev => {
      const next = { ...prev, [k]: !prev[k] };
      localStorage.setItem(`conon_admin_${k}`, String(next[k]));
      toast.success(`${LABELS[k]} ${next[k] ? "enabled" : "disabled"}`);
      return next;
    });
  return (
    <div className="max-w-2xl space-y-3">
      {(Object.keys(LABELS) as SKey[]).map(k => (
        <div key={k} className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 shadow-sm">
          <span className="text-sm font-bold" style={{ color: DK }}>{LABELS[k]}</span>
          <button onClick={() => toggle(k)} aria-label={`Toggle ${LABELS[k]}`} className="active:scale-90 transition">
            {settings[k]
              ? <ToggleRight className="w-9 h-9" style={{ color: GN }} />
              : <ToggleLeft className="w-9 h-9 text-gray-300" />}
          </button>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { logout } = useUser();
  const [active, setActive] = useState<Module>("overview");

  const handleLogout = () => { logout(); setLocation("/login"); };

  const nav: { id: Module; icon: LucideIcon; label: string }[] = [
    { id: "overview", icon: LayoutDashboard, label: "God-Eye"          },
    { id: "orders",   icon: Package,         label: "Orders"            },
    { id: "khata",    icon: BookOpen,         label: "Conon Khata"      },
    { id: "fleet",    icon: Truck,            label: "Fleet & Drivers"  },
    { id: "catalog",  icon: Tag,              label: "Catalog & Mandi"  },
    { id: "users",    icon: Users,            label: "Users & Vendors"  },
    { id: "payouts",  icon: IndianRupee,      label: "Vendor Payouts"   },
  ];

  const titles: Record<Module, { t: string; s: string }> = {
    overview: { t: "God-Eye Dashboard",         s: "Real-time analytics, charts & live fleet map"     },
    orders:   { t: "Order Operations",           s: "Live orders with SLA countdown tracking"          },
    khata:    { t: "Conon Khata — Finance",      s: "Contractor credit ledger, payments & PDF invoices"},
    fleet:    { t: "Fleet & Driver Payouts",     s: "Per-trip earnings & weekly payout settlement"     },
    catalog:  { t: "Catalog & Mandi Rates",      s: "Live price controller, inventory & rentals"       },
    users:    { t: "User & Vendor Access Control",s: "Approve, ban, and assign zones to all users"     },
    payouts:  { t: "Vendor Payouts",              s: "Review & approve vendor withdrawal requests"     },
    settings: { t: "Settings",                    s: "Notification, approval & display preferences"    },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F9FAFB" }}>
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 shrink-0 shadow-sm z-20" style={{ background: DK }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: Y }}>
            <ShieldCheck className="w-4 h-4" style={{ color: DK }} />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">CONON Infrabuilt</p>
            <p className="text-[10px] font-bold leading-none mt-0.5" style={{ color: Y }}>Admin Control Room · Full Access</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> LIVE
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#ffffff18" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: Y }}>
              <User className="w-3.5 h-3.5" style={{ color: DK }} />
            </div>
            <span className="text-white text-xs font-bold">CEO Admin</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-red-500 transition"
            style={{ background: "#ffffff18", color: "white" }}>
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 flex flex-col py-4" style={{ background: "#111827", borderRight: "1px solid #1F2937" }}>
          <nav className="flex-1 px-3 space-y-0.5">
            {nav.map(item => {
              const Icon = item.icon;
              const on = active === item.id;
              return (
                <button key={item.id} onClick={() => setActive(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{ background: on ? Y + "20" : "transparent", borderLeft: `3px solid ${on ? Y : "transparent"}` }}>
                  <Icon className="w-4 h-4 shrink-0" style={{ color: on ? Y : "#6B7280" }} />
                  <span className="text-sm font-bold" style={{ color: on ? Y : "#9CA3AF" }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="px-3 pt-4 mt-4 border-t" style={{ borderColor: "#1F2937" }}>
            <button onClick={() => setActive("settings")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 active:scale-95 transition"
              style={{ background: active === "settings" ? Y + "20" : "transparent" }}>
              <Settings className="w-4 h-4" style={{ color: active === "settings" ? Y : "#4B5563" }} />
              <span className="text-sm font-bold" style={{ color: active === "settings" ? Y : "#6B7280" }}>Settings</span>
            </button>
            <p className="text-[8px] font-bold px-3 mt-2" style={{ color: "#374151" }}>CONON Infrabuilt v2.0 · 🇮🇳</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-xl font-black" style={{ color: DK }}>{titles[active].t}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{titles[active].s}</p>
          </div>
          {active === "overview" && <GodEyeModule />}
          {active === "orders"   && <OrdersModule />}
          {active === "khata"    && <KhataModule  />}
          {active === "fleet"    && <FleetModule  />}
          {active === "catalog"  && <CatalogModule />}
          {active === "users"    && <UsersModule  />}
          {active === "payouts"  && <PayoutsModule />}
          {active === "settings" && <SettingsModule />}
        </main>
      </div>
    </div>
  );
}
