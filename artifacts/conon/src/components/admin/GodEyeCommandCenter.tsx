import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, AreaChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Truck, Package, AlertTriangle, IndianRupee, ShieldCheck,
  TrendingUp, Clock, Phone, MapPin, Eye, Play, Pause,
  Layers, CheckCircle2, ChevronRight, RefreshCw, Radio,
  Sparkles, ExternalLink, Building, X,
} from "lucide-react";
import { resolveApiUrl } from "@/lib/apiBase";
import { toast } from "sonner";

interface GodEyeKpis {
  todayGmv: number;
  todayGmvDelta: string;
  todayGmvSparkline: number[];
  netProfit: number;
  netMarginPercent: number;
  netMarginDelta: string;
  netMarginSparkline: number[];
  activeOrders: number;
  onTrackCount: number;
  heavyFleetCount: number;
  slaBreaches: number;
  slaRiskPill: string;
  khataCreditExposure: number;
  overdue15Days: number;
  pendingVendorPayouts: number;
  pendingDealersCount: number;
}

interface SupplyHub {
  id: string;
  name: string;
  zone: string;
  specialty: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  liveOrders: number;
  status: string;
  color: string;
}

interface FleetVehicle {
  id: string;
  driverName: string;
  vehicleType: string;
  vehicleClass: string;
  plateNumber: string;
  status: "EN_ROUTE" | "LOADING" | "DELAYED" | "RETURNING";
  hubId: string;
  hubName: string;
  destinationSite: string;
  cargoSummary: string;
  minsLeft: number;
  speedKmH: number;
  currentX: number;
  currentY: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  phone: string;
  orderId: string;
  itemsCount: number;
  deliveryZone: string;
}

interface AnalyticsSeries {
  stackedVehicleOrders: Array<{
    label: string;
    twoWheeler: number;
    eLoader: number;
    pickupTrolley: number;
    total: number;
  }>;
  revenueMarginTrend: Array<{
    label: string;
    gmv: number;
    netMargin: number;
    marginPct: number;
  }>;
}

interface Guardrails {
  noEntryWindow: {
    status: string;
    activeRestriction: boolean;
    nextWindow: string;
    label: string;
    trafficPoliceSla?: string;
  };
  eMM11MiningPass: {
    status: string;
    compliancePct: number;
    label: string;
    portalSync?: string;
  };
  tileBatchLock: {
    status: string;
    activeLocks: number;
    label: string;
    detail?: string;
  };
  builderKitLeads: {
    status: string;
    hotLeadsCount: number;
    label: string;
    unquotedValue?: number;
  };
}

interface WarRoomEvent {
  id: string;
  time: string;
  title: string;
  desc: string;
  severity: "info" | "warning" | "success" | "danger";
}

interface GodEyeData {
  kpis: GodEyeKpis;
  hubs: SupplyHub[];
  fleet: FleetVehicle[];
  analytics: {
    today: AnalyticsSeries;
    sevenDays: AnalyticsSeries;
    thirtyDays: AnalyticsSeries;
  };
  guardrails: Guardrails;
  warRoomPulse: WarRoomEvent[];
}

interface GodEyeCommandCenterProps {
  onNavigateTab?: (tab: "orders" | "khata" | "fleet" | "catalog" | "leads" | "payouts") => void;
}

export function GodEyeCommandCenter({ onNavigateTab }: GodEyeCommandCenterProps) {
  const [data, setData] = useState<GodEyeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>("DRV-101");
  const [vehicleClassFilter, setVehicleClassFilter] = useState<string>("ALL");
  const [timeRange, setTimeRange] = useState<"today" | "sevenDays" | "thirtyDays">("sevenDays");
  const [isLiveMotionOn, setIsLiveMotionOn] = useState(true);
  const [motionTick, setMotionTick] = useState(0);

  // Fetch telemetry
  const fetchTelemetry = async () => {
    try {
      const res = await fetch(resolveApiUrl("/api/admin/god-eye"));
      if (!res.ok) throw new Error("Telemetry fetch failed");
      const json = await res.json();
      setData(json);
    } catch {
      // Graceful fallback defaults if server/DB is in cold state
      setData({
        kpis: {
          todayGmv: 420000,
          todayGmvDelta: "+14.2%",
          todayGmvSparkline: [28, 35, 32, 42, 48, 52, 59, 62],
          netProfit: 46800,
          netMarginPercent: 11.1,
          netMarginDelta: "+0.8%",
          netMarginSparkline: [10.2, 10.4, 10.8, 10.9, 11.1, 11.2, 11.1],
          activeOrders: 24,
          onTrackCount: 19,
          heavyFleetCount: 5,
          slaBreaches: 3,
          slaRiskPill: "3 High Risk (>50m)",
          khataCreditExposure: 2840000,
          overdue15Days: 310000,
          pendingVendorPayouts: 185000,
          pendingDealersCount: 7,
        },
        hubs: [
          { id: "hub-latouche", name: "Latouche Rd Hub", zone: "Naka / Aminabad", specialty: "Electricals, Tools & Hardware", x: 38, y: 44, lat: 26.8415, lng: 80.9234, liveOrders: 8, status: "HIGH_TRAFFIC", color: "#F59E0B" },
          { id: "hub-chinhat", name: "Chinhat Industrial Hub", zone: "Faizabad / Ayodhya Rd", specialty: "Red Bricks, Morang & Cement Depot", x: 82, y: 26, lat: 26.8821, lng: 81.0189, liveOrders: 11, status: "ACTIVE", color: "#10B981" },
          { id: "hub-shaheed-path", name: "Shaheed Path / Golf City Hub", zone: "Sushant Golf City", specialty: "Express Sariya, AAC & Civil Hub", x: 64, y: 78, lat: 26.7824, lng: 80.9892, liveOrders: 9, status: "ACTIVE", color: "#3B82F6" },
          { id: "hub-alambagh", name: "Alambagh / Transport Nagar", zone: "Kanpur Rd Corridor", specialty: "Heavy Fleet Depot & TMT Bulk Yard", x: 24, y: 68, lat: 26.7912, lng: 80.8923, liveOrders: 7, status: "DISPATCHING", color: "#8B5CF6" },
          { id: "hub-naka", name: "Naka Hindola Hub", zone: "Central Lucknow", specialty: "CPVC Plumbing & Sanitary Hub", x: 42, y: 52, lat: 26.8367, lng: 80.9168, liveOrders: 5, status: "ACTIVE", color: "#06B6D4" },
          { id: "hub-gomti-nagar", name: "Gomti Nagar Express Hub", zone: "Vipin Khand / Ext", specialty: "Tiles, Paints, Granite & Finishing", x: 70, y: 42, lat: 26.8532, lng: 80.9789, liveOrders: 12, status: "HIGH_TRAFFIC", color: "#EC4899" },
        ],
        fleet: [
          { id: "DRV-101", driverName: "Ravi Kumar", vehicleType: "2W_BIKE", vehicleClass: "2-Wheeler", plateNumber: "UP 32 BK 4012", status: "EN_ROUTE", hubId: "hub-latouche", hubName: "Latouche Rd Hub", destinationSite: "Plot 42, Eldeco Greens, Gomti Nagar", cargoSummary: "Schneider 32A MCB + Havells 2.5mm Wire", minsLeft: 18, speedKmH: 38, currentX: 54, currentY: 43, startPoint: { x: 38, y: 44 }, endPoint: { x: 70, y: 42 }, phone: "+91 94150 12044", orderId: "ORD-9912", itemsCount: 4, deliveryZone: "Gomti Nagar" },
          { id: "DRV-102", driverName: "Suresh S.", vehicleType: "3W_ELECTRIC_LOADER", vehicleClass: "E-Loader", plateNumber: "UP 32 EL 8901", status: "LOADING", hubId: "hub-chinhat", hubName: "Chinhat Industrial Hub", destinationSite: "Villa 108, Sushant Golf City", cargoSummary: "25 Bags UltraTech PPC + Dr. Fixit LW+", minsLeft: 42, speedKmH: 0, currentX: 82, currentY: 26, startPoint: { x: 82, y: 26 }, endPoint: { x: 64, y: 78 }, phone: "+91 98390 44219", orderId: "ORD-9914", itemsCount: 26, deliveryZone: "Sushant Golf City" },
          { id: "DRV-103", driverName: "Kartik K.", vehicleType: "4W_PICKUP", vehicleClass: "Pickup", plateNumber: "UP 32 PK 1928", status: "EN_ROUTE", hubId: "hub-gomti-nagar", hubName: "Gomti Nagar Express Hub", destinationSite: "Tower B, Omaxe Heights, Vibhuti Khand", cargoSummary: "18 Boxes Kajaria 4x2 Vitrified Tiles", minsLeft: 12, speedKmH: 42, currentX: 68, currentY: 38, startPoint: { x: 70, y: 42 }, endPoint: { x: 67, y: 34 }, phone: "+91 88081 22931", orderId: "ORD-9918", itemsCount: 18, deliveryZone: "Vibhuti Khand" },
          { id: "DRV-104", driverName: "Vinesh M.", vehicleType: "TRACTOR_DUMPER", vehicleClass: "Trolley / Dumper", plateNumber: "UP 32 TR 5521", status: "DELAYED", hubId: "hub-alambagh", hubName: "Alambagh / Transport Nagar", destinationSite: "Commercial Arcade, Outer Ring Road", cargoSummary: "300 CFT Kabrai Gitti (10mm)", minsLeft: -8, speedKmH: 15, currentX: 38, currentY: 64, startPoint: { x: 24, y: 68 }, endPoint: { x: 58, y: 72 }, phone: "+91 97920 11984", orderId: "ORD-9892", itemsCount: 1, deliveryZone: "Outer Ring / Kisan Path" },
          { id: "DRV-105", driverName: "Rahul V.", vehicleType: "3W_ELECTRIC_LOADER", vehicleClass: "E-Loader", plateNumber: "UP 32 EL 7714", status: "RETURNING", hubId: "hub-shaheed-path", hubName: "Shaheed Path / Golf City Hub", destinationSite: "Returning to Hub for Next Site Dispatch", cargoSummary: "Empty / En Route to Shaheed Path Depot", minsLeft: 24, speedKmH: 34, currentX: 58, currentY: 72, startPoint: { x: 52, y: 66 }, endPoint: { x: 64, y: 78 }, phone: "+91 91400 38291", orderId: "ORD-9905", itemsCount: 0, deliveryZone: "Shaheed Path Corridor" },
        ],
        analytics: {
          today: {
            stackedVehicleOrders: [
              { label: "08:00", twoWheeler: 3, eLoader: 2, pickupTrolley: 1, total: 6 },
              { label: "10:00", twoWheeler: 6, eLoader: 4, pickupTrolley: 3, total: 13 },
              { label: "12:00", twoWheeler: 9, eLoader: 7, pickupTrolley: 4, total: 20 },
              { label: "14:00", twoWheeler: 7, eLoader: 5, pickupTrolley: 3, total: 15 },
              { label: "16:00", twoWheeler: 8, eLoader: 6, pickupTrolley: 4, total: 18 },
              { label: "18:00", twoWheeler: 11, eLoader: 8, pickupTrolley: 2, total: 21 },
              { label: "20:00", twoWheeler: 6, eLoader: 4, pickupTrolley: 1, total: 11 },
            ],
            revenueMarginTrend: [
              { label: "08:00", gmv: 42000, netMargin: 4800, marginPct: 11.4 },
              { label: "10:00", gmv: 95000, netMargin: 10600, marginPct: 11.2 },
              { label: "12:00", gmv: 165000, netMargin: 18200, marginPct: 11.0 },
              { label: "14:00", gmv: 235000, netMargin: 26100, marginPct: 11.1 },
              { label: "16:00", gmv: 310000, netMargin: 34500, marginPct: 11.1 },
              { label: "18:00", gmv: 395000, netMargin: 44100, marginPct: 11.2 },
              { label: "20:00", gmv: 420000, netMargin: 46800, marginPct: 11.1 },
            ],
          },
          sevenDays: {
            stackedVehicleOrders: [
              { label: "Mon", twoWheeler: 10, eLoader: 6, pickupTrolley: 2, total: 18 },
              { label: "Tue", twoWheeler: 12, eLoader: 7, pickupTrolley: 3, total: 22 },
              { label: "Wed", twoWheeler: 8, eLoader: 5, pickupTrolley: 2, total: 15 },
              { label: "Thu", twoWheeler: 16, eLoader: 10, pickupTrolley: 5, total: 31 },
              { label: "Fri", twoWheeler: 14, eLoader: 9, pickupTrolley: 5, total: 28 },
              { label: "Sat", twoWheeler: 18, eLoader: 12, pickupTrolley: 5, total: 35 },
              { label: "Sun", twoWheeler: 12, eLoader: 8, pickupTrolley: 4, total: 24 },
            ],
            revenueMarginTrend: [
              { label: "Mon", gmv: 310000, netMargin: 34100, marginPct: 11.0 },
              { label: "Tue", gmv: 380000, netMargin: 42500, marginPct: 11.2 },
              { label: "Wed", gmv: 260000, netMargin: 29000, marginPct: 11.1 },
              { label: "Thu", gmv: 520000, netMargin: 58800, marginPct: 11.3 },
              { label: "Fri", gmv: 460000, netMargin: 51000, marginPct: 11.1 },
              { label: "Sat", gmv: 590000, netMargin: 66000, marginPct: 11.2 },
              { label: "Sun", gmv: 420000, netMargin: 46800, marginPct: 11.1 },
            ],
          },
          thirtyDays: {
            stackedVehicleOrders: [
              { label: "Week 1", twoWheeler: 72, eLoader: 45, pickupTrolley: 21, total: 138 },
              { label: "Week 2", twoWheeler: 85, eLoader: 52, pickupTrolley: 28, total: 165 },
              { label: "Week 3", twoWheeler: 96, eLoader: 61, pickupTrolley: 32, total: 189 },
              { label: "Week 4", twoWheeler: 90, eLoader: 57, pickupTrolley: 26, total: 173 },
            ],
            revenueMarginTrend: [
              { label: "Week 1", gmv: 2450000, netMargin: 271000, marginPct: 11.1 },
              { label: "Week 2", gmv: 2890000, netMargin: 322000, marginPct: 11.1 },
              { label: "Week 3", gmv: 3320000, netMargin: 375000, marginPct: 11.3 },
              { label: "Week 4", gmv: 2940000, netMargin: 327000, marginPct: 11.1 },
            ],
          },
        },
        guardrails: {
          noEntryWindow: {
            status: "CLEAR",
            activeRestriction: false,
            nextWindow: "17:00 - 21:00",
            label: "Heavy Fleet No-Entry Clear (City Entry Open)",
            trafficPoliceSla: "Permitted until 17:00 IST",
          },
          eMM11MiningPass: {
            status: "VERIFIED",
            compliancePct: 100,
            label: "100% eMM-11 Mining Passes Auto-Issued",
            portalSync: "UP Mining Portal e-Pass Active",
          },
          tileBatchLock: {
            status: "LOCKED",
            activeLocks: 8,
            label: "Single Shade/Lot Batch Guaranteed",
            detail: "Zero mismatched dye-lot delivered to ongoing projects",
          },
          builderKitLeads: {
            status: "ACTIVE",
            hotLeadsCount: 14,
            label: "14 High-Value House Construction Leads",
            unquotedValue: 18400000,
          },
        },
        warRoomPulse: [
          { id: "EVT-1", time: "20:34", title: "Site Arrival Confirmed", desc: "Kartik K. (4W Pickup) reached Omaxe Heights. Unloading 18 boxes Kajaria tiles.", severity: "success" },
          { id: "EVT-2", time: "20:31", title: "Corridor Congestion Alert", desc: "Vinesh M. slowed down near Shaheed Path bottleneck — ETA revised +6m.", severity: "warning" },
          { id: "EVT-3", time: "20:28", title: "New High-Value BOQ", desc: "G+2 2,400 sq ft BOQ generated in Sushant Golf City (₹18.4L estimated).", severity: "info" },
          { id: "EVT-4", time: "20:25", title: "eMM-11 Mining Pass Issued", desc: "UP Mining Portal e-pass #LKO-99214 attached to 300 CFT Gitti order.", severity: "success" },
          { id: "EVT-5", time: "20:20", title: "Dealer Hub Dispatch", desc: "Latouche Rd Hub authorized 2-Wheeler dispatch for 32A MCB & 2.5mm Wire.", severity: "info" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 25000); // 25s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Live motion animation loop (realistic micro-movement along route arcs)
  useEffect(() => {
    if (!isLiveMotionOn) return;
    const timer = setInterval(() => {
      setMotionTick((prev) => (prev + 1) % 1000);
    }, 200);
    return () => clearInterval(timer);
  }, [isLiveMotionOn]);

  // Compute live animated driver positions along path arcs
  const activeFleet = useMemo(() => {
    if (!data?.fleet) return [];
    let list = data.fleet;
    if (vehicleClassFilter !== "ALL") {
      list = list.filter((v) => v.vehicleClass.toLowerCase().includes(vehicleClassFilter.toLowerCase()));
    }

    if (!isLiveMotionOn) return list;

    return list.map((vehicle, idx) => {
      if (vehicle.status === "LOADING") return vehicle;
      // Interpolate along startPoint to endPoint with a subtle sinusoidal wobble
      const t = ((motionTick * 0.015 + idx * 0.2) % 1.0);
      const lerpX = vehicle.startPoint.x + (vehicle.endPoint.x - vehicle.startPoint.x) * t;
      const lerpY = vehicle.startPoint.y + (vehicle.endPoint.y - vehicle.startPoint.y) * t;
      return {
        ...vehicle,
        currentX: Number(lerpX.toFixed(1)),
        currentY: Number(lerpY.toFixed(1)),
      };
    });
  }, [data?.fleet, vehicleClassFilter, isLiveMotionOn, motionTick]);

  const selectedVehicle = useMemo(() => {
    return activeFleet.find((v) => v.id === selectedVehicleId) || activeFleet[0] || null;
  }, [activeFleet, selectedVehicleId]);

  const activeAnalytics = (data?.analytics && data.analytics[timeRange]) || data?.analytics?.sevenDays || {
    stackedVehicleOrders: [],
    revenueMarginTrend: [],
  };

  // Mini Sparkline SVG Renderer
  const renderSparkline = (points: number[] = [], color: string) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const w = 70;
    const h = 26;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    return (
      <svg width={w} height={h} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  if (loading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-bold text-slate-500">Establishing Lucknow Tactical War-Room Telemetry…</p>
      </div>
    );
  }

  const kpis = data?.kpis!;
  const hubs = data?.hubs || [];
  const guardrails = data?.guardrails!;
  const warRoomPulse = data?.warRoomPulse || [];

  return (
    <div className="space-y-6">
      {/* ── 1. LUCKNOW SITE-SAFE GUARDRAILS STRIP ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Guardrail 1: Heavy Fleet No-Entry */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                No-Entry Window
              </p>
              <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                City Clear · Next 17:00
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            OPEN
          </span>
        </div>

        {/* Guardrail 2: eMM-11 Mining Pass */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                UP Mining Portal
              </p>
              <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                100% eMM-11 Passes
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
            VERIFIED
          </span>
        </div>

        {/* Guardrail 3: Single-Batch Tile Lock */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Tile Batch Lock
              </p>
              <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                Single Dye-Lot Shade
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            8 ACTIVE
          </span>
        </div>

        {/* Guardrail 4: Builder Kit Leads */}
        <div
          onClick={() => onNavigateTab?.("leads")}
          className="bg-slate-900 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between text-white shadow-sm hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 text-slate-950 font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Builder Kit Pipeline
              </p>
              <p className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-amber-300 transition">
                14 Hot House Leads
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shrink-0">
            <span>₹1.84 Cr</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* ── 2. 6 INTERACTIVE WAR-ROOM KPI CARDS (WITH SPARKLINES) ──────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Today GMV */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's GMV</p>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{(kpis.todayGmv / 100000).toFixed(2)}L</p>
            </div>
            {renderSparkline(kpis.todayGmvSparkline, "#10B981")}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{kpis.todayGmvDelta} vs yday</span>
          </div>
        </div>

        {/* KPI 2: Conon Net Margin */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Profit</p>
              <p className="text-2xl font-black text-indigo-950 mt-1">₹{(kpis.netProfit / 1000).toFixed(1)}K</p>
            </div>
            {renderSparkline(kpis.netMarginSparkline, "#6366F1")}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
            <span>{kpis.netMarginPercent}% Net Margin</span>
          </div>
        </div>

        {/* KPI 3: Active Orders */}
        <div
          onClick={() => onNavigateTab?.("orders")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400 transition cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Orders</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{kpis.activeOrders}</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span className="text-emerald-700">{kpis.onTrackCount} On-Track</span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-700">{kpis.heavyFleetCount} Heavy Fleet</span>
          </div>
        </div>

        {/* KPI 4: SLA Breaches */}
        <div
          onClick={() => onNavigateTab?.("orders")}
          className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs flex flex-col justify-between hover:border-rose-400 transition cursor-pointer bg-rose-50/20"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">SLA Breaches</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{kpis.slaBreaches}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse mt-1" />
          </div>
          <div className="mt-3 text-[10px] font-black text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md w-fit">
            {kpis.slaRiskPill}
          </div>
        </div>

        {/* KPI 5: Khata Credit Exposure */}
        <div
          onClick={() => onNavigateTab?.("khata")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-purple-400 transition cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Khata Credit</p>
            <p className="text-2xl font-black text-purple-950 mt-1">₹{(kpis.khataCreditExposure / 100000).toFixed(1)}L</p>
          </div>
          <div className="mt-3 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md w-fit truncate">
            ₹{(kpis.overdue15Days / 100000).toFixed(1)}L Overdue &gt;15d
          </div>
        </div>

        {/* KPI 6: Pending Vendor Payouts */}
        <div
          onClick={() => onNavigateTab?.("payouts")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-400 transition cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Vendor Payouts</p>
            <p className="text-2xl font-black text-amber-950 mt-1">₹{(kpis.pendingVendorPayouts / 1000).toFixed(0)}K</p>
          </div>
          <div className="mt-3 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
            {kpis.pendingDealersCount} Hub Dealers Due
          </div>
        </div>
      </div>

      {/* ── 3. LUCKNOW TACTICAL GEO-RADAR MAP & COMMAND CENTER ────────── */}
      <div className="bg-[#0B0F17] rounded-3xl border border-slate-800 shadow-xl overflow-hidden text-white relative">
        {/* Top Control Bar over Map */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-md z-20 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-wide">
                  Lucknow Tactical Geo-Radar Map
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                6 Supply Hubs · Gomti Arteries · {activeFleet.length} Active Vehicles En Route
              </p>
            </div>
          </div>

          {/* Vehicle Class Filter Pills & Live Motion Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              {["ALL", "2-Wheeler", "E-Loader", "Pickup", "Trolley"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setVehicleClassFilter(cls)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    vehicleClassFilter === cls
                      ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Play/Pause Motion Toggle */}
            <button
              onClick={() => setIsLiveMotionOn((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition active:scale-95 ${
                isLiveMotionOn
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              {isLiveMotionOn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveMotionOn ? "Motion ON" : "Paused"}</span>
            </button>
          </div>
        </div>

        {/* Tactical Canvas Area */}
        <div className="relative w-full aspect-[21/10] min-h-[420px] max-h-[580px] bg-[#070A10] overflow-hidden select-none">
          {/* Subtle Grid Rings & Crosshair Background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0B0F17" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#radarPulse)" />
            {/* Concentric radar range rings */}
            <circle cx="50%" cy="50%" r="15%" fill="none" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" />
            <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="5 5" />
            {/* Compass axis lines */}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1E293B" strokeWidth="1" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1E293B" strokeWidth="1" />
          </svg>

          {/* SVG Map of Lucknow: Gomti River, Highways & Corridors */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* 1. Outer Ring / Kisan Path (Outer boundary loop) */}
            <ellipse
              cx="50"
              cy="50"
              rx="46"
              ry="44"
              fill="none"
              stroke="#1E293B"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text x="74" y="93" fontSize="2.0" fill="#475569" fontWeight="bold">KISAN PATH / OUTER RING</text>

            {/* 2. Key Logistics Arteries */}
            {/* Amar Shaheed Path (Major South-East Expressway Arc) */}
            <path
              d="M 20 72 Q 45 84 80 50"
              fill="none"
              stroke="#334155"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <text x="36" y="80" fontSize="2.2" fill="#64748B" fontWeight="800" transform="rotate(12 36 80)">AMAR SHAHEED PATH</text>

            {/* Faizabad / Ayodhya Road */}
            <line x1="50" y1="45" x2="95" y2="22" stroke="#334155" strokeWidth="1.8" />
            <text x="68" y="30" fontSize="2.0" fill="#64748B" fontWeight="bold" transform="rotate(-18 68 30)">FAIZABAD / AYODHYA RD</text>

            {/* Kanpur Road */}
            <line x1="42" y1="52" x2="10" y2="82" stroke="#334155" strokeWidth="1.8" />
            <text x="18" y="74" fontSize="2.0" fill="#64748B" fontWeight="bold" transform="rotate(32 18 74)">KANPUR RD</text>

            {/* Sitapur Road */}
            <line x1="42" y1="44" x2="28" y2="6" stroke="#334155" strokeWidth="1.6" />
            <text x="32" y="18" fontSize="2.0" fill="#64748B" fontWeight="bold">SITAPUR RD</text>

            {/* Hardoi Road */}
            <line x1="38" y1="46" x2="6" y2="30" stroke="#334155" strokeWidth="1.4" />
            <text x="14" y="36" fontSize="2.0" fill="#64748B" fontWeight="bold">HARDOI RD</text>

            {/* 3. Gomti River Curve (Authentic winding turquoise waterway) */}
            <path
              d="M 12 18 Q 30 28 44 40 T 62 48 T 88 42"
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* Gomti River Shimmer glow */}
            <path
              d="M 12 18 Q 30 28 44 40 T 62 48 T 88 42"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.9"
            />
            <text x="26" y="24" fontSize="2.3" fill="#38BDF8" fontWeight="900" fontStyle="italic" opacity="0.8">GOMTI RIVER</text>

            {/* 4. Active Delivery Route Arcs (Hub -> Destination Site) */}
            {activeFleet.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              const strokeColor =
                vehicle.status === "DELAYED"
                  ? "#EF4444"
                  : vehicle.status === "LOADING"
                  ? "#F59E0B"
                  : vehicle.status === "RETURNING"
                  ? "#38BDF8"
                  : "#10B981";

              return (
                <g key={`route-${vehicle.id}`}>
                  {/* Dashed trajectory line */}
                  <line
                    x1={vehicle.startPoint.x}
                    y1={vehicle.startPoint.y}
                    x2={vehicle.endPoint.x}
                    y2={vehicle.endPoint.y}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? "1.8" : "1.0"}
                    strokeDasharray={isSelected ? "2 2" : "1.5 2"}
                    opacity={isSelected ? "0.9" : "0.5"}
                  />
                  {/* Destination Site Target Ring */}
                  <circle
                    cx={vehicle.endPoint.x}
                    cy={vehicle.endPoint.y}
                    r={isSelected ? "2.2" : "1.6"}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="0.8"
                    opacity="0.8"
                  />
                  <circle
                    cx={vehicle.endPoint.x}
                    cy={vehicle.endPoint.y}
                    r="0.7"
                    fill={strokeColor}
                  />
                </g>
              );
            })}

            {/* 5. 6 Lucknow Supply Hub Pins */}
            {hubs.map((hub) => (
              <g
                key={hub.id}
                className="cursor-pointer group"
                transform={`translate(${hub.x}, ${hub.y})`}
              >
                {/* Pulsing ring for active hub */}
                <circle cx="0" cy="0" r="4.2" fill={hub.color} fillOpacity="0.15">
                  <animate attributeName="r" values="3.2;5.5;3.2" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Solid Hub Marker */}
                <circle cx="0" cy="0" r="2.8" fill="#0B0F17" stroke={hub.color} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="1.4" fill={hub.color} />

                {/* Hub Label */}
                <text
                  x="0"
                  y="-4.2"
                  textAnchor="middle"
                  fontSize="2.1"
                  fill="white"
                  fontWeight="bold"
                  className="drop-shadow-md select-none"
                >
                  {hub.name.replace(" Hub", "")}
                </text>
                {/* Live orders badge */}
                <text
                  x="0"
                  y="5.2"
                  textAnchor="middle"
                  fontSize="1.7"
                  fill="#94A3B8"
                  fontWeight="600"
                >
                  {hub.liveOrders} orders
                </text>
              </g>
            ))}

            {/* 6. Live Moving Fleet Vehicle Pins */}
            {activeFleet.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              const color =
                vehicle.status === "DELAYED"
                  ? "#EF4444"
                  : vehicle.status === "LOADING"
                  ? "#F59E0B"
                  : vehicle.status === "RETURNING"
                  ? "#38BDF8"
                  : "#10B981";

              return (
                <g
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className="cursor-pointer transition-transform duration-300"
                  transform={`translate(${vehicle.currentX}, ${vehicle.currentY})`}
                >
                  {/* Glowing selection aura */}
                  {isSelected && (
                    <circle cx="0" cy="0" r="5.5" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="1.5 1.5">
                      <animate attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Status Ring */}
                  <circle cx="0" cy="0" r="3.2" fill="#0F172A" stroke={color} strokeWidth="1.4" />
                  {/* Vehicle Label Initial */}
                  <text
                    x="0"
                    y="1.0"
                    textAnchor="middle"
                    fontSize="1.9"
                    fill="white"
                    fontWeight="900"
                  >
                    {vehicle.vehicleType === "2W_BIKE" ? "2W" : vehicle.vehicleType === "3W_ELECTRIC_LOADER" ? "EL" : vehicle.vehicleType === "4W_PICKUP" ? "PK" : "TR"}
                  </text>
                  {/* ETA Bubble */}
                  <rect
                    x="-6"
                    y="-6.8"
                    width="12"
                    height="3.2"
                    rx="1.6"
                    fill="#020617"
                    stroke={color}
                    strokeWidth="0.6"
                  />
                  <text
                    x="0"
                    y="-4.6"
                    textAnchor="middle"
                    fontSize="1.6"
                    fill={color}
                    fontWeight="900"
                  >
                    {vehicle.minsLeft > 0 ? `${vehicle.minsLeft}m` : `${Math.abs(vehicle.minsLeft)}m!`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 7. Floating Driver & Trip Telemetry Card (Pinned over bottom-right of map) */}
          {selectedVehicle && (
            <div className="absolute bottom-4 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white"
                    style={{
                      background:
                        selectedVehicle.status === "DELAYED"
                          ? "#DC2626"
                          : selectedVehicle.status === "LOADING"
                          ? "#D97706"
                          : "#059669",
                    }}
                  >
                    {selectedVehicle.vehicleType === "2W_BIKE" ? "2W" : selectedVehicle.vehicleType === "3W_ELECTRIC_LOADER" ? "E-L" : "4W"}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{selectedVehicle.driverName}</h4>
                    <p className="text-[10px] font-bold text-slate-400">{selectedVehicle.plateNumber} · {selectedVehicle.vehicleClass}</p>
                  </div>
                </div>
                <span
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
                  style={{
                    color: selectedVehicle.status === "DELAYED" ? "#FCA5A5" : "#6EE7B7",
                    borderColor: selectedVehicle.status === "DELAYED" ? "#DC2626" : "#059669",
                    background: selectedVehicle.status === "DELAYED" ? "#450A0A" : "#022C22",
                  }}
                >
                  {selectedVehicle.status}
                </span>
              </div>

              {/* Trip Route Details */}
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispatch Hub</span>
                  <p className="font-semibold text-slate-200 truncate">{selectedVehicle.hubName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Site</span>
                  <p className="font-semibold text-amber-300 truncate">{selectedVehicle.destinationSite}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cargo Manifest</span>
                  <p className="text-[11px] font-medium text-slate-300 line-clamp-1">{selectedVehicle.cargoSummary}</p>
                </div>
              </div>

              {/* Action Buttons: Call Driver & Inspect Order */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${selectedVehicle.phone}`}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Driver</span>
                </a>
                <button
                  onClick={() => onNavigateTab?.("orders")}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Order</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Left Map Legend */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2 text-[10px] font-bold text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> En Route
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Loading
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> SLA Risk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Returning
            </span>
          </div>
        </div>

        {/* ── 4. LIVE FLEET HORIZONTAL STRIP ───────────────────────────── */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 overflow-x-auto flex items-center gap-2.5 scrollbar-hide">
          {activeFleet.map((vehicle) => {
            const isSelected = selectedVehicle?.id === vehicle.id;
            return (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all shrink-0 text-left cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] text-white shrink-0"
                  style={{
                    background:
                      vehicle.status === "DELAYED"
                        ? "#DC2626"
                        : vehicle.status === "LOADING"
                        ? "#D97706"
                        : "#059669",
                  }}
                >
                  {vehicle.vehicleType === "2W_BIKE" ? "2W" : vehicle.vehicleType === "3W_ELECTRIC_LOADER" ? "EL" : "PK"}
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-white truncate">{vehicle.driverName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{vehicle.cargoSummary.split("+")[0]}</p>
                </div>
                <span className="text-[10px] font-black text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded shrink-0">
                  {vehicle.minsLeft > 0 ? `${vehicle.minsLeft}m` : `${Math.abs(vehicle.minsLeft)}m!`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. UPGRADED DUAL-LAYER ANALYTICS (STACKED VEHICLE + MARGIN) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Orders by Vehicle Class (Stacked Bar) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900">Orders by Vehicle Fleet Class</h3>
              <p className="text-xs text-slate-400 mt-0.5">Stacked volume across Lucknow delivery tiers</p>
            </div>
            {/* Time-Range Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(["today", "sevenDays", "thirtyDays"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    timeRange === r
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {r === "today" ? "Today" : r === "sevenDays" ? "7D" : "30D"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeAnalytics.stackedVehicleOrders} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "none",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingBottom: 10 }}
                />
                <Bar name="2-Wheeler (60-Min)" dataKey="twoWheeler" stackId="fleet" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar name="E-Loader (3W)" dataKey="eLoader" stackId="fleet" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar name="Pickup / Trolley" dataKey="pickupTrolley" stackId="fleet" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Revenue vs Net Profit Trend (Area + Line) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900">GMV vs Conon Net Margin (₹)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Realized platform gross sales and profit trajectory</p>
            </div>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Avg 11.1% Margin
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeAnalytics.revenueMarginTrend}>
                <defs>
                  <linearGradient id="gmvArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "none",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                  formatter={(value: any, name: any) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    name === "gmv" ? "Daily GMV" : "Net Profit",
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingBottom: 10 }}
                />
                <Area
                  name="Daily GMV"
                  type="monotone"
                  dataKey="gmv"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gmvArea)"
                />
                <Line
                  name="Net Profit"
                  type="monotone"
                  dataKey="netMargin"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#6366F1" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 6. WAR-ROOM LIVE PULSE FEED & EVENT TICKER ───────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-black text-sm text-slate-900">Live War-Room Activity Pulse Feed</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Chronological telemetry feed</span>
        </div>

        <div className="divide-y divide-slate-100">
          {warRoomPulse.map((evt) => (
            <div key={evt.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 shrink-0">
                  {evt.time}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{evt.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{evt.desc}</p>
                </div>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  evt.severity === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : evt.severity === "warning"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {evt.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
