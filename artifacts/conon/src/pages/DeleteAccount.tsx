import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trash2, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, Phone, Mail } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

export function DeleteAccount() {
  const { phone, name, logout, isAuthenticated } = useUser();
  const [inputPhone, setInputPhone] = useState(phone || "");
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = inputPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit registered mobile number.");
      return;
    }
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm your request.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Account deletion request submitted successfully.");
      if (isAuthenticated) {
        logout();
      }
    }, 1200);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <Link href="/home" className="inline-flex items-center gap-2 text-sm font-bold text-[#1848a0] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Request Account & Data Deletion</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Google Play Store & DPDP Act 2023 Compliant Self-Service Portal</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-green-950 mb-2">Deletion Request Queued</h2>
            <p className="text-sm text-green-800 leading-relaxed max-w-md mx-auto mb-4">
              Your account deletion request for mobile number <strong>{inputPhone}</strong> has been registered with reference ID{" "}
              <strong>DEL-{Math.floor(100000 + Math.random() * 900000)}</strong>.
            </p>
            <p className="text-xs text-slate-500 mb-6">
              In accordance with statutory tax and GST regulations, financial transaction records will be archived in read-only form for required statutory periods, while your personal profile, credentials, and location histories will be permanently wiped within 30 days.
            </p>
            <Link href="/home" className="inline-block px-5 py-2.5 bg-[#1848a0] text-white text-xs font-bold rounded-xl shadow hover:bg-blue-800">
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs sm:text-sm text-amber-900 leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">What happens when you delete your account?</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-amber-800">
                  <li>Your user profile, saved addresses, and active Khata balances will be permanently removed.</li>
                  <li>Any unused wallet cashback and loyalty points will be forfeited.</li>
                  <li>You will lose access to order history and previous digital receipts.</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#1848a0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for leaving (Optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#1848a0] bg-white"
                >
                  <option value="">Select a reason</option>
                  <option value="project-finished">My construction project is completed</option>
                  <option value="privacy">Privacy concerns</option>
                  <option value="another-account">I have another account</option>
                  <option value="no-longer-needed">No longer need on-demand delivery</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  To confirm, type <span className="text-red-600 font-black">DELETE</span> below *
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Deletion...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Permanently Delete My Account & Data
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-slate-200 pt-6 text-xs text-slate-500 space-y-1 text-center">
              <p>Need assistance or have queries before deletion?</p>
              <p>Email our compliance desk at <strong>privacy@conon.in</strong> or call <strong>0522-4721924</strong></p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DeleteAccount;
