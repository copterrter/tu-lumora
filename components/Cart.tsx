"use client";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../store/useCart";
import { useRouter } from "next/navigation";

export default function Cart() {
  const { items, isOpen, closeCart, removeItem } = useCart();
  const router = useRouter();

  // สมการคำนวณราคาโปรโมชั่น 3 วันแรก
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const pairs = Math.floor(totalQty / 2); // หาจำนวนคู่ (เช่น ซื้อ 3 ได้ 1 คู่)
  const singles = totalQty % 2; // หาเศษตัวเดียว (เช่น ซื้อ 3 เหลือเศษ 1 ตัว)
  
  // คำนวณราคา: (จำนวนคู่ * 570) + (จำนวนเศษ * 289)
  const totalPrice = (pairs * 570) + (singles * 289);
  const isPairPromo = pairs > 0;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] cursor-pointer" onClick={closeCart} />}

      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0a0a0a] border-l border-gray-800 z-[70] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">Your Cart</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-white transition"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="tracking-widest uppercase">Cart is empty</p>
            </div>
          ) : (
             items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-black p-4 border border-gray-800">
                <div className="w-20 h-24 bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }} />
                <div className="flex-1">
                  <h3 className="text-white font-bold uppercase">{item.name}</h3>
                  <p className="text-sm text-gray-400 tracking-wider">Style: {item.style} | Size: {item.size}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  <div className="text-white font-bold mt-1">
                    <span className="text-green-500">฿289 <span className="line-through text-gray-600 text-xs ml-1">฿329</span></span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-500 transition"><Trash2 size={20} /></button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-800 bg-black">
          {isPairPromo && (
            <div className="mb-4 p-3 border border-green-500/30 bg-green-500/10 text-green-500 text-sm uppercase tracking-wider text-center font-bold">
              👯‍♀️ ได้รับโปรโมชั่น &quot;ซื้อคู่&quot; จำนวน {pairs} คู่!
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6 text-white">
            <span className="uppercase tracking-widest font-bold">Total</span>
            <span className="text-2xl font-black">฿{totalPrice}</span>
          </div>
          
          <button 
            disabled={items.length === 0}
            onClick={() => { closeCart(); router.push("/checkout"); }}
            className="w-full bg-white text-black border border-transparent hover:bg-transparent hover:text-white hover:border-white py-5 font-black uppercase tracking-[0.4em] transition-all disabled:opacity-50 active:scale-[0.98] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] relative overflow-hidden cursor-pointer"
          >
            CONFIRM & PAY
          </button>
        </div>
      </div>
    </>
  );
}