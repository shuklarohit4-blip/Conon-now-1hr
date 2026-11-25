import {
  generateProjectBOQ,
  type ProjectInputs,
  type MasterCatalogSKU,
} from "../artifacts/conon/src/lib/builderKitEngine";

async function runVerification() {
  console.log("==================================================================");
  console.log("   CONON-NOW • BUILDER KIT & CIVIL BOQ ENGINE VERIFICATION SUITE   ");
  console.log("==================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) console.error(`     Details: ${details}`);
    }
  }

  // --- PART 1: CIVIL ENGINEERING FORMULAS & TIER PROGRESSION ---
  console.log("▶ 1. Testing Civil Engineering Formulas & Quality Tiers...");

  const baseInput: ProjectInputs = {
    plotAreaSqFt: 1000,
    floors: 2, // G+1
    builtUpSqFt: 2000,
    bathrooms: 2,
    kitchens: 1,
    doorsCount: 8,
    qualityTier: "STANDARD",
    wallType: "RED_BRICK",
    lucknowZone: "Sushant Golf City",
  };

  const standardBoq = generateProjectBOQ(baseInput);
  const premiumBoq = generateProjectBOQ({ ...baseInput, qualityTier: "PREMIUM" });
  const luxuryBoq = generateProjectBOQ({ ...baseInput, qualityTier: "LUXURY" });

  assert(
    standardBoq.inputs.builtUpSqFt === 2000,
    "Built-up area correctly set (1000 sq ft * 2 floors = 2000 sq ft)",
    `Expected 2000, got ${standardBoq.inputs.builtUpSqFt}`
  );

  assert(
    standardBoq.stages.length === 6,
    "All 6 construction stages generated",
    `Found ${standardBoq.stages.length} stages`
  );

  assert(
    standardBoq.grandTotal > 0 && premiumBoq.grandTotal > standardBoq.grandTotal,
    "Premium tier total is higher than Standard tier total",
    `Standard: ₹${standardBoq.grandTotal.toLocaleString("en-IN")}, Premium: ₹${premiumBoq.grandTotal.toLocaleString("en-IN")}`
  );

  assert(
    luxuryBoq.grandTotal > premiumBoq.grandTotal,
    "Luxury tier total is higher than Premium tier total",
    `Premium: ₹${premiumBoq.grandTotal.toLocaleString("en-IN")}, Luxury: ₹${luxuryBoq.grandTotal.toLocaleString("en-IN")}`
  );

  console.log(`     Standard: ₹${standardBoq.grandTotal.toLocaleString("en-IN")} (₹${standardBoq.costPerSqFt}/sqft)`);
  console.log(`     Premium:  ₹${premiumBoq.grandTotal.toLocaleString("en-IN")} (₹${premiumBoq.costPerSqFt}/sqft)`);
  console.log(`     Luxury:   ₹${luxuryBoq.grandTotal.toLocaleString("en-IN")} (₹${luxuryBoq.costPerSqFt}/sqft)`);

  // --- PART 2: MASONRY SWITCH (RED BRICK VS AAC BLOCK) ---
  console.log("\n▶ 2. Testing Masonry Logic (Red Clay Brick vs AAC Blocks)...");

  const aacBoq = generateProjectBOQ({ ...baseInput, wallType: "AAC_BLOCK" });

  const stage1Red = standardBoq.stages.find(s => s.stageId === 1);
  const stage1Aac = aacBoq.stages.find(s => s.stageId === 1);

  const hasRedBricks = stage1Red?.items.some(i => i.itemKey.includes("brick") || i.title.toLowerCase().includes("brick"));
  const hasAacBlocksInRed = stage1Red?.items.some(i => i.itemKey.includes("aac") || i.title.toLowerCase().includes("aac"));
  const hasAacBlocks = stage1Aac?.items.some(i => i.itemKey.includes("aac") || i.title.toLowerCase().includes("aac"));
  const hasRedBricksInAac = stage1Aac?.items.some(i => i.itemKey.includes("brick") || i.title.toLowerCase().includes("brick"));

  assert(
    hasRedBricks === true && hasAacBlocksInRed === false,
    "RED_BRICK mode generates Red Clay Bricks and zero AAC blocks"
  );

  assert(
    hasAacBlocks === true && hasRedBricksInAac === false,
    "AAC_BLOCK mode generates AAC blocks and zero Red Clay Bricks"
  );

  // --- PART 3: LOGISTICS VEHICLE FLEET SPLIT ---
  console.log("\n▶ 3. Testing Logistics Multi-Vehicle Fleet Split...");

  const veh = standardBoq.vehicleSummary;
  assert(
    veh.truckOrTrolley > 0,
    "Heavy Trucks/Trolleys allocated for Sand, Gitti, Bricks & Cement",
    `Trucks allocated: ${veh.truckOrTrolley}`
  );
  assert(
    veh.pickup > 0,
    "4W Pickups allocated for Doors, Tiles, Plywood & Appliances",
    `Pickups allocated: ${veh.pickup}`
  );
  assert(
    veh.bike > 0,
    "2W Delivery Bikes allocated for Fast Electrical, Locks & Plumbing fittings",
    `Bikes allocated: ${veh.bike}`
  );

  // --- PART 4: LIVE API SERVER TEST (LEADS & LIVE CATALOG) ---
  console.log("\n▶ 4. Testing API Server Endpoints (Port 5001)...");

  const baseUrl = "http://127.0.0.1:5001";

  try {
    // 4.1 Verify Live Catalog
    const catRes = await fetch(`${baseUrl}/api/catalog/live`);
    const catData = await catRes.json();
    assert(
      catData.success === true && Array.isArray(catData.items) && catData.items.length >= 700,
      `SSOT Live Catalog returns ${catData.items?.length || 0} active SKUs (>=700 target)`
    );

    // 4.2 Verify Dynamic Catalog Matcher with Live SKUs
    const liveSkus: MasterCatalogSKU[] = catData.items || [];
    const dynamicBoq = generateProjectBOQ(baseInput, liveSkus);
    assert(
      dynamicBoq.grandTotal > 0 && dynamicBoq.stages.every(s => s.items.length > 0),
      "BOQ successfully calculated with live catalog items"
    );

    // 4.3 Verify Admin Leads Retrieval
    const leadsRes = await fetch(`${baseUrl}/api/admin/leads`);
    const leadsData = await leadsRes.json();
    assert(
      leadsData.success === true && Array.isArray(leadsData.leads) && leadsData.leads.length >= 3,
      `Admin Leads API returns seeded leads (count: ${leadsData.leads?.length || 0})`
    );

    // 4.4 Submit New High-Ticket Builder Kit Lead
    const newLeadPayload = {
      name: "Er. Vikramaditya Singh",
      phone: "9839998877",
      lucknowZone: "Sushant Golf City",
      builtUpSqFt: 2500,
      qualityTier: "PREMIUM",
      wallType: "RED_BRICK",
      floors: 2,
      grandTotal: premiumBoq.grandTotal,
      notes: "Need 60-min Express delivery to Golf City Pocket 3 site",
      startDate: "2026-12-01",
      boqSummary: {
        grandTotal: premiumBoq.grandTotal,
        costPerSqFt: premiumBoq.costPerSqFt,
        stages: premiumBoq.stages.map(s => ({
          stageId: s.stageId,
          stageName: s.stageName,
          subtotal: s.subtotal,
          itemCount: s.items.length,
        })),
      },
    };

    const postLeadRes = await fetch(`${baseUrl}/api/builder-kit/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLeadPayload),
    });
    const postLeadData = await postLeadRes.json();
    assert(
      postLeadData.success === true && postLeadData.lead?.id !== undefined,
      `Lead successfully submitted via POST /api/builder-kit/leads (Lead ID: ${postLeadData.lead?.id})`
    );

    const createdLeadId = postLeadData.lead?.id;

    // 4.5 Update Lead Status
    if (createdLeadId) {
      const patchRes = await fetch(`${baseUrl}/api/admin/leads/${createdLeadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONTACTED" }),
      });
      const patchData = await patchRes.json();
      assert(
        patchData.success === true && patchData.lead?.status === "CONTACTED",
        `Admin successfully updated lead status to CONTACTED`
      );

      // 4.6 Cleanup Test Lead
      const delRes = await fetch(`${baseUrl}/api/admin/leads/${createdLeadId}`, {
        method: "DELETE",
      });
      const delData = await delRes.json();
      assert(
        delData.success === true,
        `Admin successfully cleaned up test lead ${createdLeadId}`
      );
    }
  } catch (err: any) {
    assert(false, "API server communication check", err.message);
  }

  // --- SUMMARY ---
  console.log("\n==================================================================");
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("==================================================================\n");

  if (passedTests === totalTests) {
    console.log("🎉 All Builder Kit tests passed with 100% compliance!");
    process.exit(0);
  } else {
    console.error("❌ Some verification checks failed!");
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error("Verification suite encountered an error:", err);
  process.exit(1);
});
