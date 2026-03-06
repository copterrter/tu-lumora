"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState("T-SHIRT"); // เปลี่ยนจาก BOXY เป็น T-SHIRT แล้ว
  const [selectedSize, setSelectedSize] = useState("L");
  const sliderRef = useRef<HTMLDivElement>(null);

  const PRICE_PER_UNIT = 329;
  const PROMO_PAIR_PRICE = 590;

  const productImages = ["/images/work1.jpg", "/images/work2.jpg", "/images/work3.jpg", "/images/squad.jpg"];

  // Logic เปลี่ยนชื่อสินค้าตามสไตล์
  const productTitle = selectedStyle === "T-SHIRT" 
    ? "TU LUMORA - BLACK T-SHIRT" 
    : "TU LUMORA - BLACK CROP";

  const calculateTotal = () => {
    const pairs = Math.floor(quantity / 2);
    const singles = quantity % 2;
    return (pairs * PROMO_PAIR_PRICE) + (singles * PRICE_PER_UNIT);
  };

  const totalSaved = (quantity * PRICE_PER_UNIT) - calculateTotal();

  // ฟังก์ชัน Add to Squad แล้วไปหน้า Checkout ทันที
  const handleAddToSquad = () => {
    const orderData = {
      title: productTitle,
      quantity,
      style: selectedStyle,
      size: selectedSize,
      total: calculateTotal(),
      saved: totalSaved
    };
    localStorage.setItem('lumora_order', JSON.stringify(orderData));
    router.push('/checkout');
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      
      {/* Header: Back Button & Center Logo */}
      <header className="fixed top-0 w-full z-50 px-6 py-8 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md">
        <a href="/" className="text-[10px] font-bold uppercase tracking-[0.4em] hover:opacity-50 transition-opacity">
          [ Back ]
        </a>
        <div className="absolute left-1/2 -translate-x-1/2 w-32 md:w-44">
          <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto brightness-125" />
        </div>
        <div className="w-10"></div>
      </header>

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 1. ส่วนรูปภาพ (Horizontal Slider ตามบรีฟ) */}
        <div className="lg:col-span-7 relative group">
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth border border-white/10"
          >
            {productImages.map((img, idx) => (
              <div key={idx} className="min-w-full snap-center aspect-[3/4]">
                <img src={img} alt={`view-${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          <button onClick={() => scrollSlider('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-4 border border-white/20 hover:bg-white hover:text-black transition-all">←</button>
          <button onClick={() => scrollSlider('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-4 border border-white/20 hover:bg-white hover:text-black transition-all">→</button>
        </div>

        {/* 2. ส่วนรายละเอียดสินค้า */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-[10px] tracking-[0.5em] text-gray-500 uppercase mb-4">Signature Collection</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-tight tracking-tighter">
              {productTitle}
            </h1>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-black italic">฿{calculateTotal()}</span>
            {totalSaved > 0 && (
              <span className="text-xl text-gray-600 line-through font-bold">฿{quantity * 329}</span>
            )}
          </div>

          {/* โปรโมชั่น */}
          <div className="bg-[#111] border-l-4 border-white p-6">
            <p className="text-sm font-bold uppercase tracking-wider mb-1">⚡️ SQUAD PROMO: ซื้อคู่คุ้มกว่า</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">2 ตัวเพียง ฿590 (ประหยัด ฿68)</p>
          </div>

          {/* เลือกสไตล์ (T-SHIRT / CROP) */}
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Select Style</span>
            <div className="flex gap-4">
              {["T-SHIRT", "CROP"].map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`flex-1 py-4 border text-xs font-bold tracking-widest transition-all ${selectedStyle === style ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* เลือกไซส์ */}
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Select Size</span>
            <div className="grid grid-cols-4 gap-2">
              {["S", "M", "L", "XL", "2XL", "3XL", "4XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 border text-xs font-bold transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* จำนวนและปุ่มสั่งซื้อ */}
          <div className="pt-8 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center border border-white/20 px-6 py-3 gap-8">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl">-</button>
                <span className="text-xl font-black">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-xl">+</button>
              </div>
              
              <AnimatePresence>
                {totalSaved > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">You Saved</p>
                    <p className="text-lg font-black text-white italic">฿{totalSaved}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleAddToSquad}
              className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.5em] text-sm hover:invert transition-all duration-500"
            >
              Add To Squad
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}