-- CONON-NOW Hybrid Transactional PostgreSQL Schema (Source of Truth for Users, Hubs, Inventory, Orders, Ledger)

DO $$ BEGIN
  CREATE TYPE conon_user_role AS ENUM (
    'customer',
    'vendor',
    'driver',
    'super_admin',
    'dispatch_manager',
    'accounts_control'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE conon_order_type AS ENUM ('buy', 'rent', 'kit', 'bulk');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE conon_order_status AS ENUM (
    'PLACED',
    'VENDOR_ACCEPTED',
    'PACKED_READY',
    'DRIVER_ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE conon_beneficiary_type AS ENUM ('vendor', 'driver');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE conon_settlement_status AS ENUM ('ESCROW_PENDING', 'APPROVED', 'SETTLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  phone VARCHAR(24) NOT NULL UNIQUE,
  email VARCHAR(160) UNIQUE,
  role conon_user_role NOT NULL DEFAULT 'customer',
  pin_hash TEXT,
  khata_credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  khata_used NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lucknow_hubs (
  id BIGSERIAL PRIMARY KEY,
  hub_code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  locality_zone VARCHAR(180) NOT NULL,
  vendor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  allowed_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  commission_pct NUMERIC(5, 2) NOT NULL DEFAULT 8.00,
  sla_label VARCHAR(80) NOT NULL DEFAULT '60 Mins Express',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hub_inventory (
  id BIGSERIAL PRIMARY KEY,
  hub_id BIGINT NOT NULL REFERENCES lucknow_hubs(id) ON DELETE CASCADE,
  sku_code VARCHAR(120) NOT NULL,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  mrp NUMERIC(12, 2) NOT NULL DEFAULT 0,
  contractor_pack_price NUMERIC(12, 2),
  rent_price_per_day NUMERIC(12, 2),
  stock_qty INTEGER NOT NULL DEFAULT 100,
  is_in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hub_inventory_hub_sku UNIQUE (hub_id, sku_code)
);

CREATE INDEX IF NOT EXISTS idx_hub_inventory_sku_code ON hub_inventory (sku_code);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL UNIQUE,
  customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  hub_id BIGINT REFERENCES lucknow_hubs(id) ON DELETE SET NULL,
  driver_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  order_type conon_order_type NOT NULL DEFAULT 'buy',
  status conon_order_status NOT NULL DEFAULT 'PLACED',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  bulk_discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_mode VARCHAR(48) NOT NULL DEFAULT 'UPI_ESCROW',
  pickup_otp VARCHAR(8) NOT NULL,
  delivery_otp VARCHAR(8) NOT NULL,
  sla_deadline_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku_code VARCHAR(120) NOT NULL,
  title_snapshot VARCHAR(240) NOT NULL,
  variant_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  qty NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku_code ON order_items (sku_code);

CREATE TABLE IF NOT EXISTS payout_ledger (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  beneficiary_type conon_beneficiary_type NOT NULL,
  beneficiary_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  commission_deducted NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_payable NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cod_collected NUMERIC(12, 2) NOT NULL DEFAULT 0,
  settlement_status conon_settlement_status NOT NULL DEFAULT 'ESCROW_PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_ledger_order_id ON payout_ledger (order_id);
