import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { Layout } from "@/components/Layout";

export function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Back Link */}
        <Link href="/home" className="inline-flex items-center gap-2 text-sm font-bold text-[#1848a0] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1848a0] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Last updated: March 2026 · Compliant with DPDP Act 2023 & IT Act 2000</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
            <h2 className="text-base font-bold text-[#1848a0] mb-2">Overview</h2>
            <p>
              CONON-NOW (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), operated by <strong>CONON Infrabuilt Pvt. Ltd.</strong>, 
              is committed to protecting your privacy and ensuring your personal data is handled securely and transparently. 
              This Privacy Policy explains how we collect, use, store, process, and protect your information when you access or use 
              the CONON-NOW mobile application, web storefronts, and on-demand building material delivery services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-black">1</span>
              Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Personal Identity Information:</strong> Name, mobile phone number, email address, and delivery address.</li>
              <li><strong>Business Information (For Vendors / Contractors):</strong> GSTIN, Trade License, shop name, bank account/UPI details for merchant payouts.</li>
              <li><strong>Precise Location Data:</strong> Real-time GPS location and delivery site address to calculate driver dispatch route, estimated 1-hour arrival time, and live truck tracking.</li>
              <li><strong>Payment Information:</strong> Transaction identifiers, UPI reference IDs, and payment statuses processed securely via certified payment gateways (such as Razorpay). We never store raw debit/credit card numbers or CVV.</li>
              <li><strong>Device & Usage Data:</strong> Device model, operating system version, browser type, IP address, and application analytics for performance monitoring and fraud detection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-black">2</span>
              How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[
                { title: "Order Fulfillment", desc: "Processing construction orders, invoicing, and real-time 1-hour doorstep delivery." },
                { title: "Live Fleet Tracking", desc: "Coordinating delivery drivers and GPS navigation from depot to your construction site." },
                { title: "Authentication & Security", desc: "OTP verification, fraud prevention, and session security using platform JWTs." },
                { title: "Customer Support", desc: "Resolving inquiries, returns, replacements, and Khata credit account statements." },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-black">3</span>
              Data Protection & Security
            </h2>
            <p className="mb-3">
              We employ industry-standard TLS 1.3 encryption for data in transit and AES-256 encryption for data at rest. 
              Our infrastructure operates within secure cloud VPCs with continuous vulnerability scanning and strict role-based access controls.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> PCI-DSS Compliant via Razorpay
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> TLS 1.3 Transport Security
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> DPDP Act 2023 Compliant
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-black">4</span>
              Your Rights & Data Deletion
            </h2>
            <p>
              Under applicable Indian data protection laws, you have the right to access, rectify, or request permanent deletion of your personal data. 
              To submit an automated account and data deletion request, please visit our dedicated{" "}
              <Link href="/delete-account" className="text-[#1848a0] font-bold underline">
                Account Deletion Portal
              </Link>
              . Requests are reviewed and completed within 30 days in compliance with statutory tax retention requirements.
            </p>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">Grievance Officer & Contact Details</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-600 space-y-2">
              <p><strong>Entity:</strong> CONON Infrabuilt Pvt. Ltd.</p>
              <p><strong>Grievance Officer:</strong> Rohiit Shukla</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#1848a0]" /> <strong>Email:</strong> privacy@conon.in / support@conon.in</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#1848a0]" /> <strong>Helpline:</strong> 0522-4721924 (Mon - Sat, 9 AM - 7 PM)</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#1848a0]" /> <strong>Corporate Office:</strong> Gomti Nagar, Lucknow, Uttar Pradesh 226010, India</p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default PrivacyPolicy;
