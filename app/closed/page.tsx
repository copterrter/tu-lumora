"use client";

export default function ClosedPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-white selection:text-black">
      <div className="max-w-lg text-center space-y-5">
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight">
          PRE-ORDER CLOSED
        </h1>
        <p className="text-[11px] md:text-sm text-gray-400 leading-relaxed">
          ขอบคุณทุกคนที่ไว้วางใจ TU LUMORA รอบพรีออเดอร์นี้ปิดรับออเดอร์เรียบร้อยแล้ว
        </p>
        <p className="text-[11px] md:text-sm text-gray-300 leading-relaxed">
          เราจะทยอยจัดส่งสินค้าให้ และแจ้ง
          {" "}
          <span className="font-bold">เลขพัสดุผ่านทางอีเมล</span>
          {" "}
          ที่คุณใช้ตอนสั่งซื้อ กรุณาตรวจสอบ Inbox / Spam ด้วยนะครับ
        </p>
      </div>
    </main>
  );
}

