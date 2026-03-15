import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderReceipt } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EDIT_PIN = process.env.DEV_EDIT_AMOUNT_PASSWORD || 'dev101';

/** Parse product_name "1x T-SHIRT (S), 2x CROP (M)" into items for receipt email */
function parseOrderItems(order: { product_name?: string; style?: string; size?: string; quantity?: number }): { style: string; size: string; quantity: number }[] {
  const name = String(order.product_name || '').trim();
  if (!name) {
    const qty = Math.max(1, Number(order.quantity) || 1);
    const styles = (order.style || 'regular').toString().split(',').map((s: string) => s.trim() || 'regular');
    const sizes = (order.size || 'M').toString().split(',').map((s: string) => s.trim() || 'M');
    const items = [];
    for (let i = 0; i < qty; i++) {
      items.push({ style: styles[i % styles.length], size: sizes[i % sizes.length], quantity: 1 });
    }
    return items;
  }
  const items: { style: string; size: string; quantity: number }[] = [];
  const re = /(\d+)\s*x\s*([^(]+)\(([^)]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(name)) !== null) {
    const qty = parseInt(m[1], 10) || 1;
    const label = (m[2] || '').trim().toUpperCase();
    const size = (m[3] || '').trim() || 'M';
    const style = label.includes('CROP') ? 'crop' : 'regular';
    items.push({ style, size, quantity: qty });
  }
  if (items.length === 0) {
    const qty = Math.max(1, Number(order.quantity) || 1);
    items.push({ style: 'regular', size: 'M', quantity: qty });
  }
  return items;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const devPassword = body.devPassword as string | undefined;
    if (devPassword !== DEV_EDIT_PIN) {
      return NextResponse.json({ success: false, message: 'รหัส Dev ไม่ถูกต้อง' }, { status: 403 });
    }

    const orderId = body.orderId as string | undefined;
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Missing orderId' }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (!order.email) {
      return NextResponse.json({ success: false, message: 'Order has no email' }, { status: 400 });
    }

    const items = parseOrderItems(order);
    const total = Number(order.total_amount) || 0;
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const originalTotal = totalQty * 329;
    const discount = Math.max(0, originalTotal - total);

    const result = await sendOrderReceipt({
      email: order.email,
      firstName: order.firstName || 'Customer',
      lastName: order.lastName || '',
      items,
      total,
      discount,
      discountLabel: order.promo_code_used ? 'ส่วนลดจากโค้ด' : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message || 'ส่งเมลไม่สำเร็จ' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'ส่งเมลใบเสร็จอีกครั้งแล้ว' });
  } catch (err: unknown) {
    console.error('Resend receipt error:', err);
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

