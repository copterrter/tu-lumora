"use client";
import { useState, useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Preloader from "../components/Preloader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrolledPastHero = scrollPosition > windowHeight * 0.8;
      
      let hideAtFinale = false;
      const finaleElement = document.getElementById("finale-section");
      if (finaleElement) {
        const finaleRect = finaleElement.getBoundingClientRect();
        // Hide button when the finale section reaches the bottom 20% of the screen
        if (finaleRect.top < windowHeight * 0.8) {
          hideAtFinale = true;
        }
      }
      
      setShowFloatingBtn(scrolledPastHero && !hideAtFinale);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const lookbookRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lookbookRef,
    offset: ["start center", "end center"],
  });

  const logoOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {comingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-6"
            onClick={() => setComingSoon(false)}
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Coming Soon</p>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">Lookbook</h2>
            <p className="text-xs text-gray-500 tracking-widest uppercase">Stay tuned — dropping soon.</p>
            <button className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors">[  Close  ]</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENU button — top RIGHT */}
      <motion.button
        onClick={() => setMenuOpen(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ delay: 4, duration: 0.6 }}
        className="fixed top-6 right-6 z-[80] flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:opacity-70 transition-opacity bg-black/50 backdrop-blur-sm px-3 py-2 border border-white/10"
      >
        ☰ MENU
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
              className="absolute top-6 right-8 text-white/40 hover:text-white text-xl font-black transition-colors tracking-widest"
            >
              [ CLOSE ]
            </button>
            <img src="/images/brand.png" alt="TU LUMORA" className="w-48 md:w-64 object-contain opacity-10 absolute" />
            <nav className="flex flex-col items-center gap-8 z-10">
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors italic">HOME</Link>
              <Link href="/product" onClick={() => setMenuOpen(false)} className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors italic">SHOP / PRE-ORDER</Link>
              <button
                onClick={() => { setMenuOpen(false); setComingSoon(true); }}
                className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white/40 italic"
              >
                LOOKBOOK
              </button>
              <a href="https://lumo.mightbad.com" onClick={() => setMenuOpen(false)} target="_blank" className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors italic">MAGAZINE</a>
              <a href="https://lin.ee/19k0kWS" onClick={() => setMenuOpen(false)} target="_blank" className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors italic">CONTACT</a>
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
              className="flex items-center justify-center gap-2 md:gap-3 bg-white/90 backdrop-blur-md md:bg-white text-black px-6 py-3 md:px-10 md:py-4 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs shadow-[0_0_20px_rgba(255,255,255,0.15)] md:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 rounded-sm mx-auto max-w-[260px] md:max-w-none whitespace-nowrap"
            >
              PRE-ORDER NOW
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <ReactLenis root>
        <main className="bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black">

          {/* HERO */}
          <section className="h-[100dvh] flex items-center justify-center relative overflow-hidden bg-black">
            <video autoPlay loop muted playsInline preload="none" className="absolute inset-0 w-full h-[100dvh] object-cover opacity-50">
              <source src="/bg-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />

            <div className="z-10 flex flex-col items-center gap-8 px-5 text-center w-full max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-[75vw] sm:w-[55vw] md:w-[42vw]"
              >
                <Image src="/images/brand.png" alt="TU LUMORA" width={800} height={300} priority className="w-full h-auto object-contain" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2, duration: 0.8 }}
                className="text-[9px] tracking-[0.8em] text-white/40 uppercase font-light"
              >
                New Arrival 2026
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.6, duration: 1 }}
              >
                <Link
                  href="/product"
                  className="group relative px-6 py-3 md:px-10 md:py-4 border border-white/50 hover:border-white overflow-hidden transition-all duration-500 inline-block shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] backdrop-blur-sm"
                >
                  <span className="relative z-10 text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] group-hover:text-black transition-colors duration-500 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] group-hover:[text-shadow:none]">
                    PRE-ORDER NOW
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                </Link>
              </motion.div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.2, duration: 1 }}
                className="text-[12px] font-bold text-white/30 italic tracking-widest"
              >
                #TULUMORA
              </motion.span>
            </div>

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

          {/* EDITORIAL PHOTO — full bleed */}
          <section className="relative w-full h-[80dvh] overflow-hidden" id="lookbook">
            <Image
              src="/images/work3.jpg"
              alt="Editorial"
              fill
              sizes="100vw"
              className="object-cover opacity-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-10 left-6 md:left-16 max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/50 mb-3 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">TU LUMORA 2026</p>
              <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
                WEAR<br />YOUR SOUL
              </h2>
            </div>
          </section>

          {/* #lumosquad — no LINE OA link */}
          <section className="h-[100dvh] flex items-center justify-center relative overflow-hidden bg-black border-y border-white/5">
            <Image src="/images/squad.jpg" alt="Lumosquad" fill sizes="100vw" className="object-cover opacity-40 grayscale" loading="lazy" />
            <div className="z-10 flex flex-col items-center gap-4 text-center px-4">
              <h1 className="text-4xl md:text-[6vw] font-black uppercase italic tracking-tighter [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
                join our <span className="border-text">#lumosquad</span>
              </h1>
            </div>
          </section>

          {/* LOOKBOOK — Scroll-linked logo, editorial photos with captions */}
          <section ref={lookbookRef} className="relative w-full bg-white overflow-hidden flex justify-center pb-32">

            <motion.div
              style={{ opacity: logoOpacity, willChange: "transform, opacity" }}
              className="fixed top-1/2 -translate-y-1/2 left-0 w-full z-50 pointer-events-none mix-blend-difference px-[5vw] md:px-[10vw] flex justify-center"
            >
              <Image src="/images/brand.png" alt="TU LUMORA Logo" width={1200} height={400} className="w-[80vw] md:w-[65vw] h-auto object-contain brightness-200" loading="lazy" />
            </motion.div>

            <div className="z-10 flex flex-col w-full px-5 md:px-20 items-center space-y-24 md:space-y-[60vh] py-[30vh]">

              {/* 1 */}
              <div className="flex flex-col w-[100%] md:w-[85vw] gap-8">
                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] group shadow-2xl overflow-hidden bg-zinc-100">
                  <Image src="/images/work1.jpg" alt="Squad Track" fill sizes="(max-width:768px) 100vw, 85vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/90 font-bold drop-shadow-md">01 — THE START</p>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-3xl md:text-5xl lg:text-7xl font-black italic tracking-[-0.03em] text-black leading-[1.1]">&ldquo;Maybe the world just<br className="hidden md:block"/> needed a little more noise&rdquo;</h3>
                  <div className="w-16 h-[2px] bg-black/20 mt-2" />
                </div>
              </div>

              {/* 2 — Pure Form: permanently grayscale */}
              <div className="flex flex-col md:flex-row items-center md:items-start md:self-start gap-8 md:gap-16 w-[90%] md:w-[70vw]">
                <div className="relative w-full md:w-[38vw] aspect-[3/4] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <Image src="/images/DSC08700.jpg" alt="Studio Boy" fill sizes="(max-width:768px) 100vw, 38vw" className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/90 font-bold drop-shadow-md">02 — THE MOVEMENT</p>
                </div>
                <div className="flex flex-col pt-4 md:pt-[20%] gap-4 md:gap-5">
                  <h3 className="text-2xl md:text-4xl lg:text-6xl font-black uppercase tracking-[-0.03em] text-black italic leading-[1.1]">AGAINST<br/>THE TIDE.</h3>
                  <div className="border-l-2 md:border-l-4 border-black/10 pl-4 md:pl-5 py-1">
                    <p className="text-black/50 text-xs md:text-base leading-relaxed tracking-wide max-w-sm">
                      True style dares to swim upstream. Timeless in its defiance, this collection is crafted to ignite a new cultural movement. We are redefining the campus aesthetic by championing absolute fluidity in wear, an uncommon simplicity that speaks for itself. Stand apart, effortlessly.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 */}
              <div className="flex flex-col md:flex-row-reverse items-center md:items-end md:self-end gap-8 md:gap-16 w-[90%] md:w-[75vw]">
                <div className="relative w-full md:w-[42vw] aspect-[4/5] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <Image src="/images/DSC07437.JPG" alt="Brick Wall Girl" fill sizes="(max-width:768px) 100vw, 42vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-4 right-4 md:bottom-5 md:right-5 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/90 font-bold drop-shadow-md">03 — THE PRESENCE</p>
                </div>
                <div className="flex flex-col pt-4 md:pb-[12%] gap-4 md:gap-5 items-start md:items-end text-left md:text-right">
                  <h3 className="text-2xl md:text-4xl lg:text-6xl font-black uppercase tracking-[-0.03em] text-black leading-[1.1]">OWN THE<br/>STREET.</h3>
                  <div className="border-l-2 md:border-r-4 md:border-l-0 border-black/10 pl-4 md:pl-0 md:pr-5 py-1">
                    <p className="text-black/50 text-xs md:text-base leading-relaxed tracking-wide max-w-sm">
                      Confidence isn&apos;t something you ask for, it&apos;s something you carry. A fit that moves with you, made for the street and everything that happens on it. Walk your way, take your space, and let your presence speak before you do. Own your voice. Own the street.
                    </p>
                  </div>
                </div>
              </div>
                    {/* 4 */}
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 w-[100%] md:w-[80vw]">
                <div className="relative w-full md:w-[48vw] aspect-[2/3] md:aspect-[3/4] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <Image src="/images/DSC07681.jpg" alt="Scooter Gang" fill sizes="(max-width:768px) 100vw, 48vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/90 font-bold drop-shadow-md">04 — THE VOICE</p>
                </div>
                <div className="flex flex-col items-start md:items-start text-left gap-4 md:gap-5 md:px-12">
                  <h3 className="text-2xl md:text-4xl lg:text-6xl font-black uppercase tracking-[-0.03em] text-black leading-[1.1] italic">UN-SILENCED.</h3>
                  <div className="w-12 h-[2px] bg-black/15" />
                  <p className="text-black/50 text-xs md:text-base leading-relaxed tracking-wide max-w-sm">
                    Simply as a quiet nod to those who are tired of being told to stay silent. Inspired by Lumo and his friends who just decided to speak up, this tee is a small reminder, you don&apos;t need to be loud to be heard. The real strength is just knowing the value of your own voice, and being brave enough to use it.
                  </p>
                </div>
              </div>

              {/* 5 */}
              <div className="flex flex-col md:flex-row-reverse items-center md:items-center gap-8 md:gap-12 w-[95%] md:w-[85vw]">
                <div className="relative w-full md:w-[52vw] aspect-video md:aspect-[4/3] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <Image src="/images/DSC07193.JPG" alt="Dark Mood Boy" fill sizes="(max-width:768px) 100vw, 52vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/90 font-bold drop-shadow-md">05 — THE EXPRESSION</p>
                </div>
                <div className="flex flex-col items-start md:items-end text-left md:text-right gap-4 md:gap-5">
                  <h3 className="text-2xl md:text-4xl lg:text-6xl font-black uppercase tracking-[-0.03em] text-black leading-[1.1]">SPEAK THROUGH<br/>STYLE.</h3>
                  <div className="w-12 h-[2px] bg-black/15 self-start md:self-end" />
                  <p className="text-black/50 text-xs md:text-base leading-relaxed tracking-wide max-w-sm">
                    In a city that tells you to stay quiet, style becomes a language. More than fabric, more than a fit, it&apos;s a voice you wear. Every line, every silhouette is a signal that you refuse to disappear. Because sometimes the loudest thing you can do is simply show up as yourself.
                  </p>
                </div>
              </div>

              {/* 6 */}
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 w-[95%] md:w-[88vw]">
                <div className="relative w-full md:w-[58vw] aspect-[16/10] group shadow-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <Image src="/images/work2.jpg" alt="Colorful Building Girl" fill sizes="(max-width:768px) 100vw, 58vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <p className="absolute bottom-4 right-4 md:bottom-5 md:right-5 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/90 font-bold drop-shadow-md">06 — THE FORM</p>
                </div>
                <div className="flex flex-col justify-end pb-4 md:pb-14 gap-4 md:gap-5">
                  <h3 className="text-2xl md:text-4xl lg:text-6xl font-black uppercase tracking-[-0.03em] text-black leading-[1.1] italic">EFFORTLESS.</h3>
                  <div className="w-12 h-[2px] bg-black/15" />
                  <p className="text-black/50 text-xs md:text-base leading-relaxed tracking-wide max-w-md">
                    Fashion should liberate, not complicate. We designed this silhouette to be a universal canvas, adapting flawlessly to whoever you are. There is no need to force a look, the confidence is built-in. Woven into every thread is the unyielding soul of those who stand tall and refuse to be consumed by the shadows. Effortless in form. Defiant in spirit.
                  </p>
                </div>
              </div>

              <div id="finale-section" className="flex flex-col w-[100%] md:w-[92vw] gap-0 mt-12 bg-black text-white shadow-2xl overflow-hidden relative">
                <div className="px-6 md:px-16 py-12 md:py-16 border-b border-white/5 absolute -top-[1000px]">
                  {/* Hid this block physically but kept structure for backward comp if needed, actually let's just remove the text and move it */}
                </div>
                <div className="px-4 md:px-16 pt-8 pb-4 md:pt-12 md:pb-8 flex justify-center w-full">
                  <h3 className="text-[9vw] sm:text-4xl md:text-6xl lg:text-[7rem] font-black italic tracking-[-0.04em] text-white leading-none whitespace-nowrap">
                    &ldquo;Let the city speak&rdquo;
                  </h3>
                </div>
                <div className="relative w-full aspect-[4/3] md:aspect-[21/9] group overflow-hidden bg-zinc-900">
                  <p className="absolute top-4 left-4 md:top-8 md:left-8 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold drop-shadow-md z-10 hidden md:block">07 — FINAL STATEMENT</p>
                  <Image src="/images/DSC07728.jpg" alt="Glam Finale" fill sizes="100vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-transparent md:to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
                    <div>
                      <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/60 mb-2">TU LUMORA — 2026</p>
                      <p className="text-white/80 text-[9px] md:text-sm lg:text-xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] italic max-w-xs md:max-w-md leading-relaxed hidden md:block">
                        Redefining campus culture.<br/>Championing absolute fluidity in wear.
                      </p>
                    </div>
                    <Link href="/product" className="border border-white/30 px-6 py-3 md:px-8 md:py-4 text-[9px] md:text-[11px] tracking-[0.4em] uppercase font-black text-white hover:bg-white hover:text-black transition-all shrink-0">
                      PRE-ORDER NOW
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Footer — no ® */}
          <footer className="h-[50dvh] min-h-[400px] bg-black flex flex-col items-center justify-center border-t border-white/5 space-y-8 px-6">
            <div className="text-center space-y-2">
              <p className="text-gray-600 tracking-[1em] uppercase text-[10px]">Established 2026</p>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter uppercase text-white italic">TU LUMORA</h2>
            </div>

            <div className="pt-8 border-t border-white/10 w-full max-w-sm text-center flex flex-col gap-6">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-700 uppercase tracking-[0.4em] font-black">An Official Project By</p>
                <a href="https://www.instagram.com/tusu.rangsit/" target="_blank" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors tracking-widest uppercase inline-block">
                  TUSU.RANGSIT
                </a>
              </div>
              <div className="space-y-4 pt-4">
                <p className="text-[8px] text-gray-800 uppercase tracking-[0.4em] font-black">Website Engineered By</p>
                <div className="flex flex-col gap-3">
                  <a href="https://www.instagram.com/copterrter/?hl=en" target="_blank" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors tracking-[0.3em] uppercase inline-block">
                    copterrter
                  </a>
                  <a href="https://www.instagram.com/in33dm0respace/?hl=en" target="_blank" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors tracking-[0.3em] uppercase inline-block">
                    in33dm0respace
                  </a>
                  <a href="https://www.instagram.com/korkwai/?hl=en" target="_blank" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors tracking-[0.3em] uppercase inline-block">
                    korkwai
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </ReactLenis>
    </>
  );
}