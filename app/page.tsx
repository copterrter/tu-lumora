"use client";
import { useState, useEffect } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { AnimatePresence, motion } from "framer-motion";
import Preloader from "../components/Preloader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // จัดการเรื่องการ Scroll ขณะที่ยังโหลดไม่เสร็จ
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isLoading]);

  return (
    <>
      {/* ด่าน 1: Preloader (ยังคงไว้ตามความต้องการล่าสุด) */}
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <ReactLenis root>
        <main className="bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black">
          
          {/* ด่านที่ 2 (ย้ายวิดีโอมาเป็นหน้าแรก): Hero Showcase */}
          <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
              <source src="/bg-video.mp4" type="video/mp4" />
            </video>
            
            {/* ปุ่ม Shop Collection อยู่ตรงกลางหน้าจอตามบรีฟ */}
            <div className="z-10 flex flex-col items-center">
              <motion.a 
                href="/product"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.5, duration: 1 }}
                className="group relative px-16 py-5 border border-white overflow-hidden transition-all duration-500 hover:border-transparent"
              >
                <span className="relative z-10 text-sm font-black uppercase tracking-[0.6em] group-hover:text-black transition-colors duration-500">
                  Shop Collection
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              </motion.a>
            </div>
          </section>

          {/* ด่านที่ 3: Join our #lumosquad */}
          <section className="h-screen flex items-center justify-center relative overflow-hidden bg-black border-y border-white/5">
            <img 
              src="/images/squad.jpg" 
              alt="Lumosquad" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
            />
            <h1 className="text-4xl md:text-[6vw] font-black uppercase italic tracking-tighter z-10">
              join our <span className="border-text">#lumosquad</span>
            </h1>
          </section>

          {/* ด่านที่ 4: Brand Showcase (เปลี่ยน Our Works เป็นโลโก้แบรนด์ขนาดใหญ่) */}
          <section className="min-h-[300vh] relative flex flex-col items-center py-32 bg-white">
            
            {/* โลโก้แบรนด์ลอยนิ่งๆ และใหญ่ขึ้นตามคำขอ (ปรับเป็น 85vw) */}
            <div className="sticky top-1/2 -translate-y-1/2 z-50 pointer-events-none mix-blend-difference w-[85vw] md:w-[75vw]">
              <img 
                src="/images/brand.png" 
                alt="TU LUMORA Logo" 
                className="w-full h-auto object-contain brightness-200"
              />
            </div>
            
            {/* รายการรูปผลงานที่เลื่อนผ่านด้านหลังโลโก้ */}
            <div className="z-10 flex flex-col gap-[40vh] mt-[-10vh] w-full px-5 md:px-20 items-center">
              <img src="/images/work1.jpg" alt="Work 1" className="w-full md:w-[65vw] aspect-video object-cover shadow-2xl" />
              <img src="/images/work2.jpg" alt="Work 2" className="w-full md:w-[65vw] aspect-video object-cover ml-auto shadow-2xl" />
              <img src="/images/work3.jpg" alt="Work 3" className="w-full md:w-[65vw] aspect-video object-cover mr-auto shadow-2xl" />
            </div>
          </section>

          <footer className="h-[40vh] bg-black flex flex-col items-center justify-center">
             <p className="text-gray-600 tracking-[1em] uppercase text-[10px] mb-4">Established 2026</p>
             <h2 className="text-2xl font-bold tracking-tighter">TU LUMORA®</h2>
          </footer>

        </main>
      </ReactLenis>
    </>
  );
}