import React, { useState, useEffect } from "react";
import { PartnerDukaanOS } from "@/components/vendor/PartnerDukaanOS";
import { PartnerAccessGate, type PartnerSession } from "@/components/kyc/PartnerAccessGate";
import { PartnerWaitingRoom } from "@/components/kyc/PartnerWaitingRoom";
import { useKyc, type PartnerKycApplication } from "@/context/KycContext";

/**
 * CONON PARTNER DUKAAN OS
 * Route: /vendor
 *
 * Strict 3-State Access Architecture:
 *   • State A (Unauthenticated): PartnerAccessGate (Phone OTP Login + 4-Step Registration)
 *   • State B (Pending Admin Review / Re-upload): PartnerWaitingRoom (Live 3-stage progress,
 *     granular doc re-upload, interactive buzzer practice drill, zero-refresh live unlock)
 *   • State C (Approved): PartnerDukaanOS (Live counter workstation + Logout button)
 */
export function VendorDashboard() {
  const { applications, setActiveApplicantId } = useKyc();

  // Active Approved Session State
  const [session, setSession] = useState<PartnerSession | null>(() => {
    try {
      const stored = localStorage.getItem("conon_vendor_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.status === "APPROVED") return parsed;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  });

  // Pending KYC Application State (Waiting Room)
  const [pendingApp, setPendingApp] = useState<PartnerKycApplication | null>(() => {
    try {
      const storedPending = localStorage.getItem("conon_vendor_pending_app");
      if (storedPending) {
        return JSON.parse(storedPending);
      }
    } catch {
      // ignore parse errors
    }
    return null;
  });

  // Keep pendingApp in sync if approved or changed in KycContext
  useEffect(() => {
    if (pendingApp) {
      const found = applications.find(
        (a) =>
          a.id === pendingApp.id ||
          a.applicantId === pendingApp.applicantId ||
          (a.phone &&
            pendingApp.phone &&
            a.phone.replace(/\D/g, "").slice(-10) === pendingApp.phone.replace(/\D/g, "").slice(-10))
      );

      if (found) {
        if (found.status === "APPROVED") {
          const newSession: PartnerSession = {
            partnerId: found.partnerId || "CN-VND-LKO-108",
            phone: found.phone,
            firmOrName: found.firmOrName,
            role: "vendor",
            status: "APPROVED",
          };
          localStorage.setItem("conon_vendor_session", JSON.stringify(newSession));
          localStorage.removeItem("conon_vendor_pending_app");
          setSession(newSession);
          setPendingApp(null);
        } else {
          setPendingApp(found);
        }
      }
    }
  }, [applications, pendingApp]);

  // Handle successful login or waiting room unlock
  const handleAuthenticated = (newSession: PartnerSession) => {
    setSession(newSession);
    setPendingApp(null);
    localStorage.setItem("conon_vendor_session", JSON.stringify(newSession));
    localStorage.removeItem("conon_vendor_pending_app");
  };

  // Handle pending or re-upload required application
  const handlePending = (app: PartnerKycApplication) => {
    setPendingApp(app);
    setActiveApplicantId(app.id);
    localStorage.setItem("conon_vendor_pending_app", JSON.stringify(app));
  };

  // Handle Logout / Switch Partner
  const handleLogout = () => {
    localStorage.removeItem("conon_vendor_session");
    localStorage.removeItem("conon_vendor_pending_app");
    setSession(null);
    setPendingApp(null);
  };

  // State C: Approved Live Dashboard
  if (session && session.status === "APPROVED") {
    return <PartnerDukaanOS onLogout={handleLogout} session={session} />;
  }

  // State B: Waiting Room / Re-upload Required
  if (pendingApp && pendingApp.status !== "APPROVED") {
    return (
      <PartnerWaitingRoom
        role="vendor"
        application={pendingApp}
        onUnlocked={handleAuthenticated}
        onLogout={handleLogout}
      />
    );
  }

  // State A: Access Gate (Login / Register)
  return (
    <PartnerAccessGate
      role="vendor"
      onAuthenticated={handleAuthenticated}
      onPending={handlePending}
    />
  );
}

export default VendorDashboard;
