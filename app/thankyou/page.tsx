"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      {/* เอฟเฟกต์โลโก้แบรนด์พุ่งออกมา */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-64 md:w-96 mb-12"
      >
        <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto" />
      </motion.div>

      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
          WELCOME TO THE <br/> <span className="text-white">#LUMOSQUAD</span>
        </h1>
        <p className="text-gray-500 uppercase tracking-[0.3em] text-xs">
          Your order has been received. <br/> We are verifying your payment...
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-4">
        <Link href="/" className="px-10 py-4 border border-white text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all">
          Back to Home
        </Link>
        <p className="text-[9px] text-gray-700 uppercase">Track your order via IG: @TULUMORA</p>
      </div>
    </main>
  );
}