import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  Printer,
  FileText,
  RefreshCw,
  UserCheck,
  Store,
  X,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";

interface OrderRecord {
  id: string;
  shortId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryArea: string;
  items: Array<{
    skuId?: string;
    name: string;
    brand?: string;
    category?: string;
    unit?: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    hsnCode?: string;
  }>;
  subtotal: number;
  gstAmount: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  vendorId?: string;
  vendorStore?: string;
  driverId?: string;
  driverName?: string;
  placedAt: string;
  isB2B?: boolean;
  gstNumber?: string;
}

type StatusFilter = "ALL" | "NEW" | "CONFIRMED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

const FILTER_MAP: Record<StatusFilter, string[]> = {
  ALL: [],
  NEW: ["PLACED"],
  CONFIRMED: ["VENDOR_ACCEPTED"],
  PACKED: ["PACKING_READY", "DRIVER_ASSIGNED", "PICKED_UP"],
  OUT_FOR_DELIVERY: ["OUT_FOR_DELIVERY", "ARRIVED_AT_SITE"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED", "DISPUTED"],
};

const NEXT_STATUS_MAP: Record<string, { label: string; next: string }> = {
  PLACED: { label: "Confirm Order", next: "VENDOR_ACCEPTED" },
  VENDOR_ACCEPTED: { label: "Mark Packed Ready", next: "PACKING_READY" },
  PACKING_READY: { label: "Dispatch Out for Delivery", next: "OUT_FOR_DELIVERY" },
  DRIVER_ASSIGNED: { label: "Dispatch Out for Delivery", next: "OUT_FOR_DELIVERY" },
  PICKED_UP: { label: "Dispatch Out for Delivery", next: "OUT_FOR_DELIVERY" },
  OUT_FOR_DELIVERY: { label: "Mark Delivered", next: "DELIVERED" },
  ARRIVED_AT_SITE: { label: "Mark Delivered", next: "DELIVERED" },
};

export function AdminOrdersControlTower({ isDark = true }: { isDark?: boolean }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, dirRes] = await Promise.all([
        adminFetch("/api/admin/orders"),
        adminFetch("/api/admin/directory"),
      ]);
      if (ordRes.ok) {
        const ordJson = await ordRes.json();
        setOrders(Array.isArray(ordJson?.orders) ? ordJson.orders : []);
      }
      if (dirRes.ok) {
        const dirJson = await dirRes.json();
        setVendors(Array.isArray(dirJson?.vendors) ? dirJson.vendors : []);
        setDrivers(Array.isArray(dirJson?.drivers) ? dirJson.drivers : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const unsub = subscribeSseSync((msg) => {
      if (msg.type === "ORDERS_UPDATED" || msg.type === "PARTNERS_UPDATED" || msg.type === "FORCE_SYNC") {
        void loadData();
      }
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return orders;
    const allowed = new Set(FILTER_MAP[filter]);
    return orders.filter((o) => allowed.has(o.status));
  }, [orders, filter]);

  const counts = useMemo(() => {
    const out: Record<StatusFilter, number> = {
      ALL: orders.length,
      NEW: 0,
      CONFIRMED: 0,
      PACKED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const o of orders) {
      for (const k of Object.keys(FILTER_MAP) as StatusFilter[]) {
        if (k !== "ALL" && FILTER_MAP[k].includes(o.status)) out[k]++;
      }
    }
    return out;
  }, [orders]);

  const handleProgressStatus = async (order: OrderRecord, nextStatus: string) => {
    if (nextStatus === "CANCELLED" && !window.confirm(`Cancel order ${order.shortId || order.id}?`)) {
      return;
    }
    setUpdatingId(order.id);
    try {
      const res = await adminFetch(`/api/admin/orders/${encodeURIComponent(order.id)}/override-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note: `Admin progressed status to ${nextStatus}` }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Status update failed");
      toast.success(`Order ${order.shortId || order.id} -> ${nextStatus}`);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssign = async (
    orderId: string,
    patch: { vendorId?: string; vendorStore?: string; driverId?: string }
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await adminFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Assignment failed");
      toast.success("Partner / Driver updated live!");
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign partner/driver");
    } finally {
      setUpdatingId(null);
    }
  };

  const cardCls = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${cardCls}`}>
        <div>
          <h2 className="text-lg font-black flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Orders &amp; 60-Min Delivery Control Tower</span>
          </h2>
          <p className="text-xs text-slate-400">
            1-click order progression, live partner/driver dispatch assignment, and printable GST Tax Invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Live Orders</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "ALL", label: "All Orders" },
            { id: "NEW", label: "New" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "PACKED", label: "Packed" },
            { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ] as Array<{ id: StatusFilter; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer transition ${
              filter === tab.id
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : isDark
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      {/* Order List */}
      {filtered.length === 0 ? (
        <div className={`p-12 rounded-2xl border text-center space-y-2 ${cardCls}`}>
          <Package className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No orders in "{filter}" state</p>
          <p className="text-xs text-slate-500">
            Live customer checkout orders appear here immediately over SSE without refresh.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ord) => {
            const nextStep = NEXT_STATUS_MAP[ord.status];
            return (
              <div key={ord.id} className={`rounded-2xl border p-4 space-y-3 ${cardCls}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-amber-400">
                        {ord.shortId || ord.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {ord.status}
                      </span>
                      {ord.isB2B && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          B2B GSTIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-bold mt-1">
                      {ord.customerName} · {ord.customerPhone}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Site: {ord.deliveryAddress || ord.deliveryArea}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400 font-mono">
                      ₹{Number(ord.totalAmount || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(ord.placedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(ord.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="font-bold text-slate-200">{it.name}</span>
                        <div className="text-[10px] text-slate-400">
                          Qty: {it.qty} {it.unit || "unit"}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-300 shrink-0">
                        ₹{Math.round(it.totalPrice || it.unitPrice * it.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Controls: Vendor/Driver Assignment + Status Actions */}
                <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-amber-400" />
                      <select
                        value={ord.vendorId || ""}
                        disabled={updatingId === ord.id}
                        onChange={(e) => {
                          const v = vendors.find((x) => x.id === e.target.value);
                          if (v) {
                            void handleAssign(ord.id, {
                              vendorId: v.id,
                              vendorStore: v.name,
                            });
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                      >
                        <option value="">{ord.vendorStore || "Assign Hub Vendor..."}</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.zone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <select
                        value={ord.driverId || ""}
                        disabled={updatingId === ord.id}
                        onChange={(e) => {
                          if (e.target.value) {
                            void handleAssign(ord.id, { driverId: e.target.value });
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                      >
                        <option value="">{ord.driverName || "Assign Delivery Driver..."}</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} · {d.vehiclePlate} ({d.isOnline ? "Online" : "Offline"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(ord)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>GST Invoice</span>
                    </button>

                    {nextStep && (
                      <button
                        type="button"
                        disabled={updatingId === ord.id}
                        onClick={() => void handleProgressStatus(ord, nextStep.next)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{nextStep.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (
                      <button
                        type="button"
                        disabled={updatingId === ord.id}
                        onClick={() => void handleProgressStatus(ord, "CANCELLED")}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable GST Tax Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">TAX INVOICE (GSTR-1 Ready)</h3>
                <p className="text-xs text-slate-500">
                  CONON INFRABUILT PVT LTD · Lucknow Hub Supply Network
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-500 uppercase text-[10px]">Billed To</div>
                <div className="font-black text-slate-900 mt-0.5">{invoiceOrder.customerName}</div>
                <div>{invoiceOrder.customerPhone}</div>
                <div className="text-slate-600 mt-1">{invoiceOrder.deliveryAddress}</div>
                {invoiceOrder.gstNumber && (
                  <div className="font-mono font-bold text-blue-700 mt-1">
                    GSTIN: {invoiceOrder.gstNumber}
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
                <div className="font-bold text-slate-500 uppercase text-[10px]">Invoice Metadata</div>
                <div className="font-mono font-black text-slate-900 mt-0.5">
                  INV-{invoiceOrder.shortId || invoiceOrder.id}
                </div>
                <div>Date: {new Date(invoiceOrder.placedAt).toLocaleDateString("en-IN")}</div>
                <div>Place of Supply: 09-Uttar Pradesh (Lucknow)</div>
                <div className="font-bold text-emerald-700 mt-1">Status: {invoiceOrder.status}</div>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 text-left border border-slate-200">Item Description</th>
                  <th className="p-2 text-left border border-slate-200">HSN</th>
                  <th className="p-2 text-right border border-slate-200">Qty</th>
                  <th className="p-2 text-right border border-slate-200">Rate (₹)</th>
                  <th className="p-2 text-right border border-slate-200">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoiceOrder.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border border-slate-200 font-semibold">{it.name}</td>
                    <td className="p-2 border border-slate-200 font-mono">{it.hsnCode || "3824"}</td>
                    <td className="p-2 border border-slate-200 text-right">
                      {it.qty} {it.unit || ""}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono">
                      {Number(it.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-bold">
                      {Number(it.totalPrice || it.unitPrice * it.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono font-bold">
                    ₹{Number(invoiceOrder.subtotal || invoiceOrder.totalAmount * 0.85).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span className="font-mono">
                    ₹{(Number(invoiceOrder.gstAmount || invoiceOrder.totalAmount * 0.15) / 2).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span className="font-mono">
                    ₹{(Number(invoiceOrder.gstAmount || invoiceOrder.totalAmount * 0.15) / 2).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-black">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-700">
                    ₹{Number(invoiceOrder.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
