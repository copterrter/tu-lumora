import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ต้อง sync กับ QUOTA ใน /api/booth/spin
const QUOTA: Record<number, number> = { 50: 3, 15: 20, 10: 50, 5: 80 };
const NORMAL_EVENT_START = new Date('2026-03-15T00:00:00+07:00').toISOString();

export async function GET() {
  try {
    const usedCounts: Record<number, number> = { 50: 0, 15: 0, 10: 0, 5: 0 };
    const issuedCounts: Record<number, number> = { 50: 0, 15: 0, 10: 0, 5: 0 };
    const availableCounts: Record<number, number> = { 50: 0, 15: 0, 10: 0, 5: 0 };
    for (const tier of [50, 15, 10, 5]) {
      const { count: issued } = await supabase
        .from("promo_codes")
        .select("id", { count: "exact", head: true })
        .eq("discount_percent", tier)
        .gte("created_at", NORMAL_EVENT_START);
      issuedCounts[tier] = issued ?? 0;

      const { count } = await supabase
        .from("promo_codes")
        .select("id", { count: "exact", head: true })
        .eq("discount_percent", tier)
        .eq("is_used", true)
        .gte("created_at", NORMAL_EVENT_START);
      usedCounts[tier] = count ?? 0;

      const { count: available } = await supabase
        .from("promo_codes")
        .select("id", { count: "exact", head: true })
        .eq("discount_percent", tier)
        .eq("is_used", false)
        .gte("created_at", NORMAL_EVENT_START);
      availableCounts[tier] = available ?? 0;
    }

    const remaining: Record<number, number> = {};
    for (const tier of [50, 15, 10, 5]) {
      // เหลือโควต้า "ที่ยังใช้ได้อีก" (คุมตาม used จริง)
      remaining[tier] = Math.max(0, (QUOTA[tier] ?? 0) - (usedCounts[tier] ?? 0));
    }

    return NextResponse.json({
      success: true,
      quota: QUOTA,
      issued: issuedCounts,
      used: usedCounts,
      available: availableCounts,
      remaining,
    });
  } catch (err: unknown) {
    console.error("Quota status error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

