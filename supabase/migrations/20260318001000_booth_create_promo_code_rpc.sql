-- Create promo code inside DB with SECURITY DEFINER.
-- This allows server/anon clients to call RPC without needing service role key,
-- while keeping insert permissions restricted by default.

CREATE OR REPLACE FUNCTION public.create_booth_promo_code(p_tier int)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code text;
  v_try int := 0;
BEGIN
  -- basic guard
  IF p_tier NOT IN (5, 10, 15, 50) THEN
    RAISE EXCEPTION 'Invalid tier: %', p_tier;
  END IF;

  -- retry on unique collisions
  WHILE v_try < 8 LOOP
    -- hex chars only, good enough + uppercase, exclude ambiguous chars not required
    v_code := 'LUMO-' || upper(substring(encode(gen_random_bytes(8), 'hex') from 1 for 8));

    BEGIN
      INSERT INTO public.promo_codes (code_name, discount_percent, is_used)
      VALUES (v_code, p_tier, false);
      RETURN v_code;
    EXCEPTION
      WHEN unique_violation THEN
        v_try := v_try + 1;
    END;
  END LOOP;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.create_booth_promo_code(int)
IS 'Generate and insert one booth promo code for given tier; returns code_name or null on repeated collisions.';

-- Allow anon/authenticated to call it (table can stay locked down)
GRANT EXECUTE ON FUNCTION public.create_booth_promo_code(int) TO anon, authenticated;

