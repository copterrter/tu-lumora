import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EDIT_PIN = process.env.DEV_EDIT_AMOUNT_PASSWORD?.trim();

export async function POST(request: Request) {
  try {
    if (!DEV_EDIT_PIN) {
      return NextResponse.json({ success: false, message: 'Server env missing: DEV_EDIT_AMOUNT_PASSWORD' }, { status: 500 });
    }
    const body = await request.json();
    const devPassword = body.devPassword as string | undefined;
    if (devPassword !== DEV_EDIT_PIN) {
      return NextResponse.json({ success: false, message: 'รหัส Dev ไม่ถูกต้อง' }, { status: 403 });
    }

    const orderId = body.orderId as string | undefined;
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Missing orderId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Delete order error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'ลบออเดอร์แล้ว' });
  } catch (err: unknown) {
    console.error('Delete order error:', err);
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
