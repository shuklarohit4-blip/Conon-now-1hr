-- ============================================================================
-- CONON-NOW LIVING MATERIAL VAULT ENGINE (PostgreSQL DDL Migration)
-- Multi-Tier Construction Fintech Architecture
-- Incorporating Supabase / Postgres High-Performance & Security Best Practices
-- ============================================================================

-- Ensure pgcrypto or uuid-ossp for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Main User Vault (Fast Read Cache + Row Locking Support)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conon_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    cash_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cash_balance >= 0),
    gold_bonus_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (gold_bonus_balance >= 0),
    sos_credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sos_credit_limit >= 0),
    sos_credit_used NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sos_credit_used >= 0),
    sos_due_at TIMESTAMPTZ,
    site_trust_score INT NOT NULL DEFAULT 50 CHECK (site_trust_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_sos_credit_limit CHECK (sos_credit_used <= sos_credit_limit)
);

-- Index on user_id for instant session wallet hydration
CREATE INDEX IF NOT EXISTS idx_wallets_user ON conon_wallets(user_id);

-- Auto-bump updated_at trigger
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conon_wallets_timestamp ON conon_wallets;
CREATE TRIGGER trg_conon_wallets_timestamp
BEFORE UPDATE ON conon_wallets
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();


-- ----------------------------------------------------------------------------
-- 2. Immutable Fintech Ledger (Har 1 rupaye ka pakka hisab)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallet_ledger (
    tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE RESTRICT,
    idempotency_key VARCHAR(120) NOT NULL UNIQUE, -- Razorpay / Retry duplicate guard
    tx_type VARCHAR(30) NOT NULL CHECK (
        tx_type IN (
            'DEPOSIT',
            'ORDER_SPEND',
            'RATE_LOCK_DEBIT',
            'SOS_DRAW',
            'SOS_REPAY',
            'BILL_XRAY_REWARD',
            'BUYBACK_CREDIT',
            'CRANE_DROP',
            'REFERRAL',
            'SPONSOR_BONUS'
        )
    ),
    amount NUMERIC(12, 2) NOT NULL, -- Positive for credit (+), Negative for debit (-)
    balance_after NUMERIC(12, 2) NOT NULL,
    reference_id VARCHAR(100), -- Order ID, Razorpay Payment ID, Lock ID
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reverse chronological ledger index with wallet_id partition support
CREATE INDEX IF NOT EXISTS idx_ledger_wallet_date ON wallet_ledger(wallet_id, created_at DESC);
-- Index on reference_id for rapid reconciliation
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON wallet_ledger(reference_id) WHERE reference_id IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 3. Material-Backed Rate Lock Units (Cement / Bricks / TMT / AAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_rate_locks (
    lock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE RESTRICT,
    partner_vendor_id UUID, -- Soft-hedged local dealer (e.g. Katawala / Awadh Hub)
    sku_code VARCHAR(50) NOT NULL, -- e.g., 'OPC53_CEMENT', 'AVVAL_BRICK', 'MAGICRETE_AAC'
    unit_label VARCHAR(20) NOT NULL, -- 'bags', 'pcs', 'cbm', 'tons'
    locked_qty NUMERIC(10, 2) NOT NULL CHECK (locked_qty > 0),
    redeemed_qty NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (redeemed_qty >= 0),
    locked_unit_price NUMERIC(10, 2) NOT NULL CHECK (locked_unit_price > 0),
    expires_at TIMESTAMPTZ NOT NULL, -- 15, 30, or 60 days validity
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'PARTIAL', 'REDEEMED', 'EXPIRED_REFUNDED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_redeemed_not_exceed_locked CHECK (redeemed_qty <= locked_qty)
);

-- Partial index for active locks (super fast checkout & live dashboard hydration)
CREATE INDEX IF NOT EXISTS idx_locks_active ON material_rate_locks(wallet_id, status) WHERE status = 'ACTIVE';
-- Foreign key index for cascade & full history queries
CREATE INDEX IF NOT EXISTS idx_locks_wallet_created ON material_rate_locks(wallet_id, created_at DESC);
-- Index on SKU code for mandi rate hedging & inventory hedging
CREATE INDEX IF NOT EXISTS idx_locks_sku_status ON material_rate_locks(sku_code, status);


-- ----------------------------------------------------------------------------
-- 4. Mistri / Contractor Zero-Leakage Pass
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mistri_passes (
    pass_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE CASCADE,
    site_name VARCHAR(100) NOT NULL,
    contractor_name VARCHAR(100) NOT NULL,
    contractor_phone VARCHAR(15) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL, -- 4-digit PIN bcrypt / argon2 hash
    daily_limit NUMERIC(10, 2) NOT NULL CHECK (daily_limit > 0),
    spent_today NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (spent_today >= 0),
    allowed_categories TEXT[] NOT NULL, -- e.g. ARRAY['PLUMBING', 'ADHESIVES', 'FASTENERS']
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_spent_today_limit CHECK (spent_today <= daily_limit)
);

-- Foreign key index on owner wallet
CREATE INDEX IF NOT EXISTS idx_mistri_passes_wallet ON mistri_passes(owner_wallet_id, is_active);
-- Phone lookup for instant WhatsApp / SMS authorization handshake
CREATE INDEX IF NOT EXISTS idx_mistri_phone ON mistri_passes(contractor_phone);


-- ----------------------------------------------------------------------------
-- 5. Leftover Material Reverse Buyback
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyback_requests (
    buyback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES conon_wallets(wallet_id) ON DELETE RESTRICT,
    sku_code VARCHAR(50) NOT NULL,
    qty NUMERIC(10, 2) NOT NULL CHECK (qty > 0),
    photo_url TEXT NOT NULL,
    site_lat NUMERIC(9, 6),
    site_lng NUMERIC(9, 6),
    estimated_gold_credit NUMERIC(10, 2) NOT NULL CHECK (estimated_gold_credit >= 0),
    status VARCHAR(25) NOT NULL DEFAULT 'PICKUP_SCHEDULED' CHECK (
        status IN ('PICKUP_SCHEDULED', 'VERIFIED_CREDITED', 'REJECTED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key index on wallet_id
CREATE INDEX IF NOT EXISTS idx_buyback_wallet ON buyback_requests(wallet_id, created_at DESC);
-- Partial index for active pickup dispatch driver routing
CREATE INDEX IF NOT EXISTS idx_buyback_scheduled ON buyback_requests(status) WHERE status = 'PICKUP_SCHEDULED';


-- ============================================================================
-- HIGH-CONCURRENCY FINTECH TRANSACTION PROCEDURES (ACID Row-Locking)
-- ============================================================================

-- Procedure: Lock Material Units (Atomic Cash Debit -> Rate Lock -> Ledger Entry)
CREATE OR REPLACE FUNCTION fn_lock_material_units(
    p_wallet_id UUID,
    p_sku_code VARCHAR,
    p_unit_label VARCHAR,
    p_qty NUMERIC,
    p_unit_price NUMERIC,
    p_validity_days INT,
    p_idempotency_key VARCHAR,
    p_partner_vendor_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    new_cash_balance NUMERIC,
    lock_id UUID,
    message TEXT
) AS $$
DECLARE
    v_total_cost NUMERIC(12, 2);
    v_current_cash NUMERIC(12, 2);
    v_new_cash NUMERIC(12, 2);
    v_lock_id UUID;
BEGIN
    v_total_cost := ROUND(p_qty * p_unit_price, 2);

    -- 1. Row-lock wallet using FOR NO KEY UPDATE to prevent concurrent balance overdrafts
    SELECT cash_balance INTO v_current_cash
    FROM conon_wallets
    WHERE wallet_id = p_wallet_id
    FOR NO KEY UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0.00, NULL::UUID, 'Wallet not found'::TEXT;
        RETURN;
    END IF;

    IF v_current_cash < v_total_cost THEN
        RETURN QUERY SELECT FALSE, v_current_cash, NULL::UUID, 'Insufficient liquid cash balance'::TEXT;
        RETURN;
    END IF;

    -- 2. Deduct Cash Balance
    v_new_cash := v_current_cash - v_total_cost;
    UPDATE conon_wallets
    SET cash_balance = v_new_cash
    WHERE wallet_id = p_wallet_id;

    -- 3. Create Rate Lock Record
    INSERT INTO material_rate_locks (
        wallet_id,
        partner_vendor_id,
        sku_code,
        unit_label,
        locked_qty,
        redeemed_qty,
        locked_unit_price,
        expires_at,
        status
    ) VALUES (
        p_wallet_id,
        p_partner_vendor_id,
        p_sku_code,
        p_unit_label,
        p_qty,
        0.00,
        p_unit_price,
        NOW() + (p_validity_days || ' days')::INTERVAL,
        'ACTIVE'
    ) RETURNING material_rate_locks.lock_id INTO v_lock_id;

    -- 4. Record Immutable Ledger Entry
    INSERT INTO wallet_ledger (
        wallet_id,
        idempotency_key,
        tx_type,
        amount,
        balance_after,
        reference_id,
        metadata
    ) VALUES (
        p_wallet_id,
        p_idempotency_key,
        'RATE_LOCK_DEBIT',
        -v_total_cost,
        v_new_cash,
        v_lock_id::VARCHAR,
        jsonb_build_object(
            'sku_code', p_sku_code,
            'qty', p_qty,
            'unit_price', p_unit_price,
            'expires_at', NOW() + (p_validity_days || ' days')::INTERVAL
        )
    );

    RETURN QUERY SELECT TRUE, v_new_cash, v_lock_id, 'Rate lock created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;


-- Procedure: Draw SOS Bridge Credit (Instant 48-Hour Zero-Interest Shield)
CREATE OR REPLACE FUNCTION fn_draw_sos_credit(
    p_wallet_id UUID,
    p_amount NUMERIC,
    p_idempotency_key VARCHAR
)
RETURNS TABLE (
    success BOOLEAN,
    new_credit_used NUMERIC,
    sos_due_at TIMESTAMPTZ,
    message TEXT
) AS $$
DECLARE
    v_limit NUMERIC(12, 2);
    v_used NUMERIC(12, 2);
    v_score INT;
    v_new_used NUMERIC(12, 2);
    v_due TIMESTAMPTZ;
BEGIN
    SELECT sos_credit_limit, sos_credit_used, site_trust_score
    INTO v_limit, v_used, v_score
    FROM conon_wallets
    WHERE wallet_id = p_wallet_id
    FOR NO KEY UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0.00, NULL::TIMESTAMPTZ, 'Wallet not found'::TEXT;
        RETURN;
    END IF;

    IF v_score < 70 THEN
        RETURN QUERY SELECT FALSE, v_used, NULL::TIMESTAMPTZ, 'Site Trust Score below 70 threshold for SOS credit'::TEXT;
        RETURN;
    END IF;

    IF (v_used + p_amount) > v_limit THEN
        RETURN QUERY SELECT FALSE, v_used, NULL::TIMESTAMPTZ, 'Requested amount exceeds available SOS credit limit'::TEXT;
        RETURN;
    END IF;

    v_new_used := v_used + p_amount;
    v_due := NOW() + INTERVAL '48 hours';

    UPDATE conon_wallets
    SET sos_credit_used = v_new_used,
        sos_due_at = v_due
    WHERE wallet_id = p_wallet_id;

    INSERT INTO wallet_ledger (
        wallet_id,
        idempotency_key,
        tx_type,
        amount,
        balance_after,
        metadata
    ) VALUES (
        p_wallet_id,
        p_idempotency_key,
        'SOS_DRAW',
        p_amount,
        v_new_used,
        jsonb_build_object('due_at', v_due, 'hours', 48, 'interest', 0.0)
    );

    RETURN QUERY SELECT TRUE, v_new_used, v_due, 'SOS credit drawn successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;
