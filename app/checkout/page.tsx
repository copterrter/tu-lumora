"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdpaChecked, setPdpaChecked] = useState(false);
  const [noRefundChecked, setNoRefundChecked] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPdpaModal, setShowPdpaModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", zipCode: "", socialContact: "" 
  });
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const data = localStorage.getItem('lumora_order');
    if (data) setOrderData(JSON.parse(data));
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("0910792886"); 
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setSlipFile(null); return; }
    if (!file.type.startsWith('image/')) {
      alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้นครับ (JPG, PNG)");
      e.target.value = ''; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ใหญ่เกินไปครับ (จำกัดไม่เกิน 5MB)");
      e.target.value = ''; return;
    }
    setSlipFile(file);
  };

  const verifySlipWithRDCW = async (file: File, orderData: any, formData: any) => {
    const body = new FormData();
    body.append("file", file);
    body.append("orderData", JSON.stringify(orderData));
    body.append("formData", JSON.stringify(formData));
    const response = await fetch("/api/verify", { method: "POST", body: body });
    return await response.json();
  };

  const handleConfirmOrder = async () => {
    if (!formData.firstName || !formData.address || !formData.zipCode || !formData.phone || !formData.socialContact || !slipFile) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงช่อง IG / LINE ID ด้วยครับ");
    }
    setIsSubmitting(true);
    try {
      const slipResult = await verifySlipWithRDCW(slipFile, orderData, formData);
      if (!slipResult.success) throw new Error(slipResult.message || "การสั่งซื้อไม่สำเร็จ โปรดลองอีกครั้ง");
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
  const canSubmit = pdpaChecked && noRefundChecked && !isSubmitting;

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">

      {/* PDPA Modal */}
      {showPdpaModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowPdpaModal(false)}>
          <div className="bg-[#111] border border-white/10 max-w-lg w-full p-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black uppercase tracking-widest mb-6">นโยบายความเป็นส่วนตัว (PDPA)</h2>
            <div className="text-xs text-gray-400 space-y-4 leading-relaxed">
              <p>เราเก็บข้อมูลส่วนบุคคล (ชื่อ ที่อยู่ เบอร์โทร) เพื่อใช้ในการจัดส่งสินค้าเท่านั้น</p>
              <p>ข้อมูลของคุณจะไม่ถูกเปิดเผย ขาย หรือโอนให้กับบุคคลที่สามโดยไม่ได้รับความยินยอม</p>
              <p>คุณมีสิทธิ์ขอลบข้อมูลได้หลังจากการจัดส่งสำเร็จ ผ่านช่องทาง LINE OA</p>
              <p>ข้อมูลจะถูกเก็บรักษาไว้เป็นระยะเวลา 90 วัน</p>
            </div>
            <button onClick={() => setShowPdpaModal(false)} className="mt-8 w-full bg-white text-black py-3 font-black uppercase tracking-widest text-xs">รับทราบ</button>
          </div>
        </div>
      )}

      {/* Countdown Banner — TOP */}
      <div className={`w-full py-3 flex justify-center items-center gap-3 border-b border-white/5 ${timeLeft <= 60 ? 'bg-red-950' : 'bg-[#0a0a0a]'}`}>
        {timeLeft > 0 && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-white">
          INVENTORY RESERVED FOR{" "}
          <span className={`ml-1 font-black tracking-widest ${timeLeft <= 60 ? 'text-red-400' : 'text-red-400'}`}>
            {formatTime(timeLeft)}
          </span>
        </p>
      </div>

      <div className="p-4 sm:p-6 md:p-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* LEFT: Form */}
          <div className="space-y-12">
            <header className="space-y-4">
              <Link href="/product" className="text-[10px] tracking-widest text-gray-500 uppercase hover:text-white transition-colors">[ BACK TO SHOP ]</Link>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">SHIPPING <br/> INFORMATION</h1>
            </header>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input onChange={(e) => setFormData({...formData, firstName: e.target.value})} type="text" placeholder="FIRST NAME" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
                <input onChange={(e) => setFormData({...formData, lastName: e.target.value})} type="text" placeholder="LAST NAME" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
              </div>
              
              <input onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" placeholder="EMAIL (FOR RECEIPT)" className="bg-[#111] border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />

              <input onChange={(e) => setFormData({...formData, socialContact: e.target.value})} type="text" placeholder="IG / LINE ID (CONTACT)" className="bg-[#111] border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />

              <textarea onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="FULL ADDRESS (HOUSE NO. / STREET / DISTRICT)" rows={3} className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input onChange={(e) => setFormData({...formData, zipCode: e.target.value})} type="text" placeholder="POSTAL CODE" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
                <input onChange={(e) => setFormData({...formData, phone: e.target.value})} type="text" placeholder="PHONE NUMBER" className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full" />
              </div>
            </div>

            <div className="pt-10 border-t border-white/10 space-y-6">
              <div className="bg-[#111] p-8 flex flex-col items-center gap-6 border border-white/5 relative overflow-hidden">
                <div className="text-center space-y-2 z-10 w-full">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em]">Transfer Amount</p>
                  <p className="text-4xl sm:text-5xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">฿{orderData.total}</p>
                  {discount > 0 && (
                    <p className="text-green-400 text-xs font-bold tracking-widest">You saved ฿{discount} with Squad Promo! 🎉</p>
                  )}
                </div>
                
                {/* Bank Account Block */}
                <div className="w-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 p-6 relative overflow-hidden z-10 box-border">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] pointer-events-none" />
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Bank</p>
                        <p className="text-sm font-black text-white tracking-wider">BANGKOK BANK <span className="text-xs font-medium text-gray-300 ml-1">(ธ.กรุงเทพ)</span></p>
                      </div>
                      <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(30,64,175,0.5)]">
                        <span className="text-white font-black text-xs">BBL</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Account Name</p>
                      <p className="text-[11px] sm:text-xs font-bold text-gray-200 leading-relaxed uppercase">
                        องค์การนักศึกษามหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต ประจำปีการศึกษา 2568
                      </p>
                    </div>

                    <div className="mt-2 flex flex-col sm:flex-row justify-between items-center bg-black/50 border border-white/10 p-2 pl-4 gap-3 box-border">
                      <span className="font-black text-xl sm:text-2xl tracking-[0.15em] text-white">091-0-79288-6</span>
                      <button 
                        onClick={copyToClipboard} 
                        className={`w-full sm:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                      >
                        {copied ? "COPIED ✅" : "COPY"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex justify-between">
                  <span>Upload Payment Slip</span>
                  <span className="text-gray-600 font-normal normal-case tracking-normal">Max 5MB (JPG, PNG)</span>
                </label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileChange} 
                  className="w-full text-xs text-gray-400 file:bg-white file:text-black file:px-6 file:py-3 file:border-0 file:font-black file:uppercase file:tracking-widest file:mr-4 file:cursor-pointer hover:file:bg-gray-200 transition-all border border-white/10 p-1" 
                />
              </div>

              {/* LINE OA support */}
              <div className="flex items-center gap-3 border border-green-500/20 bg-green-500/5 p-4">
                <span className="text-green-400 text-lg">💬</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  มีปัญหาหรือต้องการความช่วยเหลือ?{" "}
                  <a href="https://lin.ee/19k0kWS" target="_blank" className="text-green-400 underline underline-offset-2 hover:text-green-300 font-bold">
                    ติดต่อ LINE OA ของเราได้เลย
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="bg-[#0a0a0a] p-8 md:p-10 border border-white/10 h-fit space-y-8 sticky top-20 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold tracking-[0.3em] uppercase opacity-30">Your Squad List</h2>
              <span className="bg-white/10 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-white/10">PRE-ORDER</span>
            </div>
            
            <div className="space-y-5">
              {orderData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <p className="font-black italic text-base uppercase leading-tight">[PRE-ORDER] TU LUMORA {item.style}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm text-gray-400 shrink-0 ml-4">฿{item.quantity * 329}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3 text-xs font-bold tracking-widest uppercase">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>฿{originalTotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 bg-green-500/10 -mx-8 md:-mx-10 px-8 md:px-10 py-3 border-y border-green-500/10">
                  <span>Squad Promo Saved 🎉</span>
                  <span className="italic font-black text-sm">-฿{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300 items-center">
                <span>Shipping</span>
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-600">฿50</span>
                  <span className="bg-white text-black px-2 py-1 text-[9px] font-black">FREE</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between font-black italic text-4xl tracking-tighter uppercase pt-4 border-t border-white/10">
              <span className="opacity-20">Total</span><span>฿{orderData.total}</span>
            </div>
            
            {/* PDPA Checkbox 1 */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={pdpaChecked}
                onChange={(e) => setPdpaChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-white cursor-pointer shrink-0"
              />
              <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                ฉันได้อ่านและยอมรับ{" "}
                <button onClick={() => setShowPdpaModal(true)} className="underline underline-offset-2 text-white/60 hover:text-white">
                  นโยบายความเป็นส่วนตัว (PDPA)
                </button>
                {" "}และยินยอมให้เก็บข้อมูลเพื่อดำเนินการสั่งซื้อ
              </span>
            </label>

            {/* PDPA Checkbox 2 — No Refund */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={noRefundChecked}
                onChange={(e) => setNoRefundChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-white cursor-pointer shrink-0"
              />
              <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                ฉันรับทราบว่าสินค้า Pre-Order ไม่สามารถยกเลิกหรือขอคืนเงินได้หลังชำระเงินแล้ว
              </span>
            </label>

            <button 
              onClick={handleConfirmOrder} 
              disabled={!canSubmit} 
              className="w-full bg-white text-black border border-transparent hover:bg-transparent hover:text-white hover:border-white py-6 font-black uppercase tracking-[0.4em] text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {isSubmitting ? "PROCESSING..." : "CONTINUE AND PAY"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}