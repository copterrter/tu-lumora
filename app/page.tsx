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

 {/* ด่านที่ 4: Brand Showcase (Editorial Parallax Lookbook) */}
<section className="min-h-[800vh] relative flex flex-col items-center py-32 bg-white overflow-hidden">
  
  {/* โลโก้แบรนด์ลอยนิ่งๆ (Gimmick หลัก) ใช้ mix-blend-difference เพื่อให้สีตัดกับรูปอัตโนมัติ */}
  <div className="sticky top-1/2 -translate-y-1/2 z-50 pointer-events-none mix-blend-difference w-[85vw] md:w-[70vw]">
    <img 
      src="/images/brand.png" 
      alt="TU LUMORA Logo" 
      className="w-full h-auto object-contain brightness-200"
    />
  </div>
  
  {/* คลังรูปภาพ: จัดวางจังหวะ ซ้าย-ขวา-กลาง สลับแนวตั้ง-แนวนอน */}
  <div className="z-10 flex flex-col w-full px-5 md:px-20 mt-[-10vh] pb-[20vh]">
    
    {/* 1. The Hook (ลู่วิ่ง) - กลางจอ กว้างๆ เปิดตัวอย่างยิ่งใหญ่ */}
    <div className="flex justify-center mb-[50vh]">
      <div className="relative w-[100%] md:w-[70vw] aspect-[16/9] group shadow-2xl overflow-hidden bg-zinc-100">
        <img src="/images/work1.jpg" alt="Squad Track" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white mix-blend-difference">01 // THE SQUAD</p>
      </div>
    </div>

    {/* 2. The Detail (นายแบบพื้นขาว) - ชิดซ้าย แนวตั้ง เท่ๆ คลีนๆ */}
    <div className="flex justify-start mb-[40vh] md:mb-[60vh]">
      <div className="relative w-[85%] md:w-[35vw] aspect-[3/4] group shadow-2xl overflow-hidden bg-zinc-100">
        <img src="/images/DSC08700.jpg" alt="Studio Boy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale hover:grayscale-0" />
        <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-black/50">02 // SIGNATURE TEE</p>
      </div>
    </div>

    {/* 3. The Street (นางแบบกำแพงอิฐ) - ชิดขวา ดึงสายตากลับมา */}
    <div className="flex justify-end mb-[50vh]">
      <div className="relative w-[90%] md:w-[40vw] aspect-[4/5] group shadow-2xl overflow-hidden bg-zinc-100">
        <img src="/images/DSC07437.JPG" alt="Brick Wall Girl" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <p className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-white drop-shadow-md">03 // CROP EDITION</p>
      </div>
    </div>

    {/* 4. The Lifestyle (แก๊งรถสกู๊ตเตอร์) - กลางจอ แนวตั้งยาวๆ สร้าง Impact ในมือถือ */}
    <div className="flex justify-center mb-[60vh]">
      <div className="relative w-[95%] md:w-[45vw] aspect-[2/3] group shadow-2xl overflow-hidden bg-zinc-100">
        <img src="/images/DSC07681.jpg" alt="Scooter Gang" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <p className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-white mix-blend-difference">04 // STREET CULTURE</p>
      </div>
    </div>

    {/* 5. The Dark Mood (นายแบบพื้นดำ) - ชิดซ้าย แนวนอน สร้างความลึกลับ */}
    <div className="flex justify-start mb-[40vh]">
      <div className="relative w-[90%] md:w-[50vw] aspect-video group shadow-2xl overflow-hidden bg-zinc-100">
        <img src="/images/DSC07193.JPG" alt="Dark Mood Boy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
      </div>
    </div>

    {/* 6. The Color Pop (นางแบบตึกสี) - ชิดขวา แนวนอน ตัดความมืด */}
    <div className="flex justify-end mb-[60vh]">
      <div className="relative w-[85%] md:w-[55vw] aspect-[16/10] group shadow-2xl overflow-hidden bg-zinc-100">
        <img src="/images/work2.jpg" alt="Colorful Building Girl" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <p className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-white drop-shadow-md">05 // CITY VIBES</p>
      </div>
    </div>

    {/* 7. The Grand Finale (นางแบบแนว Glam) - กลางจอ กว้างสุด จบแบบอลังการ */}
    <div className="flex justify-center mb-[10vh]">
      <div className="relative w-[100%] md:w-[75vw] aspect-video group shadow-2xl overflow-hidden bg-zinc-100">
        <img src="/images/DSC07728.jpg" alt="Glam Finale" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] uppercase tracking-[0.5em] text-white mix-blend-difference">TU LUMORA 2026</p>
      </div>
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