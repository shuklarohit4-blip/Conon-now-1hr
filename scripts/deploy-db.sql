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

-- Seed 7 Key Lucknow Vendor Hubs
INSERT INTO vendor_hubs (hub_id, name, zone, lat, lng, is_online, stock_flags, escrow_balance, settled_balance)
VALUES
    ('hub-naka', 'Naka Market Hub (Shri Balaji Traders)', 'Naka Hindola / Charbagh', 26.836700, 80.916800, true, '{"OPC53_CEMENT": true, "TMT_FE550D": true, "AVVAL_BRICK": false, "AAC_BLOCK": false, "CPVC_PIPES": true}'::jsonb, 12500.00, 84500.00),
    ('hub-aminabad', 'Aminabad Hardware & Pipe Depot', 'Old Lucknow / Aminabad', 26.845200, 80.925400, true, '{"OPC53_CEMENT": false, "TMT_FE550D": false, "AVVAL_BRICK": false, "AAC_BLOCK": false, "CPVC_PIPES": true}'::jsonb, 4200.00, 62100.00),
    ('hub-gomti-nagar', 'Gomti Nagar Express Depot', 'Vibhuti Khand / Gomti Nagar', 26.853200, 80.978900, true, '{"OPC53_CEMENT": true, "TMT_FE550D": true, "AVVAL_BRICK": true, "AAC_BLOCK": true, "CPVC_PIPES": true}'::jsonb, 18900.00, 142000.00),
    ('hub-sushant-golf-city', 'Sushant Golf City Civil Depot', 'Sultanpur Road Corridor', 26.782400, 80.989200, true, '{"OPC53_CEMENT": true, "TMT_FE550D": true, "AVVAL_BRICK": true, "AAC_BLOCK": true, "CPVC_PIPES": false}'::jsonb, 9800.00, 71500.00),
    ('hub-alambagh', 'Alambagh Heavy Yard (Transport Nagar)', 'Kanpur Road Corridor', 26.791200, 80.892300, true, '{"OPC53_CEMENT": true, "TMT_FE550D": true, "AVVAL_BRICK": true, "AAC_BLOCK": true, "CPVC_PIPES": true}'::jsonb, 24000.00, 198000.00),
    ('hub-chinhat', 'Chinhat Industrial Brick & Sand Depot', 'Faizabad Road Industrial', 26.882100, 81.018900, true, '{"OPC53_CEMENT": true, "TMT_FE550D": false, "AVVAL_BRICK": true, "AAC_BLOCK": true, "CPVC_PIPES": false}'::jsonb, 15300.00, 114000.00),
    ('hub-shaheed-path', 'Shaheed Path Outer Depot', 'Outer Ring Road / Omaxe City', 26.812300, 80.998700, true, '{"OPC53_CEMENT": true, "TMT_FE550D": true, "AVVAL_BRICK": true, "AAC_BLOCK": false, "CPVC_PIPES": true}'::jsonb, 7600.00, 52300.00)
ON CONFLICT (hub_id) DO UPDATE SET
    name = EXCLUDED.name,
    zone = EXCLUDED.zone,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    is_online = EXCLUDED.is_online,
    stock_flags = EXCLUDED.stock_flags,
    updated_at = NOW();

-- Seed Lucknow Drivers
INSERT INTO drivers (driver_id, name, phone, vehicle_type, max_payload_kg, is_online, current_lat, current_lng, today_earnings, palledari_bonus)
VALUES
    ('DRV-LKO-CH-01', 'Ramesh Yadav', '+91 94150 88219', 'CHHOTA_HATHI', 1500.00, true, 26.842100, 80.931200, 1450.00, 360.00),
    ('DRV-LKO-BK-02', 'Suraj Rawat', '+91 98390 12044', 'BIKE_EXPRESS', 30.00, true, 26.851000, 80.975000, 820.00, 120.00),
    ('DRV-LKO-CH-03', 'Mukesh Verma', '+91 91400 44921', 'CHHOTA_HATHI', 1500.00, true, 26.789000, 80.985000, 1850.00, 480.00),
    ('DRV-LKO-BK-04', 'Sonu Prajapati', '+91 93350 77123', 'BIKE_EXPRESS', 30.00, true, 26.834000, 80.912000, 640.00, 0.00)
ON CONFLICT (driver_id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    vehicle_type = EXCLUDED.vehicle_type,
    max_payload_kg = EXCLUDED.max_payload_kg,
    is_online = EXCLUDED.is_online,
    updated_at = NOW();

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

-- Seed Initial Realistic Pending Applications (1 Vendor + 1 Driver)
INSERT INTO partner_kyc_applications (
    id, applicant_type, applicant_id, firm_or_name, owner_or_driver_name, phone, zone,
    loading_bay_access, categories, bank_account, bank_ifsc, bank_upi, penny_drop_status,
    penny_drop_holder_name, penny_drop_ref, ai_authenticity_score, status, sla_signed_at
) VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'VENDOR', 'VND-APP-7712',
    'Awadh Building Solutions & Pipe Depot', 'Anurag Mishra', '+91 94500 11289', 'Sushant Golf City',
    'LOADER_FRIENDLY', '["Cement", "TMT Steel", "CPVC Plumbing", "Paints & Putty"]'::jsonb,
    '50100482190123', 'HDFC0001234', 'awadhbuild@okaxis', 'VERIFIED',
    'ANURAG MISHRA', 'PENNY-HDFC-991204', 98, 'PENDING_VERIFICATION', NOW()
) ON CONFLICT (applicant_id) DO NOTHING;

INSERT INTO kyc_documents (
    application_id, doc_type, doc_name, doc_url, extracted_number, extracted_name, ocr_authenticity_score, ocr_read_quality, status
) VALUES 
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'GSTIN_CERTIFICATE', 'GST Registration Certificate', '/images/kyc/sample-gstin.webp', '09AAECB1289R1Z4', 'AWADH BUILDING SOLUTIONS', 99, 'HIGH', 'PENDING'),
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'PAN_CARD', 'Proprietor PAN Card', '/images/kyc/sample-pan.webp', 'AAECB1289R', 'ANURAG MISHRA', 97, 'HIGH', 'PENDING'),
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'SIGNBOARD_PHOTO', 'GPS Shop Front Signboard', '/images/kyc/sample-shop-front.webp', 'GPS: 26.7824, 80.9892', 'AWADH BUILDING SOLUTIONS', 96, 'HIGH', 'PENDING'),
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'BRAND_DEALERSHIP', 'UltraTech Authorized Dealership Certificate', '/images/kyc/sample-ultratech-dealership.webp', 'AUTH-UT-LKO-2026-88', 'AWADH BUILDING SOLUTIONS', 98, 'HIGH', 'PENDING')
ON CONFLICT DO NOTHING;

INSERT INTO partner_kyc_applications (
    id, applicant_type, applicant_id, firm_or_name, owner_or_driver_name, phone, zone,
    vehicle_mode, vehicle_plate, bank_account, bank_ifsc, bank_upi, penny_drop_status,
    penny_drop_holder_name, penny_drop_ref, ai_authenticity_score, status, insurance_expiry, dl_expiry, puc_expiry, sla_signed_at
) VALUES (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'DRIVER', 'DRV-APP-4401',
    'Mohd. Rizwan Khan (Tata Ace)', 'Mohd. Rizwan Khan', '+91 98394 55102', 'Alambagh / Transport Nagar',
    'CHHOTA_HATHI', 'UP 32 EL 7710', '919839455102', 'PYTM0123456', 'rizwankhan@paytm', 'VERIFIED',
    'MOHD RIZWAN KHAN', 'PENNY-PYTM-881290', 97, 'PENDING_VERIFICATION',
    NOW() + INTERVAL '214 days', NOW() + INTERVAL '1120 days', NOW() + INTERVAL '180 days', NOW()
) ON CONFLICT (applicant_id) DO NOTHING;

INSERT INTO kyc_documents (
    application_id, doc_type, doc_name, doc_url, extracted_number, extracted_name, extracted_expiry, ocr_authenticity_score, ocr_read_quality, status
) VALUES 
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'AADHAAR_FRONT_BACK', 'Aadhaar Card (Masked)', '/images/kyc/sample-aadhaar.webp', 'XXXX-XXXX-4821', 'MOHD RIZWAN KHAN', NULL, 99, 'HIGH', 'PENDING'),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'DRIVING_LICENCE', 'Commercial Driving Licence', '/images/kyc/sample-dl.webp', 'UP32 20180049120', 'MOHD RIZWAN KHAN', NOW() + INTERVAL '1120 days', 98, 'HIGH', 'PENDING'),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'VEHICLE_RC', 'Tata Ace Commercial Yellow Plate RC', '/images/kyc/sample-rc.webp', 'UP 32 EL 7710', 'MOHD RIZWAN KHAN', NULL, 96, 'HIGH', 'PENDING'),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'INSURANCE_PUC', 'Commercial Vehicle Comprehensive Policy', '/images/kyc/sample-insurance.webp', 'POL-HDFC-99120412', 'UP 32 EL 7710', NOW() + INTERVAL '214 days', 97, 'HIGH', 'PENDING'),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'SELFIE_LIVENESS', 'Live Selfie Liveness Scan', '/images/kyc/sample-selfie.webp', 'Face Match 98% with DL', 'MOHD RIZWAN KHAN', NULL, 98, 'HIGH', 'PENDING'),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'TIRPAL_WATERPROOF', 'Heavy Waterproof Tarpaulin on Loader', '/images/kyc/sample-tirpal.webp', 'Heavy Duty PVC Tarpaulin 18x12', 'Verified Ready', NULL, 99, 'HIGH', 'PENDING')
ON CONFLICT DO NOTHING;

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

-- Seed Sample Live Hub Products for Verified Latouche Road Hub (hub-naka)
INSERT INTO vendor_hub_products (
    id, hub_id, category_slug, sku_code, name, brand, unit, dealer_price, mrp, image_url, is_in_stock, stock_qty, is_custom
) VALUES 
    ('vhp-ut-weatherplus', 'hub-naka', 'cement-civil-works', 'UT-WP-50KG', 'UltraTech Weather Plus Cement (50kg)', 'UltraTech', '50kg Bag', 385.00, 440.00, '/images/products/cement/ultratech-weatherplus.webp', true, 250, false),
    ('vhp-tata-tmt-12mm', 'hub-naka', 'cement-civil-works', 'TATA-TMT-12', 'Tata Tiscon 550D TMT Steel 12mm', 'Tata Tiscon', 'Piece (12m)', 710.00, 790.00, '/images/products/steel/tata-tiscon-12mm-tmt-fe500d.webp', true, 180, false),
    ('vhp-astral-cpvc-1in', 'hub-naka', 'cpvc-plumbing-tanks', 'AST-CPVC-1', 'Astral CPVC Pro Pipe 1 Inch SDR 11', 'Astral', '3m Length', 420.00, 510.00, '/images/products/plumbing/astral-cpvc-pro-pipe-1inch.webp', true, 120, false),
    ('vhp-godrej-navtal-7l', 'hub-naka', 'door-hardware-locks', 'GD-NAV-7L', 'Godrej Nav-Tal Brass Padlock 7 Levers', 'Godrej', 'Unit', 540.00, 680.00, '/images/products/hardware/godrej-navtal-brass-padlock.webp', true, 80, false),
    ('vhp-fevicol-sh-5kg', 'hub-naka', 'fevicol-adhesives-sealants', 'FEV-SH-5K', 'Fevicol SH Synthetic Adhesive 5kg', 'Pidilite', '5kg Bucket', 940.00, 1120.00, '/images/products/adhesives/fevicol-sh-synthetic-resin-adhesive.webp', true, 65, false)
ON CONFLICT (id) DO UPDATE SET
    dealer_price = EXCLUDED.dealer_price,
    mrp = EXCLUDED.mrp,
    image_url = EXCLUDED.image_url,
    is_in_stock = EXCLUDED.is_in_stock,
    updated_at = NOW();

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

-- Seed Known Lucknow Corridors Site DNA
INSERT INTO site_dna_profiles (
    site_address_key, zone, recommended_vehicle, road_summary, labour_readiness_pct, avg_site_rating, total_reports, recent_tags
) VALUES
    ('sushant-golf-city', 'Shaheed Path / Sushant Golf City', 'Loader 1.5T', 'Wide Road — Easy direct unloading near crane slab', 98, 4.95, 34, '["Wide Road (Easy Loader)", "Labour Ready ✓", "Respectful & Helpful"]'::jsonb),
    ('aminabad-hardware', 'Old Lucknow / Aminabad', 'Bike Only', 'Narrow Lane — Loader must park 80m back at main chowk', 90, 4.65, 18, '["Narrow Lane (Bike Only)", "Safe Unloading Spot", "Smooth OTP Handover"]'::jsonb),
    ('latouche-road', 'Latouche Road / Charbagh', 'Bike / 3W Only', 'Busy Mandi Corridor — Tight turning radius, morning unload ideal', 92, 4.75, 27, '["Narrow Lane (Bike Only)", "Labour Ready ✓", "Smooth OTP Handover"]'::jsonb),
    ('gomti-nagar-ext', 'Gomti Nagar Extension', 'Loader 1.5T', 'Wide 40ft Sector Road — Clean ramp unloading available', 99, 4.98, 42, '["Wide Road (Easy Loader)", "Labour Ready ✓", "Respectful & Helpful"]'::jsonb),
    ('indira-nagar-c', 'Indira Nagar Sector C', 'Loader 1.5T', 'Standard Residential — Watch overhead low-hanging cables', 94, 4.82, 15, '["Wide Road (Easy Loader)", "Safe Unloading Spot", "Respectful & Helpful"]'::jsonb)
ON CONFLICT (site_address_key) DO UPDATE SET
    road_summary = EXCLUDED.road_summary,
    labour_readiness_pct = EXCLUDED.labour_readiness_pct,
    avg_site_rating = EXCLUDED.avg_site_rating,
    recent_tags = EXCLUDED.recent_tags,
    updated_at = NOW();



