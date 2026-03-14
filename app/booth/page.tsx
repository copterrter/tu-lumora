"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, animate } from "framer-motion";
import { getCurrentPhase } from "@/lib/pricing";

type SpinResult = { success: boolean; type: string; code: string | null; discountPercent?: number; message?: string };

// สีวงล้อให้เข้าธีมแดง/ดำ/อำพัน
const SEGMENTS = [
  { label: "0%", color: "rgba(28,28,28,0.98)", type: "0" },
  { label: "10%", color: "rgba(100,28,28,0.95)", type: "10" },
  { label: "15%", color: "rgba(150,75,25,0.92)", type: "15" },
  { label: "50%", color: "rgba(180,50,35,0.95)", type: "50" },
] as const;

// ลูกศรอยู่ด้านบน (top). Segment i อยู่ที่มุม start = (i*90)-90 ถึง start+90. ให้ segment นั้นอยู่ใต้ลูกศร = ต้องหมุนจนจุดกลาง segment อยู่ที่บน (-90°).
// จุดกลาง segment i = (i*90)-90+45 = i*90-45. ต้องการ center + rotation ≡ -90 (mod 360) => rotation = -90 - (i*90-45) = -90 - i*90 + 45 = -45 - i*90.
// i=0: -45; i=1: -135=225; i=2: -225=135; i=3: -315=45.
function getSegmentAngle(type: string): number {
  const i = SEGMENTS.findIndex((s) => s.type === type);
  if (i < 0) return 0;
  const base = (-45 - i * 90) % 360;
  return base < 0 ? base + 360 : base;
}

export default function BoothPage() {
  const [phase, setPhase] = useState<ReturnType<typeof getCurrentPhase> | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showShareUnlock, setShowShareUnlock] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [rateLimitSec, setRateLimitSec] = useState(0);
  const [rateLimitKey, setRateLimitKey] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotation = useMotionValue(0);
  const spinController = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase(getCurrentPhase()), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (rateLimitSec <= 0 || rateLimitKey === 0) return;
    const id = setInterval(() => {
      setRateLimitSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  // ต้องการรันเมื่อได้ 429 (rateLimitKey เปลี่ยน) เท่านั้น ไม่ใส่ rateLimitSec เพื่อไม่ให้ interval ถูกสร้างใหม่ทุกวินาที
  }, [rateLimitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSpin = useCallback(async () => {
    if (getCurrentPhase() !== "normal") {
      setResult({ success: false, type: "closed", code: null, message: "กิจกรรมบูธเปิดเฉพาะช่วง Normal เท่านั้น" });
      return;
    }
    setLoading(true);
    setResult(null);
    setRateLimitSec(0);
    if (spinController.current) spinController.current.stop();
    rotation.set(0);

    try {
      const res = await fetch("/api/booth/spin", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        setLoading(false);
        setResult(data);
        const sec = typeof data.retryAfterSeconds === "number" ? Math.max(0, data.retryAfterSeconds) : 30;
        setRateLimitSec(sec);
        setRateLimitKey((k) => k + 1);
        return;
      }

      const fullTurns = 360 * 6;
      const segmentAngle = getSegmentAngle(String(data.type));
      const target = fullTurns + segmentAngle;

      spinController.current = animate(rotation, target, {
        duration: 3.2,
        ease: [0.12, 0.6, 0.3, 1],
        onComplete: () => {
          setResult(data);
          setLoading(false);
          if (data.type === "0" && data.message?.includes("ลูโม่")) {
            setShowShareUnlock(true);
            setCountdown(5);
            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = setInterval(() => {
              setCountdown((c) => {
                if (c <= 1) {
                  if (countdownRef.current) clearInterval(countdownRef.current);
                  countdownRef.current = null;
                  setShowShareUnlock(false);
                  return 0;
                }
                return c - 1;
              });
            }, 1000);
          }
        },
      });
      if (data.type !== "0" || !data.message?.includes("ลูโม่")) {
        setResult(data);
      }
    } catch {
      if (spinController.current) spinController.current.stop();
      setResult({ success: false, type: "error", code: null, message: "เชื่อมต่อไม่สำเร็จ ลองใหม่" });
      setLoading(false);
    }
  }, [rotation]);

  const normal = phase === "normal";

  const copyCode = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      alert("คัดลอกโค้ดแล้ว! ไปวางที่ช่อง Promo Code ในหน้าชำระเงินได้เลย");
    }
  };

  const saveAsImage = () => {
    if (!result?.code) return;
    const canvas = document.createElement("canvas");
    const w = 600;
    const h = 320;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TU LUMORA — โค้ดส่วนลดจากบูธ", w / 2, 80);
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = "#4ade80";
    ctx.fillText(result.code, w / 2, 160);
    ctx.fillStyle = "#888";
    ctx.font = "12px sans-serif";
    ctx.fillText(`ส่วนลด ${result.discountPercent}% — ใช้ได้ 1 ตัวที่ Checkout`, w / 2, 200);
    const link = document.createElement("a");
    link.download = `LUMORA-Promo-${result.code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-start md:justify-center p-4 sm:p-6 relative overflow-x-hidden overflow-y-auto pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      {/* พื้นหลังชั้น 1: gradient โทนแดง/ดำ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(180,0,20,0.25),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(120,40,0,0.12),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
      {/* ตาข่าย / grid เบาๆ */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      {/* เส้นมุมแบบสตรีท — เล็กบนมือถือ */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-12 h-12 sm:w-16 sm:h-16 border-l-2 border-t-2 border-white/20 pointer-events-none" />
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 border-r-2 border-t-2 border-white/20 pointer-events-none" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-12 h-12 sm:w-16 sm:h-16 border-l-2 border-b-2 border-white/20 pointer-events-none" />
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 border-r-2 border-b-2 border-white/20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5 sm:gap-6 md:gap-8 py-4 md:py-0">
        <Link href="/" className="text-[10px] tracking-[0.35em] text-white/40 uppercase hover:text-white transition-colors">
          [ BACK TO HOME ]
        </Link>

        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-2 ring-white/20 bg-black shadow-[0_0_30px_rgba(255,255,255,0.08)]">
            <Image src="/icon.png" alt="TU LUMORA" fill className="object-contain p-2" sizes="112px" priority />
          </div>
          <span className="text-[9px] tracking-[0.5em] text-white/60 uppercase font-medium">TU LUMORA</span>
          <span className="text-[8px] tracking-[0.6em] text-white/30 uppercase">BOOTH</span>
        </div>

        {phase === null ? (
          <p className="text-white/50 text-[10px] uppercase tracking-widest">กำลังโหลด...</p>
        ) : !normal ? (
          <div className="text-center space-y-6 py-4">
            <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-white/90 italic">กิจกรรมสิ้นสุดแล้ว</h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase max-w-xs">โค้ดส่วนลดจากบูธใช้ได้เฉพาะช่วง Normal เท่านั้น</p>
            <Link
              href="/"
              className="inline-block mt-6 px-8 py-4 border border-white/20 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-black transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-[8px] tracking-[0.6em] text-white/40 uppercase">สแกนที่บูธ</p>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white italic mt-1">ลูโม่รออยู่</h2>
              <p className="text-[9px] tracking-widest text-white/35 mt-1 uppercase">สุ่มรางวัลส่วนลด</p>
            </div>

            <div className="relative flex items-center justify-center py-3 sm:py-4 px-3 sm:px-4 rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_0_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 z-10 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[22px] sm:border-l-[18px] sm:border-r-[18px] sm:border-t-[28px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                aria-hidden
              />
              <motion.div
                className="w-[min(280px,82vw)] h-[min(280px,82vw)] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-full border-[3px] border-white/30 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_25px 60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.03)]"
                style={{ rotate: rotation, willChange: "transform" }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
                  <defs>
                    {SEGMENTS.map((s, i) => (
                      <linearGradient key={s.type} id={`seg-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={s.color} />
                        <stop offset="100%" stopColor={s.color.replace("0.92", "0.75").replace("0.95", "0.8")} />
                      </linearGradient>
                    ))}
                  </defs>
                  {SEGMENTS.map((s, i) => {
                    const start = (i * 90) - 90;
                    const rad = (deg: number) => (deg * Math.PI) / 180;
                    return (
                      <g key={s.type}>
                        <path
                          d={`M 50 50 L ${50 + 50 * Math.cos(rad(start))} ${50 + 50 * Math.sin(rad(start))} A 50 50 0 0 1 ${50 + 50 * Math.cos(rad(start + 90))} ${50 + 50 * Math.sin(rad(start + 90))} Z`}
                          fill={`url(#seg-${i})`}
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="0.6"
                        />
                        <text
                          x={50 + 34 * Math.cos(rad(start + 45))}
                          y={50 + 34 * Math.sin(rad(start + 45))}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={i === 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.9)"}
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {s.label}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="50" cy="50" r="14" fill="#0a0a0a" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                  <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.9)" fontSize="4.5" fontWeight="bold">
                    LUMORA
                  </text>
                </svg>
              </motion.div>
            </div>

            <button
              onClick={runSpin}
              disabled={loading || showShareUnlock || rateLimitSec > 0}
              className="w-full max-w-xs py-3.5 sm:py-4 min-h-[44px] border-2 border-white bg-transparent text-white font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] text-[10px] hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.98]"
            >
              {loading
                ? "กำลังสุ่ม..."
                : rateLimitSec > 0
                  ? `รอ ${rateLimitSec} วินาที`
                  : showShareUnlock
                    ? `สุ่มใหม่ได้ใน ${countdown} วินาที`
                    : "สุ่มรางวัล"}
            </button>
            {rateLimitSec > 0 && (
              <p className="text-[9px] text-white/50 tracking-widest uppercase">จำกัด 1 ครั้งต่อ 15 วินาที</p>
            )}

            {result && result.type !== "0" && result.code && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full border border-white/20 border-t-white/30 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 sm:p-6 text-center space-y-4 shadow-[0_20px 40px_-20px_rgba(0,0,0,0.5)]"
              >
                <p className="text-base font-black uppercase tracking-wider text-emerald-400/95 italic">Congratulations!</p>
                <p className="text-xl sm:text-2xl font-mono font-bold tracking-[0.15em] sm:tracking-[0.2em] text-white break-all">{result.code}</p>
                <p className="text-[10px] text-white/50 tracking-widest uppercase">ส่วนลด {result.discountPercent}% — ใช้ได้ 1 ตัวที่ Checkout</p>
                <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                  <button
                    onClick={copyCode}
                    className="min-h-[44px] px-4 sm:px-6 py-3 bg-white text-black font-black uppercase tracking-wider text-[10px] hover:bg-gray-100 transition-colors"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={saveAsImage}
                    className="min-h-[44px] px-4 sm:px-6 py-3 border border-white/25 font-black uppercase tracking-wider text-[10px] hover:bg-white/5 transition-colors"
                  >
                    Save to Camera Roll
                  </button>
                </div>
                <p className="text-[9px] text-amber-300/90 font-bold mt-4 tracking-widest uppercase">
                  💡 นำโค้ดไปกรอกที่ช่อง Promo Code ในหน้าชำระเงิน (Checkout)
                </p>
              </motion.div>
            )}

            {result && result.type === "0" && result.message?.includes("ลูโม่") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full border border-amber-500/30 bg-gradient-to-b from-amber-950/25 to-amber-950/10 p-4 sm:p-6 text-center space-y-4 shadow-[0_20px 40px_-20px_rgba(0,0,0,0.4)]"
              >
                <p className="text-lg sm:text-xl font-black text-amber-200/95 uppercase italic">ลูโม่แอบกินส่วนลดของคุณไปแล้ว! 🐰</p>
                <p className="text-[10px] text-white/70 tracking-widest">แชร์ IG Story เพื่อปลดล็อกสิทธิ์สุ่มใหม่ (หรือรอ {countdown} วินาที)</p>
              </motion.div>
            )}

            {result && result.type === "0" && result.message && !result.message.includes("ลูโม่") && (
              <p className="text-[10px] text-white/60 text-center tracking-widest uppercase">{result.message}</p>
            )}
            {result && !result.success && result.message && result.type !== "0" && (
              <p className="text-[10px] text-red-300/90 text-center tracking-widest">{result.message}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-xs pt-4">
              <Link
                href="/product"
                className="flex-1 text-center min-h-[44px] flex items-center justify-center py-3 border border-white/30 font-black uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[10px] text-white hover:bg-white hover:text-black transition-all"
              >
                [ SHOP NOW ]
              </Link>
              <Link
                href="/"
                className="flex-1 text-center min-h-[44px] flex items-center justify-center py-3 border border-white/30 font-black uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[10px] text-white hover:bg-white hover:text-black transition-all"
              >
                [ BACK TO HOME ]
              </Link>
            </div>
            <p className="text-[8px] text-white/30 tracking-[0.4em] uppercase pt-2">#TULUMORA BOOTH</p>
          </>
        )}
      </div>
    </main>
  );
}
