-- Upgrade promo_codes:
-- - allow 5% tier
-- - track usage metadata (used_at, used_order_id)

ALTER TABLE promo_codes
  DROP CONSTRAINT IF EXISTS promo_codes_discount_percent_check;

ALTER TABLE promo_codes
  ADD CONSTRAINT promo_codes_discount_percent_check
  CHECK (discount_percent IN (5, 10, 15, 50));

ALTER TABLE promo_codes
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS used_order_id UUID NULL;

-- Optional: link promo code usage to order
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    ALTER TABLE promo_codes
      ADD CONSTRAINT promo_codes_used_order_id_fkey
      FOREIGN KEY (used_order_id) REFERENCES orders(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- constraint already exists
    NULL;
END$$;

CREATE INDEX IF NOT EXISTS idx_promo_codes_used_order_id ON promo_codes(used_order_id);
