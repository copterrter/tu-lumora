"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateTotalForCart, getCurrentPhase } from "@/lib/pricing";

const FAQ_ITEMS = [
  { q: "Size เสื้อเป็นยังไง?", a: "Regular (T-SHIRT): S, M, L, XL, 2XL, 3XL | Crop: S, M, L, XL กดปุ่ม Size Guide ด้านบนเพื่อดูตาราง size ครับ" },
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
  const [promoTimeLeft, setPromoTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);

  // Flash sale 1 countdown (ใช้แค่ช่วยบอกเวลา phase แรก)
  useEffect(() => {
    const targetDate = new Date("2026-03-14T23:59:59+07:00").getTime();
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

  const REGULAR_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
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

  const phase = getCurrentPhase();
  const isClosed = phase === "closed";

  const calculateCartTotal = (currentCart: any[]) => {
    const { total } = calculateTotalForCart(currentCart);
    return total;
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
    setLastAddedItem(`${selectedStyle} • Size ${selectedSize}`);
    setTimeout(() => {
      setLastAddedItem((prev) => (prev === `${selectedStyle} • Size ${selectedSize}` ? null : prev));
    }, 2000);
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

          {/* Dynamic Promo / Pricing Box by Phase */}
          {!isClosed && (
            <div className="relative">
              <div className="absolute -inset-[2px] bg-gradient-to-r from-red-600 via-red-400 to-red-600 rounded-sm opacity-70 blur-[3px] animate-pulse pointer-events-none" />
              <div className="absolute -inset-[1px] bg-gradient-to-br from-red-500/40 to-transparent rounded-sm pointer-events-none" />

              <div className="relative overflow-hidden bg-[#060606] border border-red-500/30 rounded-sm shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-red-600/25 blur-[80px] animate-pulse pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-red-900/25 blur-[80px] pointer-events-none" />

                {/* Top badge by phase */}
                <div
                  className={
                    "flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-5 py-2 sm:py-3 gap-1 sm:gap-4 " +
                    (phase === "flash2"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-700"
                      : phase === "normal"
                      ? "bg-gradient-to-r from-slate-600 to-slate-800"
                      : "bg-gradient-to-r from-red-600 to-red-800")
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] relative shrink-0" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white">
                      {phase === "flash1" && "⚡ FLASH DEAL — ROUND I"}
                      {phase === "normal" && "STANDARD PRICE WINDOW"}
                      {phase === "flash2" && "⚡ FLASH DEAL — ROUND II (299.-)"}
                    </span>
                  </div>
                  {phase !== "normal" && (
                    <span className="text-[9px] font-bold text-red-200 uppercase tracking-widest sm:shrink-0 hidden sm:block">
                      Limited Time Only
                    </span>
                  )}
                </div>

                <div className="p-3 sm:p-7 relative z-10 flex flex-col gap-4 sm:gap-6">
                  {/* Flash 1: ใช้โปรคู่ 590 สูงสุด 6 ตัว + countdown */}
                  {phase === "flash1" && (
                    <>
                      {promoTimeLeft && (
                        <div className="flex flex-col items-center gap-1.5 py-1 sm:py-3">
                          <p className="text-[8px] sm:text-[9px] text-red-400/70 uppercase tracking-[0.4em] font-bold">
                            Offer Ends In
                          </p>
                          <div className="flex items-center gap-1.5 sm:gap-4">
                            {[
                              { value: promoTimeLeft.d, label: "D" },
                              { value: promoTimeLeft.h, label: "H" },
                              { value: promoTimeLeft.m, label: "M" },
                              { value: promoTimeLeft.s, label: "S" },
                            ].map((unit, i) => (
                              <div key={i} className="flex items-center gap-1.5 sm:gap-4">
                                <div className="flex flex-col items-center bg-black/60 border border-red-500/30 px-2 py-1.5 sm:px-5 sm:py-3 min-w-[38px] sm:min-w-[64px] shadow-[0_0_14px_rgba(239,68,68,0.15)]">
                                  <span
                                    className={`text-xl sm:text-4xl font-black italic tabular-nums leading-none ${
                                      i === 0 || i === 3 ? "text-red-400" : "text-white"
                                    } drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]`}
                                  >
                                    {String(unit.value).padStart(2, "0")}
                                  </span>
                                  <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">
                                    {unit.label}
                                  </span>
                                </div>
                                {i < 3 && (
                                  <span className="text-red-500/60 font-black text-base sm:text-xl -mt-2 sm:-mt-3">
                                    :
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold px-1">
                          Buy More, Save More (Max 6)
                        </p>
                        <div className="grid grid-cols-4 gap-1 sm:gap-2">
                          <div className="flex flex-col justify-center items-center text-center border border-white/5 bg-white/[0.02] p-2 sm:p-4 hover:border-white/20 transition-colors">
                            <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                              1
                            </span>
                            <span className="text-sm sm:text-lg font-black text-white italic mt-0.5 sm:mt-1">
                              329.-
                            </span>
                          </div>
                          <div className="flex flex-col justify-center items-center text-center border border-red-500/10 bg-red-500/[0.02] p-2 sm:p-4 hover:border-red-500/30 transition-colors">
                            <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                              2
                            </span>
                            <span className="text-sm sm:text-lg font-black text-white italic mt-0.5 sm:mt-1 bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
                              590.-
                            </span>
                            <span className="text-[7px] sm:text-[9px] text-red-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                              -68
                            </span>
                          </div>
                          <div className="flex flex-col justify-center items-center text-center border border-red-500/20 bg-red-500/[0.04] p-2 sm:p-4 hover:border-red-500/40 transition-colors">
                            <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                              4
                            </span>
                            <span className="text-sm sm:text-lg font-black text-white italic mt-0.5 sm:mt-1 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
                              1,180.-
                            </span>
                            <span className="text-[7px] sm:text-[9px] text-red-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                              -136
                            </span>
                          </div>
                          <div className="flex flex-col justify-center items-center text-center border border-red-500/40 bg-red-500/[0.08] p-2 sm:p-4 relative overflow-hidden group hover:border-red-500 transition-colors cursor-default">
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent group-hover:from-red-600/20 transition-all"></div>
                            <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-red-300 uppercase relative z-10">
                              6 MAX
                            </span>
                            <span className="text-sm sm:text-xl font-black text-white italic mt-0.5 sm:mt-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] relative z-10">
                              1,770.-
                            </span>
                            <span className="text-[7px] sm:text-[10px] text-white font-black bg-red-600 px-1 sm:px-2 mt-0.5 sm:mt-1 relative z-10">
                              -204
                            </span>
                          </div>
                        </div>
                        <p className="text-[8px] text-red-500/60 font-bold tracking-[0.1em] uppercase text-right pt-0.5 opacity-70">
                          *Mix & Match T-Shirt and Crop Allowed
                        </p>
                      </div>
                    </>
                  )}

                  {/* Normal window: 329 flat */}
                  {phase === "normal" && (
                    <div className="space-y-3">
                      <p className="text-[9px] sm:text-[10px] text-gray-300 tracking-[0.2em] uppercase font-bold px-1">
                        Regular Price Window
                      </p>
                      <div className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3">
                        <span className="text-xs text-gray-400 tracking-[0.2em] uppercase">
                          1–6 Units
                        </span>
                        <span className="text-2xl font-black italic text-white">329.- / pc</span>
                      </div>
                      <p className="text-[8px] text-gray-500 tracking-[0.2em] uppercase text-right">
                        No bundle discount in this window
                      </p>
                    </div>
                  )}

                  {/* Flash 2: 299 flat */}
                  {phase === "flash2" && (
                    <div className="space-y-4">
                      <p className="text-[9px] sm:text-[10px] text-emerald-100 tracking-[0.2em] uppercase font-bold px-1">
                        Flash Sale Round II — Flat Price
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-between border border-emerald-400/40 bg-emerald-500/10 px-4 py-4 gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                        <div className="text-left">
                          <p className="text-[9px] text-emerald-200 uppercase tracking-[0.25em]">
                            Any Style / Any Size
                          </p>
                          <p className="text-xs text-emerald-100">
                            Single flat price — no minimum, up to 6 units.
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em]">
                            Now only
                          </p>
                          <p className="text-3xl sm:text-4xl font-black italic text-emerald-200 drop-shadow-[0_0_18px_rgba(16,185,129,0.8)]">
                            299.-
                          </p>
                          <p className="text-[9px] text-emerald-300 tracking-[0.25em] uppercase">
                            per piece
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Style & Size */}
          <div className="space-y-5">
            <div className="flex gap-3">
              {["T-SHIRT", "CROP"].map((style) => (
                <button key={style}
                  onClick={() => { setSelectedStyle(style); if (sliderRef.current) sliderRef.current.scrollTo({ left: 0 }); }}
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

            <div className="space-y-2">
              <button
                onClick={addToCart}
                disabled={isClosed}
                className={`w-full py-5 font-black uppercase tracking-[0.3em] text-xs transition-all ${
                  isClosed
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {isClosed ? "PRE-ORDER CLOSED" : "+ Add To Squad"}
              </button>
              {isClosed && (
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                  รอบพรีออเดอร์สิ้นสุดแล้ว ขอบคุณทุกการสนับสนุน
                </p>
              )}
              {!isClosed && lastAddedItem && (
                <p className="text-[10px] text-green-400 uppercase tracking-[0.2em]">
                  ✓ เพิ่มสินค้าแล้ว: <span className="text-white">{lastAddedItem}</span>
                </p>
              )}
            </div>
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
                      <p className="font-bold text-xs italic">[PRE-ORDER] TU LUMORA {item.style} ({item.size})</p>
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
            <p>— Fabric: 100% PolyCotton</p>
            <p>— Print: Silk Screen</p>
            <p>— Fit: Regular / Crop</p>
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