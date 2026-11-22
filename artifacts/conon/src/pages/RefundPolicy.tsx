import React from "react";
import { Link } from "wouter";
import { ArrowLeft, RotateCcw, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Mail, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";

export function RefundPolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <Link href="/home" className="inline-flex items-center gap-2 text-sm font-bold text-[#1848a0] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#f59e0b] flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Cancellation & Refund Policy</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Clear, fair, and transparent policies compliant with Razorpay Merchant Guidelines</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5">
            <h2 className="text-base font-bold text-amber-900 mb-2">Policy Highlights</h2>
            <p className="text-amber-950 text-sm">
              We understand construction site dynamics and schedule changes. 
              Our cancellation and refund framework ensures complete peace of mind, fast replacements for transit damage, 
              and prompt reversals to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1848a0]" />
              1. Order Cancellation Window
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Before Vehicle Dispatch (Full 100% Refund):</strong> You may cancel any order free of charge directly via the app or by calling dispatch within <strong>15 minutes</strong> of placing the order or before the transport vehicle is loaded.
              </li>
              <li>
                <strong>After Dispatch / While Out for Delivery:</strong> If cancelled once the truck has departed the hub, a nominal round-trip transit deduction (standard ₹300 - ₹800 depending on vehicle size and tonnage) applies to cover driver fuel costs.
              </li>
              <li>
                <strong>Custom Pre-cut or Tinted Items:</strong> Customized building materials (e.g., custom factory-tinted paints, pre-cut granite slabs, or pre-bent rebar stirrups) cannot be cancelled once manufacturing has commenced.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              2. Damaged, Defective or Incorrect Materials
            </h2>
            <p className="mb-3">
              We stand 100% behind the quality of materials dispatched. If any item arrives damaged or incorrect:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-green-200 bg-green-50/40">
                <h3 className="font-bold text-green-950 text-sm mb-1">Instant On-Spot Replacement</h3>
                <p className="text-xs text-green-900">
                  Inspect bags (e.g. torn cement bags or moisture-damaged goods) upon arrival. Show the driver and notify support immediately — we will dispatch a replacement delivery within <strong>60 minutes</strong> at zero additional charge.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <h3 className="font-bold text-blue-950 text-sm mb-1">Quantity Discrepancy Adjustment</h3>
                <p className="text-xs text-blue-900">
                  If there is any shortfall in brick counts or plumbing fittings, the digital invoice is instantly corrected and the proportional refund is issued immediately.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#1848a0]" />
              3. Refund Processing Timelines
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Refund Destination</th>
                    <th className="p-3">Turnaround Time (SLA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">UPI / Google Pay / PhonePe</td>
                    <td className="p-3">Original Bank Account (VPA)</td>
                    <td className="p-3 text-green-700 font-bold">Instant to 24 Hours</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Credit / Debit Card</td>
                    <td className="p-3">Issuing Bank Account</td>
                    <td className="p-3">3 to 5 Working Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Net Banking</td>
                    <td className="p-3">Source Bank Account</td>
                    <td className="p-3">3 to 7 Working Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">CONON Wallet / Khata</td>
                    <td className="p-3">CONON In-App Balance / Credit Ledger</td>
                    <td className="p-3 text-green-700 font-bold">Instant (0 Minutes)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">How to Request a Refund or Return</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              To raise a refund or return claim, contact our 24/7 dedicated dispatch team with your Order ID:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1848a0]" />
                <span><strong>Helpline:</strong> 0522-4721924</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1848a0]" />
                <span><strong>Email:</strong> refunds@conon.in</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default RefundPolicy;
