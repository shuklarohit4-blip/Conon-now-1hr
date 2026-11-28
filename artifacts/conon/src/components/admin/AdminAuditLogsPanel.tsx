import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock,
  Database,
  Download,
  Filter,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { apiUrl, adminFetch } from "@/lib/apiBase";
import {
  clearAdminAuditLogs,
  getAdminAuditLogs,
  subscribeAdminAuditLogs,
  type AdminAuditLogEntry,
  type AuditEventCategory,
} from "@/services/adminAuditLog";

interface HybridHealthState {
  postgres: "connected" | "error" | "checking";
  mongo: "connected" | "error" | "checking";
  uptime?: number;
  lastChecked?: string;
}

export function AdminAuditLogsPanel({ isDark = false }: { isDark?: boolean }) {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>(() => getAdminAuditLogs());
  const [serverLogs, setServerLogs] = useState<AdminAuditLogEntry[]>([]);
  const [catFilter, setCatFilter] = useState<"ALL" | AuditEventCategory>("ALL");
  const [health, setHealth] = useState<HybridHealthState>({
    postgres: "checking",
    mongo: "checking",
  });
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const loadHybridTelemetry = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/health"));
      if (res.ok) {
        const data = await res.json();
        setHealth({
          postgres: data.postgres === "connected" ? "connected" : "error",
          mongo: data.mongo === "connected" ? "connected" : "error",
          uptime: data.uptime,
          lastChecked: new Date().toLocaleTimeString("en-IN"),
        });
      }
    } catch {
      setHealth((prev) => ({ ...prev, postgres: "error", mongo: "error" }));
    }

    try {
      const res = await adminFetch("/api/admin/hybrid/audit-logs?limit=50");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setServerLogs(
            data.logs.map((entry: any, idx: number) => ({
              id: `hybrid-${entry.timestamp || idx}-${idx}`,
              category:
                entry.entityType?.includes("inventory") || entry.action?.includes("SKU")
                  ? "CATALOG_RATE"
                  : entry.entityType?.includes("orders") || entry.action?.includes("ORDER")
                    ? "ORDER_DISPATCH"
                    : entry.entityType?.includes("Lead")
                      ? "LEAD_UPDATE"
                      : "CATALOG_RATE",
              actor: String(entry.actorId || "system"),
              actorRole: String(entry.actorRole || "SYSTEM"),
              action: String(entry.action || "HYBRID_EVENT"),
              target: `${entry.entityType || "Hybrid"}:${entry.entityId || ""}`,
              details: entry.diff ? JSON.stringify(entry.diff) : "",
              timestamp: entry.timestamp || new Date().toISOString(),
            }))
          );
        }
      }
    } catch {
      // Fall back gracefully to local audit stream
    }
  }, []);

  useEffect(() => {
    setLogs(getAdminAuditLogs());
    void loadHybridTelemetry();
    const unsub = subscribeAdminAuditLogs(() => {
      setLogs(getAdminAuditLogs());
    });
    return unsub;
  }, [loadHybridTelemetry]);

  const handleTriggerSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await adminFetch("/api/admin/hybrid/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedMessage(
          `Seed synced: ${data.categoriesCount} categories • ${data.productsCount} SKUs • ${data.hubsCount} hubs • ${data.siteKitsCount} kits`
        );
        await loadHybridTelemetry();
      } else {
        setSeedMessage(data.error || "Hybrid seed failed");
      }
    } catch (err: any) {
      setSeedMessage(err?.message || "Hybrid seed request failed");
    } finally {
      setSeeding(false);
    }
  };

  const combinedLogs = useMemo(() => {
    return [...serverLogs, ...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [serverLogs, logs]);

  const filteredLogs = useMemo(() => {
    if (catFilter === "ALL") return combinedLogs;
    return combinedLogs.filter((l) => l.category === catFilter);
  }, [combinedLogs, catFilter]);

  const cardBg = isDark
    ? "bg-[#0F172A] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-xs";

  const handleExportCsv = () => {
    const rows = [
      ["Timestamp", "Category", "Actor", "Role", "Action", "Target", "Details"].join(","),
      ...filteredLogs.map((l) =>
        [
          l.timestamp,
          l.category,
          `"${l.actor.replace(/"/g, '""')}"`,
          l.actorRole,
          `"${l.action.replace(/"/g, '""')}"`,
          `"${l.target.replace(/"/g, '""')}"`,
          `"${l.details.replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conon-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStatusPill = (label: string, status: HybridHealthState["postgres"]) => {
    const style =
      status === "connected"
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        : status === "checking"
          ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30"
          : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    return (
      <span className={`px-3 py-1.5 rounded-xl border text-xs font-black inline-flex items-center gap-1.5 ${style}`}>
        <span
          className={`w-2 h-2 rounded-full ${
            status === "connected"
              ? "bg-emerald-500 animate-pulse"
              : status === "checking"
                ? "bg-amber-500"
                : "bg-rose-500"
          }`}
        />
        {label}: {status}
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Hybrid DB Health Card */}
      <div className={`rounded-3xl border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${cardBg}`}>
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-sky-300 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Database className="w-3 h-3" /> Hybrid PostgreSQL + MongoDB Sync Health
          </span>
          <h3 className="text-base font-black mt-1.5">
            Transactional Ledger (PostgreSQL) &amp; Catalog Specs (MongoDB) Bridge
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict <code className="font-mono">skuCode</code> bridge •{" "}
            {health.lastChecked ? `Last checked ${health.lastChecked}` : "Checking live health..."}
          </p>
          {seedMessage && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">{seedMessage}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {renderStatusPill("PostgreSQL", health.postgres)}
          {renderStatusPill("MongoDB", health.mongo)}
          <button
            type="button"
            onClick={() => void loadHybridTelemetry()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
              isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Health
          </button>
          <button
            type="button"
            disabled={seeding}
            onClick={() => void handleTriggerSeed()}
            className="px-3.5 py-1.5 rounded-xl bg-[#12357A] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {seeding ? "Seeding..." : "Seed Hybrid DBs"}
          </button>
        </div>
      </div>

      {/* Audit Toolbar */}
      <div className={`rounded-3xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardBg}`}>
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> System Health &amp; Audit Trail
          </span>
          <h2 className="text-lg font-black mt-1.5">Real-Time Operations &amp; Security Audit Logs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tracks rate changes, escrow payouts, stock kill-switches, order overrides, and RBAC logins
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
              }`}
            >
              <option value="ALL">All Events ({combinedLogs.length})</option>
              <option value="AUTH_RBAC">Auth &amp; RBAC</option>
              <option value="CATALOG_RATE">Catalog &amp; Rates</option>
              <option value="STOCK_TOGGLE">Stock Kill-Switch</option>
              <option value="ORDER_DISPATCH">Order Dispatch</option>
              <option value="PAYOUT_SETTLEMENT">Escrow Payouts</option>
              <option value="LEAD_UPDATE">Leads Pipeline</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-[#12357A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            type="button"
            onClick={() => clearAdminAuditLogs()}
            className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Log Stream */}
      <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <Activity className="w-7 h-7 mx-auto mb-2 opacity-40" />
            No audit log entries recorded for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-sky-300 text-[10px] font-black">
                      {log.category}
                    </span>
                    <span className="font-black">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-300 truncate">
                      {log.target}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 break-all">{log.details}</p>
                  )}
                </div>

                <div className="shrink-0 text-left sm:text-right text-[10.5px] text-slate-400">
                  <p className="font-bold text-slate-600 dark:text-slate-300">
                    {log.actor} ({log.actorRole})
                  </p>
                  <p className="font-mono flex items-center sm:justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
