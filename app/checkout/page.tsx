"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", address: "", zipCode: "", socialContact: "" 
  });

  useEffect(() => {
    const data = localStorage.getItem('lumora_order');
    if (data) setOrderData(JSON.parse(data));
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("0910792886"); 
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifySlipWithRDCW = async (file: File, orderData: any, formData: any) => {
    const body = new FormData();
    body.append("file", file);
    body.append("orderData", JSON.stringify(orderData));
    body.append("formData", JSON.stringify(formData));
    const response = await fetch("/api/verify", { method: "POST", body: body });
    return await response.json();
  };

  const calculateExpectedTotal = (items: any[]) => {
    const totalQty = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const promoQty = Math.min(totalQty, 6); 
    const regularQty = totalQty - promoQty; 
    const pairs = Math.floor(promoQty / 2);
    const promoSingles = promoQty % 2;
    return (pairs * 590) + ((promoSingles + regularQty) * 329);
  };

  const handleConfirmOrder = async () => {
    if (!formData.firstName || !formData.address || !formData.zipCode || !formData.phone || !formData.socialContact || !slipFile) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงช่อง IG / LINE ID ด้วยครับ");
    }
    setIsSubmitting(true);
    try {
      const slipResult = await verifySlipWithRDCW(slipFile, orderData, formData);
      if (!slipResult.success) throw new Error(slipResult.message || "การสั่งซื้อไม่สำเร็จ โปรดลองอีกครั้ง");
      
      // If success, the API has already inserted the order into Supabase
      localStorage.removeItem('lumora_cart'); 
      router.push("/thankyou"); 
    } catch (err: any) {
      alert("แจ้งเตือน: " + (err.message || "เกิดข้อผิดพลาด"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData) return null;

  const originalTotal = orderData.items.reduce((sum: number, item: any) => sum + (item.quantity * 329), 0);
  const discount = originalTotal - orderData.total;

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-20 font-sans selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        <div className="space-y-12">
          <header className="space-y-4">
            <a href="/product" className="text-[10px] tracking-widest text-gray-500 uppercase hover:text-white transition-colors">[ BACK TO SHOP ]</a>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">SHIPPING <br/> INFORMATION</h1>
          </header>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input onChange={(e) => setFormData({...formData, firstName: e.target.value})} type="text" placeholder="FIRST NAME" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
              <input onChange={(e) => setFormData({...formData, lastName: e.target.value})} type="text" placeholder="LAST NAME" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
            </div>
            
            <input onChange={(e) => setFormData({...formData, socialContact: e.target.value})} type="text" placeholder="IG / LINE ID (CONTACT)" className="bg-[#111] border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />

            <textarea onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="FULL ADDRESS (HOUSE NO. / STREET / DISTRICT)" rows={3} className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input onChange={(e) => setFormData({...formData, zipCode: e.target.value})} type="text" placeholder="POSTAL CODE" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
              <input onChange={(e) => setFormData({...formData, phone: e.target.value})} type="text" placeholder="PHONE NUMBER" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 space-y-6">
             <div className="bg-[#111] p-8 flex flex-col items-center gap-6 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 w-full bg-white/10 text-center py-1">
                   <p className="text-[8px] tracking-[0.4em] uppercase text-white animate-pulse">Inventory Reserved for 10:00</p>
                </div>
                <div className="text-center space-y-2 mt-4">
                  <p className="text-white text-[10px] font-bold uppercase tracking-[0.4em]">Transfer Amount</p>
                  <p className="text-4xl font-black italic text-white">฿{orderData.total}</p>
                </div>
                <div className="w-full border-t border-white/10 pt-6 space-y-4">
                  <div className="flex flex-col text-xs tracking-widest gap-1"><span className="text-gray-500">BANK</span><span className="font-bold">BANGKOK BANK (ธนาคารกรุงเทพ)</span></div>
                  <div className="flex flex-col text-xs tracking-widest gap-1"><span className="text-gray-500">ACCOUNT NAME</span><span className="font-bold text-[11px] sm:text-xs leading-relaxed">องค์การนักศึกษามหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต ประจำปีการศึกษา 2568</span></div>
                  <div className="flex justify-between items-center bg-black border border-white/20 p-4 mt-4">
                    <span className="font-black text-lg tracking-widest">091-0-79288-6</span>
                    <button onClick={copyToClipboard} className="bg-white text-black px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-300 transition-colors shrink-0">{copied ? "COPIED!" : "COPY"}</button>
                  </div>
                </div>
             </div>
             <div className="space-y-3">
               <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Upload Payment Slip</label>
               <input type="file" accept="image/*" onChange={(e) => setSlipFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-400 file:bg-white file:text-black file:px-6 file:py-3 file:border-0 file:font-black file:uppercase file:tracking-widest file:mr-4 file:cursor-pointer hover:file:bg-gray-200 transition-all" />
             </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-10 border border-white/10 h-fit space-y-8 sticky top-20 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold tracking-[0.3em] uppercase opacity-30">Your Squad List</h2>
              <span className="bg-white text-black text-[9px] font-black uppercase tracking-widest px-3 py-1">Ready to Ship</span>
           </div>
           
           <div className="space-y-6">
              {orderData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                   <div>
                      <p className="font-black italic text-xl uppercase">{item.title}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Size: {item.size} | Qty: {item.quantity}</p>
                   </div>
                   <span className="font-bold text-sm text-gray-400">฿{item.quantity * 329}</span>
                </div>
              ))}
           </div>

           <div className="pt-8 border-t border-white/10 space-y-4 text-xs font-bold tracking-widest uppercase">
              <div className="flex justify-between text-gray-500">
                 <span>Subtotal</span><span>฿{originalTotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-white bg-white/10 -mx-10 px-10 py-3 border-y border-white/5">
                   <span>Squad Promo Saved</span><span className="italic font-black text-sm">-฿{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300 items-center">
                 <span>Shipping</span>
                 <div className="flex items-center gap-2">
                    <span className="line-through text-gray-600">฿50</span><span className="bg-white text-black px-2 py-1 text-[9px] font-black">FREE</span>
                 </div>
              </div>
           </div>

           <div className="flex justify-between font-black italic text-5xl tracking-tighter uppercase pt-6 border-t border-white/10">
              <span className="opacity-20">Total</span><span>฿{orderData.total}</span>
           </div>
           
           <button onClick={handleConfirmOrder} disabled={isSubmitting} className="w-full bg-white text-black py-7 font-black uppercase tracking-[0.5em] text-sm hover:invert transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(255,255,255,0.1)] relative overflow-hidden">
             {isSubmitting ? "PROCESSING..." : "CONFIRM & PAY"}
           </button>
        </div>
      </div>
    </main>
  );
}