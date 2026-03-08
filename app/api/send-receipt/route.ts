import { NextResponse } from 'next/server';
import { sendOrderReceipt } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await sendOrderReceipt(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
