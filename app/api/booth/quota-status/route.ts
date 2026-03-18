import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ต้อง sync กับ QUOTA ใน /api/booth/spin
const QUOTA: Record<number, number> = { 50: 3, 15: 20, 10: 50, 5: 80 };

export async function GET() {
  try {
    const usedCounts: Record<number, number> = { 50: 0, 15: 0, 10: 0, 5: 0 };
    for (const tier of [50, 15, 10, 5]) {
      const { count } = await supabase
        .from("promo_codes")
        .select("id", { count: "exact", head: true })
        .eq("discount_percent", tier)
        .eq("is_used", true);
      usedCounts[tier] = count ?? 0;
    }

    const remaining: Record<number, number> = {};
    for (const tier of [50, 15, 10, 5]) {
      remaining[tier] = Math.max(0, (QUOTA[tier] ?? 0) - (usedCounts[tier] ?? 0));
    }

    return NextResponse.json({
      success: true,
      quota: QUOTA,
      used: usedCounts,
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

