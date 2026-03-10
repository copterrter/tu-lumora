import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendManualApprovalEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.orderId;

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

    if (order.status === 'paid_and_verified') {
      return NextResponse.json({ success: true, message: 'Order already verified' });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid_and_verified' })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    if (order.email) {
      await sendManualApprovalEmail({
        email: order.email,
        firstName: order.firstName || 'Customer',
      }).catch((e: any) =>
        console.warn('Manual approval email failed (non-blocking):', e)
      );
    }

    return NextResponse.json({ success: true, message: 'Order approved and email sent (if possible)' });
  } catch (err: any) {
    console.error('Approve order error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}

