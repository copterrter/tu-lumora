"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState("T-SHIRT");
  const [selectedSize, setSelectedSize] = useState("L");
  const [cart, setCart] = useState<any[]>([]); // ระบบตะกร้าเก็บของ
  const sliderRef = useRef<HTMLDivElement>(null);

  // 🌟 1. เปลี่ยนรูปตรงนี้เลยครับ! ใช้ชื่อไฟล์ที่คุณเตรียมไว้สำหรับหน้าโปรดักโดยเฉพาะ
  const productImages = ["/images/product-1.jpg", "/images/product-2.jpg", "/images/product-3.jpg", "/images/product-4.jpg"];

  const PRICE_PER_UNIT = 1;
  const PROMO_PAIR_PRICE = 590;

  // โหลดข้อมูลตะกร้าจาก LocalStorage (ถ้ามี)
  useEffect(() => {
    const savedCart = localStorage.getItem('lumora_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // 🌟 2. ระบบคำนวณเงินแบบผสม (Mixed Promo Logic)
  const calculateCartTotal = (currentCart: any[]) => {
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    const pairs = Math.floor(totalItems / 2);
    const singles = totalItems % 2;
    return (pairs * PROMO_PAIR_PRICE) + (singles * PRICE_PER_UNIT);
  };

  // เพิ่มสินค้าลงตะกร้า (รองรับคละแบบ)
  const addToCart = () => {
    const newItem = {
      id: `${selectedStyle}-${selectedSize}`,
      title: `TU LUMORA - ${selectedStyle}`,
      style: selectedStyle,
      size: selectedSize,
      quantity: 1
    };

    let newCart = [...cart];
    const existingIndex = newCart.findIndex(item => item.id === newItem.id);

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push(newItem);
    }

    setCart(newCart);
    localStorage.setItem('lumora_cart', JSON.stringify(newCart));
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('lumora_cart', JSON.stringify(newCart));
  };

  const proceedToCheckout = () => {
    const finalData = {
      items: cart,
      total: calculateCartTotal(cart)
    };
    localStorage.setItem('lumora_order', JSON.stringify(finalData));
    router.push('/checkout');
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <header className="fixed top-0 w-full z-50 px-6 py-8 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md">
        <a href="/" className="text-[10px] font-bold uppercase tracking-[0.4em] hover:opacity-50 transition-opacity">[ Back ]</a>
        <div className="absolute left-1/2 -translate-x-1/2 w-32 md:w-44">
          <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto brightness-125" />
        </div>
        <div className="w-10"></div>
      </header>

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 relative">
          <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border border-white/10">
            {productImages.map((img, idx) => (
              <div key={idx} className="min-w-full snap-center aspect-[3/4]">
                <img src={img} alt={`view-${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <button onClick={() => scrollSlider('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-4 border border-white/20">←</button>
          <button onClick={() => scrollSlider('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-4 border border-white/20">→</button>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-[10px] tracking-[0.5em] text-gray-500 uppercase mb-4">Signature Collection</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-tight tracking-tighter">TU LUMORA SERIES</h1>
          </div>

          <div className="bg-[#111] border-l-4 border-white p-6">
            <p className="text-sm font-bold uppercase tracking-wider">⚡️ SQUAD PROMO: 2 ตัว 590.- (คละได้!)</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              {["T-SHIRT", "CROP"].map((style) => (
                <button key={style} onClick={() => setSelectedStyle(style)} className={`flex-1 py-4 border text-xs font-bold ${selectedStyle === style ? 'bg-white text-black border-white' : 'border-white/20'}`}>{style}</button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["S", "M", "L", "XL", "2XL", "3XL", "4XL"].map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 border text-xs font-bold ${selectedSize === size ? 'bg-white text-black border-white' : 'border-white/20'}`}>{size}</button>
              ))}
            </div>
            <button onClick={addToCart} className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.3em] text-xs hover:bg-gray-200 transition-all">+ Add To Squad</button>
          </div>

          {/* ตะกร้าสินค้า (Squad List) */}
          <div className="pt-8 border-t border-white/10">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 mb-6 uppercase">Your Squad List</h3>
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#0a0a0a] p-4 border border-white/5">
                  <div>
                    <p className="font-bold text-xs italic">{item.title} ({item.size})</p>
                    <p className="text-[10px] text-gray-500">QTY: {item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(idx)} className="text-xs opacity-50 hover:opacity-100 uppercase tracking-widest">[ Remove ]</button>
                </div>
              ))}
            </div>
            
            {cart.length > 0 && (
              <div className="mt-10 space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
                  <span className="text-4xl font-black italic text-white">฿{calculateCartTotal(cart)}</span>
                </div>
                <button onClick={proceedToCheckout} className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.5em] text-sm hover:invert transition-all">Proceed to Checkout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}