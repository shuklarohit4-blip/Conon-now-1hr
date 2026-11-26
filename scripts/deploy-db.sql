-- ============================================================================
-- CONON-NOW CLOUD POSTGRESQL IDEMPOTENT BOOTSTRAP SCHEMA
-- Target Platforms: Supabase (AWS Mumbai ap-south-1) / Neon / Render Postgres
-- Model: 60-Minute Lucknow Construction Aggregator & Living Material Vault
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. App Users & Multi-Panel Roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL DEFAULT 'Conon Builder',
    role VARCHAR(30) NOT NULL DEFAULT 'customer',
    vendor_store VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Lucknow Mandi Live Commodities & Benchmark Rates
CREATE TABLE IF NOT EXISTS mandi_rates (
    id SERIAL PRIMARY KEY,
    commodity_id VARCHAR(50) NOT NULL UNIQUE,
    material VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL,
    current_price NUMERIC(10, 2) NOT NULL,
    previous_price NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    trend VARCHAR(10) NOT NULL DEFAULT 'FLAT',
    change_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    lucknow_mandi_location VARCHAR(120) NOT NULL DEFAULT 'Latouche Road Mandi, Lucknow',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Storefront Real-Time Orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(60) NOT NULL UNIQUE,
    user_id VARCHAR(120),
    phone VARCHAR(20),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    delivery_address TEXT NOT NULL,
    delivery_pin VARCHAR(10) NOT NULL DEFAULT '226001',
    hub_zone VARCHAR(100) NOT NULL DEFAULT 'Hazratganj & Central Lucknow',
    status VARCHAR(40) NOT NULL DEFAULT 'confirmed',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    assigned_driver_id VARCHAR(60),
    eta_minutes INT NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Main Living Material Vault (Conon Wallets)
CREATE TABLE IF NOT EXISTS conon_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(120) NOT NULL UNIQUE,
    cash_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cash_balance >= 0),
    gold_bonus_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (gold_bonus_balance >= 0),
    sos_credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sos_credit_used NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sos_due_at TIMESTAMPTZ,
    site_trust_score INT NOT NULL DEFAULT 50 CHECK (site_trust_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Immutable Fintech Ledger (Pakka Hisab)
CREATE TABLE IF NOT EXISTS wallet_ledger (
    tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE CASCADE,
    idempotency_key VARCHAR(120) NOT NULL UNIQUE,
    tx_type VARCHAR(30) NOT NULL CHECK (
        tx_type IN ('DEPOSIT', 'ORDER_SPEND', 'RATE_LOCK_DEBIT', 'SOS_DRAW', 'SOS_REPAY', 'BILL_XRAY_REWARD', 'BUYBACK_CREDIT', 'CRANE_DROP', 'REFERRAL', 'SPONSOR_BONUS')
    ),
    amount NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    reference_id VARCHAR(120),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Material Rate Lock Units (Inflation-Shielded Inventory)
CREATE TABLE IF NOT EXISTS material_rate_locks (
    lock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE CASCADE,
    partner_vendor_id VARCHAR(120),
    sku_code VARCHAR(80) NOT NULL,
    unit_label VARCHAR(30) NOT NULL,
    locked_qty NUMERIC(10, 2) NOT NULL,
    redeemed_qty NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    locked_unit_price NUMERIC(10, 2) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'PARTIAL', 'REDEEMED', 'EXPIRED_REFUNDED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Mistri / Contractor Zero-Leakage Passes
CREATE TABLE IF NOT EXISTS mistri_passes (
    pass_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE CASCADE,
    site_name VARCHAR(150) NOT NULL,
    contractor_name VARCHAR(120) NOT NULL,
    contractor_phone VARCHAR(20) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    daily_limit NUMERIC(10, 2) NOT NULL,
    spent_today NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    allowed_categories TEXT[] NOT NULL DEFAULT ARRAY['PLUMBING', 'ADHESIVES']::text[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Leftover Material Reverse Buyback Requests
CREATE TABLE IF NOT EXISTS buyback_requests (
    buyback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE CASCADE,
    sku_code VARCHAR(80) NOT NULL,
    qty NUMERIC(10, 2) NOT NULL,
    photo_url TEXT NOT NULL,
    site_lat NUMERIC(9, 6),
    site_lng NUMERIC(9, 6),
    estimated_gold_credit NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PICKUP_SCHEDULED' CHECK (
        status IN ('PICKUP_SCHEDULED', 'VERIFIED_CREDITED', 'REJECTED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Ultra-Fast Query Performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet ON wallet_ledger(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_tx_type ON wallet_ledger(tx_type);
CREATE INDEX IF NOT EXISTS idx_material_rate_locks_wallet ON material_rate_locks(wallet_id);
CREATE INDEX IF NOT EXISTS idx_mistri_passes_wallet ON mistri_passes(owner_wallet_id);
CREATE INDEX IF NOT EXISTS idx_buyback_wallet ON buyback_requests(wallet_id);

-- Baseline Seed Data for Lucknow Mandi Rates (Latouche Road Benchmark)
INSERT INTO mandi_rates (commodity_id, material, category, current_price, previous_price, unit, trend, change_percent, lucknow_mandi_location)
VALUES 
    ('cement-opc53', 'Ultratech Super Cement (OPC 53)', 'Cement', 390.00, 380.00, '50kg Bag', 'UP', 2.63, 'Latouche Road Mandi, Lucknow'),
    ('tmt-fe550d', 'Kamdhenu PAS 10000 TMT (Fe-550D)', 'Steel', 54.50, 56.00, 'kg', 'DOWN', -2.68, 'Aishbagh Mandi, Lucknow'),
    ('red-brick-avval', 'First Class Red Clay Bricks (Avval)', 'Masonry', 8.50, 8.50, 'Piece', 'FLAT', 0.00, 'Chinhat / Faizabad Road, Lucknow'),
    ('sand-morang', 'Red Morang Sand (Fine Coarse)', 'Sand', 62.00, 58.00, 'Cubic Ft', 'UP', 6.90, 'Shaheed Path Ghat, Lucknow'),
    ('river-sand-safed', 'Safed Ret / White River Sand', 'Sand', 38.00, 38.00, 'Cubic Ft', 'FLAT', 0.00, 'Gomti Ghat, Lucknow'),
    ('gitti-aggregate-20mm', 'Stone Blue Aggregate (20mm Gitti)', 'Aggregates', 48.00, 47.00, 'Cubic Ft', 'UP', 2.13, 'Alambagh Yard, Lucknow'),
    ('aac-blocks-4inch', 'Magicrete Aerated AAC Blocks (4")', 'Masonry', 58.00, 60.00, 'Piece', 'DOWN', -3.33, 'Transport Nagar, Lucknow')
ON CONFLICT (commodity_id) DO UPDATE SET
    current_price = EXCLUDED.current_price,
    previous_price = EXCLUDED.previous_price,
    trend = EXCLUDED.trend,
    change_percent = EXCLUDED.change_percent,
    lucknow_mandi_location = EXCLUDED.lucknow_mandi_location,
    updated_at = NOW();

-- 9. Real-Time Vendor Supply Hubs (Lucknow Corridor)
CREATE TABLE IF NOT EXISTS vendor_hubs (
    hub_id VARCHAR(60) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT true,
    stock_flags JSONB NOT NULL DEFAULT '{"OPC53_CEMENT": true, "TMT_FE550D": true, "AVVAL_BRICK": true, "AAC_BLOCK": true, "CPVC_PIPES": true}'::jsonb,
    escrow_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    settled_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Real-Time Drivers & Fleet Loaders
CREATE TABLE IF NOT EXISTS drivers (
    driver_id VARCHAR(60) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL CHECK (
        vehicle_type IN ('BIKE_EXPRESS', 'CHHOTA_HATHI', '2W_BIKE', '3W_ELECTRIC_LOADER', '4W_PICKUP', 'TRACTOR_DUMPER')
    ),
    max_payload_kg NUMERIC(8, 2) NOT NULL DEFAULT 30.00,
    is_online BOOLEAN NOT NULL DEFAULT true,
    current_lat NUMERIC(9, 6),
    current_lng NUMERIC(9, 6),
    today_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    palledari_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Smart Multi-Stop Clubbing Sequences (1 Loader picking up from 1-2 partner shops)
CREATE TABLE IF NOT EXISTS order_stops (
    stop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(80) NOT NULL,
    hub_id VARCHAR(60) NOT NULL REFERENCES vendor_hubs(hub_id) ON DELETE CASCADE,
    sequence_no INT NOT NULL DEFAULT 1,
    pickup_qr_token VARCHAR(120) NOT NULL,
    is_loaded BOOLEAN NOT NULL DEFAULT false,
    loaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Immutable Dispatch & Relay Audit Timeline (180s cascades, tarpaulin checks, GPS arrival, detention)
CREATE TABLE IF NOT EXISTS dispatch_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(80) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Additional Relay & Logistics Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_hubs_online ON vendor_hubs(is_online);
CREATE INDEX IF NOT EXISTS idx_drivers_online ON drivers(is_online, vehicle_type);
CREATE INDEX IF NOT EXISTS idx_order_stops_order ON order_stops(order_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_events_order ON dispatch_events(order_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_events_type ON dispatch_events(event_type);

-- 13. Partner KYC & Compliance Applications (Vendor & Driver)
CREATE TABLE IF NOT EXISTS partner_kyc_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_type VARCHAR(20) NOT NULL CHECK (applicant_type IN ('VENDOR', 'DRIVER')),
    applicant_id VARCHAR(80) NOT NULL UNIQUE,
    firm_or_name VARCHAR(150) NOT NULL,
    owner_or_driver_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    vehicle_mode VARCHAR(40) CHECK (vehicle_mode IN ('BIKE_EXPRESS', 'CHHOTA_HATHI', NULL)),
    vehicle_plate VARCHAR(30),
    loading_bay_access VARCHAR(40) CHECK (loading_bay_access IN ('NARROW_LANE', 'LOADER_FRIENDLY', NULL)),
    categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    shop_lat NUMERIC(9, 6),
    shop_lng NUMERIC(9, 6),
    bank_account VARCHAR(40),
    bank_ifsc VARCHAR(20),
    bank_upi VARCHAR(60),
    penny_drop_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (penny_drop_status IN ('PENDING', 'VERIFIED', 'FAILED')),
    penny_drop_holder_name VARCHAR(120),
    penny_drop_ref VARCHAR(80),
    ai_authenticity_score INT NOT NULL DEFAULT 95 CHECK (ai_authenticity_score BETWEEN 0 AND 100),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (
        status IN ('PENDING_VERIFICATION', 'REUPLOAD_REQUESTED', 'APPROVED', 'REJECTED', 'EXPIRING_SOON', 'COMPLIANCE_PAUSED')
    ),
    sla_signed_at TIMESTAMPTZ,
    insurance_expiry TIMESTAMPTZ,
    dl_expiry TIMESTAMPTZ,
    puc_expiry TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Partner KYC Uploaded Documents & AI OCR Extractions
CREATE TABLE IF NOT EXISTS kyc_documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES partner_kyc_applications(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL CHECK (
        doc_type IN (
            'GSTIN_CERTIFICATE', 'PAN_CARD', 'SIGNBOARD_PHOTO', 'BRAND_DEALERSHIP',
            'AADHAAR_FRONT_BACK', 'DRIVING_LICENCE', 'VEHICLE_RC', 'INSURANCE_PUC',
            'SELFIE_LIVENESS', 'TIRPAL_WATERPROOF', 'CANCELLED_CHEQUE'
        )
    ),
    doc_name VARCHAR(120) NOT NULL,
    doc_url TEXT NOT NULL,
    extracted_number VARCHAR(100),
    extracted_name VARCHAR(120),
    extracted_expiry TIMESTAMPTZ,
    ocr_authenticity_score INT NOT NULL DEFAULT 96,
    ocr_read_quality VARCHAR(30) NOT NULL DEFAULT 'HIGH',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REUPLOAD_REQUIRED', 'REJECTED')),
    rejection_reason TEXT,
    reviewed_by VARCHAR(80),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Immutable KYC Compliance Audit Logs
CREATE TABLE IF NOT EXISTS kyc_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES partner_kyc_applications(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    actor VARCHAR(80) NOT NULL DEFAULT 'SYSTEM',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_apps_status ON partner_kyc_applications(status, applicant_type);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_app ON kyc_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_status ON kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_logs_app ON kyc_audit_logs(application_id);

-- 16. Vendor Hub Inventory & Custom Visual Catalog (16-Category Unified Sync)
CREATE TABLE IF NOT EXISTS vendor_hub_products (
    id VARCHAR(80) PRIMARY KEY,
    hub_id VARCHAR(60) NOT NULL,
    category_slug VARCHAR(80) NOT NULL,
    sku_code VARCHAR(60) NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL DEFAULT 'Conon Certified',
    unit VARCHAR(40) NOT NULL DEFAULT 'Unit',
    dealer_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT NOT NULL,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    stock_qty INT NOT NULL DEFAULT 50,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_products_hub_cat ON vendor_hub_products(hub_id, category_slug);
CREATE INDEX IF NOT EXISTS idx_hub_products_stock ON vendor_hub_products(hub_id, is_in_stock);

-- 12. Customer Delivery Feedback & Visual Construction X-Ray
CREATE TABLE IF NOT EXISTS customer_delivery_feedback (
    id SERIAL PRIMARY KEY,
    feedback_id VARCHAR(60) NOT NULL UNIQUE DEFAULT ('fb-cust-' || gen_random_uuid()),
    order_id VARCHAR(60) NOT NULL,
    customer_id VARCHAR(120),
    driver_id VARCHAR(60),
    hub_id VARCHAR(60),
    rating INT NOT NULL DEFAULT 5,
    material_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    driver_badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    voice_transcript TEXT,
    sentiment VARCHAR(20) NOT NULL DEFAULT 'Positive',
    damage_claim_status VARCHAR(30) NOT NULL DEFAULT 'NONE', -- 'NONE', 'PENDING_APPROVAL', 'APPROVED_REFUND', 'APPROVED_REPLACEMENT'
    damage_claim_type VARCHAR(30), -- 'INSTANT_VAULT_REFUND', 'FREE_REPLACEMENT'
    damage_claim_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    damage_photo_url TEXT,
    affected_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cust_fb_order ON customer_delivery_feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_cust_fb_driver ON customer_delivery_feedback(driver_id);
CREATE INDEX IF NOT EXISTS idx_cust_fb_claim ON customer_delivery_feedback(damage_claim_status);

-- 13. Driver Site DNA & Road Intelligence Feedback
CREATE TABLE IF NOT EXISTS driver_site_feedback (
    id SERIAL PRIMARY KEY,
    feedback_id VARCHAR(60) NOT NULL UNIQUE DEFAULT ('fb-site-' || gen_random_uuid()),
    order_id VARCHAR(60) NOT NULL,
    driver_id VARCHAR(60) NOT NULL,
    site_address_key VARCHAR(160) NOT NULL,
    road_access_tag VARCHAR(80) NOT NULL,
    unloading_tag VARCHAR(80) NOT NULL,
    behaviour_tag VARCHAR(80) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drv_site_key ON driver_site_feedback(site_address_key);
CREATE INDEX IF NOT EXISTS idx_drv_site_driver ON driver_site_feedback(driver_id);

-- 14. Aggregated Lucknow Site DNA Intelligence Profiles
CREATE TABLE IF NOT EXISTS site_dna_profiles (
    site_address_key VARCHAR(160) PRIMARY KEY,
    zone VARCHAR(100) NOT NULL DEFAULT 'Lucknow Core',
    recommended_vehicle VARCHAR(40) NOT NULL DEFAULT 'Loader 1.5T',
    road_summary TEXT NOT NULL DEFAULT 'Wide Road',
    labour_readiness_pct INT NOT NULL DEFAULT 95,
    avg_site_rating NUMERIC(3, 2) NOT NULL DEFAULT 4.90,
    total_reports INT NOT NULL DEFAULT 1,
    recent_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Admin Master Catalog Categories
CREATE TABLE IF NOT EXISTS catalog_categories (
    id VARCHAR(60) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    name_hi VARCHAR(120),
    slug VARCHAR(120) NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    default_gst_rate INT NOT NULL DEFAULT 18,
    vehicle_type VARCHAR(40) NOT NULL DEFAULT 'LOADER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cat_slug ON catalog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_cat_active ON catalog_categories(is_active);

-- 16. Admin Master Products (Master CMS with HSN, GST, Specs & Lock)
CREATE TABLE IF NOT EXISTS master_products (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(240) NOT NULL,
    brand VARCHAR(120) NOT NULL,
    category_slug VARCHAR(120) NOT NULL,
    subcategory VARCHAR(120),
    unit VARCHAR(40) NOT NULL DEFAULT 'Unit',
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    bulk_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    bulk_min_qty INT NOT NULL DEFAULT 10,
    hsn_code VARCHAR(20) NOT NULL DEFAULT '25232910',
    gst_rate INT NOT NULL DEFAULT 18,
    vehicle_requirement VARCHAR(40) NOT NULL DEFAULT 'LOADER',
    image_url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    spec_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    admin_locked BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_cat ON master_products(category_slug);
CREATE INDEX IF NOT EXISTS idx_prod_hsn ON master_products(hsn_code);
CREATE INDEX IF NOT EXISTS idx_prod_locked ON master_products(admin_locked);

-- 17. Master Skilled Services Catalog (SAC 9954)
CREATE TABLE IF NOT EXISTS service_catalog_items (
    id VARCHAR(80) PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    trade_name VARCHAR(160) NOT NULL,
    trade_name_hi VARCHAR(160),
    category VARCHAR(40) NOT NULL CHECK (category IN ('CIVIL', 'MEP', 'FINISHING', 'AUDIT')),
    sac_code VARCHAR(20) NOT NULL DEFAULT '9954',
    shift_rate NUMERIC(10, 2) NOT NULL,
    shift_hours INT NOT NULL DEFAULT 8,
    unit VARCHAR(40) NOT NULL DEFAULT 'Shift (8 Hrs)',
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Master Machine Rental Catalog (SAC 9973)
CREATE TABLE IF NOT EXISTS machine_rental_catalog (
    id VARCHAR(80) PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    machine_name VARCHAR(160) NOT NULL,
    model_name VARCHAR(160) NOT NULL,
    category VARCHAR(40) NOT NULL CHECK (category IN ('EARTHMOVING', 'CONCRETE', 'TRANSPORT', 'TOOLS')),
    sac_code VARCHAR(20) NOT NULL DEFAULT '9973',
    wet_hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    dry_hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    wet_shift_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    dry_shift_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    wet_weekly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    dry_weekly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    mobilization_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    needs_operator BOOLEAN NOT NULL DEFAULT true,
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Vendor Fleet & Crew Listings (Organic Partners Only - Zero Dummy Seeds)
CREATE TABLE IF NOT EXISTS vendor_fleet_listings (
    id VARCHAR(80) PRIMARY KEY,
    vendor_hub_id VARCHAR(80) NOT NULL,
    vendor_name VARCHAR(160) NOT NULL,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('SERVICE', 'RENTAL')),
    master_item_id VARCHAR(80) NOT NULL,
    custom_title VARCHAR(200),
    hourly_wet_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shift_wet_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    weekly_wet_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    hourly_dry_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shift_dry_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    weekly_dry_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    rc_or_fitness_expiry DATE,
    custom_photo_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Skilled Service Bookings (Escrow, Start/End OTP, GPS Selfie Haziri - Zero Dummy Seeds)
CREATE TABLE IF NOT EXISTS service_bookings (
    id VARCHAR(80) PRIMARY KEY,
    short_id VARCHAR(40) NOT NULL UNIQUE,
    customer_id VARCHAR(120),
    customer_name VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_gstin VARCHAR(30),
    site_address TEXT NOT NULL,
    lucknow_zone VARCHAR(100) NOT NULL DEFAULT 'Lucknow Core',
    booking_date VARCHAR(30) NOT NULL,
    shift_slot VARCHAR(80) NOT NULL DEFAULT 'Morning 8:30 AM - 5:00 PM',
    squad_items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    addon_items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sac_code VARCHAR(20) NOT NULL DEFAULT '9954',
    payment_mode VARCHAR(30) NOT NULL DEFAULT 'LIVING_VAULT',
    start_otp VARCHAR(8) NOT NULL,
    end_otp VARCHAR(8) NOT NULL,
    selfie_haziri_url TEXT,
    haziri_gps_verified BOOLEAN NOT NULL DEFAULT false,
    work_done_photo_url TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'BOOKED',
    assigned_vendor_id VARCHAR(80),
    assigned_vendor_name VARCHAR(160),
    escrow_status VARCHAR(30) NOT NULL DEFAULT 'LOCKED' CHECK (escrow_status IN ('LOCKED', 'AWAITING_RELEASE', 'SETTLED')),
    settled_utr VARCHAR(80),
    partner_payout NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    platform_margin NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 21. Machine Rental Bookings (Digital HMR Optical Lock & Breakdown Pause - Zero Dummy Seeds)
CREATE TABLE IF NOT EXISTS machine_rental_bookings (
    id VARCHAR(80) PRIMARY KEY,
    short_id VARCHAR(40) NOT NULL UNIQUE,
    customer_id VARCHAR(120),
    customer_name VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_gstin VARCHAR(30),
    site_address TEXT NOT NULL,
    lucknow_zone VARCHAR(100) NOT NULL DEFAULT 'Lucknow Core',
    machine_id VARCHAR(80) NOT NULL,
    machine_name VARCHAR(160) NOT NULL,
    model_name VARCHAR(160) NOT NULL,
    fuel_mode VARCHAR(16) NOT NULL CHECK (fuel_mode IN ('WET', 'DRY')),
    billing_unit VARCHAR(16) NOT NULL CHECK (billing_unit IN ('HOUR', 'SHIFT', 'WEEK')),
    quantity_units INT NOT NULL DEFAULT 1,
    rate_per_unit NUMERIC(10, 2) NOT NULL,
    mobilization_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_bill_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    taxable_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sac_code VARCHAR(20) NOT NULL DEFAULT '9973',
    payment_mode VARCHAR(30) NOT NULL DEFAULT 'LIVING_VAULT',
    start_otp VARCHAR(8) NOT NULL,
    end_otp VARCHAR(8) NOT NULL,
    start_hmr NUMERIC(10, 2),
    end_hmr NUMERIC(10, 2),
    start_hmr_photo TEXT,
    end_hmr_photo TEXT,
    is_breakdown_paused BOOLEAN NOT NULL DEFAULT false,
    breakdown_paused_mins INT NOT NULL DEFAULT 0,
    breakdown_reason TEXT,
    pause_started_at TIMESTAMPTZ,
    status VARCHAR(40) NOT NULL DEFAULT 'BOOKED',
    assigned_vendor_id VARCHAR(80),
    assigned_vendor_name VARCHAR(160),
    assigned_operator_id VARCHAR(80),
    assigned_operator_name VARCHAR(160),
    escrow_status VARCHAR(30) NOT NULL DEFAULT 'LOCKED' CHECK (escrow_status IN ('LOCKED', 'AWAITING_RELEASE', 'SETTLED')),
    settled_utr VARCHAR(80),
    partner_payout NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    platform_margin NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_srv_bookings_status ON service_bookings(status, escrow_status);
CREATE INDEX IF NOT EXISTS idx_rent_bookings_status ON machine_rental_bookings(status, escrow_status);
CREATE INDEX IF NOT EXISTS idx_vendor_fleet_vendor ON vendor_fleet_listings(vendor_hub_id, is_available);

-- 22. Admin Master Media & Product Vault (Multi-Image Gallery + Descriptions + Pricing Overrides)
CREATE TABLE IF NOT EXISTS product_media_overrides (
    product_id TEXT PRIMARY KEY,
    category_slug TEXT,
    title TEXT,
    brand TEXT,
    subcategory TEXT,
    description TEXT,
    spec_bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    price NUMERIC,
    mrp NUMERIC,
    bulk_price NUMERIC,
    bulk_min_qty NUMERIC,
    hsn_code TEXT,
    gst_rate NUMERIC,
    unit TEXT,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    is_admin_verified_media BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_vault_cat ON product_media_overrides(category_slug);
CREATE INDEX IF NOT EXISTS idx_media_vault_verified ON product_media_overrides(is_admin_verified_media);

-- 23. CONON Treasury & Live Money X-Ray (Zero-Dummy Clean Slate)
CREATE TABLE IF NOT EXISTS company_bank_accounts (
    id VARCHAR(80) PRIMARY KEY,
    label VARCHAR(160) NOT NULL,
    role VARCHAR(40) NOT NULL CHECK (role IN ('COLLECTION', 'ESCROW_NODAL', 'PAYOUT', 'TAX_RESERVE')),
    bank_name VARCHAR(120) NOT NULL,
    account_holder VARCHAR(160) NOT NULL DEFAULT 'CONON INFRABUILT PVT LTD',
    account_number_masked VARCHAR(40) NOT NULL,
    account_number_last4 VARCHAR(8) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    upi_vpa VARCHAR(120),
    gateway_provider VARCHAR(40) NOT NULL DEFAULT 'MANUAL_BANK_UTR' CHECK (gateway_provider IN ('RAZORPAY_ROUTE_API', 'CASHFREE_EASY_SPLIT', 'MANUAL_BANK_UTR')),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_ledger_entries (
    id VARCHAR(80) PRIMARY KEY,
    order_id VARCHAR(80) NOT NULL,
    entry_type VARCHAR(40) NOT NULL CHECK (entry_type IN ('CUSTOMER_INFLOW', 'VAULT_TOPUP', 'VENDOR_PAYOUT', 'DRIVER_PAYOUT', 'CUSTOMER_REFUND', 'TAX_RESERVE')),
    direction VARCHAR(16) NOT NULL CHECK (direction IN ('CREDIT', 'DEBIT')),
    from_account_label VARCHAR(160) NOT NULL,
    from_account_ref VARCHAR(120) NOT NULL,
    to_account_label VARCHAR(160) NOT NULL,
    to_account_ref VARCHAR(120) NOT NULL,
    to_ifsc VARCHAR(20),
    beneficiary_name VARCHAR(160) NOT NULL,
    payment_mode VARCHAR(40) NOT NULL,
    utr_number VARCHAR(80) NOT NULL,
    gateway_ref_id VARCHAR(120),
    gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    platform_margin NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'SETTLED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treasury_ledger_order ON treasury_ledger_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_treasury_ledger_utr ON treasury_ledger_entries(utr_number);
CREATE INDEX IF NOT EXISTS idx_treasury_ledger_type ON treasury_ledger_entries(entry_type, direction);




