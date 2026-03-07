"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FAQ_ITEMS = [
  { q: "Size เสื้อเป็นยังไง?", a: "Regular (T-SHIRT): S, M, L, XL, 2XL, 3XL, 4XL | Crop: S, M, L, XL กดปุ่ม Size Guide ด้านบนเพื่อดูตาราง size ครับ" },
  { q: "มีสินค้าพร้อมส่งมั้ย หรือพรีออเดอร์เท่านั้น?", a: "พรีออเดอร์เท่านั้นครับ ไม่มีสต็อกพร้อมส่ง" },
  { q: "มีรอบ 2 มั้ย?", a: "มีรอบนี้รอบเดียวเท่านั้นครับผม อย่าพลาดนะครับ!" },
  { q: "พรีออเดอร์แล้วรอนานแค่ไหน?", a: "รอการยืนยันระยะเวลาจากผู้ผลิต จะอัปเดตผ่าน LINE OA ครับ" },
  { q: "เช็คเลขพัสดุที่ไหน?", a: "เลขพัสดุจะส่งให้ทาง LINE ID หรือ IG ที่คุณให้ไว้ตอนสั่งครับ" },
  { q: "ค่าจัดส่งเท่าไหร่?", a: "ส่งฟรีทั่วประเทศทุกออเดอร์ครับ! (Free Shipping)" },
  { q: "สั่งผิดเปลี่ยนไซส์ได้มั้ย?", a: "ถ้าพรียังไม่ปิด สามารถติดต่อ LINE OA เพื่อขอเปลี่ยนได้เลยครับ" },
  { q: "ได้สินค้าผิดหรือมีตำหนิ ต้องทำยังไง?", a: "ถ่ายรูปสินค้าและติดต่อ LINE OA ของเราได้เลยครับ จะดูแลให้ครับ" },
  { q: "ชำระแล้วแต่ขอเปลี่ยนไซส์ได้มั้ย?", a: "ถ้ายังไม่ปิดพรี ติดต่อ LINE OA ได้เลยครับผม" },
  { q: "เริ่มส่งวันไหน?", a: "จะแจ้งให้ทราบผ่าน LINE OA และ Instagram ครับ" },
  { q: "ได้รับของประมาณวันไหน?", a: "3-5 วันทำการหลังจากส่ง (Kerry / Flash Express)" },
  { q: "มีปัญหาติดต่อที่ไหน?", a: "ติดต่อได้ที่ LINE OA ของเราได้เลยครับ (กดปุ่มด้านล่าง)" },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold uppercase tracking-widest text-xs text-white pr-4">{q}</span>
        <span className={`text-white/40 font-black text-lg transition-transform duration-300 shrink-0 ${open ? 'rotate-45' : 'rotate-0'}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPage() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState("T-SHIRT");
  const [selectedSize, setSelectedSize] = useState("L");
  const [cart, setCart] = useState<any[]>([]);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);
  const [promoTimeLeft, setPromoTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetDate = new Date("2026-03-14T18:00:00+07:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference <= 0) {
        setPromoTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(interval);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setPromoTimeLeft({ d, h, m, s });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto Swipe Slider
  useEffect(() => {
    const swipeInterval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(swipeInterval);
  }, []);

  const TSHIRT_IMAGES = ["/images/front.png", "/images/back.png", "/images/product-1.jpg", "/images/regular_actor1.jpg", "/images/regular_actor2.jpg"]; 
  const CROP_IMAGES = ["/images/front-crop.png", "/images/back-crop.png", "/images/product-2.jpg", "/images/crop_actor2.jpg", "/images/crop_actor.jpg"];   
  const productImages = selectedStyle === "T-SHIRT" ? TSHIRT_IMAGES : CROP_IMAGES;

  const PRICE_PER_UNIT = 329;
  const PROMO_PAIR_PRICE = 590;

  const REGULAR_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const CROP_SIZES = ["S", "M", "L", "XL"];
  const currentSizes = selectedStyle === "T-SHIRT" ? REGULAR_SIZES : CROP_SIZES;

  useEffect(() => {
    const savedCart = localStorage.getItem('lumora_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    if (!currentSizes.includes(selectedSize)) {
      setSelectedSize("L");
    }
  }, [selectedStyle, currentSizes, selectedSize]);

  const calculateCartTotal = (currentCart: any[]) => {
    const totalQty = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    const promoQty = Math.min(totalQty, 6); 
    const regularQty = totalQty - promoQty; 
    const pairs = Math.floor(promoQty / 2);
    const promoSingles = promoQty % 2;
    return (pairs * PROMO_PAIR_PRICE) + ((promoSingles + regularQty) * PRICE_PER_UNIT);
  };

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
    if (existingIndex > -1) newCart[existingIndex].quantity += 1;
    else newCart.push(newItem);
    setCart(newCart);
    localStorage.setItem('lumora_cart', JSON.stringify(newCart));
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('lumora_cart', JSON.stringify(newCart));
  };

  const proceedToCheckout = () => {
    const finalData = { items: cart, total: calculateCartTotal(cart) };
    localStorage.setItem('lumora_order', JSON.stringify(finalData));
    router.push('/checkout');
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: direction === 'left' ? -sliderRef.current.clientWidth : sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollToFAQ = () => {
    document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black pb-32">
      
      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedImg(null)} className="fixed inset-0 z-[100] bg-black/90 cursor-zoom-out flex items-center justify-center p-4">
            <img src={zoomedImg} className="max-w-full max-h-full object-contain" alt="Zoomed Product" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#e7e7e7] p-2 w-full max-w-xl relative shadow-2xl">
              <button onClick={() => setShowSizeChart(false)} className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-red-600 text-white text-lg md:text-xl w-8 h-8 md:w-10 md:h-10 rounded-full font-black shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-110 hover:bg-red-500 transition-all z-10 flex items-center justify-center">X</button>
              <img src={selectedStyle === "T-SHIRT" ? "/images/size-guide-regular.png" : "/images/size-guide-crop.png"} alt={`${selectedStyle} Size Guide`} className="w-full h-auto object-contain max-h-[85vh] md:max-h-none" /> 
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 w-full z-50 px-6 py-5 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.4em] hover:opacity-50 transition-opacity">[ Back ]</Link>
        <div className="absolute left-1/2 -translate-x-1/2 w-28 md:w-40">
          <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto brightness-125" />
        </div>
        <div className="w-10"></div>
      </header>

      <div className="pt-24 md:pt-28 px-4 md:px-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* LEFT: Image Slider */}
        <div className="lg:col-span-7 relative group">
          <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border border-white/10 relative bg-white">
            {productImages.map((img, idx) => (
              <div key={idx} className="min-w-full snap-center aspect-square cursor-zoom-in bg-white flex items-center justify-center p-1 md:p-2" onClick={() => setZoomedImg(img)}>
                <motion.img 
                  key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                  src={img} alt={`view-${idx}`} className="w-full h-full object-contain" 
                />
              </div>
            ))}
          </div>
          <button onClick={() => scrollSlider('left')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-3 border border-white/20 text-sm hover:bg-black transition-colors">←</button>
          <button onClick={() => scrollSlider('right')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-3 border border-white/20 text-sm hover:bg-black transition-colors">→</button>
          <p className="text-center text-[9px] text-gray-500 mt-3 uppercase tracking-[0.3em]">( Click image to zoom )</p>
        </div>

        {/* RIGHT: Product Info */}
        <div className="lg:col-span-5 space-y-7">
          <div>
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] tracking-[0.5em] text-gray-500 uppercase">Signature Collection</p>
              <button onClick={scrollToFAQ} className="text-[10px] tracking-[0.2em] border-b border-gray-500 text-gray-400 pb-1">Frequently Asked Questions</button>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic leading-tight tracking-tighter">TU LUMORA SERIES</h1>
          </div>

          {/* 🌟 7 Days Promo + Countdown Combined 🌟 */}
          <div className="relative overflow-hidden bg-[#050505] border border-white/10 rounded-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 blur-[60px] animate-pulse pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-800/20 blur-[60px] pointer-events-none" />
            
            <div className="p-5 sm:p-7 relative z-10 flex flex-col gap-6">
              
              {/* Header + Countdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <span className="animate-ping absolute w-full h-full rounded-full bg-red-500 opacity-60"></span>
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-[0.2em] text-white italic leading-none">7 DAYS EXCLUSIVE</h3>
                    <p className="text-[9px] text-gray-500 tracking-[0.3em] uppercase mt-1">Limited Time Offer</p>
                  </div>
                </div>

                {/* Cyberpunk/Sleek Countdown */}
                {promoTimeLeft && (
                  <div className="flex items-baseline justify-center sm:justify-end gap-2 bg-black/40 border border-white/10 px-4 py-2 self-start sm:self-auto">
                    <div className="text-center"><span className="text-lg md:text-xl font-black text-red-500 italic">{String(promoTimeLeft.d).padStart(2,'0')}</span><span className="text-[8px] text-gray-500 uppercase block -mt-1">Days</span></div><span className="text-white/20">:</span>
                    <div className="text-center"><span className="text-lg md:text-xl font-black text-white italic">{String(promoTimeLeft.h).padStart(2,'0')}</span><span className="text-[8px] text-gray-500 uppercase block -mt-1">Hrs</span></div><span className="text-white/20">:</span>
                    <div className="text-center"><span className="text-lg md:text-xl font-black text-white italic">{String(promoTimeLeft.m).padStart(2,'0')}</span><span className="text-[8px] text-gray-500 uppercase block -mt-1">Min</span></div><span className="text-white/20">:</span>
                    <div className="text-center"><span className="text-lg md:text-xl font-black text-red-500 italic">{String(promoTimeLeft.s).padStart(2,'0')}</span><span className="text-[8px] text-gray-500 uppercase block -mt-1">Sec</span></div>
                  </div>
                )}
              </div>

              {/* Tiers */}
              <div className="flex flex-col gap-3">
                <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold px-1">
                   Buy More, Save More (Max 6)
                </p>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                  <div className="flex flex-col justify-center items-center text-center border border-white/5 bg-white/[0.02] p-4 hover:border-white/20 transition-colors">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">1 ITEM</span>
                    <span className="text-lg font-black text-white italic mt-1">329.-</span>
                  </div>
                  <div className="flex flex-col justify-center items-center text-center border border-red-500/10 bg-red-500/[0.02] p-4 hover:border-red-500/30 transition-colors">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">2 ITEMS</span>
                    <span className="text-lg font-black text-white italic mt-1 bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">590.-</span>
                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">Save 68.-</span>
                  </div>
                  <div className="flex flex-col justify-center items-center text-center border border-red-500/20 bg-red-500/[0.04] p-4 hover:border-red-500/40 transition-colors">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">4 ITEMS</span>
                    <span className="text-lg font-black text-white italic mt-1 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">1,180.-</span>
                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">Save 136.-</span>
                  </div>
                  <div className="flex flex-col justify-center items-center text-center border border-red-500/40 bg-red-500/[0.08] p-4 relative overflow-hidden group hover:border-red-500 transition-colors cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent group-hover:from-red-600/20 transition-all"></div>
                    <span className="text-[10px] items-center gap-1 font-bold tracking-widest text-red-300 uppercase relative z-10 flex">
                      6 ITEMS <span className="text-[8px] bg-red-600/80 text-white px-1 py-0.5 rounded-sm">MAX</span>
                    </span>
                    <span className="text-xl font-black text-white italic mt-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] relative z-10">1,770.-</span>
                    <span className="text-[10px] text-white font-black bg-red-600 px-2 mt-1 relative z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]">SAVE 204.-</span>
                  </div>
                </div>
                <p className="text-[9px] text-red-500/60 font-bold tracking-[0.1em] uppercase text-right pt-1 opacity-70">
                  *Mix & Match T-Shirt and Crop Allowed
                </p>
              </div>
            </div>
          </div>

          {/* Style & Size */}
          <div className="space-y-5">
            <div className="flex gap-3">
              {["T-SHIRT", "CROP"].map((style) => (
                <button key={style} 
                  onClick={() => { setSelectedStyle(style); if(sliderRef.current) sliderRef.current.scrollTo({left:0}); }} 
                  className={`flex-1 py-4 border text-xs font-bold tracking-widest ${selectedStyle === style ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white/40'}`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Select Size</span>
                <button onClick={() => setShowSizeChart(true)} className="text-[10px] uppercase tracking-[0.2em] font-bold text-white underline decoration-white/30 underline-offset-4 flex items-center gap-2">
                  📏 Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {currentSizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 border text-xs font-bold ${selectedSize === size ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white/40'}`}>{size}</button>
                ))}
              </div>
            </div>

            <button onClick={addToCart} className="w-full bg-white text-black py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-gray-200 transition-all">
              + Add To Squad
            </button>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Your Squad List</h3>
                <button onClick={() => { setCart([]); localStorage.removeItem('lumora_cart'); }} className="text-[10px] font-bold tracking-widest uppercase text-red-500 hover:text-white transition-colors underline decoration-red-500/30 underline-offset-4">
                  Clear All
                </button>
              </div>
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0a0a0a] p-4 border border-white/5">
                    <div>
                      <p className="font-bold text-xs italic">{item.title} ({item.size})</p>
                      <p className="text-[11px] font-black tracking-widest text-white mt-1">x{item.quantity}</p>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-xs opacity-40 hover:opacity-100 uppercase tracking-widest text-red-500">[ Remove ]</button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
                  <span className="text-4xl font-black italic text-white">฿{calculateCartTotal(cart)}</span>
                </div>
                <button onClick={proceedToCheckout} className="w-full bg-white text-black border border-transparent hover:bg-transparent hover:text-white hover:border-white py-6 font-black uppercase tracking-[0.5em] text-sm transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  CONTINUE AND PAY
                </button>
              </div>
            </div>
          )}
          
          {/* PRODUCT DETAIL */}
          <div className="pt-6 border-t border-white/10 text-xs text-gray-400 space-y-2 font-mono">
            <p className="text-white uppercase tracking-widest font-bold mb-4 text-[10px]">Product Detail</p>
            <p>— Fabric: 100% Premium Cotton Comb 20</p>
            <p>— Print: High-Quality Silk Screen</p>
            <p>— Fit: T-Shirt / Crop</p>
            <p>— Tag: Custom TU LUMORA Woven Label</p>
            <p className="text-gray-600 pt-2 border-t border-white/5">— Fabric Care: Hand wash or machine wash cold / Do not bleach / Hang dry / Do not tumble dry / Iron on low heat, avoid print area</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div id="faq-section" className="max-w-3xl mx-auto px-4 md:px-6 mt-28 space-y-6 pb-16">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase text-center tracking-tighter mb-10">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, idx) => (
            <FAQItem key={idx} q={item.q} a={item.a} />
          ))}
        </div>

        <div className="pt-10 text-center flex flex-col items-center gap-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Need more help?</p>
          <a href="https://lin.ee/19k0kWS" target="_blank" className="flex items-center gap-2 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-bold uppercase tracking-widest text-xs px-8 py-4 transition-all">
            💬 Contact via LINE OA
          </a>
        </div>
      </div>

    </main>
  );
}