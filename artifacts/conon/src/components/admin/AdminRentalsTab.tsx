import React, { useState, useEffect } from "react";
import { Plus, Edit3, Check, X, Truck, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  rate: number;
  unit: string;
  available: boolean;
  specs: string;
  imageUrl?: string;
}

export function AdminRentalsTab() {
  const [rentals, setRentals] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Earthmoving");
  const [newRate, setNewRate] = useState("");
  const [newSpecs, setNewSpecs] = useState("");

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await fetch(resolveApiUrl("/api/admin/rentals"));
      if (res.ok) {
        const data = await res.json();
        setRentals(data);
      }
    } catch {
      toast.error("Failed to load equipment rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleToggleAvailability = async (item: EquipmentItem) => {
    const nextState = !item.available;
    // Optimistic
    setRentals((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, available: nextState } : r))
    );

    try {
      const res = await fetch(resolveApiUrl(`/api/admin/rentals/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: nextState }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      toast.success(`${item.name} marked ${nextState ? "Available" : "Booked"}`);
    } catch {
      // Rollback
      setRentals((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, available: !nextState } : r))
      );
      toast.error("Failed to update equipment status");
    }
  };

  const handleSaveRate = async (item: EquipmentItem) => {
    const rateNum = Number(editRate);
    if (!rateNum || isNaN(rateNum) || rateNum <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    try {
      const res = await fetch(resolveApiUrl(`/api/admin/rentals/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: rateNum }),
      });
      if (!res.ok) throw new Error("Save failed");

      setRentals((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, rate: rateNum } : r))
      );
      setEditingId(null);
      toast.success(`${item.name} rate updated to ₹${rateNum}/day`);
    } catch {
      toast.error("Failed to update rate");
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(newRate);
    if (!newName.trim() || !rateNum || rateNum <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(resolveApiUrl("/api/admin/rentals"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory,
          rate: rateNum,
          unit: "day",
          available: true,
          specs: newSpecs.trim() || "Heavy machinery with certified operator",
        }),
      });

      if (!res.ok) throw new Error("Creation failed");
      const json = await res.json();

      setRentals((prev) => [...prev, json.item]);
      setShowAddModal(false);
      setNewName("");
      setNewRate("");
      setNewSpecs("");
      toast.success(`Equipment "${newName}" added to fleet!`);
    } catch {
      toast.error("Failed to add equipment");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-900">Heavy Construction Equipment & Machinery Rentals</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch ready-mix transit mixers, excavators, batching plants, and tower cranes with certified operators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRentals}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition active:scale-95"
            title="Refresh Rentals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment</span>
          </button>
        </div>
      </div>

      {/* Grid of Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rentals.map((eq) => {
          const isEditing = editingId === eq.id;

          return (
            <div
              key={eq.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                eq.available ? "border-slate-200" : "border-slate-200 opacity-80 bg-slate-50/50"
              }`}
            >
              <div>
                {/* Header Badge & Switch */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                    {eq.category}
                  </span>

                  <button
                    onClick={() => handleToggleAvailability(eq)}
                    className="flex items-center gap-1.5 transition active:scale-95"
                    title={eq.available ? "Mark as Booked" : "Mark as Available"}
                  >
                    {eq.available ? (
                      <ToggleRight className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Name */}
                <h3 className="font-black text-sm text-slate-900 leading-snug">{eq.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{eq.specs}</p>
              </div>

              {/* Pricing & Availability Bottom Row */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Daily Rental</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        autoFocus
                        className="w-20 px-1.5 py-0.5 border border-amber-400 rounded text-xs font-bold"
                      />
                      <button
                        onClick={() => handleSaveRate(eq)}
                        className="p-1 rounded bg-emerald-600 text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded bg-slate-200 text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm font-black text-slate-900">
                        ₹{eq.rate.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500">/{eq.unit}</span>
                      <button
                        onClick={() => {
                          setEditingId(eq.id);
                          setEditRate(String(eq.rate));
                        }}
                        className="text-slate-400 hover:text-amber-600 transition ml-1"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      eq.available ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {eq.available ? "Available" : "Booked"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Add Equipment to Fleet</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Concrete Needle Vibrator 2HP"
                  className="w-full px-3 py-2 border rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-medium bg-white"
                  >
                    <option value="Earthmoving">Earthmoving</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Lifting">Lifting</option>
                    <option value="Power & Site">Power & Site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specifications & Scope</label>
                <textarea
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  placeholder="e.g. 40mm needle, 5m flexible shaft, 220V electric motor with site operator"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
