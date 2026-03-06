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
          
          {/* ด่านที่ 2: Hero Showcase (เวอร์ชันเน้นปุ่มกลางจอ แต่จัดสมดุลใหม่ให้เท่ขึ้น) */}
<section className="h-screen flex items-center justify-center relative overflow-hidden bg-black">
  <video 
    autoPlay 
    loop 
    muted 
    playsInline 
    className="absolute inset-0 w-full h-full object-cover opacity-60"
  >
    <source src="/bg-video.mp4" type="video/mp4" />
  </video>
  
  {/* Content Layer: จัดวางแบบแกนกลาง (Vertical Axis) */}
  <div className="z-10 flex flex-col items-center gap-8 px-5">
    
    {/* 1. ข้อความขนาดเล็กด้านบนปุ่ม (ช่วยลดความโล่งในมือถือ) */}
    <motion.p 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3, duration: 0.8 }}
      className="text-[10px] tracking-[0.8em] text-white/50 uppercase font-light"
    >
      New Arrival 2026
    </motion.p>

    {/* 2. ปุ่ม Shop Collection อยู่ตรงกลางตามความชอบของคุณ */}
    <motion.a 
      href="/product"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 3.5, duration: 1 }}
      className="group relative px-14 py-4 border border-white overflow-hidden transition-all duration-500 hover:border-transparent"
    >
      <span className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-[0.6em] group-hover:text-black transition-colors duration-500">
        PRE ORDER NOW
      </span>
      {/* เอฟเฟกต์สีขาววิ่งขึ้นตอน Hover */}
      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
    </motion.a>

    {/* 3. สัญลักษณ์แบรนด์เล็กๆ ด้านล่างปุ่ม (เพิ่มความ Unique) */}
    <motion.span 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 4, duration: 1 }}
      className="text-[14px] font-bold text-white/30 italic"
    >
      #LUMOSQUAD
    </motion.span>
  </div>

  {/* 🌟 4. ลูกศรชี้ลงที่ขยับได้ (Bouncing Arrow) อยู่ที่ขอบล่างจอ 🌟 */}
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0], 
      y: [0, 12, 0] 
    }}
    transition={{ 
      delay: 5, 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut"
    }}
    className="absolute bottom-10 flex flex-col items-center gap-2"
  >
    <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-1">Scroll</span>
    <span className="text-xl font-light text-white/60">↓</span>
  </motion.div>
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

{/* ด่านที่ 4: Brand Showcase (Street Lookbook Edition) */}
<section className="min-h-[600vh] relative flex flex-col items-center py-32 bg-white">
  
  {/* โลโก้แบรนด์: ใช้ mix-blend-difference เพื่อให้เล่นกับสีของรูปที่เลื่อนผ่าน */}
  <div className="sticky top-1/2 -translate-y-1/2 z-50 pointer-events-none mix-blend-difference w-[85vw] md:w-[70vw]">
    <img 
      src="/images/brand.png" 
      alt="TU LUMORA Logo" 
      className="w-full h-auto object-contain brightness-200"
    />
  </div>
  
  {/* Grid Layout: ในคอมจะนิ่งและเท่ ในมือถือจะซ้อนกันอย่างมีสไตล์ */}
  <div className="z-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-[-10vh] w-full px-5 md:px-24 auto-rows-[250px] md:auto-rows-[350px]">
    
    {/* รูป 1: พระเอกของงาน (ใหญ่พิเศษ) */}
    <div className="col-span-2 row-span-2 overflow-hidden bg-zinc-100 group shadow-xl">
      <img src="/images/work1.jpg" alt="Work 1" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0" />
    </div>

    {/* รูป 2: แนวตั้งสไตล์นิตยสาร (ในคอมจะไปอยู่ขวาสุด) */}
    <div className="row-span-2 md:col-start-4 overflow-hidden bg-zinc-100 group shadow-xl">
      <img src="/images/work2.jpg" alt="Work 2" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
    </div>

    {/* รูป 3: ดีเทลเล็กๆ */}
    <div className="overflow-hidden bg-zinc-100 group shadow-xl">
      <img src="/images/work3.jpg" alt="Work 3" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
    </div>

    {/* รูป 4: ดีเทลเล็กๆ */}
    <div className="overflow-hidden bg-zinc-100 group shadow-xl">
      <img src="/images/work4.jpg" alt="Work 4" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
    </div>

    {/* รูป 5: แนวนอนยาวๆ (ตัดจังหวะสายตา) */}
    <div className="col-span-2 md:col-start-2 overflow-hidden bg-zinc-100 group shadow-xl">
      <img src="/images/work5.jpg" alt="Work 5" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
    </div>

    {/* รูป 6: ปิดท้ายด้วยรูปทรงสูงทางซ้าย */}
    <div className="row-span-2 overflow-hidden bg-zinc-100 group shadow-xl">
      <img src="/images/work6.jpg" alt="Work 6" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
    </div>

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