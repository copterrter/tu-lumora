import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentPhase } from '@/lib/pricing';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const RATE_LIMIT_SEC = 15;

const QUOTA: Record<number, number> = {
  50: 2,
  15: 20,
  10: 50,
  5: 80, // โควต้า 5% เพิ่มเป็นชั้นใหม่
};

// ความน่าจะเป็นฐาน:
// - 50%   ~ 1%
// - 5/10/15% เท่ากัน (แบ่งเท่าๆ กันจาก pool เดียวกัน)
// - ที่เหลือเป็น 0%
const PROBABILITY = [
  { tier: 50 as const, p: 0.01 },
  { tier: 15 as const, p: 0.163 },
  { tier: 10 as const, p: 0.163 },
  { tier: 5 as const, p: 0.163 },
  { tier: 0 as const, p: 0.501 },
];

function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').substring(0, 32);
}

/** สุ่ม tier จากรายการที่โคว้ายังไม่เต็ม (รวม 0%) */
function pickTierFrom(available: { tier: 50 | 15 | 10 | 5 | 0; p: number }[]): 50 | 15 | 10 | 5 | 0 {
  if (available.length === 0) return 0;
  const sum = available.reduce((s, x) => s + x.p, 0);
  if (sum <= 0) return 0;
  const r = Math.random() * sum;
  let acc = 0;
  for (const { tier, p } of available) {
    acc += p;
    if (r < acc) return tier;
  }
  return available[available.length - 1].tier;
}

export async function POST(request: Request) {
  try {
    const phase = getCurrentPhase();
    if (phase !== 'normal') {
      return NextResponse.json(
        { success: false, type: 'closed', message: 'กิจกรรมบูธเปิดเฉพาะช่วง Normal เท่านั้น' },
        { status: 400 }
      );
    }

    const ipHash = hashIp(getClientIp(request));
    const since = new Date(Date.now() - RATE_LIMIT_SEC * 1000).toISOString();
    const { data: lastSpin } = await supabase
      .from('booth_spin_log')
      .select('spun_at')
      .eq('ip_hash', ipHash)
      .gte('spun_at', since)
      .order('spun_at', { ascending: false })
      .limit(1)
      .single();

    if (lastSpin?.spun_at) {
      const spunAt = new Date(lastSpin.spun_at).getTime();
      const retryAt = spunAt + RATE_LIMIT_SEC * 1000;
      const retryAfterSeconds = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      return NextResponse.json(
        {
          success: false,
          message: `กรุณารอสักครู่ก่อนสุ่มใหม่ (จำกัด 1 ครั้งต่อ ${RATE_LIMIT_SEC} วินาที)`,
          retryAfterSeconds: Math.min(retryAfterSeconds, RATE_LIMIT_SEC),
        },
        { status: 429 }
      );
    }

    const usedCounts: Record<number, number> = { 50: 0, 15: 0, 10: 0, 5: 0 };
    for (const tier of [50, 15, 10, 5]) {
      const { count } = await supabase
        .from('promo_codes')
        .select('id', { count: 'exact', head: true })
        .eq('discount_percent', tier)
        .eq('is_used', true);
      usedCounts[tier] = count ?? 0;
    }

    const available = PROBABILITY.filter(({ tier }) => {
      if (tier === 0) return true;
      const quota = QUOTA[tier];
      return quota != null && (usedCounts[tier] ?? 0) < quota;
    });

    // --- Pretty rate สำหรับ 50% ---
    // เงื่อนไข: ทุก ๆ 50 ครั้ง ให้มีสิทธิ์ 50% 1 ใบ (ถ้า quota 50% ยังเหลือ)
    // วิธีทำ:
    // - นับจำนวนแถวใน booth_spin_log = จำนวนสปินที่ผ่านมา
    // - spin ถัดไป = totalSpins + 1
    // - ถ้า spin ถัดไปเป็นเลขหาร 50 ลงตัว และ quota 50 ยังเหลือ -> บังคับ tier = 50
    // - สปินอื่น ๆ ใน block 50 นั้น ตัด tier 50 ออกจาก PROBABILITY เพื่อไม่ให้เกิน 1 ใบต่อ 50 สปิน
    let tier: 50 | 15 | 10 | 5 | 0;
    const quota50Left = (QUOTA[50] ?? 0) - (usedCounts[50] ?? 0);

    if (quota50Left > 0) {
      const { count: totalSpins } = await supabase
        .from('booth_spin_log')
        .select('id', { count: 'exact', head: true });

      const nextSpinNumber = (totalSpins ?? 0) + 1;

      if (nextSpinNumber % 50 === 0) {
        // สปินที่ 50, 100, 150, ... และ quota 50 ยังเหลือ -> การันตี 50%
        tier = 50;
      } else {
        // ใน block 50 นี้ แต่ยังไม่ถึงสปินที่หาร 50 ลงตัว -> ไม่ให้ 50% ออกก่อน
        const availableWithout50 = available.filter(({ tier }) => tier !== 50);
        tier = pickTierFrom(availableWithout50);
      }
    } else {
      // quota 50% หมดแล้ว -> ตัด 50% ทิ้งจากตัวเลือก
      const availableNo50 = available.filter(({ tier }) => tier !== 50);
      tier = pickTierFrom(availableNo50);
    }

    const logSpin = async () => {
      await supabase.from('booth_spin_log').insert({ ip_hash: ipHash });
    };

    if (tier === 0) {
      await logSpin();
      return NextResponse.json({ success: true, type: '0', code: null, message: 'ลูโม่แอบกินส่วนลดของคุณไปแล้ว! 🐰' });
    }

    const { data: codeName, error: rpcError } = await supabase.rpc('claim_booth_promo_code', { p_tier: tier });

    if (rpcError) {
      console.error('Booth spin RPC error:', rpcError);
      await logSpin();
      return NextResponse.json({ success: false, type: '0', code: null, message: 'สร้างโค้ดไม่สำเร็จ ลองใหม่' }, { status: 500 });
    }

    if (codeName == null || codeName === '') {
      await logSpin();
      return NextResponse.json({ success: false, type: '0', code: null, message: 'สร้างโค้ดไม่สำเร็จ ลองสุ่มใหม่ได้เลย' }, { status: 500 });
    }

    await logSpin();
    return NextResponse.json({
      success: true,
      type: String(tier),
      code: codeName,
      discountPercent: tier,
      message: `ยินดีด้วย! คุณได้ส่วนลด ${tier}%`,
    });
  } catch (err: unknown) {
    console.error('Booth spin error:', err);
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
