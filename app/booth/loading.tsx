export default function BoothLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
        <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
        <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
        <div className="h-12 w-[min(280px,82vw)] rounded-full bg-white/5 animate-pulse" />
      </div>
    </main>
  );
}
