/**
 * Conon Trust & Site DNA Cross-Tab / Real-Time Sync Service
 * Seamlessly coordinates Customer Feedback, Driver Shabaashi Tips,
 * Instant Damage Auto-Escrow Shield, and Site DNA Road Intelligence across all 4 panels.
 */

import { getSocket } from "./socket";

export interface CustomerFeedbackPayload {
  id?: string;
  orderId: string;
  customerId?: string;
  driverId: string;
  hubId: string;
  rating: number;
  materialTags: string[];
  driverBadges: string[];
  tipAmount: number;
  voiceTranscript?: string;
  sentiment?: "Positive" | "Needs Action";
  damageClaim?: {
    hasIssue: boolean;
    claimType: "INSTANT_VAULT_REFUND" | "FREE_REPLACEMENT";
    claimAmount: number;
    affectedQty: number;
    photoUrl?: string;
    issueTag?: string;
  };
  ticketId?: string;
  createdAt?: string;
}

export interface DriverSiteFeedbackPayload {
  orderId: string;
  driverId: string;
  siteAddressKey: string;
  address?: string;
  roadAccessTag: string;
  unloadingTag: string;
  behaviourTag: string;
  notes?: string;
}

export interface SiteDnaProfile {
  siteAddressKey: string;
  zone: string;
  recommendedVehicle: "Loader 1.5T" | "Bike Only" | "3-Wheeler Auto";
  roadSummary: string;
  labourReadinessPct: number;
  avgSiteRating: number;
  totalReports: number;
  recentTags: string[];
  updatedAt: string;
}

export interface DisputeTicket {
  orderId: string;
  ticketId: string;
  hubId: string;
  claimAmount: number;
  claimType: "INSTANT_VAULT_REFUND" | "FREE_REPLACEMENT";
  affectedQty: number;
  damagePhotoUrl?: string;
  issueTag: string;
  status: "ESCROW_DISPUTE_HOLD" | "APPROVED_REFUND" | "APPROVED_REPLACEMENT";
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface DriverTipCelebration {
  id: string;
  orderId: string;
  driverId: string;
  tipAmount: number;
  driverBadges: string[];
  timestamp: number;
}

// Default Lucknow Corridors Site DNA
const DEFAULT_SITE_DNA: Record<string, SiteDnaProfile> = {
  "sushant-golf-city": {
    siteAddressKey: "sushant-golf-city",
    zone: "Shaheed Path / Sushant Golf City",
    recommendedVehicle: "Loader 1.5T",
    roadSummary: "Wide Road — Easy direct unloading near crane slab",
    labourReadinessPct: 98,
    avgSiteRating: 4.95,
    totalReports: 36,
    recentTags: ["Wide Road (Easy Loader)", "Labour Ready ✓", "Respectful & Helpful"],
    updatedAt: new Date().toISOString(),
  },
  "aminabad-hardware": {
    siteAddressKey: "aminabad-hardware",
    zone: "Old Lucknow / Aminabad",
    recommendedVehicle: "Bike Only",
    roadSummary: "Narrow Lane — Loader must park 80m back at main chowk",
    labourReadinessPct: 90,
    avgSiteRating: 4.65,
    totalReports: 20,
    recentTags: ["Narrow Lane (Bike Only)", "Safe Unloading Spot", "Smooth OTP Handover"],
    updatedAt: new Date().toISOString(),
  },
  "latouche-road": {
    siteAddressKey: "latouche-road",
    zone: "Latouche Road / Charbagh",
    recommendedVehicle: "Bike Only",
    roadSummary: "Busy Mandi Corridor — Tight turning radius, morning unload ideal",
    labourReadinessPct: 92,
    avgSiteRating: 4.75,
    totalReports: 29,
    recentTags: ["Narrow Lane (Bike Only)", "Labour Ready ✓", "Smooth OTP Handover"],
    updatedAt: new Date().toISOString(),
  },
  "gomti-nagar-ext": {
    siteAddressKey: "gomti-nagar-ext",
    zone: "Gomti Nagar Extension",
    recommendedVehicle: "Loader 1.5T",
    roadSummary: "Wide 40ft Sector Road — Clean ramp unloading available",
    labourReadinessPct: 99,
    avgSiteRating: 4.98,
    totalReports: 44,
    recentTags: ["Wide Road (Easy Loader)", "Labour Ready ✓", "Respectful & Helpful"],
    updatedAt: new Date().toISOString(),
  },
};

const BROADCAST_CHANNEL_NAME = "conon_trust_dna_sync";
const STORAGE_KEY_FEEDBACK = "conon_last_feedback_event";
const STORAGE_KEY_DISPUTES = "conon_active_disputes";
const STORAGE_KEY_SITE_DNA = "conon_site_dna_profiles";
const STORAGE_KEY_DRIVER_KAMAI_BONUS = "conon_driver_tip_kamai_bonus";

class FeedbackSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<(event: any) => void>();
  private siteDnaMap: Record<string, SiteDnaProfile> = { ...DEFAULT_SITE_DNA };
  private disputes: DisputeTicket[] = [];

  constructor() {
    this.initStorage();
    this.initBroadcastChannel();
    this.initSocketListener();
  }

  private initStorage() {
    if (typeof window === "undefined") return;
    try {
      const storedDna = localStorage.getItem(STORAGE_KEY_SITE_DNA);
      if (storedDna) {
        this.siteDnaMap = { ...this.siteDnaMap, ...JSON.parse(storedDna) };
      }
      const storedDisputes = localStorage.getItem(STORAGE_KEY_DISPUTES);
      if (storedDisputes) {
        this.disputes = JSON.parse(storedDisputes);
      }
    } catch {
      // ignore
    }
  }

  private initBroadcastChannel() {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.channel.onmessage = (msg) => {
        if (msg?.data) {
          this.handleInboundSyncEvent(msg.data);
        }
      };
    } catch {
      // ignore
    }

    // Storage fallback for cross-tab sync in private browsing or older engines
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY_FEEDBACK && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.handleInboundSyncEvent(parsed);
        } catch {}
      }
    });
  }

  private initSocketListener() {
    if (typeof window === "undefined") return;
    try {
      const socket = getSocket();
      socket.on("feedback:customer_submitted", (data: any) => {
        this.handleInboundSyncEvent({ type: "CUSTOMER_FEEDBACK", payload: data });
      });

      socket.on("feedback:driver_tip", (data: any) => {
        this.handleInboundSyncEvent({ type: "DRIVER_TIP", payload: data });
      });

      socket.on("admin:damage_dispute_alert", (data: any) => {
        this.handleInboundSyncEvent({ type: "DISPUTE_ALERT", payload: data });
      });

      socket.on("feedback:site_dna_updated", (data: any) => {
        this.handleInboundSyncEvent({ type: "SITE_DNA_UPDATED", payload: data });
      });

      socket.on("feedback:dispute_resolved", (data: any) => {
        this.handleInboundSyncEvent({ type: "DISPUTE_RESOLVED", payload: data });
      });
    } catch {
      // Socket client might not be connected yet
    }
  }

  private broadcastLocally(event: { type: string; payload: any }) {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {}
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify({ ...event, _ts: Date.now() }));
      } catch {}
    }
    this.handleInboundSyncEvent(event);
  }

  private handleInboundSyncEvent(event: { type: string; payload: any }) {
    if (!event || !event.type) return;

    if (event.type === "DRIVER_TIP" || (event.type === "CUSTOMER_FEEDBACK" && event.payload?.tipAmount > 0)) {
      const tip = event.payload.tipAmount || 0;
      if (tip > 0 && typeof window !== "undefined") {
        try {
          const currentBonus = Number(localStorage.getItem(STORAGE_KEY_DRIVER_KAMAI_BONUS) || "0");
          localStorage.setItem(STORAGE_KEY_DRIVER_KAMAI_BONUS, String(currentBonus + tip));
        } catch {}
      }
    }

    if (event.type === "DISPUTE_ALERT") {
      const dispute: DisputeTicket = {
        orderId: event.payload.orderId,
        ticketId: event.payload.ticketId || `TKT-ESCROW-${Date.now().toString().slice(-6)}`,
        hubId: event.payload.hubId || "hub-naka",
        claimAmount: event.payload.claimAmount || 780,
        claimType: event.payload.claimType || "INSTANT_VAULT_REFUND",
        affectedQty: event.payload.affectedQty || 2,
        damagePhotoUrl: event.payload.damagePhotoUrl,
        issueTag: event.payload.issueTag || "Torn / Wet Bag",
        status: "ESCROW_DISPUTE_HOLD",
        createdAt: event.payload.timestamp || new Date().toISOString(),
      };
      this.disputes = [dispute, ...this.disputes.filter((d) => d.orderId !== dispute.orderId)];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_DISPUTES, JSON.stringify(this.disputes));
        } catch {}
      }
    }

    if (event.type === "DISPUTE_RESOLVED") {
      this.disputes = this.disputes.map((d) => {
        if (d.orderId === event.payload.orderId || d.ticketId === event.payload.ticketId) {
          return {
            ...d,
            status: event.payload.resolution === "DISPATCH_REPLACEMENT" ? "APPROVED_REPLACEMENT" : "APPROVED_REFUND",
            resolvedAt: event.payload.resolvedAt || new Date().toISOString(),
            notes: event.payload.notes,
          };
        }
        return d;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_DISPUTES, JSON.stringify(this.disputes));
        } catch {}
      }
    }

    if (event.type === "SITE_DNA_UPDATED" && event.payload?.profile) {
      const prof = event.payload.profile as SiteDnaProfile;
      this.siteDnaMap[prof.siteAddressKey] = prof;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_SITE_DNA, JSON.stringify(this.siteDnaMap));
        } catch {}
      }
    }

    // Notify registered listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error("[FeedbackSync Listener Error]", e);
      }
    });
  }

  public subscribe(listener: (event: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getSiteDna(addressOrKey: string): SiteDnaProfile {
    const key = this.normalizeKey(addressOrKey);
    return this.siteDnaMap[key] || this.siteDnaMap["sushant-golf-city"];
  }

  public getDisputes(): DisputeTicket[] {
    return [...this.disputes];
  }

  public getDriverTipBonus(): number {
    if (typeof window === "undefined") return 0;
    try {
      return Number(localStorage.getItem(STORAGE_KEY_DRIVER_KAMAI_BONUS) || "0");
    } catch {
      return 0;
    }
  }

  public normalizeKey(address: string): string {
    const lower = (address || "").toLowerCase();
    if (lower.includes("sushant") || lower.includes("golf") || lower.includes("shaheed")) return "sushant-golf-city";
    if (lower.includes("aminabad") || lower.includes("chawk") || lower.includes("chowk")) return "aminabad-hardware";
    if (lower.includes("latouche") || lower.includes("charbagh") || lower.includes("naka")) return "latouche-road";
    if (lower.includes("gomti") || lower.includes("vibhuti") || lower.includes("extension")) return "gomti-nagar-ext";
    return "sushant-golf-city";
  }

  /**
   * Submit Customer Visual X-Ray Feedback
   */
  public async submitCustomerFeedback(feedback: CustomerFeedbackPayload): Promise<{
    success: boolean;
    ticketId?: string;
    disputeHoldActive: boolean;
  }> {
    const hasIssue = Boolean(
      feedback.damageClaim?.hasIssue ||
      feedback.materialTags.some((t) =>
        t.toLowerCase().includes("torn") ||
        t.toLowerCase().includes("wet") ||
        t.toLowerCase().includes("short") ||
        t.toLowerCase().includes("wrong")
      )
    );

    const ticketId = hasIssue
      ? feedback.ticketId || `TKT-ESCROW-${Date.now().toString().slice(-6)}`
      : undefined;

    const payload = {
      ...feedback,
      ticketId,
      createdAt: new Date().toISOString(),
    };

    // 1. Immediate local cross-tab broadcast (sub-100ms reaction)
    this.broadcastLocally({ type: "CUSTOMER_FEEDBACK", payload });

    if (payload.tipAmount > 0) {
      this.broadcastLocally({
        type: "DRIVER_TIP",
        payload: {
          driverId: payload.driverId,
          orderId: payload.orderId,
          tipAmount: payload.tipAmount,
          driverBadges: payload.driverBadges,
        },
      });
    }

    if (hasIssue) {
      this.broadcastLocally({
        type: "DISPUTE_ALERT",
        payload: {
          orderId: payload.orderId,
          ticketId,
          hubId: payload.hubId,
          claimAmount: payload.damageClaim?.claimAmount || 780,
          claimType: payload.damageClaim?.claimType || "INSTANT_VAULT_REFUND",
          affectedQty: payload.damageClaim?.affectedQty || 2,
          damagePhotoUrl: payload.damageClaim?.photoUrl,
          issueTag: payload.damageClaim?.issueTag || payload.materialTags[0] || "Torn / Wet Bag",
          status: "ESCROW_DISPUTE_HOLD",
          timestamp: payload.createdAt,
        },
      });
    }

    // 2. Network API dispatch with fallback resilience
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
      await fetch(`${apiUrl}/api/feedback/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (netErr) {
      console.warn("[FeedbackSync API Fallback]", netErr);
    }

    return {
      success: true,
      ticketId,
      disputeHoldActive: hasIssue,
    };
  }

  /**
   * Submit Driver Site DNA Road Intelligence
   */
  public async submitDriverSiteFeedback(data: DriverSiteFeedbackPayload): Promise<SiteDnaProfile> {
    const key = this.normalizeKey(data.siteAddressKey || data.address || "");
    const isNarrow =
      data.roadAccessTag.toLowerCase().includes("narrow") ||
      data.roadAccessTag.toLowerCase().includes("bike") ||
      data.roadAccessTag.toLowerCase().includes("पतली");

    const isMud =
      data.roadAccessTag.toLowerCase().includes("mud") ||
      data.roadAccessTag.toLowerCase().includes("blocked") ||
      data.roadAccessTag.toLowerCase().includes("कीचड़");

    const existing = this.siteDnaMap[key] || DEFAULT_SITE_DNA["sushant-golf-city"];
    const updatedProfile: SiteDnaProfile = {
      siteAddressKey: key,
      zone: existing.zone,
      recommendedVehicle: isNarrow ? "Bike Only" : isMud ? "3-Wheeler Auto" : "Loader 1.5T",
      roadSummary: isNarrow
        ? "⚠️ Narrow Lane — Bike recommended, Loader stops 50m early"
        : isMud
        ? "⚠️ Muddy Approach — Heavy loaders beware, light transit advised"
        : "✓ Wide Sector Road — Easy direct unloading near crane slab",
      labourReadinessPct: data.unloadingTag.includes("Labour Ready") ? 98 : 85,
      avgSiteRating: data.behaviourTag.includes("Dispute") ? 4.3 : 4.9,
      totalReports: existing.totalReports + 1,
      recentTags: [data.roadAccessTag, data.unloadingTag, data.behaviourTag],
      updatedAt: new Date().toISOString(),
    };

    // Immediate local broadcast
    this.broadcastLocally({
      type: "SITE_DNA_UPDATED",
      payload: {
        feedback: data,
        profile: updatedProfile,
      },
    });

    // Remote API call
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
      await fetch(`${apiUrl}/api/feedback/driver-site`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (netErr) {
      console.warn("[Driver Site DNA API Fallback]", netErr);
    }

    return updatedProfile;
  }

  /**
   * Admin Resolves Dispute
   */
  public async resolveDispute(
    orderOrTicketId: string,
    resolution: "VAULT_REFUND" | "DISPATCH_REPLACEMENT",
    notes: string = "Approved by Operations Head"
  ): Promise<boolean> {
    const payload = {
      orderId: orderOrTicketId,
      ticketId: orderOrTicketId,
      resolution,
      notes,
      resolvedAt: new Date().toISOString(),
    };

    // Immediate local broadcast
    this.broadcastLocally({
      type: "DISPUTE_RESOLVED",
      payload,
    });

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
      await fetch(`${apiUrl}/api/feedback/admin/disputes/${orderOrTicketId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "conon_mac_secret_9988",
        },
        body: JSON.stringify(payload),
      });
    } catch (netErr) {
      console.warn("[Resolve Dispute API Fallback]", netErr);
    }

    return true;
  }
}

export const feedbackSync = new FeedbackSyncManager();
