/**
 * Automated Verification Script: Conon Trust & Site DNA Feedback Engine
 * Tests 2-way feedback loop across Customer, Driver, Vendor, and Admin panels.
 */

async function runTests() {
  console.log("=========================================================================");
  console.log("  CONON TRUST & SITE DNA FEEDBACK ENGINE: 2-WAY RELAY VERIFICATION GATE");
  console.log("=========================================================================\n");

  const baseUrl = "http://localhost:5001";
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${msg}`);
      process.exitCode = 1;
    }
  }

  // 1. Submit positive customer feedback with ₹50 tip
  console.log("1. Testing Customer Shabaashi & Chai-Pani Tip Relay...");
  try {
    const res = await fetch(`${baseUrl}/api/feedback/customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ord_test_shabaashi_01",
        driverId: "DRV-LKO-201",
        hubId: "hub-naka",
        rating: 5,
        materialTags: ["Fresh & Sealed ISI ✓", "Exact Quantity ✓", "Genuine Brand ✓"],
        driverBadges: ["On-Time 60m Hero", "Rain Tirpal Protected", "Clean Unloading"],
        tipAmount: 50,
        voiceTranscript: "UltraTech cement ekdum fresh tha, driver ne slab ke paas tarpaulin hata ke unload kiya.",
        sentiment: "Positive",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "POST /api/feedback/customer returned 200 OK");
    assert(data.feedback.tipAmount === 50, "Chai-Pani Tip amount recorded as ₹50");
    assert(data.disputeHoldActive === false, "Positive feedback has NO dispute hold");
    assert(data.feedback.sentiment === "Positive", "Sentiment correctly tagged as Positive");
  } catch (err: any) {
    assert(false, `Customer Shabaashi feedback failed: ${err.message}`);
  }

  // 2. Submit material damage claim triggering Auto-Escrow Shield
  console.log("\n2. Testing Auto-Escrow Shield on Torn / Wet Bag Damage Claim...");
  let createdTicketId = "";
  try {
    const res = await fetch(`${baseUrl}/api/feedback/customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ord_test_damage_99",
        driverId: "DRV-LKO-201",
        hubId: "hub-naka",
        rating: 2,
        materialTags: ["Torn / Wet Bag"],
        driverBadges: ["Polite & Helpful"],
        tipAmount: 0,
        voiceTranscript: "2 boriyan fati hui aayi hain jisme cement jam gaya hai.",
        damageClaim: {
          hasIssue: true,
          claimType: "INSTANT_VAULT_REFUND",
          claimAmount: 780,
          affectedQty: 2,
          photoUrl: "/images/products/cement/adani-acc-suraksha-power-ppc.webp",
          issueTag: "Torn / Wet Bag",
        },
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "POST /api/feedback/customer damage claim returned 200 OK");
    assert(data.disputeHoldActive === true, "Auto-Escrow Shield correctly activated (disputeHoldActive: true)");
    assert(Boolean(data.ticketId), `Protection ticket ID generated: ${data.ticketId}`);
    assert(data.feedback.damageClaimStatus === "PENDING_APPROVAL", "Damage claim status is PENDING_APPROVAL");
    assert(data.feedback.damageClaimAmount === 780, "Damage claim amount matches 2 bags @ ₹390 = ₹780");
    createdTicketId = data.ticketId;
  } catch (err: any) {
    assert(false, `Damage claim trigger failed: ${err.message}`);
  }

  // 3. Driver submits Site DNA Road & Unloading Intelligence
  console.log("\n3. Testing Driver Site DNA Road Intelligence Telemetry...");
  try {
    const res = await fetch(`${baseUrl}/api/feedback/driver-site`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ord_test_site_dna_01",
        driverId: "DRV-LKO-202",
        siteAddressKey: "aminabad-hardware",
        roadAccessTag: "Narrow Lane (Bike Only)",
        unloadingTag: "Labour Ready ✓",
        behaviourTag: "Respectful & Helpful",
        notes: "Narrow lane near Aminabad chowk, loader stops 80m early.",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "POST /api/feedback/driver-site returned 200 OK");
    assert(data.profile.recommendedVehicle === "Bike Only", "Narrow road tag automatically updated recommended vehicle to 'Bike Only'");
    assert(data.profile.labourReadinessPct >= 90, "Labour readiness percentage computed");
    assert(data.profile.recentTags.includes("Narrow Lane (Bike Only)"), "Recent tags updated with crowd-sourced tags");
  } catch (err: any) {
    assert(false, `Driver Site DNA failed: ${err.message}`);
  }

  // 4. Query Site DNA profile for active missions
  console.log("\n4. Testing Active Mission Site DNA Query...");
  try {
    const res = await fetch(`${baseUrl}/api/feedback/site-dna?address=Sushant+Golf+City`);
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "GET /api/feedback/site-dna returned 200 OK");
    assert(data.profile.zone.includes("Sushant Golf City"), "Corridor correctly matched to Sushant Golf City");
    assert(Boolean(data.profile.roadSummary), `Road summary available: "${data.profile.roadSummary}"`);
  } catch (err: any) {
    assert(false, `Site DNA query failed: ${err.message}`);
  }

  // 5. Query Feedback & Trust Summary
  console.log("\n5. Testing Live Feedback Summary & Quality Scores...");
  try {
    const res = await fetch(`${baseUrl}/api/feedback/summary`);
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "GET /api/feedback/summary returned 200 OK");
    assert(data.stats.totalCustomerReviews >= 1, "Customer reviews count > 0");
    assert(data.stats.openDisputesCount >= 1, "Open disputes count accurately reflects damage claim");
    assert(data.openDisputes.length > 0, "Open disputes list contains pending damage claim");
  } catch (err: any) {
    assert(false, `Feedback summary failed: ${err.message}`);
  }

  // 6. Admin 1-Click Escrow Dispute Resolution
  console.log("\n6. Testing Admin 1-Click Escrow Dispute Resolution...");
  try {
    const ticketToResolve = createdTicketId || "ord_test_damage_99";
    const res = await fetch(`${baseUrl}/api/feedback/admin/disputes/${ticketToResolve}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": "conon_mac_secret_9988",
      },
      body: JSON.stringify({
        resolution: "VAULT_REFUND",
        notes: "Approved by Founder Admin after inspection of damaged bag photo",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "POST /api/feedback/admin/disputes/:id/resolve returned 200 OK");
    assert(data.dispute.damageClaimStatus === "APPROVED_REFUND", "Dispute marked as APPROVED_REFUND");
  } catch (err: any) {
    assert(false, `Admin dispute resolution failed: ${err.message}`);
  }

  console.log("\n=========================================================================");
  console.log(`  VERIFICATION RESULTS: ${passed}/${total} CHECKS PASSED`);
  console.log("=========================================================================");

  if (passed === total) {
    console.log("🎉 ALL CONON TRUST & SITE DNA FEEDBACK TESTS PASSED 100%!");
  } else {
    process.exit(1);
  }
}

runTests();
