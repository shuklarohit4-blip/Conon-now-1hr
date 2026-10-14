import React from "react";
import { Layout } from "@/components/Layout";
import {
  Phone, MessageCircle, Mail, MapPin, Clock, Headphones,
  Truck, Building2, Send, CheckCircle2,
} from "lucide-react";

const BRAND_DARK = "#1b4366";
const BRAND_MID  = "#5c92b1";
const AMBER      = "#f59e0b";

const SUPPORT_PHONE = "09696727279";
const SUPPORT_WA    = "919696727279";
const SUPPORT_MAIL  = "support@conon.in";

export function Contact() {
  const [name, setName]       = React.useState("");
  const [phone, setPhone]     = React.useState("");
  const [topic, setTopic]     = React.useState("Order issue");
  const [message, setMessage] = React.useState("");
  const [sent, setSent]       = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    // Stash the contact request locally — backend wiring can come later
    let reqs: unknown[] = [];
    try {
      const raw = localStorage.getItem("conon_contact_reqs");
      const parsed = raw ? JSON.parse(raw) : [];
      reqs = Array.isArray(parsed) ? parsed : [];
    } catch {
      reqs = [];
    }
    reqs.push({ name, phone, topic, message, ts: Date.now() });
    localStorage.setItem("conon_contact_reqs", JSON.stringify(reqs));
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName(""); setPhone(""); setMessage("");
    }, 2500);
  };

  const channels = [
    {
      icon: Phone,
      label: "Call Support",
      sub: SUPPORT_PHONE,
      tint: "#10b981",
      action: () => { window.location.href = `tel:${SUPPORT_PHONE.replace(/\D/g, "")}`; },
    },
    {
      icon: MessageCircle,
      label: "WhatsApp Us",
      sub: "Reply within minutes",
      tint: "#22c55e",
      action: () => {
        const txt = encodeURIComponent("Hi CONON, I need help with my order.");
        window.open(`https://wa.me/${SUPPORT_WA}?text=${txt}`, "_blank");
      },
    },
    {
      icon: Mail,
      label: "Email Us",
      sub: SUPPORT_MAIL,
      tint: "#3b82f6",
      action: () => { window.location.href = `mailto:${SUPPORT_MAIL}`; },
    },
  ];

  return (
    <Layout>
      <div className="px-5 pt-4 pb-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
            We're here 24×7
          </p>
          <h1 className="font-display font-black text-2xl leading-tight" style={{ color: BRAND_DARK }}>
            Contact CONON
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stuck on an order, late delivery, or just have a question? Pick the fastest channel below.
          </p>
        </div>

        {/* Quick channels */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                onClick={c.action}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-all text-left"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${c.tint}15`, color: c.tint }}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-slate-800">{c.label}</p>
                  <p className="text-xs text-slate-500 truncate">{c.sub}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: c.tint }}>
                  Open →
                </span>
              </button>
            );
          })}
        </div>

        {/* Office card */}
        <div
          className="rounded-2xl p-5 text-white mb-6"
          style={{ background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_MID} 100%)` }}
        >
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-black text-sm">CONON Infrabuilt HQ</p>
              <p className="text-[12px] text-blue-100 leading-relaxed mt-1">
                G47, Skyline Plaza 3<br />
                Sushant Golf City, Ansal API<br />
                Lucknow, Uttar Pradesh
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-70">Support</p>
                <p className="text-[12px] font-bold">24 × 7</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-70">JIT Delivery</p>
                <p className="text-[12px] font-bold">Within 60 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Send a message */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="w-4 h-4" style={{ color: BRAND_DARK }} />
            <h2 className="font-black text-sm" style={{ color: BRAND_DARK }}>
              Send us a message
            </h2>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="font-black text-slate-800 text-sm">Thanks! We've got it.</p>
              <p className="text-xs text-slate-500 mt-1">
                Our team will reach out within 30 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label htmlFor="contact-name" className="sr-only">Your name</label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <label htmlFor="contact-phone" className="sr-only">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <label htmlFor="contact-topic" className="sr-only">Topic</label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option>Order issue</option>
                <option>Delivery delay</option>
                <option>Material quality</option>
                <option>Vendor on-boarding</option>
                <option>Bulk pricing query</option>
                <option>Other</option>
              </select>
              <label htmlFor="contact-message" className="sr-only">Message</label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Tell us briefly what's going on…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!name || !phone || !message}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-black disabled:opacity-50"
                style={{ background: BRAND_DARK }}
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          )}
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-6 font-semibold">
          <MapPin className="inline w-3 h-3 -mt-0.5" /> Currently serving Lucknow, Uttar Pradesh — 60-min delivery
        </p>
        <p className="text-[10px] text-slate-300 text-center mt-1">
          Powered by <span style={{ color: AMBER }} className="font-black">CONON</span> Infrabuilt · v2.1
        </p>
      </div>
    </Layout>
  );
}

export default Contact;
