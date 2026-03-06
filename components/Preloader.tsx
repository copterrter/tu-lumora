"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);

  // ดึงรูปจากโฟลเดอร์ images
  const images = [
    "/images/1.jpg", 
    "/images/2.jpg", 
    "/images/3.jpg", 
    "/images/4.jpg", 
    "/images/5.jpg"
  ];

  useEffect(() => {
    // คำสั่งรันรูป: ให้เปลี่ยนรูปทุกๆ 0.2 วินาที (200ms)
    const interval = setInterval(() => {
      setIndex((prev) => {
        // ถ้ารันถึงรูปสุดท้ายแล้ว ให้วนกลับไปรูปแรก (0)
        if (prev + 1 >= images.length) return 0;
        return prev + 1;
      });
    }, 800);

    // สั่งให้หน้าโหลดปิดตัวเองเมื่อผ่านไป 3.5 วินาที
    const timeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []); // ปล่อยวงเล็บว่างไว้ เพื่อกันไม่ให้ระบบมันเรนเดอร์ซ้ำซ้อนจนรูปค้าง

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center w-full h-screen"
      initial={{ y: 0 }}
      exit={{ y: "-100vh", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="absolute top-8 left-8 w-20 md:w-32 opacity-80">
        <img src="/images/mascot.png" alt="Mascot" className="w-full object-contain" />
      </div>

      <div className="absolute top-10 right-8 w-32 md:w-48 opacity-80">
        <img src="/images/brand.png" alt="Brand Font" className="w-full object-contain" />
      </div>

      {/* ตรงนี้ลบคำว่า grayscale ออกแล้ว รูปจะกลับมาเป็นสีปกติครับ! */}
      <div className="w-[60vw] md:w-[25vw] aspect-[3/4] overflow-hidden relative">
        <img 
          src={images[index]} 
          alt="loading sequence" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute bottom-12 flex gap-4 text-gray-400 uppercase tracking-[0.4em] text-xs md:text-sm font-bold">
        <span className="animate-pulse">Loading Culture</span>
        {/* ตัวเลขเปร์เซ็นต์จะวิ่งตามรูปที่เปลี่ยน */}
        <span>{Math.min((index * 20) + 20, 100)}%</span>
      </div>
    </motion.div>
  );
}