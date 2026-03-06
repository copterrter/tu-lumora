"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", zipCode: ""
  });

  useEffect(() => {
    const data = localStorage.getItem('lumora_order');
    if (data) setOrderData(JSON.parse(data));
  }, []);

  const handleConfirmOrder = async () => {
    if (!formData.firstName || !formData.address || !formData.phone || !slipFile) {
      return alert("กรุณากรอกข้อมูลจัดส่งและอัปโหลดสลิปให้ครบถ้วนครับ");
    }

    setIsSubmitting(true);

    try {
      // 1. ตรวจสอบสลิปผ่าน API
      const body = new FormData();
      body.append("file", slipFile);
      const res = await fetch("/api/verify", { method: "POST", body });
      const slipResult = await res.json();
      
      if (!slipResult.success) throw new Error(slipResult.message);
      if (slipResult.data.amount !== orderData.total) throw new Error("ยอดเงินในสลิปไม่ตรงกับยอดสั่งซื้อครับ");

      // 2. รวมรายการสินค้าเป็นข้อความเดียวเพื่อเก็บลง Database
      const summaryItems = orderData.items.map((item: any) => 
        `${item.quantity}x ${item.style} (${item.size})`
      ).join(", ");

      // 3. บันทึกลง Supabase
      const { error } = await supabase.from('orders').insert([{
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: `${formData.address} ${formData.zipCode}`,
        product_name: summaryItems, // เก็บรายการทั้งหมด เช่น "1x T-SHIRT (L), 1x CROP (M)"
        total_amount: orderData.total,
        status: 'paid_and_verified'
      }]);

      if (error) throw error;
      
      localStorage.removeItem('lumora_cart'); // ล้างตะกร้า
      router.push("/thankyou"); 

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData) return null;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* ฝั่งซ้าย: ข้อมูลจัดส่ง */}
        <div className="space-y-12">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">SHIPPING</h1>
          <div className="space-y-4">
             <input onChange={(e) => setFormData({...formData, firstName: e.target.value})} type="text" placeholder="NAME" className="bg-transparent border border-white/20 p-4 w-full outline-none focus:border-white" />
             <input onChange={(e) => setFormData({...formData, phone: e.target.value})} type="text" placeholder="PHONE" className="bg-transparent border border-white/20 p-4 w-full outline-none focus:border-white" />
             <textarea onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="ADDRESS" className="bg-transparent border border-white/20 p-4 w-full outline-none focus:border-white" rows={3} />
             <input onChange={(e) => setFormData({...formData, zipCode: e.target.value})} type="text" placeholder="POSTAL CODE" className="bg-transparent border border-white/20 p-4 w-full outline-none focus:border-white" />
          </div>

          <div className="bg-[#111] p-8 border border-white/5 space-y-4">
             <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-center">Transfer to</p>
             <p className="text-center font-bold text-xs uppercase">BKK Bank: 091-0-79288-6</p>
             <input type="file" onChange={(e) => setSlipFile(e.target.files?.[0] || null)} className="w-full text-xs" />
          </div>
        </div>

        {/* ฝั่งขวา: สรุปตะกร้าสินค้า (Squad List) */}
        <div className="bg-[#0a0a0a] p-10 border border-white/10 h-fit sticky top-20 shadow-2xl">
           <h2 className="text-xs font-bold tracking-[0.3em] uppercase opacity-30 mb-8">Your Squad List</h2>
           
           <div className="space-y-6 mb-10 border-b border-white/5 pb-10">
              {orderData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                   <div>
                      <p className="font-black italic text-xl uppercase">{item.style}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Size: {item.size} | Qty: {item.quantity}</p>
                   </div>
                   <span className="font-bold">฿{item.quantity * 329 > 590 ? "PROMO" : item.quantity * 329}</span>
                </div>
              ))}
           </div>

           <div className="flex justify-between font-black italic text-5xl tracking-tighter uppercase mb-10">
              <span className="opacity-20">Total</span>
              <span>฿{orderData.total}</span>
           </div>
           
           <button 
             onClick={handleConfirmOrder}
             disabled={isSubmitting}
             className="w-full bg-white text-black py-7 font-black uppercase tracking-[0.5em] text-sm hover:invert transition-all disabled:opacity-50"
           >
             {isSubmitting ? "VERIFYING..." : "CONFIRM & PAY"}
           </button>
        </div>
      </div>
    </main>
  );
}