import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <p className="text-6xl mb-4" aria-hidden>🐰</p>
      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
        404
      </h1>
      <p className="text-white/60 text-sm mb-8 text-center">
        หน้าที่คุณตามหาไม่มีอยู่
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs text-center hover:bg-gray-200 transition-colors"
        >
          กลับหน้าหลัก
        </Link>
        <Link
          href="/product"
          className="px-8 py-4 border border-white/30 font-bold uppercase tracking-widest text-xs text-center hover:bg-white hover:text-black transition-colors"
        >
          ไปร้าน
        </Link>
      </div>
    </main>
  );
}
