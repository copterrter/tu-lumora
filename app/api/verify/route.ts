import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (Prefer Service Role Key for server-side inserts bypassing RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const incomingData = await request.formData();
    const file = incomingData.get("file") as File;
    const orderDataRaw = incomingData.get("orderData") as string;
    const formDataRaw = incomingData.get("formData") as string;

    if (!file || !orderDataRaw || !formDataRaw) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน (ขาดสลิป หรือ ข้อมูลออเดอร์)" }, { status: 400 });
    }

    const orderData = JSON.parse(orderDataRaw);
    const formData = JSON.parse(formDataRaw);

    // 1. Calculate expected total securely on the server
    const totalQty = orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const promoQty = Math.min(totalQty, 6); 
    const regularQty = totalQty - promoQty; 
    const pairs = Math.floor(promoQty / 2);
    const promoSingles = promoQty % 2;
    const expectedTotal = (pairs * 590) + ((promoSingles + regularQty) * 329);

    // 2. Verify Slip with RDCW API
    const clientId = process.env.SLIP_CLIENT_ID?.trim(); 
    const clientSecret = process.env.SLIP_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      return NextResponse.json({ success: false, message: "Server API Key is missing" }, { status: 500 });
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const bytes = await file.arrayBuffer();
    const imageBlob = new Blob([bytes], { type: file.type || 'image/jpeg' });
    
    const apiFormData = new FormData();
    apiFormData.append("file", imageBlob, file.name || "slip.jpg"); 

    const response = await fetch("https://suba.rdcw.co.th/v2/inquiry", {
      method: "POST",
      headers: { 
        "Authorization": `Basic ${authHeader}`
      },
      body: apiFormData
    });

    const slipResult = await response.json();

    if (!response.ok || slipResult.code) {
       return NextResponse.json({ 
         success: false, 
         message: slipResult.message || "สลิปนี้ไม่ถูกต้อง หรือเคยใช้งานไปแล้วครับ" 
       });
    }

    // 3. Validate Amount
    const slipAmount = slipResult.data.amount;
    if (Number(slipAmount) !== Number(expectedTotal)) {
      return NextResponse.json({ 
        success: false, 
        message: `ยอดเงินไม่ตรง! สลิปมียอด ฿${slipAmount} แต่ยอดสั่งซื้อที่ถูกต้องคือ ฿${expectedTotal}` 
      });
    }

    const transRef = slipResult.data.transRef;

    // 4. Duplicate Slip Check (Anti Double Spend)
    // Note: This requires the 'slip_trans_ref' column in the 'orders' table.
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('slip_trans_ref', transRef)
      .single();

    if (existingOrder) {
      return NextResponse.json({ success: false, message: "สลิปนี้ถูกใช้งานไปแล้ว! (Duplicate Slip)" });
    }

    // Ignore checkError if it's just "not found" (PGRST116), but catch missing column errors
    if (checkError && checkError.code !== 'PGRST116') {
      console.warn("Supabase Check Error (might be missing slip_trans_ref column):", checkError);
    }

    // 5. Insert Order Securely
    const summaryItems = orderData.items.map((item: any) => `${item.quantity}x ${item.style} (${item.size})`).join(", ");

    const { error: insertError } = await supabase.from('orders').insert([{
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: formData.address,
      zipCode: formData.zipCode,
      social_contact: formData.socialContact, 
      product_name: summaryItems,
      total_amount: expectedTotal,
      status: 'paid_and_verified',
      slip_trans_ref: transRef // Saved to prevent future reuse
    }]);

    if (insertError) {
       // Graceful degradation if slip_trans_ref column doesn't exist yet
       if (insertError.code === 'PGRST204' || insertError.message.includes("slip_trans_ref")) {
          // Retry without slip_trans_ref
          const { error: retryError } = await supabase.from('orders').insert([{
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            zipCode: formData.zipCode,
            social_contact: formData.socialContact, 
            product_name: summaryItems,
            total_amount: expectedTotal,
            status: 'paid_and_verified'
          }]);
          if (retryError) throw retryError;
          console.warn("WARNING: Inserted order without slip_trans_ref. Please add the column to Supabase.");
       } else {
          throw insertError;
       }
    }

    return NextResponse.json({ success: true, message: "สั่งซื้อสำเร็จ" });
    
  } catch (error: any) {
    console.error("Checkout Verification Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}