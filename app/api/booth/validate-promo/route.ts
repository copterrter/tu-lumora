import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentPhase } from '@/lib/pricing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// โควต้าถูกคุมตอน "ออกโค้ด" แล้ว จึงไม่ต้อง re-check ที่ validate
const NORMAL_EVENT_START = new Date('2026-03-15T00:00:00+07:00').toISOString();

export async function POST(request: Request) {
  try {
    const phase = getCurrentPhase();
    if (phase !== 'normal') {
      return NextResponse.json({ success: false, message: 'โค้ดส่วนลดจากบูธใช้ได้เฉพาะช่วง Normal' }, { status: 400 });
    }

    const body = await request.json();
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const quantity = typeof body.quantity === 'number' ? body.quantity : Number(body.quantity) || 0;
    const totalQty = Array.isArray(body.items) ? (body.items as { quantity?: number }[]).reduce((s, i) => s + (i.quantity ?? 0), 0) : quantity;

    if (!code) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกโค้ด' }, { status: 400 });
    }
    if (totalQty !== 1) {
      return NextResponse.json({ success: false, message: 'โค้ดส่วนลดจากบูธใช้ได้เมื่อซื้อ 1 ตัวเท่านั้น' }, { status: 400 });
    }

    const { data: row, error } = await supabase
      .from('promo_codes')
      .select('id, discount_percent, created_at')
      .eq('code_name', code)
      .eq('is_used', false)
      .gte('created_at', NORMAL_EVENT_START)
      .single();

    if (error || !row) {
      return NextResponse.json({ success: false, message: 'โค้ดไม่ถูกต้องหรือถูกใช้ไปแล้ว' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discountPercent: row.discount_percent,
      message: `ใช้โค้ดสำเร็จ ลด ${row.discount_percent}%`,
    });
  } catch (err: unknown) {
    console.error('Validate promo error:', err);
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
