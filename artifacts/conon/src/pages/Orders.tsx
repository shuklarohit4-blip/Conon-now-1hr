import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, MapPin, Timer, Search, ShoppingBag, RefreshCw, Phone,
  TrendingUp, Truck, CheckCircle2, IndianRupee, Layers, Box,
  Clock, ChevronRight, AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/Layout";
import { useUI } from "@/context/UIContext";
import {
  useGetOrders,
  useAddToCart,
  getGetCartQueryKey,
  getGetOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const BRAND_DARK = "#1b4366";
const BRAND_MID  = "#5c92b1";
const AMBER      = "#f59e0b";

type StatusFilter = "all" | "active" | "delivered";

const STATUS_META: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  placed:     { label: "Placed",     color: "#1d4ed8", bg: "#dbeafe", ring: "#93c5fd" },
  confirmed:  { label: "Confirmed",  color: "#7c3aed", bg: "#ede9fe", ring: "#c4b5fd" },
  dispatched: { label: "Dispatched", color: "#b45309", bg: "#fef3c7", ring: "#fcd34d" },
  delivered:  { label: "Delivered",  color: "#15803d", bg: "#dcfce7", ring: "#86efac" },
  cancelled:  { label: "Cancelled",  color: "#b91c1c", bg: "#fee2e2", ring: "#fca5a5" },
};

const PROGRESS: Record<string, number> = {
  placed: 25, confirmed: 50, dispatched: 80, delivered: 100, cancelled: 0,
};

const ACTIVE_STATUSES = ["placed", "confirmed", "dispatched"];

export function Orders() {
  const { data: orders, isLoading } = useGetOrders({ query: { queryKey: getGetOrdersQueryKey(), refetchInterval: 10000 } });
  const { setCartOpen } = useUI();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    if (!orders) return { count: 0, spend: 0, inTransit: 0, items: 0 };
    return {
      count: orders.length,
      spend: orders.reduce((s, o) => s + (o.total ?? 0), 0),
      inTransit: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      items: orders.reduce((s, o) => s + (o.items?.length ?? 0), 0),
    };
  }, [orders]);

  // Aggregated materials across all orders (top 4)
  const aggMaterials = useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, { name: string; qty: number; unit: string }>();
    for (const o of orders) {
      for (const it of (o.items ?? []) as any[]) {
        const key = (it.name ?? "Item").toLowerCase();
        const cur = map.get(key) ?? { name: it.name ?? "Item", qty: 0, unit: it.unit ?? "" };
        cur.qty += parseFloat(it.quantity ?? 0) || 0;
        map.set(key, cur);
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  }, [orders]);

  // Filtered list
  const visible = useMemo(() => {
    if (!orders) return [];
    return orders
      .filter((o) => {
        if (filter === "active")    return ACTIVE_STATUSES.includes(o.status);
        if (filter === "delivered") return o.status === "delivered";
        return true;
      })
      .filter((o) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(s) ||
          (o.vendor ?? "").toLowerCase().includes(s) ||
          (o.deliveryAddress ?? "").toLowerCase().includes(s) ||
          (o.items ?? []).some((i: any) => (i.name ?? "").toLowerCase().includes(s))
        );
      });
  }, [orders, filter, search]);

  const handleReorder = async (order: any) => {
    setReorderingId(order.id);
    let added = 0;
    let skipped = 0;
    for (const it of (order.items ?? []) as any[]) {
      const q = Number(it?.quantity);
      if (!it?.materialId || !Number.isFinite(q) || q <= 0) {
        skipped++;
        continue;
      }
      try {
        await addToCart.mutateAsync({
          data: { materialId: it.materialId, quantity: q },
        });
        added++;
      } catch {
        skipped++;
      }
    }
    setReorderingId(null);
    if (added > 0) setCartOpen(true);
    if (added === 0 && skipped > 0) {
      // surface failure to the user
      console.warn(`Reorder failed: ${skipped} item(s) could not be added`);
    }
  };

  return (
    <Layout>
      <div className="px-5 pt-4 pb-6 bg-gradient-to-b from-slate-50 to-white min-h-full">
        {/* Title */}
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
            Material Inventory
          </p>
          <h1 className="font-display font-black text-2xl leading-tight" style={{ color: BRAND_DARK }}>
            My Orders & Stock
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Live tracking, quick reorder & total project consumption.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard
            icon={Package}
            label="Total Orders"
            value={stats.count.toString()}
            tint={BRAND_DARK}
          />
          <StatCard
            icon={Truck}
            label="In Transit"
            value={stats.inTransit.toString()}
            tint="#b45309"
            pulse={stats.inTransit > 0}
          />
          <StatCard
            icon={IndianRupee}
            label="Total Spend"
            value={`₹${stats.spend.toLocaleString("en-IN")}`}
            tint="#15803d"
          />
          <StatCard
            icon={Layers}
            label="Items Bought"
            value={stats.items.toString()}
            tint="#7c3aed"
          />
        </div>

        {/* Aggregated materials strip */}
        {aggMaterials.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" style={{ color: BRAND_DARK }} />
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: BRAND_DARK }}>
                Project Stockpile
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {aggMaterials.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-default"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${BRAND_DARK}15`, color: BRAND_DARK }}
                  >
                    <Box className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-slate-700 truncate group-hover:text-slate-900">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {m.qty.toLocaleString("en-IN")} {m.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + filter chips */}
        <div className="mb-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order, item, vendor or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            {([
              { id: "all",       label: `All · ${stats.count}`            },
              { id: "active",    label: `Active · ${stats.inTransit}`     },
              { id: "delivered", label: `Delivered`                        },
            ] as const).map((c) => {
              const active = filter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setFilter(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-black border transition-all ${
                    active ? "shadow-sm" : "hover:bg-slate-50"
                  }`}
                  style={{
                    background: active ? BRAND_DARK : "white",
                    color: active ? "white" : "#475569",
                    borderColor: active ? BRAND_DARK : "#e2e8f0",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState hasOrders={(orders?.length ?? 0) > 0} onClear={() => { setSearch(""); setFilter("all"); }} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {visible.map((order: any, idx: number) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <OrderCard
                    order={order}
                    isReordering={reorderingId === order.id}
                    onReorder={() => handleReorder(order)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
  pulse = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tint: string;
  pulse?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
    >
      <div
        className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10"
        style={{ background: tint }}
      />
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center relative"
          style={{ background: `${tint}15`, color: tint }}
        >
          <Icon className="w-4 h-4" strokeWidth={2.4} />
          {pulse && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-xl font-display font-black leading-none" style={{ color: tint }}>
        {value}
      </p>
    </motion.div>
  );
}

function OrderCard({
  order,
  onReorder,
  isReordering,
}: {
  order: any;
  onReorder: () => void;
  isReordering: boolean;
}) {
  const meta = STATUS_META[order.status] ?? STATUS_META.placed;
  const pct  = PROGRESS[order.status] ?? 0;
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const itemsPreview = (order.items ?? []).slice(0, 3).map((i: any) => i.name).join(" · ");
  const more = (order.items?.length ?? 0) - 3;

  return (
    <div className="p-4">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] uppercase font-black tracking-wider px-2 py-1 rounded-full border"
            style={{ color: meta.color, background: meta.bg, borderColor: meta.ring }}
          >
            {isActive && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle animate-pulse"
                style={{ background: meta.color }}
              />
            )}
            {meta.label}
          </span>
          <span className="text-[10px] font-mono text-slate-400 truncate">
            #{order.id.substring(0, 8)}
          </span>
        </div>

        {isActive && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: `${AMBER}18`, color: "#b45309" }}
          >
            <Timer className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[11px] font-black">
              {order.deliveryCountdownMinutes}m
            </span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform"
          style={{ background: `${BRAND_DARK}10`, color: BRAND_DARK }}
        >
          <Package className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-sm text-slate-800 truncate">
            {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
            {order.vendor && <span className="text-slate-400 font-bold"> · {order.vendor}</span>}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {itemsPreview}{more > 0 ? ` +${more} more` : ""}
          </p>
        </div>
        <p className="text-lg font-display font-black shrink-0" style={{ color: BRAND_DARK }}>
          ₹{order.total?.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Progress bar */}
      {order.status !== "cancelled" && (
        <div className="mb-3">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${BRAND_DARK} 0%, ${BRAND_MID} 100%)`,
              }}
            >
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md ring-2 ring-blue-300/40" />
              )}
            </motion.div>
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span className={pct >= 25 ? "text-slate-600" : ""}>Placed</span>
            <span className={pct >= 50 ? "text-slate-600" : ""}>Confirmed</span>
            <span className={pct >= 80 ? "text-slate-600" : ""}>Dispatched</span>
            <span className={pct >= 100 ? "text-emerald-600" : ""}>Delivered</span>
          </div>
        </div>
      )}

      {/* Address + time */}
      <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate flex-1">{order.deliveryAddress}</span>
        <Clock className="w-3 h-3 shrink-0 ml-1" />
        <span className="shrink-0 font-bold text-slate-600">
          {order.placedAt
            ? formatDistanceToNow(new Date(order.placedAt), { addSuffix: true })
            : ""}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={(e) => { e.stopPropagation(); onReorder(); }}
          disabled={isReordering}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black text-white shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
          style={{ background: BRAND_DARK }}
        >
          {isReordering ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Reorder
            </>
          )}
        </button>
        {isActive && (
          <Link
            href="/track"
            onClick={(e: any) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border-2 hover:bg-slate-50 active:scale-[0.98] transition-all"
            style={{ color: BRAND_DARK, borderColor: BRAND_DARK }}
          >
            <Truck className="w-3.5 h-3.5" />
            Track
          </Link>
        )}
        {order.vendor && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = "tel:1800-26666";
            }}
            aria-label="Call vendor"
            className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Delivered timestamp */}
      {order.status === "delivered" && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
          <CheckCircle2 className="w-3 h-3" />
          Delivered {format(new Date(order.placedAt), "MMM d, h:mm a")}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasOrders, onClear }: { hasOrders: boolean; onClear: () => void }) {
  if (hasOrders) {
    return (
      <div className="text-center py-14">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <AlertCircle className="w-7 h-7 text-slate-400" />
        </div>
        <p className="font-black text-slate-700">No matches found</p>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Try a different search or clear the filter.
        </p>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-xl text-xs font-black border border-slate-200 hover:bg-slate-50"
        >
          Clear filters
        </button>
      </div>
    );
  }
  return (
    <div className="text-center py-14">
      <div
        className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${BRAND_DARK}10`, color: BRAND_DARK }}
      >
        <ShoppingBag className="w-9 h-9" />
      </div>
      <p className="font-black text-slate-800 text-base">Your inventory is empty</p>
      <p className="text-xs text-slate-500 mt-1 mb-5 max-w-[260px] mx-auto">
        Order materials and they'll show up here with live tracking, totals, and one-tap reorder.
      </p>
      <Link
        href="/home"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white shadow-sm hover:shadow-md hover:brightness-110 transition-all"
        style={{ background: BRAND_DARK }}
      >
        Browse Materials
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default Orders;
