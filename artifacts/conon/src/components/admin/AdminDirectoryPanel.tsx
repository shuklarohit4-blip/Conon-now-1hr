import React, { useEffect, useState } from "react";
import {
  Store,
  Truck,
  Plus,
  Phone,
  MapPin,
  ShieldCheck,
  Power,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";

export function AdminDirectoryPanel({ isDark = true }: { isDark?: boolean }) {
  const [tab, setTab] = useState<"vendors" | "drivers">("vendors");
  const [vendors, setVendors] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formName, setFormName] = useState("");
  const [formOwner, setFormOwner] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formZone, setFormZone] = useState("Sushant Golf City / 226030");
  const [formCategories, setFormCategories] = useState("Cement, Steel, CPVC");
  const [formPlate, setFormPlate] = useState("UP 32 CONON 101");
  const [formVehicleModel, setFormVehicleModel] = useState("Tata Ace Gold (1.5T Loader)");

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/directory");
      if (res.ok) {
        const data = await res.json();
        setVendors(Array.isArray(data?.vendors) ? data.vendors : []);
        setDrivers(Array.isArray(data?.drivers) ? data.drivers : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDirectory();
    return subscribeSseSync((msg) => {
      if (msg.type === "PARTNERS_UPDATED" || msg.type === "FORCE_SYNC") {
        void loadDirectory();
      }
    });
  }, []);

  const toggleVendorActive = async (v: any) => {
    try {
      const res = await adminFetch(`/api/admin/directory/vendors/${encodeURIComponent(v.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !v.isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${v.name} marked ${!v.isActive ? "Active" : "Paused"}`);
      await loadDirectory();
    } catch {
      toast.error("Failed to toggle vendor status");
    }
  };

  const toggleDriverOnline = async (d: any) => {
    try {
      const res = await adminFetch(`/api/admin/directory/drivers/${encodeURIComponent(d.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !d.isOnline }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${d.name} is now ${!d.isOnline ? "Online" : "Offline"}`);
      await loadDirectory();
    } catch {
      toast.error("Failed to toggle driver duty status");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }
    try {
      const endpoint =
        tab === "vendors" ? "/api/admin/directory/vendors" : "/api/admin/directory/drivers";
      const body =
        tab === "vendors"
          ? {
              name: formName.trim(),
              ownerName: formOwner.trim() || formName.trim(),
              phone: formPhone.trim(),
              zone: formZone.trim(),
              categories: formCategories
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : {
              name: formName.trim(),
              phone: formPhone.trim(),
              currentZone: formZone.trim(),
              vehiclePlate: formPlate.trim(),
              vehicleModel: formVehicleModel.trim(),
            };

      const res = await adminFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Create failed");
      toast.success(`Added ${tab === "vendors" ? "Partner Vendor" : "Driver"} "${formName}"!`);
      setShowAddModal(false);
      setFormName("");
      setFormPhone("");
      await loadDirectory();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add directory entry");
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
            <Store className="w-5 h-5 text-amber-400" />
            <span>Partners &amp; Drivers Directory</span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage Lucknow supplier depots and verified fleet drivers used in Order Dispatch assignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setTab("vendors")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                tab === "vendors" ? "bg-amber-400 text-slate-950" : "text-slate-300"
              }`}
            >
              Partner Hubs ({vendors.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("drivers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                tab === "drivers" ? "bg-amber-400 text-slate-950" : "text-slate-300"
              }`}
            >
              Drivers Fleet ({drivers.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {tab === "vendors" ? "Partner" : "Driver"}</span>
          </button>

          <button
            type="button"
            onClick={() => void loadDirectory()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {tab === "vendors" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <div key={v.id} className={`rounded-2xl border p-4 space-y-3 ${cardCls}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black">{v.name}</h4>
                  <p className="text-xs text-slate-400">Owner: {v.ownerName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleVendorActive(v)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 cursor-pointer ${
                    v.isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                  {v.isActive ? "Active" : "Paused"}
                </button>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono">{v.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{v.zone}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                {(v.categories || []).map((c: string) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-amber-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <div key={d.id} className={`rounded-2xl border p-4 space-y-3 ${cardCls}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black flex items-center gap-1.5">
                    {d.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">{d.vehiclePlate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleDriverOnline(d)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 cursor-pointer ${
                    d.isOnline
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                  {d.isOnline ? "Online" : "Offline"}
                </button>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{d.vehicleModel || d.vehicleLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">{d.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{d.currentZone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-3 text-xs text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black">
                Add {tab === "vendors" ? "Partner Supplier Hub" : "Fleet Driver"}
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-bold block mb-1">
                {tab === "vendors" ? "Depot / Firm Name *" : "Driver Full Name *"}
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
              />
            </div>

            {tab === "vendors" && (
              <div>
                <label className="font-bold block mb-1">Owner Name</label>
                <input
                  type="text"
                  value={formOwner}
                  onChange={(e) => setFormOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                />
              </div>
            )}

            <div>
              <label className="font-bold block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98390 XXXXX"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Lucknow Area / Zone</label>
              <input
                type="text"
                value={formZone}
                onChange={(e) => setFormZone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
              />
            </div>

            {tab === "vendors" ? (
              <div>
                <label className="font-bold block mb-1">Categories (comma separated)</label>
                <input
                  type="text"
                  value={formCategories}
                  onChange={(e) => setFormCategories(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Vehicle Plate</label>
                  <input
                    type="text"
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={formVehicleModel}
                    onChange={(e) => setFormVehicleModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer"
              >
                Save to Directory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
