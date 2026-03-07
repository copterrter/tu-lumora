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
        className="w-48 mb-10"
      >
        <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto opacity-90" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="space-y-6 max-w-lg w-full"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">
            ORDER<br/>CONFIRMED
          </h1>
          <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed max-w-xs mx-auto mb-8">
            Your order has been received.<br/>We are verifying your payment.<br/>You will be contacted via the info provided.
          </p>
        </div>

        {/* Welcome Text & Social Links */}
        <div className="py-8 border-y border-white/10 w-full text-center my-6">
          <h2 className="text-xl md:text-2xl font-black italic tracking-[0.15em] uppercase mb-4 text-white drop-shadow-md">
            Welcome to <span className="text-white/60">#LUMOSQUAD</span>
          </h2>
          <p className="text-[#888] text-[10px] md:text-xs tracking-widest leading-loose">
            สามารถติดตามข่าวสารเเละคอนเทนต์เพิ่มเติมได้จาก<br/>
            <span className="text-white font-bold">#TULUMORA</span> เเละ <span className="text-white font-bold">#LUMOSQUAD</span><br/>
            ผ่านไอจี <a href="https://www.instagram.com/tusu.rangsit/" target="_blank" className="text-white font-bold underline underline-offset-4 hover:text-gray-400 transition-colors">@TUSU.RANGSIT</a>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-8 flex flex-col items-center gap-4 w-full max-w-sm"
      >
        {/* LINE OA button */}
        <a 
          href="https://lin.ee/19k0kWS" 
          target="_blank"
          className="flex items-center justify-center gap-3 w-full bg-[#06C755] text-white px-8 py-4 font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(6,199,85,0.2)]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm5.21 15.27c-.32.492-.842.73-1.34.73-.25 0-.506-.065-.739-.2L12 14.82l-3.131 1.98a1.364 1.364 0 01-.74.2c-.498 0-1.02-.238-1.34-.73a1.5 1.5 0 01.43-2.075L10.4 12l-3.18-2.195a1.5 1.5 0 01-.43-2.075c.32-.492.842-.73 1.34-.73.25 0 .506.065.74.2L12 9.18l3.131-1.98a1.364 1.364 0 01.74-.2c.498 0 1.02.238 1.34.73.455.702.258 1.636-.43 2.075L13.6 12l3.18 2.195c.688.44.885 1.373.43 2.075z"/></svg>
          LINE OA
        </a>
        
        <Link href="/" className="flex items-center justify-center w-full px-8 py-4 border border-white/20 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all text-white/60">
          BACK TO HOME
        </Link>
      </motion.div>
    </main>
  );
}