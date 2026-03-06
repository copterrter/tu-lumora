"use client";
import { useState, useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Preloader from "../components/Preloader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isLoading]);

  // Show floating button after scrolling past the hero
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingBtn(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Framer Motion Scroll Tracking for Lookbook
  const lookbookRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lookbookRef,
    offset: ["start center", "end center"],
  });

  const logoOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const logoY = useTransform(scrollYProgress, [0, 1], ["-50%", "-50%"]); 

  return (
    <>
      {/* Preloader */}
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Floating MENU button */}
      <motion.button
        onClick={() => setMenuOpen(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ delay: 4, duration: 0.6 }}
        className="fixed top-6 left-6 z-[80] flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors"
      >
        <img src="/images/mascot.png" alt="menu" className="w-5 h-5 object-contain opacity-70" />
        [ M E N U ]
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center gap-10"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-8 text-white/40 hover:text-white text-2xl font-black transition-colors tracking-widest"
            >
              [ CLOSE ]
            </button>
            <img src="/images/brand.png" alt="TU LUMORA" className="w-48 md:w-64 object-contain opacity-20 absolute" />
            <nav className="flex flex-col items-center gap-8 z-10">
              {[
                { label: "HOME", href: "/" },
                { label: "SHOP / PRE-ORDER", href: "/product" },
                { label: "LOOKBOOK", href: "#lookbook" },
                { label: "CONTACT", href: "https://lin.ee/19k0kWS" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors italic"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating PRE-ORDER button */}
      <AnimatePresence>
        {showFloatingBtn && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]"
          >
            <Link
              href="/product"
              className="flex items-center gap-3 bg-white text-black px-10 py-4 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              🛍 PRE-ORDER NOW
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <ReactLenis root>
        <main className="bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black">
          
          {/* HERO SECTION — Logo center, PRE-ORDER below */}
          <section className="h-[100dvh] flex items-center justify-center relative overflow-hidden bg-black">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-[100dvh] object-cover opacity-50"
            >
              <source src="/bg-video.mp4" type="video/mp4" />
            </video>

            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />

            {/* Center content */}
            <div className="z-10 flex flex-col items-center gap-10 px-5 text-center">
              
              {/* Brand Logo — main focal point */}
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-[80vw] sm:w-[60vw] md:w-[45vw]"
              >
                <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto object-contain" />
              </motion.div>

              {/* Small label */}
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2, duration: 0.8 }}
                className="text-[10px] tracking-[0.8em] text-white/40 uppercase font-light"
              >
                New Arrival 2026
              </motion.p>

              {/* PRE-ORDER Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.6, duration: 1 }}
                className="inline-block"
              >
                <Link 
                  href="/product"
                  className="group relative px-14 py-4 border border-white overflow-hidden transition-all duration-500 hover:border-transparent inline-block"
                >
                  <span className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-[0.6em] group-hover:text-black transition-colors duration-500">
                    PRE-ORDER NOW
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                </Link>
              </motion.div>

              {/* Brand tag */}
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.2, duration: 1 }}
                className="text-[13px] font-bold text-white/30 italic tracking-widest"
              >
                #TULUMORA
              </motion.span>
            </div>

            {/* Bouncing scroll arrow */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: [0, 12, 0] }}
              transition={{ delay: 5, duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-10 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-1">Scroll</span>
              <span className="text-xl font-light text-white/60">↓</span>
            </motion.div>
          </section>

          {/* SECTION 2 — Full-bleed editorial photo */}
          <section className="relative w-full h-[80dvh] overflow-hidden" id="lookbook">
            <img
              src="/images/work3.jpg"
              alt="Editorial"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-10 left-6 md:left-16">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/50 mb-2">Tu Lumora 2026</p>
              <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
                WEAR<br/>YOUR SOUL
              </h2>
            </div>
          </section>

          {/* SECTION 3 — #lumosquad */}
          <section className="h-[100dvh] flex items-center justify-center relative overflow-hidden bg-black border-y border-white/5">
            <img 
              src="/images/squad.jpg" 
              alt="Lumosquad" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
            />
            <div className="z-10 flex flex-col items-center gap-6 text-center px-4">
              <h1 className="text-4xl md:text-[6vw] font-black uppercase italic tracking-tighter">
                join our <span className="border-text">#lumosquad</span>
              </h1>
              <Link href="https://lin.ee/19k0kWS" target="_blank"
                className="text-[10px] font-bold tracking-[0.4em] uppercase underline underline-offset-4 text-white/40 hover:text-white transition-colors"
              >
                LINE OA →
              </Link>
            </div>
          </section>

          {/* SECTION 4 — Lookbook (with scroll-linked sticky logo) */}
          <section ref={lookbookRef} className="relative w-full bg-white overflow-hidden flex justify-center pb-32">
            
            <motion.div 
              style={{ opacity: logoOpacity, y: logoY, willChange: "transform, opacity" }}
              className="fixed top-1/2 left-0 w-full z-50 pointer-events-none mix-blend-difference overflow-hidden px-[7.5vw] md:px-[15vw] flex flex-col items-center gap-4"
            >
              <img src="/images/brand.png" alt="TU LUMORA Logo" className="w-[85vw] md:w-[70vw] h-auto object-contain brightness-200" />
            </motion.div>
            
            <div className="z-10 flex flex-col w-full px-5 md:px-20 items-center space-y-24 md:space-y-[60vh] py-[30vh]">
              
              {/* 1 */}
              <div className="flex flex-col w-[100%] md:w-[85vw] gap-4">
                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] group shadow-2xl overflow-hidden bg-zinc-100">
                  <img src="/images/work1.jpg" alt="Squad Track" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white mix-blend-difference">01 // THE SQUAD</p>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-4 mt-2">
                  <h3 className="text-xl md:text-3xl font-black uppercase tracking-widest text-black">STARTING LINE</h3>
                  <p className="text-black/60 text-xs md:text-sm tracking-widest leading-relaxed uppercase max-w-md text-left md:text-right">
                    Running track campaign. The beginning of the Tu Lumora journey where street meets athletic performance.
                  </p>
                </div>
              </div>

              {/* 2 */}
              <div className="flex flex-col md:flex-row items-center md:items-start md:self-start gap-8 md:gap-16 w-[90%] md:w-[65vw]">
                <div className="relative w-full md:w-[35vw] aspect-[3/4] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <img src="/images/DSC08700.jpg" alt="Studio Boy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale hover:grayscale-0" />
                  <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-black/50">02 // SIGNATURE TEE</p>
                </div>
                <div className="flex flex-col pt-4 md:pt-[15%] gap-4">
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-black italic">Pure Form</h3>
                  <p className="text-black/60 text-xs md:text-sm tracking-widest leading-relaxed uppercase border-l-2 border-black/20 pl-4 py-1">
                    The signature white collection. Minimalist apparel designed for everyday lifestyle, featuring premium construction and uncompromising comfort.
                  </p>
                </div>
              </div>

              {/* 3 */}
              <div className="flex flex-col md:flex-row-reverse items-center md:items-end md:self-end gap-8 md:gap-16 w-[90%] md:w-[70vw]">
                <div className="relative w-full md:w-[40vw] aspect-[4/5] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <img src="/images/DSC07437.JPG" alt="Brick Wall Girl" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <p className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-white drop-shadow-md">03 // CROP EDITION</p>
                </div>
                <div className="flex flex-col pt-4 md:pb-[10%] gap-4 items-start md:items-end text-left md:text-right">
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-black">Urban <br/> Texture</h3>
                  <p className="text-black/60 text-xs md:text-sm tracking-widest leading-relaxed uppercase border-r-0 md:border-r-2 md:border-black/20 md:pr-4 py-1 max-w-[300px]">
                    Urban streetwear exploration. The exclusive crop top series crafted for the modern youth seeking effortless edge.
                  </p>
                </div>
              </div>

              {/* 4 */}
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 w-[100%] md:w-[75vw]">
                <div className="relative w-full md:w-[45vw] aspect-[2/3] md:aspect-[3/4] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <img src="/images/DSC07681.jpg" alt="Scooter Gang" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <p className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-white mix-blend-difference">04 // STREET CULTURE</p>
                </div>
                <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4 md:px-10">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-black/40">Editorial 04</p>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">Freedom <br/> Riders</h3>
                  <p className="text-black/60 text-xs md:text-sm tracking-widest leading-relaxed uppercase mt-4">
                    Youth rebellion & freedom. Cruising through the streets with the latest Tu Lumora Squad apparel, engineered for movement.
                  </p>
                </div>
              </div>

              {/* 5 */}
              <div className="flex flex-col md:flex-row-reverse items-center md:items-center gap-8 md:gap-12 w-[95%] md:w-[80vw]">
                <div className="relative w-full md:w-[50vw] aspect-video group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <img src="/images/DSC07193.JPG" alt="Dark Mood Boy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <div className="flex flex-col items-center md:items-end text-center md:text-right gap-3">
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-black">Night <br className="hidden md:block"/> Shift</h3>
                  <div className="h-[1px] w-12 bg-black my-2"></div>
                  <p className="text-black/60 text-xs md:text-sm tracking-widest leading-relaxed uppercase">
                    Movement in the shadows. A darker aesthetic highlighting durability and athletic performance under city lights.
                  </p>
                </div>
              </div>

              {/* 6 */}
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 w-[95%] md:w-[85vw]">
                <div className="relative w-full md:w-[55vw] aspect-[16/10] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <img src="/images/work2.jpg" alt="Colorful Building Girl" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <p className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-white drop-shadow-md">05 // CITY VIBES</p>
                </div>
                <div className="flex flex-col justify-end pb-4 md:pb-10 gap-3">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-black">T/L CAMPAIGN</span>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black">Concrete Life</h3>
                  <p className="text-black/60 text-xs tracking-widest leading-relaxed uppercase">
                    Color blocking the concrete jungle. Bringing life to downtown with bold, architectural silhouettes and vibrant energy.
                  </p>
                </div>
              </div>

              {/* 7 — Editorial finale */}
              <div className="flex flex-col w-[100%] md:w-[90vw] gap-8 mt-12 bg-black text-white p-5 md:p-10 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <h3 className="text-3xl md:text-6xl font-black uppercase tracking-widest italic text-center md:text-left">
                    The New <br/> Standard
                  </h3>
                  <p className="text-white/70 text-xs md:text-sm tracking-widest leading-relaxed text-center md:text-right uppercase max-w-sm">
                    Redefining glamour and streetwear in perfect harmony. The highly anticipated 2026 collection arrives.
                  </p>
                </div>
                <div className="relative w-full aspect-video md:aspect-[21/9] group overflow-hidden bg-zinc-900 mt-4">
                  <img src="/images/DSC07728.jpg" alt="Glam Finale" className="w-full h-full object-cover outline-none transition-transform duration-1000 group-hover:scale-105 opacity-80" />
                  <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] md:text-[18px] font-black uppercase tracking-[0.5em] text-white">TU LUMORA 2026</p>
                </div>
              </div>

            </div>
          </section>

          {/* Footer */}
          <footer className="h-[50dvh] min-h-[400px] bg-black flex flex-col items-center justify-center border-t border-white/5 space-y-8 px-6">
            <div className="text-center space-y-2">
              <p className="text-gray-600 tracking-[1em] uppercase text-[10px]">Established 2026</p>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter uppercase text-white italic">TU LUMORA®</h2>
            </div>
            
            <div className="pt-8 border-t border-white/10 w-full max-w-sm text-center flex flex-col gap-6">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-700 uppercase tracking-[0.4em] font-black">An Official Project By</p>
                <a href="https://www.instagram.com/tusu.rangsit/" target="_blank" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors tracking-widest uppercase inline-block">
                  TUSU.RANGSIT
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-gray-800 uppercase tracking-[0.4em] font-black">Website Engineered By</p>
                <a href="https://github.com/copterrter" target="_blank" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors tracking-[0.3em] uppercase inline-block">
                  VAROTE MAIDERATA
                </a>
              </div>
            </div>
          </footer>
        </main>
      </ReactLenis>
    </>
  );
}