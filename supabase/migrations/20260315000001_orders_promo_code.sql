-- คอลัมน์เก็บโค้ดส่วนลดจากบูธที่ใช้กับออเดอร์ (ใช้ได้แค่ 1 ตัว ตอน Normal)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_used TEXT;

COMMENT ON COLUMN orders.promo_code_used IS 'Booth promo code used (valid only when phase = normal, single item).';
