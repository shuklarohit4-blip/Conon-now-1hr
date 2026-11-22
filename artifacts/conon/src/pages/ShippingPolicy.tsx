import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Truck, Clock, ShieldCheck, MapPin, AlertCircle, Phone, Navigation } from "lucide-react";
import { Layout } from "@/components/Layout";

export function ShippingPolicy() {
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
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shipping & Delivery Policy</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Guaranteed 1-Hour Hyperlocal Dispatch for Building Materials</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="bg-gradient-to-r from-blue-900 to-[#1848a0] text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-[#f2b705]" />
              <h2 className="text-lg font-black tracking-wide">The CONON-NOW 1-Hour Delivery Promise</h2>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Never let your construction labor wait or your project stall. 
              We utilize automated hub dispatch, dedicated 3-wheeler and 4-wheeler commercial fleets, and smart routing 
              to deliver cement, steel, tools, plumbing, and essentials directly to your site within <strong>60 minutes</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#1848a0]" />
              1. Delivery Service Coverage & Hubs
            </h2>
            <p className="mb-3">
              We operate across key urban corridors, expanding dynamically through micro-fulfillment hubs and partner yards:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Current Primary Hub:</strong> Lucknow Urban & Peri-Urban (Gomti Nagar, Indira Nagar, Alambagh, Shaheed Path, Sultanpur Road, Raebareli Road, Faizabad Road corridor, and surrounding construction zones).</li>
              <li><strong>Operating Hours:</strong> Deliveries run <strong>7 days a week from 7:00 AM to 9:00 PM</strong>. Orders placed after 8:30 PM are scheduled for early-morning 7:00 AM priority dispatch.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#1848a0]" />
              2. Fleet Types & Load Capacity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: "Express Cargo 3-Wheeler", load: "Up to 500 kg", ideal: "Urgent plumbing, adhesives, wires, tools, paint buckets" },
                { type: "Commercial Pickup (Tata Ace)", load: "Up to 1.5 - 2.5 Tons", ideal: "Cement bags (20-50 bags), tiles, plywood, hardware" },
                { type: "Heavy Commercial Truck", load: "Up to 10 - 25 Tons", ideal: "TMT steel rebar, bulk sand, river morang, stone aggregate" },
              ].map((vehicle, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm">{vehicle.type}</h3>
                  <p className="text-xs font-semibold text-[#1848a0] mt-0.5">{vehicle.load}</p>
                  <p className="text-xs text-slate-500 mt-2">{vehicle.ideal}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              3. Live Tracking & Delivery Confirmation
            </h2>
            <p className="mb-2">
              Once an order is confirmed, you receive live GPS tracking links. You can monitor the driver&apos;s real-time progress, speed, 
              and estimated arrival timestamp right on the <Link href="/live-track" className="text-[#1848a0] font-bold underline">Live Tracking screen</Link>.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm">
              Deliveries are finalized with an OTP verification code provided to the driver upon unloading and physical inspection at your site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              4. Unloading Guidelines & Customer Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Please ensure that the entry gate, colony road, or driveway has sufficient clearance for the vehicle type booked.</li>
              <li>Standard delivery includes ground-level drop-off next to the transport vehicle. If multi-story carrying or basement staging is needed, choose the &ldquo;Labor Assistance&rdquo; add-on during checkout.</li>
            </ul>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">Delivery Support Helpline</h2>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1848a0]" />
              For urgent delivery rerouting or dispatch queries, dial our live control room: <strong>0522-4721924</strong>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default ShippingPolicy;
