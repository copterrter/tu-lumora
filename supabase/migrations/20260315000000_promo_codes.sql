-- ตารางโค้ดส่วนลดจากบูธ (ใช้ตอน Normal เท่านั้น)
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_name TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent IN (10, 15, 50)),
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code_name ON promo_codes(code_name);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_used ON promo_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_promo_codes_discount_used ON promo_codes(discount_percent, is_used);

COMMENT ON TABLE promo_codes IS 'Booth promo codes (valid only when phase = normal). Use for single-item orders only.';
