"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, animate } from "framer-motion";
import { getCurrentPhase } from "@/lib/pricing";

type SpinResult = { success: boolean; type: string; code: string | null; discountPercent?: number; message?: string };

// สีวงล้อคู่สีน่าเล่น โทนสดใส
const SEGMENTS = [
  { label: "5%", color: "rgba(120,190,255,0.95)", type: "5", degrees: 90 },
  { label: "10%", color: "rgba(255,107,107,0.95)", type: "10", degrees: 90 },
  { label: "15%", color: "rgba(255,195,77,0.95)", type: "15", degrees: 90 },
  { label: "50%", color: "rgba(120,220,120,0.95)", type: "50", degrees: 90 },
] as const;

const SEGMENT_STARTS: number[] = (() => {
  let acc = -90;
  const out: number[] = [];
  for (let i = 0; i < SEGMENTS.length; i++) {
    out.push(acc);
    acc += SEGMENTS[i].degrees;
  }
  return out;
})();

// ลูกศรอยู่ด้านบน (top). หมุนจนจุดกลาง segment อยู่ที่บน (-90°) => rotation = -90 - centerDeg.
function getSegmentAngle(type: string): number {
  const i = SEGMENTS.findIndex((s) => s.type === type);
  if (i < 0) return 0;
  const start = SEGMENT_STARTS[i];
  const centerDeg = start + SEGMENTS[i].degrees / 2;
  let base = (-90 - centerDeg) % 360;
  if (base < 0) base += 360;
  return base;
}

export default function BoothPage() {
  const [phase, setPhase] = useState<ReturnType<typeof getCurrentPhase> | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [rateLimitSec, setRateLimitSec] = useState(0);
  const [rateLimitKey, setRateLimitKey] = useState(0);
  const rotation = useMotionValue(0);
  const spinController = useRef<ReturnType<typeof animate> | null>(null);
  const idleController = useRef<ReturnType<typeof animate> | null>(null);
  const waitSpinController = useRef<ReturnType<typeof animate> | null>(null);

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
  }, [rateLimitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // วงล้อหมุนช้าๆ ตลอดเมื่อไม่ได้กด (รอ user หรือไม่ได้ใช้)
  useEffect(() => {
    if (phase !== "normal" || loading) {
      idleController.current?.stop();
      idleController.current = null;
      return;
    }
    const duration = 24;
    const runIdle = () => {
      const from = rotation.get();
      idleController.current = animate(rotation, from + 360, {
        duration,
        ease: "linear",
        onComplete: () => {
          if (idleController.current == null) return;
          runIdle();
        },
        onStop: () => { idleController.current = null; },
      });
    };
    runIdle();
    return () => {
      idleController.current?.stop();
      idleController.current = null;
    };
  }, [phase, loading, rotation]);

  const runSpin = useCallback(async () => {
    if (getCurrentPhase() !== "normal") {
      setResult({ success: false, type: "closed", code: null, message: "กิจกรรมบูธเปิดเฉพาะช่วง Normal เท่านั้น" });
      return;
    }
    setLoading(true);
    setResult(null);
    setRateLimitSec(0);
    idleController.current?.stop();
    idleController.current = null;
    spinController.current?.stop();
    waitSpinController.current?.stop();
    waitSpinController.current = null;

    // หมุนทันทีระหว่างรอ backend เพื่อไม่ให้ user รู้สึกค้าง
    const waitFrom = rotation.get();
    waitSpinController.current = animate(rotation, waitFrom + 360, {
      duration: 0.85,
      ease: "linear",
      repeat: Infinity,
    });

    const startRotation = rotation.get();
    const spinStartTime = Date.now();

    try {
      const res = await fetch("/api/booth/spin", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        waitSpinController.current?.stop();
        waitSpinController.current = null;
        setLoading(false);
        setResult(data);
        const sec = typeof data.retryAfterSeconds === "number" ? Math.max(0, data.retryAfterSeconds) : 30;
        setRateLimitSec(sec);
        setRateLimitKey((k) => k + 1);
        return;
      }

      // ปิด wait-spin แล้วไหลต่อไปสปินจริงในเฟรมถัดไป (ลดอาการสะดุด)
      waitSpinController.current?.stop();
      waitSpinController.current = null;

      const segmentAngle = getSegmentAngle(String(data.type));
      const now = rotation.get();
      const current = Number.isFinite(now) ? now : startRotation;
      const currentMod = ((current % 360) + 360) % 360;

      // หมุนอย่างน้อย baseTurns รอบ + ปรับมุมให้ไปลงตรง segment ตาม API
      const baseTurns = 8;
      const baseDistance = 360 * baseTurns;
      const diffToSegment = ((segmentAngle - currentMod) + 360) % 360;
      const distance = baseDistance + diffToSegment;
      const finalTarget = current + distance;

      // ความเร็วเชิงมุมคงที่คร่าว ๆ เพื่อให้รอบสั้น/ยาวรู้สึกเร็วเท่ากัน
      const angularVelocity = 720; // deg/s
      const idealDuration = distance / angularVelocity;
      const elapsed = (Date.now() - spinStartTime) / 1000;
      const minDuration = 5;
      const maxDuration = 8;
      const clamped = Math.max(minDuration, Math.min(maxDuration, idealDuration));
      const duration = Math.max(minDuration, Math.min(maxDuration, clamped - elapsed));

      spinController.current = animate(rotation, finalTarget, {
        duration,
        ease: [0.22, 0.2, 0.1, 1],
        onComplete: () => {
          setResult(data);
          setLoading(false);
        },
      });
    } catch {
      waitSpinController.current?.stop();
      waitSpinController.current = null;
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
    ctx.fillText("LUMO888 สล็อตเว็บตรง ยูสใหม่แตกง่าย รับล้าน(หัว)ทุกวัน", w / 2, 80);
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
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-start md:justify-center p-4 sm:p-6 relative overflow-x-hidden overflow-y-auto pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] font-[var(--font-geist-sans)]">
      {/* พื้นหลังชั้น 1: gradient โทนส้ม/ชมพู/เขียว น่าเล่น */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(255,120,100,0.28),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(100,200,180,0.15),transparent)] pointer-events-none" />
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
        <Link href="/" className="text-[10px] tracking-[0.35em] text-white/40 uppercase hover:text-white transition-colors whitespace-nowrap">
          [ BACK TO HOME ]
        </Link>

        <div className="flex flex-col items-center gap-3 font-[var(--font-sarabun)]">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-2 ring-white/20 bg-black shadow-[0_0_30px_rgba(255,255,255,0.08)]">
            <Image src="/icon.png" alt="LUMO888" fill className="object-contain p-2" sizes="112px" priority fetchPriority="high" />
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold tracking-wide text-white">LUMO888</div>
            <div className="text-sm md:text-base text-white/80 mt-0.5 tracking-normal">สล็อตเว็บตรง ยูสใหม่แตกง่าย รับล้าน(หัว)ทุกวัน</div>
          </div>
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
            <div className="text-center font-[var(--font-sarabun)]">
              <p className="text-[10px] tracking-wide text-white/50">สแกนที่บูธ</p>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1 tracking-normal">เรียนเชิญ ผู้ชื่นชอบการเสี่ยงโชค</h2>
              <p className="text-sm text-white/40 mt-1 tracking-normal">สุ่มรางวัลส่วนลด</p>
            </div>

            <div className="relative flex items-center justify-center py-3 sm:py-4 px-3 sm:px-4 rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_0_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 z-10 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[22px] sm:border-l-[18px] sm:border-r-[18px] sm:border-t-[28px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                aria-hidden
              />
              <motion.div
                className="w-[min(280px,82vw)] h-[min(280px,82vw)] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-full border-[3px] border-white/30 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_25px 60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.03)]"
                style={{ rotate: rotation, willChange: loading ? "transform" : undefined }}
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
                    const start = SEGMENT_STARTS[i];
                    const span = s.degrees;
                    const rad = (deg: number) => (deg * Math.PI) / 180;
                    const end = start + span;
                    const largeArc = span > 180 ? 1 : 0;
                    return (
                      <g key={s.type}>
                        <path
                          d={`M 50 50 L ${50 + 50 * Math.cos(rad(start))} ${50 + 50 * Math.sin(rad(start))} A 50 50 0 ${largeArc} 1 ${50 + 50 * Math.cos(rad(end))} ${50 + 50 * Math.sin(rad(end))} Z`}
                          fill={`url(#seg-${i})`}
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="0.6"
                        />
                        <text
                          x={50 + 34 * Math.cos(rad(start + span / 2))}
                          y={50 + 34 * Math.sin(rad(start + span / 2))}
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
              <button
                type="button"
                onClick={runSpin}
                disabled={loading || rateLimitSec > 0}
                aria-label="สุ่มรางวัล"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[min(78px,22vw)] h-[min(78px,22vw)] sm:w-[78px] sm:h-[78px] rounded-full bg-[#0a0a0a] border-2 border-white/30 flex items-center justify-center hover:border-white/50 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-white/90 text-center leading-tight px-0.5">
                  {rateLimitSec > 0 ? `รอ ${rateLimitSec} วิ` : "SPIN"}
                </span>
              </button>
            </div>

            {loading && (
              <p className="text-[9px] text-emerald-300 tracking-widest uppercase mt-1">
                วงล้อกำลังหมุน กรุณารอจนหยุด
              </p>
            )}
            {!loading && rateLimitSec > 0 && (
              <p className="text-[9px] text-white/50 tracking-widest uppercase">จำกัด 1 ครั้งต่อ 15 วินาที</p>
            )}

            {result && result.code && (
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
                <p className="text-[11px] text-white/80 font-bold mt-4 uppercase tracking-wider">
                  ไปหน้าสั่งซื้อเลยมั้ย?
                </p>
                <Link
                  href="/product"
                  className="inline-block min-h-[44px] px-6 py-3 bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-black uppercase tracking-wider text-[10px] hover:bg-emerald-500/30 transition-colors"
                >
                  ไปเลือกสินค้าและสั่งซื้อ
                </Link>
              </motion.div>
            )}

            {result && !result.success && result.message && (
              <p className="text-[10px] text-red-300/90 text-center tracking-widest">{result.message}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-xs pt-4">
              <Link
                href="/product"
                className="flex-1 text-center min-h-[44px] flex items-center justify-center py-3 border border-white/30 font-black uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[10px] text-white hover:bg-white hover:text-black transition-all whitespace-nowrap"
              >
                [ SHOP NOW ]
              </Link>
              <Link
                href="/"
                className="flex-1 text-center min-h-[44px] flex items-center justify-center py-3 border border-white/30 font-black uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[10px] text-white hover:bg-white hover:text-black transition-all whitespace-nowrap"
              >
                [ BACK TO HOME ]
              </Link>
            </div>
            <div className="font-[var(--font-sarabun)] text-center pt-2">
              <div className="text-lg font-bold text-white/90">LUMO888</div>
              <div className="text-[10px] text-white/40 tracking-normal">สล็อตเว็บตรง ยูสใหม่แตกง่าย รับล้าน(หัว)ทุกวัน</div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
