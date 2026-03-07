"use client";
import { Menu, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "../../store/useCart";
import Cart from "../../components/Cart";

export default function Showcase() {
  const router = useRouter();
  const { items, openCart } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // สร้างอาร์เรย์รูปภาพจำลองสำหรับสไลด์ด้านล่าง (ใส่รูป hero.jpg ซ้ำไปก่อน)
  const galleryImages = [
    "/images/look1.jpg",
    "/images/look2.jpg",
    "/images/hero.jpg",
    "/images/hero.jpg",
    "/images/hero.jpg",
  ];

  return (
    <main className="min-h-screen bg-black text-white pb-20 overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* 0. แอบใส่ตะกร้าไว้เผื่อลูกค้ากดเปิดจากหน้านี้ */}
      <Cart />

      {/* 1. Header (Navbar) - ใส่ Mascot ตรงกลาง */}
      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-black/80 backdrop-blur-md border-b border-gray-900">
        <button className="relative hover:opacity-70 transition-opacity bg-transparent outline-none border-none p-0 cursor-pointer">
          <Menu size={32} color="white" />
        </button>

        {/* โลโก้ Mascot ตรงกลาง กดแล้วกลับหน้าแรกได้ */}
        <img 
          src="/images/mascot.png" 
          alt="TU LUMORA Mascot" 
          onClick={() => router.push("/")}
          className="h-12 md:h-16 w-auto object-contain cursor-pointer transition-transform duration-300 drop-shadow-lg"
        />

        <button 
          onClick={openCart}
          className="relative hover:opacity-70 transition-opacity bg-transparent outline-none border-none p-0 cursor-pointer"
        >
          <ShoppingCart size={32} color="white" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* 2. เนื้อหาหน้า Showcase */}
      <div className="pt-28 px-4 md:px-8 max-w-[2000px] mx-auto">

        {/* --- รูปแรก (Main Look) โชว์คนตรงกลาง --- */}
        <div 
          onClick={() => router.push("/product")}
          className="group relative w-full h-[70vh] md:h-[85vh] overflow-hidden cursor-pointer mb-8 md:mb-16 border border-gray-900"
        >
          {/* พื้นหลังรูป */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1500ms] group-hover:scale-105"
            style={{ backgroundImage: "url('/images/look1.jpg')" }}
          />
          
          {/* เลเยอร์สีดำบางๆ บังตอน Hover + เอฟเฟกต์ Pop-up */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center backdrop-blur-[2px]">
            <div className="translate-y-12 group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6 drop-shadow-2xl">
                The Signature Look
              </h2>
              <button className="bg-white text-black px-10 py-4 font-black uppercase tracking-widest hover:bg-gray-300 transition-colors">
                Shop This Look
              </button>
            </div>
          </div>
        </div>

        {/* --- โซนแกลอรี่เลื่อนไหลไปเรื่อยๆ (Horizontal Flow) --- */}
        <div className="mb-4 flex items-center justify-between px-2">
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">More Looks</h3>
          <span className="text-xs uppercase tracking-widest text-gray-600">Swipe &rarr;</span>
        </div>
        
        {/* แถบสไลด์รูป (ซ่อน Scrollbar แบบเนียนๆ) */}
        <div className="flex overflow-x-auto gap-4 md:gap-8 pb-8 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {galleryImages.map((src, index) => (
            <div 
              key={index}
              onClick={() => router.push("/product")}
              className="shrink-0 w-[85vw] md:w-[45vw] lg:w-[30vw] h-[50vh] md:h-[60vh] relative group cursor-pointer snap-center border border-gray-900 overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                style={{ backgroundImage: `url('${src}')` }} 
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="border border-white text-white px-8 py-3 uppercase tracking-widest text-sm backdrop-blur-sm hover:bg-white hover:text-black transition-colors">
                  View Detail
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}