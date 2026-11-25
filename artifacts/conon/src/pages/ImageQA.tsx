import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Upload,
  Check,
  ImageIcon,
  ShieldCheck,
  Tag,
  ArrowRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";
import { ADMIN_JWT_KEY } from "@/lib/authApi";

function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_JWT_KEY) : null;
  return fetch(resolveApiUrl(path), {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

interface Candidate {
  url: string;
  source: string;
}

interface ManifestEntry {
  id: string;
  skuSlug: string;
  categorySlug: string;
  title: string;
  brand: string;
  oemModelCode: string;
  price: number;
  candidates: Candidate[];
  selectedCandidateIndex: number;
  localPath: string;
  sha256: string;
  fileSizeBytes: number;
  dimensions: { width: number; height: number };
  status: "AUTO_FETCHED" | "NEEDS_REVIEW" | "APPROVED";
  lastUpdated: string;
}

export default function ImageQA() {
  const [manifest, setManifest] = useState<Record<string, ManifestEntry>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchManifest = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/image-qa/manifest");
      if (res.ok) {
        const data = await res.json();
        setManifest(data.manifest || {});
      } else {
        toast.error("Failed to load image manifest from server");
      }
    } catch (err: any) {
      toast.error(`Error loading manifest: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManifest();
  }, []);

  const handleSelectCandidate = async (productId: string, candidateIndex: number) => {
    try {
      setProcessingId(productId);
      const res = await adminFetch("/api/admin/image-qa/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, candidateIndex }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Updated packshot to Candidate #${candidateIndex + 1}!`);
        setManifest((prev) => ({
          ...prev,
          [productId]: data.entry,
        }));
      } else {
        toast.error(data.error || "Failed to switch candidate");
      }
    } catch (err: any) {
      toast.error(`Error selecting candidate: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApplyCustomUrl = async (productId: string) => {
    const customUrl = customUrls[productId]?.trim();
    if (!customUrl) {
      toast.error("Please enter a valid image URL");
      return;
    }

    try {
      setProcessingId(productId);
      const res = await adminFetch("/api/admin/image-qa/custom-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Custom URL downloaded and converted to WebP successfully!");
        setManifest((prev) => ({
          ...prev,
          [productId]: data.entry,
        }));
        setCustomUrls((prev) => ({ ...prev, [productId]: "" }));
      } else {
        toast.error(data.error || "Failed to process custom URL");
      }
    } catch (err: any) {
      toast.error(`Error applying custom URL: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const res = await adminFetch("/api/admin/image-qa/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Packshot marked as APPROVED!");
        setManifest((prev) => ({
          ...prev,
          [productId]: data.entry,
        }));
      }
    } catch (err: any) {
      toast.error("Failed to approve packshot");
    }
  };

  const entries = useMemo(() => Object.values(manifest), [manifest]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchCat =
        selectedCategory === "all" ||
        e.categorySlug?.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchStatus =
        selectedStatus === "all" || e.status === selectedStatus;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title?.toLowerCase().includes(q) ||
        e.brand?.toLowerCase().includes(q) ||
        e.oemModelCode?.toLowerCase().includes(q) ||
        e.id?.toLowerCase().includes(q);

      return matchCat && matchStatus && matchSearch;
    });
  }, [entries, selectedCategory, selectedStatus, search]);

  const stats = useMemo(() => {
    const total = entries.length;
    const approved = entries.filter((e) => e.status === "APPROVED").length;
    const autoFetched = entries.filter((e) => e.status === "AUTO_FETCHED").length;
    const needsReview = entries.filter((e) => e.status === "NEEDS_REVIEW").length;
    return { total, approved, autoFetched, needsReview };
  }, [entries]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Conon-Now Visual Image QA & Packshot Verifier
              </h1>
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">
                Admin QA
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inspect, compare candidates, verify SHA-256 deduplication, and approve 800x800 WebP packshots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchManifest}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total SKUs in QA</p>
            <p className="text-xl font-black text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-[11px] font-bold text-emerald-600 uppercase">Approved Packshots</p>
            <p className="text-xl font-black text-emerald-800">{stats.approved}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-[11px] font-bold text-blue-600 uppercase">Auto Fetched (Active)</p>
            <p className="text-xl font-black text-blue-800">{stats.autoFetched}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[11px] font-bold text-amber-600 uppercase">Needs Review</p>
            <p className="text-xl font-black text-amber-800">{stats.needsReview}</p>
          </div>
        </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, brand, OEM code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="sanitary">Sanitary & Bath</option>
              <option value="cctv">CCTV & Networking</option>
              <option value="plumbing">Plumbing & Tanks</option>
              <option value="electrical">Electricals & Wires</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="APPROVED">Approved Only</option>
              <option value="AUTO_FETCHED">Auto Fetched</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading && entries.length === 0 ? (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Loading Product Image Manifest...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No products match the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntries.map((item) => {
              const isProcessing = processingId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase rounded-md">
                            {item.brand}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded-md">
                            {item.oemModelCode || item.skuSlug}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                              item.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-slate-900">₹{item.price}</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.categorySlug}</p>
                      </div>
                    </div>

                    {/* Main Image Preview & Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-3 bg-slate-50 border border-slate-100 rounded-xl items-center">
                      <div className="relative aspect-square w-full max-w-[200px] mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden p-2 flex items-center justify-center shadow-2xs">
                        <img
                          src={`${item.localPath}?t=${item.lastUpdated}`}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/80 text-white text-[9px] font-mono rounded-sm">
                          800×800
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5 font-medium text-slate-600">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Verified WebP Packshot
                        </p>
                        <p className="text-[11px]">
                          <strong>File Size:</strong> {(item.fileSizeBytes / 1024).toFixed(1)} KB (Target &lt;80KB)
                        </p>
                        <p className="text-[11px] font-mono truncate" title={item.sha256}>
                          <strong>SHA-256:</strong> {item.sha256 ? `${item.sha256.slice(0, 16)}...` : "N/A"}
                        </p>
                        <p className="text-[11px] truncate" title={item.localPath}>
                          <strong>Local Path:</strong> {item.localPath}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Packshot
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Thumbnails Selector */}
                    <div>
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide mb-2">
                        Candidate Packshots (Top 3)
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {item.candidates?.map((cand, idx) => {
                          const isSelected = item.selectedCandidateIndex === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => handleSelectCandidate(item.id, idx)}
                              className={`p-2 bg-white rounded-xl border-2 transition-all cursor-pointer text-center relative ${
                                isSelected
                                  ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/20"
                                  : "border-slate-200 hover:border-slate-400"
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                                  ✓
                                </span>
                              )}
                              <div className="w-full aspect-square bg-slate-50 rounded-lg flex items-center justify-center p-1 mb-1 overflow-hidden">
                                {cand.url.startsWith("http") ? (
                                  <img
                                    src={cand.url}
                                    alt={`Candidate ${idx + 1}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-[10px] font-black text-blue-700">OEM SPEC</span>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-800">Candidate #{idx + 1}</p>
                              <p className="text-[9px] font-medium text-slate-400 truncate" title={cand.source}>
                                {cand.source.replace("OFFICIAL_", "").replace("SERPAPI_", "")}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Custom URL Input */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste custom verified URL to replace..."
                      value={customUrls[item.id] || ""}
                      onChange={(e) =>
                        setCustomUrls({ ...customUrls, [item.id]: e.target.value })
                      }
                      className="grow px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleApplyCustomUrl(item.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Apply WebP"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
