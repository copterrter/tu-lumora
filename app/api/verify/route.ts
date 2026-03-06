import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const incomingData = await request.formData();
    const file = incomingData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "ไม่พบไฟล์สลิป" }, { status: 400 });
    }

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

    const data = await response.json();

    // 🌟 จุดที่แก้: ถ้า API แจ้ง Error (400) ให้ส่งกลับไปบอกหน้าเว็บตรงๆ 🌟
    if (!response.ok || data.code) {
       return NextResponse.json({ 
         success: false, 
         message: data.message || "สลิปนี้ไม่ถูกต้อง หรือเคยใช้งานไปแล้วครับ" 
       });
    }

    // 🌟 ถ้าไม่มี Error แปลว่าสลิปจริง! ให้ส่ง success: true ไปบอกหน้าเว็บ 🌟
    return NextResponse.json({ 
      success: true, 
      data: data.data || data 
    });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}