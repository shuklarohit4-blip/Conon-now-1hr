import React from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText, Scale, AlertCircle, CheckCircle2, MapPin, Mail } from "lucide-react";
import { Layout } from "@/components/Layout";

export function Terms() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <Link href="/home" className="inline-flex items-center gap-2 text-sm font-bold text-[#1848a0] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1848a0] flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Terms and Conditions</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Last updated: March 2026 · Governing Law: Lucknow, Uttar Pradesh, India</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Builder&rdquo;, &ldquo;Contractor&rdquo;, or &ldquo;Customer&rdquo;) 
              and <strong>CONON Infrabuilt Pvt. Ltd.</strong> (&ldquo;CONON-NOW&rdquo;). By accessing, registering on, or using our mobile app, 
              storefront, or delivery services, you acknowledge that you have read, understood, and agreed to be bound by these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Service Scope & 1-Hour Delivery SLA</h2>
            <p className="mb-2">
              CONON-NOW operates an on-demand hyperlocal marketplace connecting builders and project owners with verified suppliers and transport logistics for building materials 
              (cement, steel, sand, bricks, plumbing, electrical, tiles, paints, hardware, and equipment rental).
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>1-Hour Delivery Window:</strong> Applies to active service zones and standard express quantities. Large bulk dispatches (e.g., full tippers of sand or aggregates) may require scheduled heavy vehicle clearance.</li>
              <li><strong>Delivery Site Accessibility:</strong> The customer must ensure an accessible motorable road and legal unloading space for commercial vehicles at the delivery destination.</li>
              <li><strong>Unloading & Labor:</strong> Standard orders include tailgate drop-off. Ground-level labor or floor-wise carrying is available upon selecting specific labor add-ons during checkout.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Pricing, Mandi Ticker & GST Invoicing</h2>
            <p className="mb-2">
              All prices displayed on the platform are in Indian Rupees (INR) and inclusive of applicable Goods and Services Tax (GST) unless indicated otherwise.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Live Market Rates:</strong> Commodity materials like steel TMT bars, cement, and sand may fluctuate according to daily Mandi indices. The price locked at the time of online checkout remains final for that order.</li>
              <li><strong>Tax Invoicing:</strong> Tax invoices bearing our GSTIN and the vendor&apos;s credentials are automatically issued upon dispatch and accessible through the <Link href="/orders" className="text-[#1848a0] font-bold underline">Orders Tab</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Payments & Khata Credit Line</h2>
            <p className="mb-2">
              Payments are facilitated via Razorpay, UPI, net banking, debit/credit cards, and cash-on-delivery (COD) for eligible amounts.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Digital Payments:</strong> Payments are processed via PCI-DSS certified partners. In the event of a transaction failure where funds are deducted, banks typically reverse the amount within 48-72 hours.</li>
              <li><strong>Khata Credit Facility:</strong> Approved contractors and institutional builders may access 7 to 30-day Khata credit lines subject to credit evaluation, signed Parcha promissory agreements, and prompt settlements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Inspection & Quality Assurance</h2>
            <p>
              CONON-NOW partners only with authorized manufacturers and tier-1 distributors (UltraTech, Tata Tiscon, Astral, Asian Paints, Polycab, Dr. Fixit, etc.). 
              The customer must visually inspect materials and verify seal integrity upon truck arrival. Any discrepancies in bag count or transit damage must be recorded with the driver before signing the digital delivery challan.
            </p>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Jurisdiction & Disputes</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              These terms are governed by the laws of India. Any legal dispute, arbitration, or proceeding arising out of or related to our services 
              shall be subject to the exclusive jurisdiction of the competent courts in Lucknow, Uttar Pradesh.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Terms;
