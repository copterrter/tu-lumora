"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { getCurrentPhase } from "@/lib/pricing";

type SpinResult = { success: boolean; type: string; code: string | null; discountPercent?: number; message?: string };

export default function BoothPage() {
  const [phase, setPhase] = useState<ReturnType<typeof getCurrentPhase> | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showShareUnlock, setShowShareUnlock] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPhase(getCurrentPhase());
  }, []);

  const runSpin = useCallback(async () => {
    if (getCurrentPhase() !== "normal") {
      setResult({ success: false, type: "closed", code: null, message: "กิจกรรมบูธเปิดเฉพาะช่วง Normal เท่านั้น" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/booth/spin", { method: "POST" });
      const data = await res.json();
      setResult(data);
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
    } catch {
      setResult({ success: false, type: "error", code: null, message: "เชื่อมต่อไม่สำเร็จ ลองใหม่" });
    } finally {
      setLoading(false);
    }
  }, []);

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
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-black pointer-events-none" />
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        <div className="w-24">
          <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto opacity-90" />
        </div>

        {phase === null ? (
          <p className="text-white/50 text-sm">กำลังโหลด...</p>
        ) : !normal ? (
          <div className="text-center space-y-4">
            <h1 className="text-xl font-black uppercase tracking-wider text-white/90">กิจกรรมสิ้นสุดแล้ว</h1>
            <p className="text-sm text-white/50">โค้ดส่วนลดจากบูธใช้ได้เฉพาะช่วง Normal เท่านั้น</p>
            <Link href="/" className="inline-block mt-6 px-8 py-4 border border-white/30 font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-6xl mb-2" aria-hidden>🐰</p>
              <h2 className="text-lg font-black uppercase tracking-widest text-white/80">ลูโม่รออยู่</h2>
              <p className="text-xs text-white/50 mt-1">กดสุ่มรางวัลด้านล่าง</p>
            </div>

            <button
              onClick={runSpin}
              disabled={loading || showShareUnlock}
              className="w-full max-w-xs py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg"
            >
              {loading ? "กำลังสุ่ม..." : showShareUnlock ? `สุ่มใหม่ได้ใน ${countdown} วินาที` : "สุ่มรางวัล"}
            </button>

            {result && result.type !== "0" && result.code && (
              <div className="w-full bg-white/5 border border-white/20 rounded-2xl p-6 text-center space-y-4">
                <p className="text-2xl font-black text-emerald-400 uppercase tracking-wider">Congratulations!</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-white">{result.code}</p>
                <p className="text-xs text-white/50">ส่วนลด {result.discountPercent}% — ใช้ได้ 1 ตัวที่ Checkout</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={copyCode} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-gray-200">
                    Copy Code
                  </button>
                  <button onClick={saveAsImage} className="px-6 py-3 bg-white/10 border border-white/30 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-white/20">
                    Save to Camera Roll
                  </button>
                </div>
                <p className="text-[10px] text-amber-300 font-bold mt-4">
                  💡 อย่าลืม! นำโค้ดไปกรอกในช่อง Promo Code ที่หน้าชำระเงิน (Checkout) เพื่อรับส่วนลด
                </p>
              </div>
            )}

            {result && result.type === "0" && result.message?.includes("ลูโม่") && (
              <div className="w-full bg-amber-950/30 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4">
                <p className="text-xl font-black text-amber-200">ลูโม่แอบกินส่วนลดของคุณไปแล้ว! 🐰</p>
                <p className="text-sm text-white/70">แชร์ IG Story เพื่อปลดล็อกสิทธิ์สุ่มใหม่ (หรือรอ {countdown} วินาที)</p>
              </div>
            )}

            {result && result.type === "0" && result.message && !result.message.includes("ลูโม่") && (
              <p className="text-sm text-white/60 text-center">{result.message}</p>
            )}
            {result && !result.success && result.message && result.type !== "0" && (
              <p className="text-sm text-red-300 text-center">{result.message}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
              <Link
                href="/product"
                className="flex-1 text-center py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-emerald-500"
              >
                🛒 Shop Now
              </Link>
              <Link
                href="/"
                className="flex-1 text-center py-4 border border-white/30 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white/10"
              >
                🏠 Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
