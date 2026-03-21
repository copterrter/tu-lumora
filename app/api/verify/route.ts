import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderReceipt } from '@/lib/email';
import { calculateTotalForCart } from '@/lib/pricing';
import { isStaffOrderingEnabled } from '@/lib/staff-ordering';

// Initialize Supabase client (Prefer Service Role Key for server-side inserts bypassing RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const STAFF_TOKEN = process.env.STAFF_CHECKOUT_TOKEN?.trim();
const STAFF_PURCHASE_PASSWORD = (process.env.STAFF_PURCHASE_PASSWORD || "makesomenoise").trim();
const IS_STAFF_ONLY_MODE = process.env.NEXT_PUBLIC_STAFF_ONLY_MODE === "true";
const STAFF_UNIT_PRICE = 150;

function calculateStaffTotal(items: { quantity?: number; style?: string }[]): number {
  return items.reduce((sum, item) => {
    return sum + (item.quantity ?? 0) * STAFF_UNIT_PRICE;
  }, 0);
}

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

    // 1. Calculate expected total securely on the server (respect pricing phases)
    const { phase, total: expectedTotal, originalTotal } = calculateTotalForCart(orderData.items);
    const totalQty = orderData.items.reduce((s: number, item: { quantity?: number }) => s + (item.quantity ?? 0), 0);
    let finalTotal = expectedTotal;
    let promoCodeUsed: string | null = null;
    const promoCode = typeof formData.promoCode === "string" ? formData.promoCode.trim().toUpperCase() : "";
    const staffToken = typeof formData.staffToken === "string" ? formData.staffToken.trim() : "";
    const staffPassword = typeof formData.staffPassword === "string" ? formData.staffPassword.trim() : "";
    const hasStaffToken = Boolean(staffToken);
    const hasConfiguredStaffToken = Boolean(STAFF_TOKEN);
    const isStaffCheckout = hasStaffToken && hasConfiguredStaffToken && staffToken === STAFF_TOKEN;

    if (isStaffCheckout && !isStaffOrderingEnabled()) {
      return NextResponse.json(
        { success: false, message: "ระบบรับสั่งซื้อ staff ปิดแล้ว" },
        { status: 403 }
      );
    }

    if (phase === "closed" && !isStaffCheckout) {
      return NextResponse.json(
        { success: false, message: "รอบพรีออเดอร์สิ้นสุดแล้ว" },
        { status: 400 }
      );
    }

    if (hasStaffToken && (!hasConfiguredStaffToken || !isStaffCheckout)) {
      return NextResponse.json({ success: false, message: "ลิงก์ staff ไม่ถูกต้อง" }, { status: 403 });
    }

    if (IS_STAFF_ONLY_MODE && !isStaffCheckout) {
      return NextResponse.json({ success: false, message: "ขณะนี้เปิดรับเฉพาะ staff เท่านั้น" }, { status: 403 });
    }

    if (isStaffCheckout && staffPassword !== STAFF_PURCHASE_PASSWORD) {
      return NextResponse.json({ success: false, message: "รหัส staff ไม่ถูกต้อง" }, { status: 403 });
    }

    if (isStaffCheckout) {
      finalTotal = calculateStaffTotal(orderData.items);
    }

    const QUOTA: Record<number, number> = { 50: 4, 15: 20, 10: 50, 5: 80 };
    // นับโควต้าที่ "ใช้จริง" เฉพาะช่วง Normal รอบกิจกรรมนี้
    const NORMAL_EVENT_START = new Date('2026-03-15T00:00:00+07:00').toISOString();
    if (!isStaffCheckout && phase === "normal" && totalQty === 1 && promoCode) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("discount_percent")
        .eq("code_name", promoCode)
        .eq("is_used", false)
        .single();
      if (promo) {
        const tier = promo.discount_percent as number;
        const quota = QUOTA[tier];
        if (quota != null) {
          const { count } = await supabase
            .from("promo_codes")
            .select("id", { count: "exact", head: true })
            .eq("discount_percent", tier)
            .eq("is_used", true)
            .gte("created_at", NORMAL_EVENT_START);
          if ((count ?? 0) >= quota) {
            return NextResponse.json(
              { success: false, message: "โควต้าส่วนลดนี้เต็มแล้ว ไม่สามารถใช้โค้ดนี้ได้" },
              { status: 400 }
            );
          }
        }
        finalTotal = 329 - Math.round(329 * (promo.discount_percent / 100));
        promoCodeUsed = promoCode;
      }
    }

    // 1.1 ไม่ให้ส่งออเดอร์ซ้ำ — ถ้ามีออเดอร์รอตรวจของเบอร์/อีเมลนี้อยู่แล้ว (ภายใน 20 นาที) ให้แจ้งรอ
    const norm = (s: string) => String(s || "").replace(/\D/g, "");
    const phoneNorm = norm(formData.phone);
    const emailTrim = String(formData.email || "").trim();
    const since = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const { data: recentPending } = await supabase
      .from("orders")
      .select("id, phone, email")
      .eq("status", "pending_manual_verify")
      .gte("created_at", since);
    const hasPending = (recentPending || []).some((o: { phone?: string; email?: string }) => {
      if (phoneNorm && norm(o.phone || "") === phoneNorm) return true;
      if (emailTrim && (o.email || "").trim().toLowerCase() === emailTrim.toLowerCase()) return true;
      return false;
    });
    if (hasPending) {
      return NextResponse.json(
        { success: false, message: "คุณมีออเดอร์ที่รอตรวจสลิปอยู่แล้ว กรุณารอแอดมินตรวจก่อน หรือติดต่อแอดมินถ้าต้องการยกเลิกออเดอร์เดิม" },
        { status: 400 }
      );
    }

    // 2. Prepare common order fields
    type Item = { quantity?: number; style?: string; size?: string };
    const summaryItems = orderData.items.map((item: Item) => `${item.quantity ?? 0}x ${item.style ?? ""} (${item.size ?? ""})`).join(", ");
    
    // Map frontend full names back to Supabase enum constraints (regular, crop)
    const styleStr = orderData.items.map((i: Item) => {
      const itemStyle = String(i.style || "").toUpperCase();
      if (itemStyle.includes("BABY") || itemStyle.includes("CROP")) return "crop";
      return "regular";
    }).join(", ");
    
    const sizeStr = orderData.items.map((i: Item) => i.size).join(", ");

    const insertOrder = async (status: string, slipTransRef?: string | null, slipImageUrl?: string | null): Promise<string | null> => {
      const baseOrder: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        zipCode: formData.zipCode,
        social_contact: formData.socialContact, 
        product_name: summaryItems,
        quantity: orderData.items.reduce((sum: number, item: Item) => sum + (item.quantity ?? 0), 0),
        style: styleStr,
        size: sizeStr,
        total_amount: finalTotal,
        status
      };
      if (isStaffCheckout) {
        baseOrder.promo_code_used = "STAFF_COST";
      } else if (promoCodeUsed) {
        baseOrder.promo_code_used = promoCodeUsed;
      }

      if (slipTransRef) {
        baseOrder.slip_trans_ref = slipTransRef;
      }
      if (slipImageUrl) {
        baseOrder.slip_image_url = slipImageUrl;
      }

      const { data: inserted, error: insertError } = await supabase.from('orders').insert([baseOrder]).select('id').single();

      if (insertError) {
        // Graceful degradation if slip_trans_ref column doesn't exist yet
        if (
          insertError.code === 'PGRST204' ||
          insertError.message.includes("slip_trans_ref") ||
          insertError.message.includes("slip_image_url")
        ) {
          const withoutExtras = Object.fromEntries(
            Object.entries(baseOrder).filter(([k]) => k !== "slip_trans_ref" && k !== "slip_image_url")
          );
          const { data: inserted2, error: retryError } = await supabase.from('orders').insert([withoutExtras]).select('id').single();
          if (retryError) throw retryError;
          console.warn("WARNING: Inserted order without some optional columns (slip_trans_ref / slip_image_url). Please ensure these columns exist in Supabase if you need them.");
          return inserted2?.id ?? null;
        } else {
          throw insertError;
        }
      }
      return inserted?.id ?? null;
    };

    // 3. Auto verify flow with RDCW API (มี fallback ไปตรวจมือในทุกเคสที่อ่านสลิปไม่ได้/ยอดไม่ตรง)
    const bytes = await file.arrayBuffer();
    const imageBlob = new Blob([bytes], { type: file.type || 'image/jpeg' });

    // Upload slip image to Supabase Storage for admin review (best-effort)
    let slipImageUrl: string | null = null;
    try {
      const fileExt = (file.name || 'slip.jpg').split('.').pop() || 'jpg';
      const safeExt = fileExt.toLowerCase().startsWith('jp') ? 'jpg' : fileExt.toLowerCase();
      const path = `slips/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
      const { error: uploadError } = await supabase
        .storage
        .from('order_slips')
        .upload(path, imageBlob, { contentType: file.type || 'image/jpeg', upsert: false });
      if (!uploadError) {
        const { data } = supabase.storage.from('order_slips').getPublicUrl(path);
        slipImageUrl = data.publicUrl;
      } else {
        console.warn("Slip upload error:", uploadError);
      }
    } catch (e) {
      console.warn("Slip upload unexpected error:", e);
    }

    const clientId = process.env.SLIP_CLIENT_ID?.trim(); 
    const clientSecret = process.env.SLIP_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      return NextResponse.json({ success: false, message: "Server API Key is missing" }, { status: 500 });
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
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
      // Fallback: บันทึกออเดอร์ให้ไปตรวจมือแทน (ยังไม่ส่งอีเมลยืนยันจนกว่าจะอนุมัติจากหลังบ้าน)
      await insertOrder('pending_manual_verify', undefined, slipImageUrl);

      return NextResponse.json({ 
        success: true,
        manualFallback: true,
        message: slipResult.message || "ไม่สามารถตรวจสอบสลิปอัตโนมัติได้ ระบบจะรอตรวจสอบด้วยมือ" 
      });
    }

    // 5. Validate Amount
    const slipAmount = slipResult.data.amount;
    if (Number(slipAmount) !== Number(finalTotal)) {
      // Fallback: ยอดไม่ตรง แต่ยังบันทึกให้ทีมงานตรวจมือ (ยังไม่ส่งอีเมลยืนยันจนกว่าจะอนุมัติจากหลังบ้าน)
      await insertOrder('pending_manual_verify', undefined, slipImageUrl);

      return NextResponse.json({ 
        success: true,
        manualFallback: true,
        message: `ยอดเงินในสลิป ฿${slipAmount} ไม่ตรงกับยอดที่คำนวณ (฿${finalTotal}) ระบบจะรอตรวจสอบด้วยมือ` 
      });
    }
    
    const transRef = String(slipResult?.data?.transRef || "").trim();

    // 6. Duplicate Slip Check (Anti Double Spend)
    // ตรวจเฉพาะออเดอร์ที่ยืนยันจ่ายแล้วจริง เพื่อลด false positive จากสถานะอื่น
    if (!transRef) {
      await insertOrder('pending_manual_verify', undefined, slipImageUrl);
      return NextResponse.json({
        success: true,
        manualFallback: true,
        message: "ระบบอ่านเลขอ้างอิงสลิปไม่ครบถ้วน จึงส่งให้แอดมินตรวจสอบด้วยมือ"
      });
    }

    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('slip_trans_ref', transRef)
      .eq('status', 'paid_and_verified')
      .single();

    if (existingOrder) {
      // ผู้ให้บริการบางครั้งอาจคืน transRef ซ้ำในคนละสลิป
      // เลี่ยงการ reject ทันทีเพื่อลด false positive และส่งให้แอดมินตรวจมือแทน
      await insertOrder('pending_manual_verify', undefined, slipImageUrl);
      return NextResponse.json({
        success: true,
        manualFallback: true,
        message: "ตรวจพบเลขอ้างอิงสลิปซ้ำ ระบบส่งให้แอดมินตรวจสอบด้วยมือแล้ว"
      });
    }

    // Ignore checkError if it's just "not found" (PGRST116), but catch missing column errors
    if (checkError && checkError.code !== 'PGRST116') {
      console.warn("Supabase Check Error (might be missing slip_trans_ref column):", checkError);
    }

    // 7. Insert Order Securely
    const orderId = await insertOrder('paid_and_verified', transRef, slipImageUrl);

    if (promoCodeUsed) {
      await supabase
        .from("promo_codes")
        .update({ is_used: true, used_at: new Date().toISOString(), used_order_id: orderId })
        .eq("code_name", promoCodeUsed);
    }

    // 8. Send Email Receipt
    if (formData.email) {
      const discount = originalTotal - finalTotal;
      await sendOrderReceipt({
        orderId: orderId ?? undefined,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        items: orderData.items,
        total: finalTotal,
        discount: discount > 0 ? discount : 0,
        discountLabel: isStaffCheckout ? "Staff Cost" : promoCodeUsed ? "ส่วนลดจากโค้ด" : undefined,
      }).catch((e: unknown) => console.warn('Email send failed (non-blocking):', e));
    }

    return NextResponse.json({ success: true, message: "สั่งซื้อสำเร็จ" });
    
  } catch (error: unknown) {
    console.error("Checkout Verification Error:", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Internal error" }, { status: 500 });
  }
}