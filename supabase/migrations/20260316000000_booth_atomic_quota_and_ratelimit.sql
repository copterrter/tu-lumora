-- Atomic quota: RPC ที่ claim โค้ดใน transaction เดียว (กันโควต้า 50% เกิน 2 ภายใต้ concurrency)
CREATE OR REPLACE FUNCTION claim_booth_promo_code(p_tier int)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_quota int;
  v_count int;
  v_prefix text;
  v_code_name text;
  v_suffix text;
  v_i int;
  v_r int;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
BEGIN
  v_quota := CASE p_tier WHEN 50 THEN 2 WHEN 15 THEN 20 WHEN 10 THEN 50 ELSE 0 END;
  IF v_quota = 0 THEN RETURN null; END IF;
  v_prefix := CASE p_tier WHEN 50 THEN 'LUMO50' WHEN 15 THEN 'LUMO15' WHEN 10 THEN 'LUMO10' ELSE null END;
  IF v_prefix IS NULL THEN RETURN null; END IF;

  -- Lock ต่อ tier เพื่อกันสอง request พร้อมกันเห็น count เท่ากันแล้ว insert พร้อมกัน
  PERFORM pg_advisory_xact_lock(hashtext(('booth_quota_' || p_tier)));

  SELECT count(*)::int INTO v_count FROM promo_codes WHERE discount_percent = p_tier AND is_used = false;
  IF v_count >= v_quota THEN
    RETURN null;
  END IF;

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

COMMENT ON FUNCTION claim_booth_promo_code(int) IS 'Claim one promo code for tier (10/15/50) under quota; returns code_name or null. Call inside phase=normal only.';

-- Rate limit: เก็บว่า IP นี้กด spin ล่าสุดเมื่อไหร่ (ใช้ hash ไม่เก็บ IP จริง)
CREATE TABLE IF NOT EXISTS booth_spin_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booth_spin_log_ip_hash_spun_at ON booth_spin_log(ip_hash, spun_at DESC);

COMMENT ON TABLE booth_spin_log IS 'Rate limit booth spin: one spin per IP per 30s. Cleanup old rows optional.';
