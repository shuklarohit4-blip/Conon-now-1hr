import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Plus, MessageCircle, FileDown, X,
  TrendingUp, TrendingDown, Users, Wallet, Phone, Paperclip,
  ChevronRight, IndianRupee, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const BRAND = "#1b4366";
const GREEN = "#15803d";
const RED   = "#dc2626";
const AMBER = "#b45309";

/* ── Types ───────────────────────────────────────────────────── */
interface KhataClient {
  id: string; name: string; type: "Contractor" | "Builder" | "Individual";
  phone: string; creditLimit: number; utilized: number; pending: number;
  outstanding: number; available: number; overdueDays: number; txnCount: number;
}
interface Txn {
  id: number; date: string; kind: "debit" | "credit";
  description: string; amount: number; balance: number;
}
interface LedgerResponse extends KhataClient { transactions: Txn[]; }
interface Summary {
  totalOutstanding: number; collectedToday: number; activeAccounts: number;
  overdueAccounts: number; totalCreditLimit: number; totalClients: number;
}

const PAY_MODES = ["Cash", "UPI", "Cheque", "RTGS/NEFT"] as const;
type PayMode = typeof PAY_MODES[number];

/* ── Helpers ─────────────────────────────────────────────────── */
const API = import.meta.env.BASE_URL; // ends with "/"
async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, { credentials: "include", ...opts });
  if (!r.ok) throw new Error(String(r.status));
  return r.json() as Promise<T>;
}
const inr = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const TYPE_TINT: Record<KhataClient["type"], string> = {
  Contractor: "#1b4366", Builder: "#7c3aed", Individual: "#0891b2",
};

/* ════════════════════════════════════════════════════════════════
   KHATA MANAGER
════════════════════════════════════════════════════════════════ */
export function KhataManager() {
  const [, setLocation] = useLocation();
  const [clients, setClients] = useState<KhataClient[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [payFor, setPayFor]   = useState<KhataClient | null>(null);

  const loadAll = useCallback(() => {
    Promise.all([
      api<KhataClient[]>("api/admin/khata"),
      api<Summary>("api/admin/khata/summary"),
    ])
      .then(([list, sum]) => { setClients(list); setSummary(sum); })
      .catch(() => toast.error("Could not load Khata accounts"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.phone.includes(q));
  }, [clients, search]);

  const onPaymentDone = () => { setPayFor(null); loadAll(); };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[480px] bg-slate-50 min-h-screen relative shadow-2xl flex flex-col">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="px-5 pt-10 pb-6 rounded-b-[36px] shadow-lg" style={{ background: BRAND }}>
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setLocation("/home")} className="p-2 bg-white/10 rounded-full">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div>
              <h2 className="font-display font-black italic text-xl text-white">Khata Manager</h2>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">B2B Credit & Collections</p>
            </div>
            <div className="ml-auto p-2 bg-white/10 rounded-full">
              <Wallet className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard
              label="Outstanding" tone="red"
              value={summary ? inr(summary.totalOutstanding) : "—"}
              icon={<TrendingUp className="w-3.5 h-3.5" />} />
            <SummaryCard
              label="Collected Today" tone="green"
              value={summary ? inr(summary.collectedToday) : "—"}
              icon={<TrendingDown className="w-3.5 h-3.5" />} />
            <SummaryCard
              label="Active A/Cs" tone="amber"
              value={summary ? String(summary.activeAccounts) : "—"}
              icon={<Users className="w-3.5 h-3.5" />} />
          </div>
        </div>

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search client, type or phone…"
              className="flex-1 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 placeholder:font-medium"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* ── Client list ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10 space-y-2.5 scrollbar-hide">
          {loading && (
            <div className="text-center text-slate-400 text-sm font-semibold py-16">Loading accounts…</div>
          )}
          {!loading && visible.length === 0 && (
            <div className="text-center text-slate-400 text-sm font-semibold py-16">No accounts match “{search}”.</div>
          )}
          {visible.map((c, i) => {
            const settled = c.outstanding <= 0;
            const advance = c.outstanding < 0;
            const amtColor = advance ? GREEN : settled ? GREEN : c.overdueDays > 0 ? RED : BRAND;
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setSelected(c.id)}
                className="w-full text-left bg-white rounded-[22px] p-4 border border-slate-200 flex items-center gap-3 active:scale-[0.99] transition"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-sm"
                  style={{ background: TYPE_TINT[c.type] }}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">{c.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md"
                      style={{ background: `${TYPE_TINT[c.type]}14`, color: TYPE_TINT[c.type] }}>
                      {c.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Limit {inr(c.creditLimit)}
                    </span>
                    {c.overdueDays > 0 && (
                      <span className="text-[9px] font-black text-red-500 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> {c.overdueDays}d
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color: amtColor }}>
                    {advance ? "+" : ""}{inr(c.outstanding)}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: amtColor }}>
                    {advance ? "Advance" : settled ? "Settled" : "Outstanding"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </motion.button>
            );
          })}
        </div>

        {/* ── Detailed ledger drawer ─────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <LedgerView
              clientId={selected}
              onClose={() => setSelected(null)}
              onRecordPayment={(c) => setPayFor(c)}
              refreshKey={clients}
            />
          )}
        </AnimatePresence>

        {/* ── Record payment sheet ───────────────────────────── */}
        <AnimatePresence>
          {payFor && (
            <RecordPayment
              client={payFor}
              onClose={() => setPayFor(null)}
              onDone={onPaymentDone}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Summary card ────────────────────────────────────────────── */
function SummaryCard({ label, value, icon, tone }: {
  label: string; value: string; icon: React.ReactNode;
  tone: "red" | "green" | "amber";
}) {
  const color = tone === "red" ? "#fca5a5" : tone === "green" ? "#86efac" : "#fcd34d";
  return (
    <div className="bg-white/10 rounded-2xl p-3 border border-white/5">
      <div className="flex items-center gap-1 mb-1" style={{ color }}>
        {icon}
        <p className="text-[8px] font-black uppercase tracking-wide leading-tight">{label}</p>
      </div>
      <p className="text-[13px] font-display font-black text-white leading-tight">{value}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DETAILED LEDGER VIEW
════════════════════════════════════════════════════════════════ */
function LedgerView({ clientId, onClose, onRecordPayment, refreshKey }: {
  clientId: string;
  onClose: () => void;
  onRecordPayment: (c: KhataClient) => void;
  refreshKey: unknown;
}) {
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<LedgerResponse>(`api/admin/khata/${clientId}/ledger`)
      .then(setData)
      .catch(() => toast.error("Could not load ledger"))
      .finally(() => setLoading(false));
  }, [clientId, refreshKey]);

  const sendWhatsApp = () => {
    if (!data) return;
    const due = Math.max(0, data.outstanding);
    const msg =
      `Dear ${data.name}, your current outstanding balance with CONON Infrabuilt is ₹${due.toLocaleString("en-IN")}. ` +
      `Kindly arrange the payment at your earliest. Thank you. — Team CONON`;
    window.open(`https://wa.me/91${data.phone}?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success(`WhatsApp reminder drafted for ${data.name}`);
  };

  const downloadStatement = () => {
    window.open(`${API}api/admin/khata/${clientId}/statement`, "_blank");
    toast.success("Statement opened — use Print to save as PDF");
  };

  const out = data?.outstanding ?? 0;
  const advance = out < 0;
  const settled = out === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        className="absolute inset-0 z-50 bg-slate-50 flex flex-col"
      >
        {/* Header */}
        <div className="px-5 pt-10 pb-5 rounded-b-[32px] shadow-lg" style={{ background: BRAND }}>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="min-w-0">
              <h3 className="font-display font-black italic text-lg text-white truncate">
                {data?.name ?? "Loading…"}
              </h3>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                {data ? `${data.type} · +91-${data.phone}` : ""}
              </p>
            </div>
          </div>

          {data && (
            <div className="bg-white/10 rounded-[24px] p-4 border border-white/5">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-0.5">
                    {advance ? "Advance Balance" : "Net Outstanding"}
                  </p>
                  <p className="text-3xl font-display font-black italic"
                    style={{ color: advance || settled ? "#86efac" : "#fca5a5" }}>
                    {advance ? "+" : ""}{inr(out)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-0.5">Credit Limit</p>
                  <p className="text-base font-display font-black text-white">{inr(data.creditLimit)}</p>
                  <p className="text-[9px] font-bold text-blue-200 mt-0.5">Avl {inr(data.available)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {data && (
          <div className="px-5 pt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => onRecordPayment(data)}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-wide"
              style={{ background: BRAND }}>
              <Plus className="w-4 h-4" /> Record Pay
            </button>
            <button
              onClick={sendWhatsApp}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wide text-white"
              style={{ background: "#16a34a" }}>
              <MessageCircle className="w-4 h-4" /> Remind
            </button>
            <button
              onClick={downloadStatement}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wide bg-white text-slate-700 border border-slate-200">
              <FileDown className="w-4 h-4" /> Statement
            </button>
          </div>
        )}

        {/* Ledger list */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10 scrollbar-hide">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Transaction Statement
          </p>
          {loading && <div className="text-center text-slate-400 text-sm py-12 font-semibold">Loading…</div>}
          {data && [...data.transactions].reverse().map((t, i) => {
            const isDebit = t.kind === "debit";
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.25) }}
                className="bg-white rounded-[18px] p-3.5 border border-slate-200 mb-2 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: isDebit ? "#fef2f2" : "#f0fdf4" }}>
                  {isDebit
                    ? <TrendingUp className="w-4 h-4" style={{ color: RED }} />
                    : <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 leading-snug">{t.description}</p>
                  <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{fmtDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color: isDebit ? RED : GREEN }}>
                    {isDebit ? "−" : "+"}{inr(t.amount)}
                  </p>
                  <p className="text-[9px] font-bold mt-0.5"
                    style={{ color: t.balance < 0 ? GREEN : "#94a3b8" }}>
                    Bal {inr(t.balance)} {t.balance < 0 ? "Cr" : t.balance > 0 ? "Dr" : ""}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   RECORD PAYMENT SHEET
════════════════════════════════════════════════════════════════ */
function RecordPayment({ client, onClose, onDone }: {
  client: KhataClient; onClose: () => void; onDone: () => void;
}) {
  const [amount, setAmount]     = useState("");
  const [mode, setMode]         = useState<PayMode>("UPI");
  const [reference, setRef]     = useState("");
  const [date, setDate]         = useState(() => new Date().toISOString().slice(0, 10));
  const [fileName, setFileName] = useState("");
  const [saving, setSaving]     = useState(false);

  const due = Math.max(0, client.outstanding);
  const refLabel = mode === "Cheque" ? "Cheque Number"
    : mode === "Cash" ? "Receipt No. (optional)"
    : "Transaction Reference / UTR";

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    try {
      await api(`api/admin/khata/${client.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt, mode, reference: reference || undefined,
          date, proofName: fileName || undefined,
        }),
      });
      toast.success(`${inr(amt)} recorded for ${client.name} via ${mode}`);
      onDone();
    } catch {
      toast.error("Could not record payment");
    } finally { setSaving(false); }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 240 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[36px] z-[70] max-h-[92%] overflow-y-auto scrollbar-hide"
      >
        <div className="px-6 pt-6 pb-10">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h4 className="font-display font-black italic text-lg" style={{ color: BRAND }}>Record Payment</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{client.name} · {client.type}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Outstanding context */}
          <div className="bg-slate-50 rounded-[20px] p-4 mb-5 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding Due</p>
              <p className="text-2xl font-display font-black italic" style={{ color: due > 0 ? RED : GREEN }}>
                {inr(due)}
              </p>
            </div>
            <button
              onClick={() => setAmount(String(due))}
              className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-white border border-slate-200 text-slate-600">
              Pay Full
            </button>
          </div>

          {/* Amount */}
          <Field label="Amount Received">
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200 focus-within:border-blue-400">
              <IndianRupee className="w-4 h-4 text-slate-400" />
              <input
                type="number" inputMode="numeric" value={amount}
                onChange={e => setAmount(e.target.value)} placeholder="0"
                className="flex-1 text-lg font-black text-slate-800 outline-none bg-transparent"
              />
            </div>
          </Field>

          {/* Mode */}
          <Field label="Payment Mode">
            <div className="grid grid-cols-4 gap-2">
              {PAY_MODES.map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2"
                  style={{
                    borderColor: mode === m ? BRAND : "#e2e8f0",
                    background: mode === m ? "#f0f6ff" : "white",
                    color: mode === m ? BRAND : "#94a3b8",
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </Field>

          {/* Reference */}
          <Field label={refLabel}>
            <input
              value={reference} onChange={e => setRef(e.target.value)}
              placeholder={mode === "Cheque" ? "e.g. 884512" : "e.g. UTR / Txn ID"}
              className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400"
            />
          </Field>

          {/* Date */}
          <Field label="Payment Date">
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400"
            />
          </Field>

          {/* File upload */}
          <Field label="Attach Proof (UPI screenshot / cheque photo)">
            <label className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3.5 border border-dashed border-slate-300 cursor-pointer">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-500 truncate flex-1">
                {fileName || "Tap to attach file"}
              </span>
              {fileName && (
                <button type="button" onClick={(e) => { e.preventDefault(); setFileName(""); }}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <input
                type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => setFileName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </Field>

          <button
            onClick={submit} disabled={saving || !amount}
            className="w-full mt-2 py-4 rounded-[20px] font-black text-sm uppercase tracking-widest text-white transition-all"
            style={{
              background: !amount || saving ? "#e2e8f0" : BRAND,
              color: !amount || saving ? "#94a3b8" : "white",
              boxShadow: !amount || saving ? "none" : "0 8px 24px rgba(27,67,102,0.3)",
            }}>
            {saving ? "Recording…" : "Confirm Payment"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {children}
    </div>
  );
}
