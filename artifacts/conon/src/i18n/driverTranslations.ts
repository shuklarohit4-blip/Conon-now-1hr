/**
 * CONON DRIVER & LOADER COCKPIT — BILINGUAL I18N DICTIONARY
 *
 * Natural, everyday North Indian driver & loader Hindi (Devanagari script)
 * paired with crisp, high-clarity English.
 *
 * Written specifically for Lucknow Chhota Hathi / Tata Ace loaders,
 * bike express riders, and transport mandi drivers. Universal vehicle codes,
 * brand names, and currency numbers remain crisp and recognizable.
 */

export type DriverLang = "en" | "hi";

export interface DriverTranslationSchema {
  [key: string]: string;

  // Header & Brand
  brandTagline: string;
  cockpitVersion: string;
  verifiedFleet: string;
  driverSwitcherTitle: string;
  instantSyncNote: string;
  registerNewDriver: string;
  onlineDuty: string;
  dutyOff: string;
  dutyLocked: string;
  vehicleLoader: string;
  vehicleBike: string;
  aajKiKamai: string;
  tripsCount: string;
  payloadGuard: string;
  safeLoad: string;
  docsValid: string;
  killSwitchActive: string;
  rainModeActiveBanner: string;
  rainModeDesc: string;

  // Active Mission Command Card
  activeMissionTitle: string;
  missionSlaCountdown: string;
  multiStopTitle: string;
  singleLoaderRun: string;
  stopLabel: string;
  markStopLoadedBtn: string;
  stopLoadedBadge: string;
  pickupHubLabel: string;
  pickupOtpLabel: string;
  dropSiteLabel: string;
  unloadingSlaTitle: string;
  freeWindowActive: string;
  detentionNotice: string;
  fastForwardDetentionTest: string;
  totalMissionPay: string;
  palledariIncluded: string;
  routeVoiceBtn: string;
  speakingVoiceBtn: string;
  arrivedAtSiteBtn: string;
  openGeoEscrowBtn: string;
  sosAlertBtn: string;
  noActiveMissionTitle: string;
  noActiveMissionDesc: string;

  // Quick Action Strip
  navGoogleMaps: string;
  callDealer: string;
  callSite: string;

  // Geo-Photo Escrow HUD
  hudTitle: string;
  gpsRadarMatch: string;
  gpsLockedText: string;
  customerOtpLabel: string;
  oneTapDemoOtp: string;
  mandatoryUnloadProof: string;
  photoVerifiedBadge: string;
  snapPhotoBtn: string;
  changePhotoBtn: string;
  rainTirpalVerify: string;
  rainTirpalMandatory: string;
  rainTirpalCheck: string;
  submitEscrowCashoutBtn: string;

  // Breakdown / Dhalai SOS Modal
  sosModalTitle: string;
  sosModalDesc: string;
  sosReasonLabel: string;
  cancelBtn: string;
  broadcastSosBtn: string;

  // Khali Mat Lautna (Reverse Buyback Radar)
  buybackTitle: string;
  buybackBonus: string;
  buybackPickupDesc: string;
  acceptBuybackBtn: string;
  completeBuybackBtn: string;

  // Earnings & Instant UPI Cashout Card
  earningsCardTitle: string;
  baseTripPay: string;
  palledariEarnings: string;
  returnBuybackEarnings: string;
  availableToWithdraw: string;
  withdrawUpiBtn: string;
  withdrawingUpi: string;
  dieselStreakTitle: string;
  dieselStreakProgress: string;
  dieselStreakUnlocked: string;

  // Compliance Health Shield & Expiry
  complianceShieldTitle: string;
  dlValidLabel: string;
  rcValidLabel: string;
  insValidLabel: string;
  pucValidLabel: string;
  tirpalReadyLabel: string;
  viewRenewPapersBtn: string;

  // Today's Completed Trips Timeline
  todayTripsTitle: string;
  noCompletedTrips: string;
  tripDelivered: string;

  // Driver Registration & KYC (/driver/register)
  kycWizardTitle: string;
  kycWizardSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  driverNameLabel: string;
  mobileOtpLabel: string;
  sendOtpBtn: string;
  otpVerifiedBadge: string;
  operatingZoneLabel: string;
  emergencyContactLabel: string;
  vehicleClassLabel: string;
  vehiclePlateLabel: string;
  dlNumberLabel: string;
  rcNumberLabel: string;
  insuranceNumberLabel: string;
  driverSelfieLabel: string;
  tirpalCheckLabel: string;
  bankAccountLabel: string;
  confirmAccountLabel: string;
  ifscLabel: string;
  upiVpaLabel: string;
  pennyDropBtn: string;
  pennyDropSuccess: string;
  pennyDropPending: string;
  slaPledgeTitle: string;
  slaPledge1: string;
  slaPledge2: string;
  slaPledge3: string;
  submitKycBtn: string;
  submittingKyc: string;
  backBtn: string;
  nextBtn: string;
}

export const DRIVER_TRANSLATIONS: Record<DriverLang, DriverTranslationSchema> = {
  en: {
    brandTagline: "CONON DRIVER",
    cockpitVersion: "COCKPIT v3.0",
    verifiedFleet: "VERIFIED FLEET",
    driverSwitcherTitle: "Driver Account Switcher",
    instantSyncNote: "Instant Sync",
    registerNewDriver: "+ Register New Driver / Loader",
    onlineDuty: "ONLINE",
    dutyOff: "DUTY OFF",
    dutyLocked: "LOCKED",
    vehicleLoader: "Loader (1.5T)",
    vehicleBike: "Bike (30kg)",
    aajKiKamai: "Today's Earnings",
    tripsCount: "Trips",
    payloadGuard: "Payload Load Guard",
    safeLoad: "Safe Load",
    docsValid: "Docs Valid",
    killSwitchActive: "Kill-Switch",
    rainModeActiveBanner: "🌧️ Global Rain-Shield Tirpal Mode Active",
    rainModeDesc: "Tarpaulin dry photo proof mandatory for all moisture-sensitive dispatches.",

    activeMissionTitle: "ACTIVE MISSION",
    missionSlaCountdown: "Left",
    multiStopTitle: "Smart Multi-Stop Clubbing",
    singleLoaderRun: "Single Loader Run",
    stopLabel: "Stop",
    markStopLoadedBtn: "Mark Loaded",
    stopLoadedBadge: "LOADED",
    pickupHubLabel: "Pickup Partner Hub",
    pickupOtpLabel: "Pickup Handover OTP",
    dropSiteLabel: "Site Construction Drop",
    unloadingSlaTitle: "Unloading Waiting SLA:",
    freeWindowActive: "15m Free Window Active",
    detentionNotice: "Free 15-minute unloading started upon site arrival. Detention auto-credits ₹2/min thereafter.",
    fastForwardDetentionTest: "⚡ +15m Fast-Forward Test",
    totalMissionPay: "Total Mission Pay",
    palledariIncluded: "Palledari Included",
    routeVoiceBtn: "🔊 Route Voice",
    speakingVoiceBtn: "Speaking…",
    arrivedAtSiteBtn: "Arrived at Site ➔ Open Geo-Escrow HUD",
    openGeoEscrowBtn: "Complete Geo-Escrow Drop & Cashout",
    sosAlertBtn: "Breakdown / Dhalai SOS Alert",
    noActiveMissionTitle: "No Active Mission",
    noActiveMissionDesc: "Accepted orders from the Vendor Panel will buzz directly into this cockpit.",

    navGoogleMaps: "Navigate",
    callDealer: "Call Dealer",
    callSite: "Call Site",

    hudTitle: "Geo-Photo Escrow Verifier",
    gpsRadarMatch: "GPS Radar Match",
    gpsLockedText: "Locked to site coordinates:",
    customerOtpLabel: "Customer 4-Digit Handover OTP:",
    oneTapDemoOtp: "1-Tap 2026",
    mandatoryUnloadProof: "Mandatory Site Unloading Proof:",
    photoVerifiedBadge: "✓ Photo Proof Verified",
    snapPhotoBtn: "Snap / Simulate Unloading Photo Proof",
    changePhotoBtn: "Change",
    rainTirpalVerify: "Rain-Shield Tirpal Dry Verification:",
    rainTirpalMandatory: "MANDATORY",
    rainTirpalCheck: "Tarpaulin inspected: 100% moisture sealed & dry during road transit.",
    submitEscrowCashoutBtn: "Submit Geo-Proof & Cashout",

    sosModalTitle: "Emergency Dhalai SOS Alert",
    sosModalDesc: "Pushes high-priority alert directly to CONON COMMAND OS God-Eye radar. A replacement loader or rescue mechanic will be dispatched immediately.",
    sosReasonLabel: "Reason for Breakdown / Delay:",
    cancelBtn: "Cancel",
    broadcastSosBtn: "Broadcast SOS Alert 🚨",

    buybackTitle: "Khali Mat Lautna! (Zero-Empty-Return)",
    buybackBonus: "Return Trip Bonus",
    buybackPickupDesc: "Pickup leftover cement/pipes from site and return to nearest partner hub.",
    acceptBuybackBtn: "Accept Return Pickup (+₹220 Bonus)",
    completeBuybackBtn: "Mark Reverse Drop Complete ➔ Claim ₹220",

    earningsCardTitle: "Live Earnings & Instant Cashout",
    baseTripPay: "Base Trip Fares",
    palledariEarnings: "Palledari Unloading Bonus",
    returnBuybackEarnings: "Return Buyback Bonus",
    availableToWithdraw: "Available for Instant Cashout",
    withdrawUpiBtn: "⚡ Withdraw ₹ to UPI Instantly (NPCI 24x7)",
    withdrawingUpi: "Transferring to UPI…",
    dieselStreakTitle: "Daily Diesel Bonus Streak",
    dieselStreakProgress: "Trips Completed — 1 more trip to unlock +₹250 Diesel Bonus!",
    dieselStreakUnlocked: "🎉 +₹250 Daily Diesel Bonus Unlocked & Added to Wallet!",

    complianceShieldTitle: "Fleet Compliance & Health Shield",
    dlValidLabel: "Commercial Driving Licence",
    rcValidLabel: "Vehicle Registration Certificate (RC)",
    insValidLabel: "Commercial Goods Insurance",
    pucValidLabel: "Pollution Under Control (PUC)",
    tirpalReadyLabel: "Heavy-Duty Tarpaulin (Tirpal)",
    viewRenewPapersBtn: "View Papers / Upload Renewals",

    todayTripsTitle: "Today's Completed Trips",
    noCompletedTrips: "No trips completed yet today. Accept a mission to start earning!",
    tripDelivered: "Site Delivered & Geo-Verified",

    kycWizardTitle: "Fleet Driver & Loader Onboarding",
    kycWizardSubtitle: "Join Lucknow's verified express building materials supply network in 4 simple steps",
    step1Title: "1. Driver Profile & Vehicle",
    step1Desc: "Full name, phone verification, Lucknow zone, vehicle plate number and loading capacity",
    step2Title: "2. RTO Papers with AI OCR",
    step2Desc: "Automated scan for Driving Licence, Vehicle RC, Goods Insurance, PUC and Tirpal proof",
    step3Title: "3. Bank & ₹1 Penny-Drop",
    step3Desc: "Instant ₹1 IMPS deposit to authenticate bank account and direct UPI VPA for settlement",
    step4Title: "4. Digital SLA & E-Sign",
    step4Desc: "Transparent safety bylaws, anti-overloading pledge and customer handshake delivery commitment",

    driverNameLabel: "Driver Full Name (as per DL)",
    mobileOtpLabel: "Mobile Number (WhatsApp Enabled)",
    sendOtpBtn: "Send OTP",
    otpVerifiedBadge: "Mobile Verified via OTP",
    operatingZoneLabel: "Operating Lucknow Corridor Zone",
    emergencyContactLabel: "Emergency Contact (Family / Munim)",
    vehicleClassLabel: "Vehicle Delivery Category",
    vehiclePlateLabel: "Vehicle Registration Number (RTO Plate)",
    dlNumberLabel: "Commercial Driving Licence Number",
    rcNumberLabel: "Vehicle RC Number",
    insuranceNumberLabel: "Commercial Goods Carrier Insurance",
    driverSelfieLabel: "Driver Live Face Verification",
    tirpalCheckLabel: "Waterproof Tarpaulin (Tirpal) Inspection",
    bankAccountLabel: "Bank Account Number (for Instant Earnings)",
    confirmAccountLabel: "Re-Enter Bank Account Number",
    ifscLabel: "Bank IFSC Code (Branch Auto-Fetch)",
    upiVpaLabel: "Instant Payout UPI VPA",
    pennyDropBtn: "⚡ Verify via ₹1 Penny-Drop",
    pennyDropSuccess: "₹1 IMPS Deposited • Beneficiary Name Matched Successfully",
    pennyDropPending: "Pinging NPCI IMPS Gateway…",
    slaPledgeTitle: "CONON Lucknow Driver & Loader Code of Conduct",
    slaPledge1: "I will never overload my vehicle beyond legal RTO limits (1.5 Ton for Loader / 30kg for Bike).",
    slaPledge2: "I will always carry a heavy waterproof Tarpaulin to protect cement and moisture-sensitive goods.",
    slaPledge3: "I will only release materials after obtaining customer 4-digit OTP and taking real site unloading photo.",
    submitKycBtn: "Complete Registration & Go Live 🚀",
    submittingKyc: "Submitting Application…",
    backBtn: "Back",
    nextBtn: "Continue",
  },
  hi: {
    brandTagline: "कोनोन ड्राइवर",
    cockpitVersion: "कॉकपिट v3.0",
    verifiedFleet: "सत्यापित फ्लीट",
    driverSwitcherTitle: "ड्राइवर खाता बदलें",
    instantSyncNote: "तुरंत सिंक",
    registerNewDriver: "+ नया ड्राइवर / लोडर जोड़ें",
    onlineDuty: "ड्यूटी चालू (ऑनलाइन)",
    dutyOff: "ड्यूटी बंद (ऑफलाइन)",
    dutyLocked: "निलंबित (लॉक)",
    vehicleLoader: "छोटा हाथी (1.5 टन)",
    vehicleBike: "बाइक (30 किग्रा)",
    aajKiKamai: "आज की कुल कमाई",
    tripsCount: "ट्रिप्स",
    payloadGuard: "लोड सुरक्षा गार्ड",
    safeLoad: "सुरक्षित लोड",
    docsValid: "कागजात सही हैं",
    killSwitchActive: "सुरक्षा लॉक सक्रिय",
    rainModeActiveBanner: "🌧️ बारिश सुरक्षा (तिरपाल मोड) सक्रिय है",
    rainModeDesc: "सीमेंट व नमी वाली सामग्री हेतु सूखा तिरपाल फोटो अनिवार्य है।",

    activeMissionTitle: "सक्रिय डिलीवरी मिशन",
    missionSlaCountdown: "शेष",
    multiStopTitle: "स्मार्ट 2-दुकान क्लबिंग",
    singleLoaderRun: "एक ही गाड़ी, 2 पिकअप",
    stopLabel: "पड़ाव",
    markStopLoadedBtn: "लोडिंग दर्ज करें",
    stopLoadedBadge: "लोड हो गया",
    pickupHubLabel: "पिकअप पार्टनर दुकान (हब)",
    pickupOtpLabel: "लोडिंग गेट पास ओटीपी",
    dropSiteLabel: "कंस्ट्रक्शन साइट डिलीवरी",
    unloadingSlaTitle: "अनलोडिंग प्रतीक्षा समय:",
    freeWindowActive: "15 मिनट मुफ्त समय चालू",
    detentionNotice: "साइट पर पहुँचने से 15 मिनट मुफ्त अनलोडिंग। इसके बाद ₹2 प्रति मिनट वेटिंग चार्ज सीधे जुड़ेगा।",
    fastForwardDetentionTest: "⚡ +15 मिनट फास्ट-फॉरवर्ड टेस्ट",
    totalMissionPay: "इस ट्रिप की कुल कमाई",
    palledariIncluded: "पल्लेदारी बोनस शामिल",
    routeVoiceBtn: "🔊 रूट वॉयस निर्देश",
    speakingVoiceBtn: "बोल रहे हैं...",
    arrivedAtSiteBtn: "साइट पर पहुँचे ➔ एस्क्रो HUD खोलें",
    openGeoEscrowBtn: "जियो-फोटो डिलीवरी पूरी करें और पैसे लें",
    sosAlertBtn: "🚨 गाड़ी खराब / ढलाई इमरजेंसी SOS",
    noActiveMissionTitle: "कोई सक्रिय ट्रिप नहीं है",
    noActiveMissionDesc: "दुकानदार द्वारा आर्डर स्वीकार होते ही आपकी स्क्रीन पर तुरंत घंटी बजेगी।",

    navGoogleMaps: "गूगल मैप्स नेविगेट",
    callDealer: "दुकानदार को कॉल करें",
    callSite: "साइट इंजीनियर को कॉल करें",

    hudTitle: "जियो-फोटो एस्क्रो डिलीवरी सत्यापन",
    gpsRadarMatch: "जीपीएस लोकेशन मिलान",
    gpsLockedText: "साइट लोकेशन से लॉक:",
    customerOtpLabel: "ग्राहक का 4-अंकों का डिलीवरी ओटीपी:",
    oneTapDemoOtp: "1-टैप 2026",
    mandatoryUnloadProof: "साइट पर उतरे सामान की फोटो (अनिवार्य):",
    photoVerifiedBadge: "✓ फोटो प्रमाण सत्यापित",
    snapPhotoBtn: "कैमरा से अनलोडिंग फोटो लें / सैंपल लगाएं",
    changePhotoBtn: "फोटो बदलें",
    rainTirpalVerify: "बारिश तिरपाल सुरक्षा जांच:",
    rainTirpalMandatory: "अनिवार्य",
    rainTirpalCheck: "तिरपाल ठीक से बंधा है: रास्ते में बारिश से सीमेंट पूरी तरह सुरक्षित रहा।",
    submitEscrowCashoutBtn: "प्रमाण जमा करें और तुरंत पैसे निकालें",

    sosModalTitle: "गाड़ी खराब / ढलाई SOS आपातकालीन अलर्ट",
    sosModalDesc: "यह संदेश सीधे कोनोन हेडक्वार्टर कंट्रोल रूम को जाएगा। तुरंत दूसरी गाड़ी या मैकेनिक भेजा जाएगा ताकि साइट पर ढलाई न रुके।",
    sosReasonLabel: "समस्या का मुख्य कारण चुनें:",
    cancelBtn: "रद्द करें",
    broadcastSosBtn: "एसओएस अलर्ट भेजें 🚨",

    buybackTitle: "खाली मत लौटना! (वापसी ट्रिप बोनस)",
    buybackBonus: "वापसी ट्रिप कमाई",
    buybackPickupDesc: "साइट पर बची हुई सीमेंट/पाइप पास की दुकान पर लौटाएं और अतिरिक्त बोनस पाएं।",
    acceptBuybackBtn: "वापसी पिकअप स्वीकार करें (+₹220 बोनस)",
    completeBuybackBtn: "वापसी सामान जमा किया ➔ ₹220 प्राप्त करें",

    earningsCardTitle: "लाइव कमाई व तुरंत यूपीआई निकासी",
    baseTripPay: "मूल ट्रिप भाड़ा",
    palledariEarnings: "पल्लेदारी / अनलोडिंग बोनस",
    returnBuybackEarnings: "वापसी ट्रिप बोनस",
    availableToWithdraw: "निकासी हेतु उपलब्ध राशि",
    withdrawUpiBtn: "⚡ तुरंत यूपीआई में भेजें (NPCI 24x7)",
    withdrawingUpi: "बैंक में ट्रांसफर हो रहा है...",
    dieselStreakTitle: "दैनिक डीजल बोनस स्ट्रीक",
    dieselStreakProgress: "ट्रिप्स पूरी हुईं — +₹250 डीजल बोनस हेतु 1 ट्रिप और बाकी!",
    dieselStreakUnlocked: "🎉 बधाई! +₹250 दैनिक डीजल बोनस वॉलेट में क्रेडिट हो गया!",

    complianceShieldTitle: "गाड़ी फिटनेस व कानूनी कागजात सुरक्षा",
    dlValidLabel: "कमर्शियल ड्राइविंग लाइसेंस (DL)",
    rcValidLabel: "गाड़ी की आरसी (RC बुक)",
    insValidLabel: "गाड़ी का बीमा (कमर्शियल इन्शुरन्स)",
    pucValidLabel: "प्रदूषण प्रमाण पत्र (PUC)",
    tirpalReadyLabel: "वाटरप्रूफ तिरपाल (Tirpal)",
    viewRenewPapersBtn: "कागजात देखें / नवीनीकरण अपलोड करें",

    todayTripsTitle: "आज पूरी की गई ट्रिप्स",
    noCompletedTrips: "आज अभी तक कोई ट्रिप पूरी नहीं हुई है। ड्यूटी चालू कर मिशन स्वीकार करें!",
    tripDelivered: "साइट पर सुरक्षित डिलीवरी पूर्ण",

    kycWizardTitle: "कोनोन फ्लीट ड्राइवर व लोडर पंजीकरण",
    kycWizardSubtitle: "लखनऊ के सबसे बड़े निर्माण सामग्री ट्रांसपोर्ट नेटवर्क से जुड़ें — केवल 4 सरल चरणों में",
    step1Title: "1. ड्राइवर विवरण व गाड़ी",
    step1Desc: "पूरा नाम, मोबाइल ओटीपी, कार्य क्षेत्र, गाड़ी नंबर और भार वहन क्षमता",
    step2Title: "2. सरकारी कागजात व एआई जांच",
    step2Desc: "ड्राइविंग लाइसेंस, आरसी, इन्शुरन्स, पीयूसी और तिरपाल की तत्काल कंप्यूटर जांच",
    step3Title: "3. बैंक खाता व ₹1 पेनी-ड्रॉप",
    step3Desc: "आईएमपीएस द्वारा ₹1 जमा कर तुरंत बैंक खाता और यूपीआई आईडी का सत्यापन",
    step4Title: "4. गुणवत्ता व सुरक्षा शपथ पत्र",
    step4Desc: "ओवरलोडिंग निषेध, बारिश से बचाव और ग्राहक ओटीपी डिलीवरी की डिजिटल गारंटी",

    driverNameLabel: "ड्राइवर का पूरा नाम (लाइसेंस अनुसार)",
    mobileOtpLabel: "मोबाइल नंबर (व्हाट्सएप नंबर)",
    sendOtpBtn: "ओटीपी भेजें",
    otpVerifiedBadge: "मोबाइल ओटीपी सत्यापित",
    operatingZoneLabel: "लखनऊ में मुख्य संचालन क्षेत्र",
    emergencyContactLabel: "आपातकालीन संपर्क (परिवार / मुनीम)",
    vehicleClassLabel: "गाड़ी का प्रकार चुनें",
    vehiclePlateLabel: "गाड़ी का नंबर (आरसी प्लेट)",
    dlNumberLabel: "ड्राइविंग लाइसेंस (DL) नंबर",
    rcNumberLabel: "गाड़ी की आरसी (RC) नंबर",
    insuranceNumberLabel: "गाड़ी का इन्शुरन्स पॉलिसी नंबर",
    driverSelfieLabel: "ड्राइवर लाइव सेल्फी फोटो",
    tirpalCheckLabel: "वाटरप्रूफ तिरपाल जांच फोटो",
    bankAccountLabel: "बैंक खाता संख्या (कमाई जमा करने हेतु)",
    confirmAccountLabel: "खाता संख्या दोबारा दर्ज करें",
    ifscLabel: "बैंक आईएफएससी (IFSC) कोड",
    upiVpaLabel: "सीधा यूपीआई पता (तुरंत सेटलमेंट हेतु)",
    pennyDropBtn: "⚡ ₹1 पेनी-ड्रॉप बैंक सत्यापन शुरू करें",
    pennyDropSuccess: "₹1 बैंक में जमा हुआ • खाता नाम ड्राइवर नाम से शत-प्रतिशत मिल गया",
    pennyDropPending: "एनपीसीआई गेटवे से बैंक जांच जारी है...",
    slaPledgeTitle: "कोनोन फ्लीट ड्राइवर सुरक्षा नियम व शपथ",
    slaPledge1: "मैं अपनी गाड़ी में कभी भी आरटीओ सीमा से अधिक लोड (छोटा हाथी 1.5 टन / बाइक 30 किग्रा) नहीं भरूंगा।",
    slaPledge2: "मैं बारिश और धूल से सीमेंट व अन्य सामान को बचाने के लिए हमेशा मजबूत तिरपाल साथ रखूंगा।",
    slaPledge3: "मैं ग्राहक से 4-अंकों का ओटीपी लेकर और साइट पर अनलोडिंग फोटो खींचकर ही सामान सौंपूंगा।",
    submitKycBtn: "पंजीकरण पूरा करें और ट्रिप लेना शुरू करें 🚀",
    submittingKyc: "आवेदन जमा हो रहा है...",
    backBtn: "पीछे जाएं",
    nextBtn: "अगला कदम",
  },
};
