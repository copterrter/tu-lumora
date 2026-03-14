-- โควต้านับจาก "การถูกใช้" เท่านั้น — สุ่มได้โค้ดไม่จำกัด แต่ใช้ได้แค่โควต้า (50%=2, 15%=20, 10%=50)
-- RPC เปลี่ยนเป็นแค่สร้างโค้ด (ไม่เช็คโควต้า); โควต้าเช็คตอน validate/verify ว่า used count < quota
CREATE OR REPLACE FUNCTION claim_booth_promo_code(p_tier int)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefix text;
  v_code_name text;
  v_suffix text;
  v_i int;
  v_r int;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
BEGIN
  IF p_tier NOT IN (10, 15, 50) THEN RETURN null; END IF;
  v_prefix := CASE p_tier WHEN 50 THEN 'LUMO50' WHEN 15 THEN 'LUMO15' WHEN 10 THEN 'LUMO10' ELSE null END;
  IF v_prefix IS NULL THEN RETURN null; END IF;

  FOR v_i IN 1..10 LOOP
    BEGIN
      v_suffix := '';
      FOR v_r IN 1..5 LOOP
        v_suffix := v_suffix || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
      END LOOP;
      v_code_name := v_prefix || '-' || v_suffix;
      INSERT INTO promo_codes (code_name, discount_percent, is_used) VALUES (v_code_name, p_tier, false);
      RETURN v_code_name;
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;
  END LOOP;
  RETURN null;
END;
$$;

COMMENT ON FUNCTION claim_booth_promo_code(int) IS 'Create one promo code for tier (10/15/50). No quota check here; quota is enforced when code is USED (validate/verify).';
