"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingMascot() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: -300, right: 300, top: -500, bottom: 100 }}
      dragElastic={0.6}
      animate={{
        y: [0, -15, 0],
        x: [0, 10, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="fixed bottom-[12%] right-[5%] md:bottom-[15%] md:right-[10%] z-[9999] cursor-grab active:cursor-grabbing w-20 md:w-32"
      title="Drag me!"
    >
      <img
        src="/images/mascot.png"
        alt="LUMO Mascot"
        className="w-full h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        draggable="false"
      />
    </motion.div>
  );
}
