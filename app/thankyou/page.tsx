"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function ThankYouPage() {
  const [isManual, setIsManual] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsManual(params.get("manual") === "1");
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        generateBrandedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBrandedImage = (userImgSrc: string) => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const userImg = new Image();
    const frameImg = new Image();

    userImg.src = userImgSrc;
    frameImg.src = "/images/frame-custom.png";

    let loadedCount = 0;
    const totalToLoad = 2;

    const onAssetLoad = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        // Assuming the custom frame is designed for 9:16 IG Story (e.g., 1080x1920)
        canvas.width = 1080;
        canvas.height = 1920;

        // 1. Draw User Image (Fill canvas)
        const drawHeight = canvas.height;
        const drawWidth = canvas.width;
        const imgRatio = userImg.width / userImg.height;
        const areaRatio = drawWidth / drawHeight;

        let sx, sy, sWidth, sHeight;
        if (imgRatio > areaRatio) {
          sHeight = userImg.height;
          sWidth = userImg.height * areaRatio;
          sx = (userImg.width - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = userImg.width;
          sHeight = userImg.width / areaRatio;
          sx = 0;
          sy = (userImg.height - sHeight) / 2;
        }

        // Draw user image centered to fill the entire canvas
        ctx.drawImage(userImg, sx, sy, sWidth, sHeight, 0, 0, drawWidth, drawHeight);

        // 2. Draw Custom Frame Overlay
        // The frame should have a transparent cutout where the user's photo should be visible
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

        setGeneratedImage(canvas.toDataURL("image/jpeg", 0.9));
        setIsGenerating(false);
      }
    };

    userImg.onload = onAssetLoad;
    frameImg.onload = onAssetLoad;
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "LUMO_SQUAD_STORY.jpg";
    link.click();
  };

  const shareToInstagram = async () => {
    if (!generatedImage) return;

    // Convert Base64 to Blob for sharing
    const res = await fetch(generatedImage);
    const blob = await res.blob();
    const file = new File([blob], "LUMO_SQUAD_STORY.jpg", { type: "image/jpeg" });

    // Try Native Web Share API (Works well on Safari/iOS and Android Chrome)
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "LUMO SQUAD",
          text: "Joined the #LUMOSQUAD! @TUSU.RANGSIT",
        });
      } catch (error) {
        console.log("Share failed or was canceled", error);
        // Fallback to Download if share fails/cancels
        downloadImage();
      }
    } else {
      // Fallback: Download the image and instruct the user
      downloadImage();
      alert("Image saved! Open Instagram -> Story -> Select from Gallery to share.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-6 text-center relative overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 blur-[120px] rounded-full pointer-events-none" />
      
      {/* 1. Header Section */}
      <motion.div 
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-32 mb-8"
      >
        <img src="/images/brand.png" alt="TU LUMORA" className="w-full h-auto opacity-90" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight mb-2">
          {isManual ? (
            <>
              PAYMENT <span className="text-white/40">PENDING REVIEW</span>
            </>
          ) : (
            <>
              ORDER <span className="text-white/40">CONFIRMED</span>
            </>
          )}
        </h1>
        <p className="text-gray-500 uppercase tracking-[0.2em] text-[9px] md:text-xs">
          {isManual
            ? "We have received your order and payment slip. Our team is currently reviewing your payment."
            : "Your order has been received. Check your email for the receipt."
          }
        </p>
      </motion.div>

      <div className="max-w-2xl w-full flex flex-col items-center gap-12">
        
        {/* 2. Primary Action: Share to Viral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-3xl w-full relative group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-white mb-2">Join the #LUMOSQUAD</h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest">Create & Share your exclusive Story Frame</p>
            </div>

            <div className="aspect-[9/16] max-w-[320px] mx-auto bg-black border border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center shadow-2xl">
              {generatedImage ? (
                <img src={generatedImage} alt="Generated Story" className="w-full h-full object-cover" />
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <div className="text-gray-500 text-[10px] font-mono tracking-widest uppercase">Generating...</div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8 cursor-pointer group/upload" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-2xl group-hover/upload:scale-110 group-hover/upload:border-white/30 transition-all">📸</div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    Tap to upload photo<br/><span className="text-gray-600">to get branded frame</span>
                  </p>
                </div>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="space-y-3">
              {!generatedImage ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white text-black py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-gray-200 transition-all shadow-xl active:scale-[0.98]"
                >
                  Upload My Photo
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/5 border border-white/10 py-5 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all"
                  >
                    Change
                  </button>
                  <button 
                    onClick={shareToInstagram}
                    className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white py-5 font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-90 transition-all shadow-xl"
                  >
                    Share to IG Story
                  </button>
                </div>
              )}
              
              <p className="text-[9px] text-gray-600 uppercase tracking-widest text-center pt-2">
                Post to your IG Story & Tag <span className="text-white">@TUSU.RANGSIT</span>
              </p>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </motion.div>

        {/* 3. Secondary Info & Socials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full space-y-12"
        >
          <div className="py-10 border-y border-white/10 w-full">
            <h2 className="text-xl md:text-2xl font-black italic tracking-[0.1em] uppercase mb-4 text-white">
              SQUAD <span className="text-white/40">DASHBOARD</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-2">
                <p className="text-white font-bold text-[10px] uppercase tracking-widest">Tracking & Support</p>
                <p className="text-[#888] text-[10px] tracking-widest leading-relaxed">
                  เราจะอัพเดทสถานะการจัดส่งผ่านทาง LINE OA ลิงก์ด้านล่างครับ
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white font-bold text-[10px] uppercase tracking-widest">Community</p>
                <p className="text-[#888] text-[10px] tracking-widest leading-relaxed">
                  Join #LUMOSQUAD via IG <a href="https://www.instagram.com/tusu.rangsit/" target="_blank" className="text-white font-bold hover:text-gray-400">@TUSU.RANGSIT</a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <a 
              href="https://lin.ee/19k0kWS" 
              target="_blank"
              className="flex-1 flex items-center justify-center gap-3 bg-[#06C755] text-white px-8 py-5 font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all"
            >
              Contact via LINE OA
            </a>
            <Link href="/" className="flex-1 flex items-center justify-center px-8 py-5 border border-white/20 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
              BACK TO HOME
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}