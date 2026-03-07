"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(0);

  const images = [
    "/images/1.jpg", 
    "/images/2.jpg", 
    "/images/3.jpg", 
    "/images/4.jpg", 
    "/images/5.jpg"
  ];

  useEffect(() => {
    const duration = 3000;
    const stepMs = 30;
    const steps = duration / stepMs;
    let current = 0;

    const progressInterval = setInterval(() => {
      current += 1;
      setProgress(Math.min(Math.round((current / steps) * 100), 100));
      if (current >= steps) clearInterval(progressInterval);
    }, stepMs);

    const imageInterval = setInterval(() => {
      setIndex((prev) => (prev + 1 >= images.length ? 0 : prev + 1));
    }, 800);

    const timeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(imageInterval);
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center w-full h-screen"
      initial={{ y: 0 }}
      exit={{ y: "-100vh", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Centered product photo */}
      <div className="w-[60vw] md:w-[25vw] aspect-[3/4] overflow-hidden">
        <Image
          src={images[index]}
          alt="loading"
          width={400}
          height={533}
          priority
          className="w-full h-full object-cover"
        />
      </div>

      {/* Mascot — right side */}
      <div className="absolute bottom-16 right-8 w-16 md:w-24 opacity-70">
        <Image src="/images/BB.png" alt="Logo" width={96} height={96} className="w-full object-contain drop-shadow-lg" loading="lazy" />
      </div>
      
      {/* Progress bar — bottom */}
      <div className="absolute bottom-8 w-[60vw] md:w-[25vw] flex flex-col gap-2">
        <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 uppercase tracking-[0.4em] text-[9px] font-bold">Loading Culture</span>
          <span className="text-white text-[9px] font-black tabular-nums">{progress}%</span>
        </div>
      </div>
    </motion.div>
  );
}