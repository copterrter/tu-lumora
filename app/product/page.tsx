"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState("T-SHIRT");
  const [selectedSize, setSelectedSize] = useState("L");
  const [cart, setCart] = useState<any[]>([]);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  const TSHIRT_IMAGES = ["/images/product-1.jpg", "/images/couple.jpg"]; 
  const CROP_IMAGES = ["/images/product-2.jpg", "/images/couple.jpg"];   
  const productImages = selectedStyle === "T-SHIRT" ? TSHIRT_IMAGES : CROP_IMAGES;

  const PRICE_PER_UNIT = 329;
  const PROMO_PAIR_PRICE = 590;

  // 🌟 Dynamic Sizes Data 🌟
  const REGULAR_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const CROP_SIZES = ["S", "M", "L", "XL"];
  const currentSizes = selectedStyle === "T-SHIRT" ? REGULAR_SIZES : CROP_SIZES;

  useEffect(() => {
    const savedCart = localStorage.getItem('lumora_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Reset selected size if switching styles and the current size is no longer available
  useEffect(() => {
    if (!currentSizes.includes(selectedSize)) {
      setSelectedSize("L"); // default safe fallback
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
      const scrollAmount = sliderRef.current.clientWidth;
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToFAQ = () => {
    document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black pb-32">
      
      <AnimatePresence>
        {zoomedImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedImg(null)} className="fixed inset-0 z-[100] bg-black/90 cursor-zoom-out flex items-center justify-center p-4">
            <img src={zoomedImg} className="max-w-full max-h-full object-contain" alt="Zoomed Product" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSizeChart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#e7e7e7] p-2 w-full max-w-xl relative shadow-2xl">
              <button 
                onClick={() => setShowSizeChart(false)} 
                className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-red-600 text-white text-lg md:text-xl w-8 h-8 md:w-10 md:h-10 rounded-full font-black shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-110 hover:bg-red-500 transition-all z-10 flex items-center justify-center"
              >
                X
              </button>
              <img 
                src={selectedStyle === "T-SHIRT" ? "/images/size-guide-regular.png" : "/images/size-guide-crop.png"} 
                alt={`${selectedStyle} Size Guide`} 
                className="w-full h-auto object-contain max-h-[85vh] md:max-h-none" 
              /> 
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 w-full z-50 px-6 py-8 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.4em] hover:opacity-50 transition-opacity">[ Back ]</Link>
        <div className="absolute left-1/2 -translate-x-1/2 w-32 md:w-44">
          <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto brightness-125" />
        </div>
        <div className="w-10"></div>
      </header>

      <div className="pt-24 md:pt-32 px-6 md:px-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        <div className="lg:col-span-7 relative group">
          <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border border-white/10 relative">
            {productImages.map((img, idx) => (
              <div key={idx} className="min-w-full snap-center aspect-[3/4] cursor-zoom-in" onClick={() => setZoomedImg(img)}>
                <motion.img 
                  key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeInOut" }}
                  src={img} alt={`view-${idx}`} className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
          <button onClick={() => scrollSlider('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-4 border border-white/20">←</button>
          <button onClick={() => scrollSlider('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-4 border border-white/20">→</button>
          <p className="text-center text-[9px] text-gray-500 mt-4 uppercase tracking-[0.3em]">( Click image to zoom )</p>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] tracking-[0.5em] text-gray-500 uppercase">Signature Collection</p>
               <button onClick={scrollToFAQ} className="text-[10px] tracking-[0.2em] border-b border-gray-500 text-gray-400 pb-1">Q&A / FAQ</button>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic leading-tight tracking-tighter">TU LUMORA SERIES</h1>
          </div>

          <div className="bg-white text-black p-4 text-center border-l-4 border-black border-y border-r flex flex-col gap-1 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 blur-2xl opacity-20 animate-pulse"></div>
             <p className="text-[10px] uppercase font-black tracking-[0.4em]">Pre-Order Period</p>
             <p className="text-lg font-black italic tracking-widest">7 - 20 MAR 2026</p>
          </div>

          {/* 🌟 Premium Promotion Banner 🌟 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-950 to-black border border-red-500/30 p-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-[80px] opacity-30 animate-pulse"></div>
            
            <div className="bg-black/40 backdrop-blur-md p-5 sm:p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-white italic">
                  7 Days Exclusive
                </h3>
              </div>
              
              <p className="text-[10px] sm:text-xs text-red-400/80 tracking-[0.2em] uppercase font-bold mb-4">
                ( Max 6 items per order • Mix & Match allowed )
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {/* Tier 1 */}
                <div className="flex justify-between items-center border border-white/10 p-3 hover:border-red-500/50 transition-colors">
                  <span className="text-xs font-bold text-gray-300">1 ITEM</span>
                  <span className="text-sm font-black text-white">329.-</span>
                </div>
                {/* Tier 2 */}
                <div className="flex justify-between items-center border border-white/10 p-3 bg-red-500/5 hover:border-red-500/50 transition-colors relative overflow-hidden">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-300">2 ITEMS</span>
                    <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">Save 68.-</span>
                  </div>
                  <span className="text-sm font-black text-white">590.-</span>
                </div>
                {/* Tier 3 */}
                <div className="flex justify-between items-center border border-white/10 p-3 bg-red-500/10 hover:border-red-500/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-300">4 ITEMS</span>
                    <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">Save 136.-</span>
                  </div>
                  <span className="text-sm font-black text-white">1,180.-</span>
                </div>
                {/* Tier 4 */}
                <div className="flex justify-between items-center border border-red-500/30 p-3 bg-red-500/20 hover:border-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-red-200">6 ITEMS <span className="text-[9px] text-red-500 ml-1">(MAX)</span></span>
                    <span className="text-[9px] text-green-400 font-black uppercase tracking-wider">Save 204.-</span>
                  </div>
                  <span className="text-base font-black text-white drop-shadow-md">1,770.-</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              {["T-SHIRT", "CROP"].map((style) => (
                <button key={style} onClick={() => { setSelectedStyle(style); if(sliderRef.current) sliderRef.current.scrollTo({left:0}); }} className={`flex-1 py-4 border text-xs font-bold ${selectedStyle === style ? 'bg-white text-black border-white' : 'border-white/20'}`}>{style}</button>
              ))}
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Select Size</span>
                  <button onClick={() => setShowSizeChart(true)} className="text-[10px] uppercase tracking-[0.2em] font-bold text-white underline decoration-white/30 underline-offset-4 flex items-center gap-2">
                     📏 Size Guide
                  </button>
               </div>
               <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                 {currentSizes.map((size) => (
                   <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 border text-xs font-bold ${selectedSize === size ? 'bg-white text-black border-white' : 'border-white/20'}`}>{size}</button>
                 ))}
               </div>
            </div>

            <button onClick={addToCart} className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.3em] text-xs hover:bg-gray-200 transition-all">+ Add To Squad</button>
          </div>

          {cart.length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Your Squad List</h3>
                <button onClick={() => { setCart([]); localStorage.removeItem('lumora_cart'); }} className="text-[10px] font-bold tracking-widest uppercase text-red-500 hover:text-white transition-colors underline decoration-red-500/30 underline-offset-4">
                  Clear All
                </button>
              </div>
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0a0a0a] p-4 border border-white/5">
                    <div>
                      <p className="font-bold text-xs italic">{item.title} ({item.size})</p>
                      <p className="text-[11px] font-black tracking-widest text-white mt-1">x{item.quantity}</p>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-xs opacity-50 hover:opacity-100 uppercase tracking-widest text-red-500">[ Remove ]</button>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
                  <span className="text-4xl font-black italic text-white">฿{calculateCartTotal(cart)}</span>
                </div>
                <button onClick={proceedToCheckout} className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.5em] text-sm hover:invert transition-all">Proceed to Checkout</button>
              </div>
            </div>
          )}
          
          <div className="pt-8 border-t border-white/10 text-xs text-gray-400 space-y-2 font-mono">
            <p className="text-white uppercase tracking-widest font-bold mb-4 text-[10px]">Product Specifications</p>
            <p>- Fabric: 100% Premium Cotton Comb 20</p>
            <p>- Print: High-Quality Silk Screen</p>
            <p>- Fit: Boxy Oversized (T-Shirt) / Fitted (Crop)</p>
            <p>- Tag: Custom TU LUMORA Woven Label</p>
          </div>
        </div>
      </div>

      <div id="faq-section" className="max-w-4xl mx-auto px-6 mt-32 space-y-8">
         <h2 className="text-3xl font-black italic uppercase text-center tracking-tighter mb-12">FAQ / Q&A</h2>
         
         <div className="space-y-6">
            <div className="border border-white/10 p-6 bg-[#0a0a0a]">
               <h4 className="font-bold uppercase tracking-widest text-sm mb-2 text-white">Q: รอของนานไหม จัดส่งเมื่อไหร่?</h4>
               <p className="text-xs text-gray-400 leading-relaxed">A: สินค้าเป็นพรีออเดอร์ จะเริ่มจัดส่งภายใน 7-14 วันทำการหลังจากปิดรับออเดอร์ในวันที่ 20 มี.ค. 69 ครับผม</p>
            </div>
            <div className="border border-white/10 p-6 bg-[#0a0a0a]">
               <h4 className="font-bold uppercase tracking-widest text-sm mb-2 text-white">Q: โปรโมชั่น 2 ตัว 590 คละไซส์ คละแบบได้ไหม?</h4>
               <p className="text-xs text-gray-400 leading-relaxed">A: คละได้เต็มที่เลยครับ! จะเอา T-Shirt 1 ตัว + Crop 1 ตัว ก็ได้ราคาโปรโมชั่น (จำกัดสิทธิ์ส่วนลดสูงสุด 6 ตัวต่อออเดอร์)</p>
            </div>
            <div className="border border-white/10 p-6 bg-[#0a0a0a]">
               <h4 className="font-bold uppercase tracking-widest text-sm mb-2 text-white">Q: มีค่าจัดส่งไหม?</h4>
               <p className="text-xs text-gray-400 leading-relaxed">A: จัดส่งฟรีทั่วประเทศ (Free Shipping) ทุกออเดอร์ครับ!</p>
            </div>
         </div>

         <div className="pt-12 text-center flex flex-col items-center gap-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Need more help?</p>
             <a href="https://lin.ee/19k0kWS" target="_blank" className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase tracking-widest text-xs px-8 py-4 transition-all inline-block">
               Contact via LINE OA
            </a>
         </div>
      </div>
    </main>
  );
}