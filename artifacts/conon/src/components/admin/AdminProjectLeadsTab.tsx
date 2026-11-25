import React, { useState, useEffect } from "react";
import {
  Building2,
  PhoneCall,
  MessageSquare,
  Clock,
  CheckCircle,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  ShoppingCart,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";

export interface BuilderKitLead {
  id: string;
  name: string;
  phone: string;
  lucknowZone: string;
  builtUpSqFt: number;
  qualityTier: "STANDARD" | "PREMIUM" | "LUXURY";
  wallType: "RED_BRICK" | "AAC_BLOCK";
  floors: number;
  grandTotal: number;
  notes?: string;
  startDate?: string;
  status: "NEW" | "CONTACTED" | "QUOTE_SENT" | "CONVERTED";
  assignedEngineer: string;
  createdAt: string;
  updatedAt: string;
  boqSummary?: {
    grandTotal: number;
    costPerSqFt: number;
    stages: Array<{
      stageId: number;
      stageName: string;
      subtotal: number;
      itemCount: number;
    }>;
  };
}

interface LeadsResponse {
  success: boolean;
  leads: BuilderKitLead[];
  stats: {
    total: number;
    newCount: number;
    contactedCount: number;
    convertedCount: number;
    totalPipelineValue: number;
  };
}

export function AdminProjectLeadsTab() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<BuilderKitLead | null>(null);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(resolveApiUrl("/api/admin/leads"));
      if (!res.ok) throw new Error("Failed to fetch leads");
      const json: LeadsResponse = await res.json();
      setData(json);
      if (json.leads.length > 0 && !selectedLead) {
        setSelectedLead(json.leads[0]);
      }
    } catch {
      toast.error("Could not load project leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: BuilderKitLead["status"]) => {
    try {
      const res = await fetch(resolveApiUrl(`/api/admin/leads/${leadId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      const json = await res.json();
      toast.success(`Lead ${leadId} status updated to ${newStatus}`);
      setData((prev) => {
        if (!prev) return null;
        const updated = prev.leads.map((l) => (l.id === leadId ? json.lead : l));
        return {
          ...prev,
          leads: updated,
          stats: {
            ...prev.stats,
            newCount: updated.filter((l) => l.status === "NEW").length,
            contactedCount: updated.filter((l) => l.status === "CONTACTED").length,
            convertedCount: updated.filter((l) => l.status === "CONVERTED").length,
          },
        };
      });
      if (selectedLead?.id === leadId) {
        setSelectedLead(json.lead);
      }
    } catch {
      toast.error("Could not update lead status");
    }
  };

  const handleWhatsAppChat = (lead: BuilderKitLead) => {
    const text = encodeURIComponent(
      `Hello ${lead.name}! This is Er. Abhishek from CONON-NOW Lucknow Construction Network. Regarding your ${lead.builtUpSqFt} sq ft (${lead.qualityTier} Quality) project inquiry in ${lead.lucknowZone}: We have prepared your customized wholesale material schedule with free scheduled delivery. Are you available for a 5-minute call today?`
    );
    window.open(`https://wa.me/91${lead.phone}?text=${text}`, "_blank");
  };

  const filteredLeads = (data?.leads || []).filter((l) => {
    const matchesStatus = selectedStatus === "ALL" || l.status === selectedStatus;
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.lucknowZone.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = data?.stats || {
    total: 0,
    newCount: 0,
    contactedCount: 0,
    convertedCount: 0,
    totalPipelineValue: 0,
  };

  return (
    <div className="space-y-5 text-slate-900">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Inquiries</span>
          <span className="text-xl font-black text-slate-900 block mt-0.5">{stats.total}</span>
          <span className="text-[10px] text-slate-500">6-Stage Planner Leads</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">New (Action Required)</span>
          <span className="text-xl font-black text-amber-950 block mt-0.5">{stats.newCount}</span>
          <span className="text-[10px] text-amber-800 font-semibold">Immediate Follow-Up</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Converted to Orders</span>
          <span className="text-xl font-black text-emerald-950 block mt-0.5">{stats.convertedCount}</span>
          <span className="text-[10px] text-emerald-800 font-semibold">Sites Active in Lucknow</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pipeline Value</span>
          <span className="text-xl font-black text-slate-900 block mt-0.5">
            ₹{(stats.totalPipelineValue / 100000).toFixed(1)} Lakhs
          </span>
          <span className="text-[10px] text-slate-500">Verified Material Quotes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "NEW", "CONTACTED", "QUOTE_SENT", "CONVERTED"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedStatus === st
                  ? "bg-[#1E293B] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? "All Leads" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, zone..."
              className="bg-transparent text-slate-800 placeholder:text-slate-400 outline-none w-full"
            />
          </div>
          <button
            onClick={fetchLeads}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2-Column Leads Workspace: List on left, details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Leads List */}
        <div className="lg:col-span-5 space-y-2.5">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border">
              Loading project leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border">
              No project leads matching current filter.
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;
              const statusColors = {
                NEW: "bg-amber-100 text-amber-900 border-amber-300",
                CONTACTED: "bg-blue-100 text-blue-900 border-blue-300",
                QUOTE_SENT: "bg-purple-100 text-purple-900 border-purple-300",
                CONVERTED: "bg-emerald-100 text-emerald-900 border-emerald-300",
              };

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#FDB813] shadow-md ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">
                        {lead.id}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">{lead.name}</h4>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColors[lead.status]}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">{lead.lucknowZone}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-500">
                      {lead.builtUpSqFt} sq ft • {lead.qualityTier}
                    </span>
                    <span className="font-black text-slate-900">
                      ₹{Math.round(lead.grandTotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Lead Detailed Preview & Quick Actions */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sticky top-6 space-y-6">
          {selectedLead ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {selectedLead.id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {new Date(selectedLead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedLead.lucknowZone}, Lucknow</span>
                    <span>• Start: {selectedLead.startDate || "Within 15 Days"}</span>
                  </p>
                </div>

                {/* Direct Action Buttons: WhatsApp & Call */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleWhatsAppChat(selectedLead)}
                    className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </button>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="Direct Phone Call"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Pipeline Status</span>
                  <span className="text-xs text-slate-600 font-medium">Assigned: {selectedLead.assignedEngineer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["NEW", "CONTACTED", "QUOTE_SENT", "CONVERTED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedLead.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                        selectedLead.status === st
                          ? "bg-[#1E293B] text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Parameters Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 block font-medium">Built-Up Area</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedLead.builtUpSqFt.toLocaleString("en-IN")} sq ft
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {selectedLead.floors === 1 ? "Ground" : `G+${selectedLead.floors - 1}`} Structure
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 block font-medium">Quality Tier</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {selectedLead.qualityTier} Quality
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {selectedLead.wallType === "RED_BRICK" ? "Red Clay Bricks" : "AAC Blocks"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 block font-medium">Material Budget</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{Math.round(selectedLead.grandTotal).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ₹{Math.round(selectedLead.grandTotal / selectedLead.builtUpSqFt)}/sq ft
                  </span>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedLead.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                  <span className="font-bold block mb-0.5">Client Note / Specific Requests:</span>
                  <p className="leading-relaxed">{selectedLead.notes}</p>
                </div>
              )}

              {/* Stage-by-Stage Subtotals Breakdown */}
              {selectedLead.boqSummary?.stages && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    6-Stage Estimated Material Takeoff
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {selectedLead.boqSummary.stages.map((st) => (
                      <div key={st.stageId} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            Stage {st.stageId}: {st.stageName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {st.itemCount} verified catalog materials
                          </span>
                        </div>
                        <span className="font-black text-slate-900">
                          ₹{Math.round(st.subtotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversion Footer Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-400">Phone: +91 {selectedLead.phone}</span>
                <button
                  onClick={() => {
                    handleStatusChange(selectedLead.id, "CONVERTED");
                    toast.success(`Draft order generated for ${selectedLead.name}! Site deliveries queued.`);
                  }}
                  className="px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Convert to Draft Order</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Select a project lead from the list to view specifications and initiate follow-up.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
