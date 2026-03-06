"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Logo */}
      <motion.div 
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-52 md:w-72 mb-10"
      >
        <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="space-y-4 max-w-md"
      >
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
          ORDER<br/>CONFIRMED
        </h1>
        <p className="text-gray-500 uppercase tracking-[0.3em] text-[10px] leading-relaxed">
          Your order has been received.<br/>We are verifying your payment.<br/>You will be contacted via the info provided.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-14 flex flex-col items-center gap-5"
      >
        {/* LINE OA button */}
        <a 
          href="https://lin.ee/19k0kWS" 
          target="_blank"
          className="flex items-center gap-3 bg-[#06C755] text-white px-10 py-4 font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm5.21 15.27c-.32.492-.842.73-1.34.73-.25 0-.506-.065-.739-.2L12 14.82l-3.131 1.98a1.364 1.364 0 01-.74.2c-.498 0-1.02-.238-1.34-.73a1.5 1.5 0 01.43-2.075L10.4 12l-3.18-2.195a1.5 1.5 0 01-.43-2.075c.32-.492.842-.73 1.34-.73.25 0 .506.065.74.2L12 9.18l3.131-1.98a1.364 1.364 0 01.74-.2c.498 0 1.02.238 1.34.73.455.702.258 1.636-.43 2.075L13.6 12l3.18 2.195c.688.44.885 1.373.43 2.075z"/></svg>
          ติดต่อ LINE OA
        </a>
        
        <Link href="/" className="px-10 py-4 border border-white/20 text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all text-white/60">
          Back to Home
        </Link>
        <p className="text-[9px] text-gray-700 uppercase tracking-widest mt-2">Track your order: IG @TULUMORA</p>
      </motion.div>
    </main>
  );
}