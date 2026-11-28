import React, { useEffect, useState } from "react";
import {
  Wifi,
  Copy,
  Check,
  RefreshCw,
  Radio,
  Activity,
  ChevronDown,
  ChevronUp,
  Smartphone,
  AlertTriangle,
  Package,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/apiBase";
import { subscribeSseSync, useSseSyncStatus } from "@/services/sseSyncClient";
import { useLiveCategoriesStore } from "@/services/liveCategoriesStore";
import { useLiveProductsStore } from "@/services/liveProductsStore";

interface AdminActivityEntry {
  id: string;
  type: string;
  action: string;
  summary: string;
  timestamp: string;
}

interface NetworkInfoResponse {
  lanIps: string[];
  primaryLanIp: string;
  customerLanUrl: string;
  adminLanUrl: string;
  connectedSseClients: number;
  recentActivity: AdminActivityEntry[];
}

export function AdminLiveSyncNetworkBar({
  isDark = true,
  onNavigateTab,
}: {
  isDark?: boolean;
  onNavigateTab?: (tabId: string) => void;
}) {
  const sseStatus = useSseSyncStatus();
  const { categories } = useLiveCategoriesStore({ includeInactive: true });
  const { products } = useLiveProductsStore();

  const [info, setInfo] = useState<NetworkInfoResponse | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [forcing, setForcing] = useState(false);
  const [showFeed, setShowFeed] = useState(false);

  const loadInfo = async () => {
    try {
      const res = await adminFetch("/api/system/network-info");
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
      }
    } catch {
      // ignore offline
    }
  };

  useEffect(() => {
    void loadInfo();
    const unsub = subscribeSseSync(() => {
      void loadInfo();
    });
    const timer = window.setInterval(() => void loadInfo(), 20000);
    return () => {
      unsub();
      window.clearInterval(timer);
    };
  }, []);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const lanCustomerUrl =
    info?.customerLanUrl ||
    (currentOrigin ? `${currentOrigin}/home` : "/home");

  const activeCategoryCount = categories.filter((c) => c.isActive !== false).length;
  const lowOrOutCount = products.filter(
    (p) => !p.isInStock || (typeof p.stockQty === "number" && p.stockQty <= 5)
  ).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lanCustomerUrl);
      setCopiedUrl(true);
      toast.success(`Copied LAN Customer URL: ${lanCustomerUrl}`);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error("Copy failed — copy URL manually");
    }
  };

  const handleForceSync = async () => {
    setForcing(true);
    try {
      const res = await adminFetch("/api/events/force-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Admin Command triggered Live Force Sync" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Force sync failed");
      }
      toast.success(
        `Broadcasted Force Sync to ${data.connectedSseClients || 0} connected SSE clients!`
      );
      await loadInfo();
    } catch (err: any) {
      toast.error(err?.message || "Force sync error");
    } finally {
      setForcing(false);
    }
  };

  const surfaceCls = isDark
    ? "bg-[#0F172A] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${surfaceCls}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: LAN URL & SSE Health */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <span
              className={`w-2 h-2 rounded-full ${
                sseStatus === "CONNECTED"
                  ? "bg-emerald-400 animate-pulse"
                  : sseStatus === "RECONNECTING"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-400"
              }`}
            />
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-black text-emerald-400">
              SSE {sseStatus} · {info?.connectedSseClients ?? 1} Client(s)
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 max-w-full">
            <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
              Phone / LAN URL:
            </span>
            <code className="text-[11px] font-mono font-bold text-amber-300 truncate max-w-[260px]">
              {lanCustomerUrl}
            </code>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
              title="Copy URL to open on mobile phone on same Wi-Fi"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Counts + Force Sync + Activity */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab?.("category_studio")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeCategoryCount}/{categories.length} Categories</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.("product_master")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-sky-400" />
            <span>{products.length} Active SKUs</span>
          </button>

          {lowOrOutCount > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab?.("product_master")}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-black text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowOrOutCount} Low/OOS</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFeed((v) => !v)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Feed ({info?.recentActivity?.length || 0})</span>
            {showFeed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            disabled={forcing}
            onClick={() => void handleForceSync()}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shadow cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${forcing ? "animate-spin" : ""}`} />
            <span>{forcing ? "Syncing..." : "Force Sync All Devices"}</span>
          </button>
        </div>
      </div>

      {/* Expandable Recent Admin Activity Feed */}
      {showFeed && (
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            <span>Live Admin Change Feed (LAN / DevTunnel / Localhost)</span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" /> Zero-Cache SSE Push
            </span>
          </div>
          {!info?.recentActivity?.length ? (
            <p className="text-xs text-slate-500 py-2">No recent mutations recorded yet in this session.</p>
          ) : (
            info.recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between gap-2 text-xs px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/70"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                    {act.type}
                  </span>
                  <span className="truncate text-slate-200">{act.summary}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
