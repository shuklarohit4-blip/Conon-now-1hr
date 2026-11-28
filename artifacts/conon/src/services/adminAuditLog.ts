export type AuditEventCategory =
  | "AUTH_RBAC"
  | "CATALOG_RATE"
  | "STOCK_TOGGLE"
  | "ORDER_DISPATCH"
  | "PAYOUT_SETTLEMENT"
  | "LEAD_UPDATE"
  | "SYSTEM_POLICY";

export interface AdminAuditLogEntry {
  id: string;
  timestamp: string;
  category: AuditEventCategory;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
}

const AUDIT_STORAGE_KEY = "conon_admin_audit_logs_v1";
const MAX_LOGS = 200;

const DEFAULT_AUDIT_LOGS: AdminAuditLogEntry[] = [
  {
    id: "aud-boot-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    category: "CATALOG_RATE",
    actor: "Founder & CEO",
    actorRole: "SUPER_ADMIN",
    action: "Synced Unified Master Registry",
    target: "23 Categories • Lighting, Solar, Wires, Tools & Site Kits",
    details: "Verified live pricing & GST mapping across Customer, Vendor & Admin OS.",
  },
  {
    id: "aud-boot-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    category: "SYSTEM_POLICY",
    actor: "Conon Command OS",
    actorRole: "SUPER_ADMIN",
    action: "Bulk Discount Slabs Verified",
    target: "₹15,000 Free Express • ₹50,000 Flat ₹5,000 OFF",
    details: "Live Homepage Bulk Meter & Cart Checkout policy synchronized.",
  },
];

let memoryLogs: AdminAuditLogEntry[] | null = null;
const listeners = new Set<() => void>();

function readLogs(): AdminAuditLogEntry[] {
  if (memoryLogs) return memoryLogs;
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryLogs = parsed;
          return memoryLogs;
        }
      }
    }
  } catch {
    // Graceful fallback
  }
  memoryLogs = [...DEFAULT_AUDIT_LOGS];
  return memoryLogs;
}

function writeLogs(next: AdminAuditLogEntry[]) {
  memoryLogs = next.slice(0, MAX_LOGS);
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(memoryLogs));
      window.dispatchEvent(new CustomEvent("conon_audit_logs_updated"));
    }
  } catch {
    // Ignore storage limits
  }
  listeners.forEach((cb) => cb());
}

export function appendAdminAuditLog(entry: {
  category: AuditEventCategory;
  actor?: string;
  actorRole?: string;
  action: string;
  target: string;
  details?: string;
}) {
  const current = readLogs();
  const created: AdminAuditLogEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    category: entry.category,
    actor: entry.actor || "Admin Operator",
    actorRole: entry.actorRole || (typeof window !== "undefined" ? localStorage.getItem("conon_admin_role") || "SUPER_ADMIN" : "SUPER_ADMIN"),
    action: entry.action,
    target: entry.target,
    details: entry.details || "",
  };
  writeLogs([created, ...current]);
  return created;
}

export function getAdminAuditLogs(): AdminAuditLogEntry[] {
  return readLogs();
}

export function clearAdminAuditLogs() {
  writeLogs([]);
}

export function subscribeAdminAuditLogs(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === AUDIT_STORAGE_KEY) {
      memoryLogs = null;
      cb();
    }
  };
  const onCustom = () => cb();
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    window.addEventListener("conon_audit_logs_updated", onCustom);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("conon_audit_logs_updated", onCustom);
    }
  };
}
