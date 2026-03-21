"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentPhase } from "@/lib/pricing";
import { isStaffOrderingEnabled } from "@/lib/staff-ordering";

type OrderData = { items: { quantity: number; style?: string; size?: string }[]; total: number };
const STAFF_UNIT_PRICE = 150;

function calculateStaffTotal(items: { quantity: number; style?: string }[]): number {
  return items.reduce((sum, item) => {
    return sum + (item.quantity ?? 0) * STAFF_UNIT_PRICE;
  }, 0);
}

export default function CheckoutPage() {
  const router = useRouter();
  const isStaffOnlyMode = process.env.NEXT_PUBLIC_STAFF_ONLY_MODE === "true";
  const staffOrderingEnabled = isStaffOrderingEnabled();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdpaChecked, setPdpaChecked] = useState(false);
  const [noRefundChecked, setNoRefundChecked] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPdpaModal, setShowPdpaModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [socialMode, setSocialMode] = useState<"ig" | "line" | "both">("ig");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", zipCode: "",
    igContact: "", lineContact: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [phase, setPhase] = useState<"flash1" | "normal" | "flash2" | "closed" | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [staffToken, setStaffToken] = useState("");
  const [staffTokenReady, setStaffTokenReady] = useState(false);
  const [staffPassword, setStaffPassword] = useState("");
  const [isStaffVerified, setIsStaffVerified] = useState(false);

  const [timeLeft, setTimeLeft] = useState(600);
  const hasStaffToken = staffToken.length > 0;
  const isStaffCheckout = hasStaffToken && isStaffVerified;

  const paymentSectionRef = useRef<HTMLDivElement | null>(null);

  // Session countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      // Redirect to home when expired
      router.push("/");
      return;
    }
    if (timeLeft === 30) {
      setShowTimeoutModal(true);
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const data = localStorage.getItem('lumora_order');
    if (data) setOrderData(JSON.parse(data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStaffToken(params.get("staff") ?? "");
    setStaffTokenReady(true);
  }, []);

  useEffect(() => {
    if (!staffTokenReady) return;
    if (hasStaffToken && !staffOrderingEnabled) {
      router.replace("/closed");
      return;
    }
    if (!isStaffOnlyMode) return;
    if (!hasStaffToken) {
      router.replace("/closed");
    }
  }, [isStaffOnlyMode, staffTokenReady, hasStaffToken, staffOrderingEnabled, router]);

  useEffect(() => {
    const verifyOnEnter = async () => {
      if (!staffOrderingEnabled) return;
      if (!hasStaffToken || isStaffVerified) return;

      const input = window.prompt("กรอกรหัส staff เพื่อเข้าโหมดสั่งซื้อพิเศษ");
      if (!input || !input.trim()) {
        alert("ไม่ได้กรอกรหัส staff");
        router.push("/closed");
        return;
      }

      try {
        const res = await fetch("/api/staff/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: input.trim() }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.message || "รหัส staff ไม่ถูกต้อง");
          router.push("/closed");
          return;
        }
        setStaffPassword(input.trim());
        setIsStaffVerified(true);
      } catch {
        alert("ตรวจสอบรหัส staff ไม่สำเร็จ");
        router.push("/closed");
      }
    };
    verifyOnEnter();
  }, [staffOrderingEnabled, hasStaffToken, isStaffVerified, router]);

  useEffect(() => {
    const t = setTimeout(() => setPhase(getCurrentPhase()), 0);
    return () => clearTimeout(t);
  }, []);

  const totalQty = orderData ? orderData.items.reduce((s, item) => s + item.quantity, 0) : 0;
  useEffect(() => {
    if (!orderData) return;
    if (isStaffCheckout || totalQty !== 1 || phase !== "normal") {
      setAppliedPromo(null);
      setPromoError("");
    }
  }, [orderData, totalQty, phase, isStaffCheckout]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("0910792886");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPromo = async () => {
    if (isStaffCheckout) return;
    const code = promoInput.trim().toUpperCase();
    if (!code || !orderData) return;
    setPromoError("");
    setIsApplyingPromo(true);
    try {
      const res = await fetch("/api/booth/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, quantity: totalQty, items: orderData.items }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedPromo({ code: data.code ?? code, discountPercent: data.discountPercent });
      } else {
        setAppliedPromo(null);
        setPromoError(data.message || "โค้ดไม่ถูกต้องหรือใช้ไปแล้ว");
      }
    } catch {
      setAppliedPromo(null);
      setPromoError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setSlipFile(null); return; }
    if (!file.type.startsWith('image/')) {
      alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้นครับ (JPG, PNG)");
      e.target.value = ''; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ใหญ่เกินไปครับ (จำกัดไม่เกิน 5MB)");
      e.target.value = ''; return;
    }
    setSlipFile(file);
    if (submitAttempted) {
      setFormErrors(prev => ({ ...prev, slipFile: "" }));
    }

    // หลังอัปโหลดสลิปแล้ว พาลูกค้าไปยังส่วนสรุปยอด/ปุ่มจ่ายเงิน
    paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Validation logic
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "กรุณากรอกชื่อ";
    } else if (!/^[a-zA-Zก-๙\s]+$/.test(formData.firstName.trim())) {
      errors.firstName = "กรุณากรอกเฉพาะตัวอักษรเท่านั้น";
    }
    if (!formData.email.trim()) {
      errors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (!formData.phone.trim()) {
      errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^\d{9,10}$/.test(formData.phone.replace(/[-\s]/g, ""))) {
      errors.phone = "เบอร์ต้องมี 9-10 หลัก";
    }
    if (!formData.address.trim()) errors.address = "กรุณากรอกที่อยู่";
    if (!formData.zipCode.trim()) {
      errors.zipCode = "กรุณากรอกรหัสไปรษณีย์";
    } else if (!/^\d{5}$/.test(formData.zipCode.trim())) {
      errors.zipCode = "รหัสไปรษณีย์ต้องมี 5 หลัก";
    }
    // Social contact — require at least the selected channel
    if (socialMode === "ig" || socialMode === "both") {
      if (!formData.igContact.trim()) errors.igContact = "กรุณากรอก Instagram ID";
    }
    if (socialMode === "line" || socialMode === "both") {
      if (!formData.lineContact.trim()) errors.lineContact = "กรุณากรอก LINE ID";
    }
    if (!slipFile) errors.slipFile = "กรุณาอัปโหลดสลิปการโอนเงิน";
    return errors;
  };

  const handleFieldChange = (field: string, value: string) => {
    // พิเศษสำหรับช่องที่อยู่: ถ้ามีเลข 5 หลักท้าย (รหัสไปรษณีย์) ให้ดึงออกไปใส่ zipCode อัตโนมัติ
    if (field === "address") {
      const match = value.match(/(\d{5})(?!.*\d{5})/);
      if (match) {
        const postcode = match[1];
        const cleanedAddress = value.replace(match[1], "").replace(/\s*,?\s*$/, "");
        setFormData(prev => ({
          ...prev,
          address: cleanedAddress,
          zipCode: postcode,
        }));
        if (submitAttempted) {
          setFormErrors(prev => ({
            ...prev,
            address: "",
            zipCode: "",
          }));
        }
        return;
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitAttempted && formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Build the combined socialContact string for the order
  const buildSocialContact = () => {
    if (socialMode === "ig") return `IG: ${formData.igContact}`;
    if (socialMode === "line") return `LINE: ${formData.lineContact}`;
    return `IG: ${formData.igContact} | LINE: ${formData.lineContact}`;
  };

  const verifySlipWithRDCW = async (file: File, orderData: OrderData, formData: Record<string, string | undefined>) => {
    const body = new FormData();
    body.append("file", file);
    body.append("orderData", JSON.stringify(orderData));
    body.append("formData", JSON.stringify(formData));
    const response = await fetch("/api/verify", { method: "POST", body: body });
    return await response.json();
  };

  const handleConfirmOrder = async () => {
    setSubmitAttempted(true);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!pdpaChecked || !noRefundChecked) {
      setFormErrors(prev => ({
        ...prev,
        pdpa: !pdpaChecked ? "กรุณายอมรับนโยบายความเป็นส่วนตัว" : "",
        noRefund: !noRefundChecked ? "กรุณายืนยันว่ารับทราบเงื่อนไข" : "",
      }));
      return;
    }
    if (!orderData || !slipFile) {
      alert("ข้อมูลออเดอร์หรือสลิปไม่ครบ กรุณากลับไป chọnสินค้าและอัปโหลดสลิป");
      return;
    }

    setIsSubmitting(true);
    try {
      const enrichedFormData = {
        ...formData,
        socialContact: buildSocialContact(),
        promoCode: appliedPromo?.code ?? "",
        staffToken,
        staffPassword,
      };
      const slipResult = await verifySlipWithRDCW(slipFile, orderData, enrichedFormData);
      if (!slipResult.success) throw new Error(slipResult.message || "การสั่งซื้อไม่สำเร็จ โปรดลองอีกครั้ง");
      localStorage.removeItem('lumora_cart');
      const shouldGoManualThankyou = !!slipResult.manualFallback;
      router.push(shouldGoManualThankyou ? "/thankyou?manual=1" : "/thankyou");
    } catch (err: unknown) {
      alert("แจ้งเตือน: " + (err instanceof Error ? err.message : "เกิดข้อผิดพลาด"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData) return null;

  const originalTotal = orderData.items.reduce((sum: number, item: { quantity: number }) => sum + (item.quantity * 329), 0);
  const staffTotal = calculateStaffTotal(orderData.items);
  const displayTotal = isStaffCheckout
    ? staffTotal
    : (appliedPromo && totalQty === 1
      ? 329 - Math.round(329 * appliedPromo.discountPercent / 100)
      : orderData.total);
  const discount = originalTotal - displayTotal;

  const inputClass = (field: string) =>
    `bg-transparent border p-4 text-xs tracking-widest focus:outline-none w-full transition-colors ${
      formErrors[field]
        ? "border-red-500 bg-red-500/5 focus:border-red-400"
        : "border-white/20 focus:border-white"
    }`;

  const ErrorMsg = ({ field }: { field: string }) =>
    formErrors[field] ? (
      <p className="text-red-400 text-[10px] tracking-widest mt-1 font-bold">{formErrors[field]}</p>
    ) : null;

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">

      {/* Session Timeout Warning Modal */}
      {showTimeoutModal && timeLeft > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="border border-red-500/40 bg-[#0a0a0a] max-w-sm w-full p-8 text-center space-y-6 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
            {/* Pulsing icon */}
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center w-16 h-16">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20" />
                <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-400 text-2xl">
                  ⏱
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">SESSION EXPIRING</h2>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                สินค้าที่จองไว้จะถูกปล่อยในอีก
              </p>
              <p className="text-5xl font-black italic text-red-400 tabular-nums">
                {formatTime(timeLeft)}
              </p>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">ระบบจะพากลับหน้าหลักโดยอัตโนมัติ</p>
            </div>
            <button
              onClick={() => setShowTimeoutModal(false)}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-4 font-black uppercase tracking-[0.3em] text-xs transition-all"
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      )}

      {/* PDPA Modal */}
      {showPdpaModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowPdpaModal(false)}>
          <div className="bg-[#111] border border-white/10 max-w-lg w-full p-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black uppercase tracking-widest mb-6">นโยบายความเป็นส่วนตัว (PDPA)</h2>
            <div className="text-xs text-gray-400 space-y-4 leading-relaxed">
              <p>เราเก็บข้อมูลส่วนบุคคล (ชื่อ ที่อยู่ เบอร์โทร) เพื่อใช้ในการจัดส่งสินค้าเท่านั้น</p>
              <p>ข้อมูลของคุณจะไม่ถูกเปิดเผย ขาย หรือโอนให้กับบุคคลที่สามโดยไม่ได้รับความยินยอม</p>
              <p>คุณมีสิทธิ์ขอลบข้อมูลได้หลังจากการจัดส่งสำเร็จ ผ่านช่องทาง LINE OA</p>
              <p>ข้อมูลจะถูกเก็บรักษาไว้เป็นระยะเวลา 90 วัน</p>
            </div>
            <button onClick={() => setShowPdpaModal(false)} className="mt-8 w-full bg-white text-black py-3 font-black uppercase tracking-widest text-xs">รับทราบ</button>
          </div>
        </div>
      )}

      {/* Countdown Banner — TOP */}
      <div className={`w-full py-3 flex justify-center items-center gap-3 border-b border-white/5 transition-colors duration-500 ${timeLeft <= 60 ? 'bg-red-950' : 'bg-[#0a0a0a]'}`}>
        {timeLeft > 0 && <div className={`w-1.5 h-1.5 bg-red-500 rounded-full ${timeLeft <= 60 ? 'animate-ping' : 'animate-pulse'}`} />}
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-white">
          INVENTORY RESERVED FOR{" "}
          <span className={`ml-1 font-black tracking-widest tabular-nums ${timeLeft <= 60 ? 'text-red-400' : 'text-red-400'}`}>
            {formatTime(timeLeft)}
          </span>
        </p>
      </div>

      <div className="p-4 sm:p-6 md:p-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* LEFT: Form */}
          <div className="space-y-12">
            <header className="space-y-4">
              <Link href="/product" className="text-[10px] tracking-widest text-gray-500 uppercase hover:text-white transition-colors">[ BACK TO SHOP ]</Link>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">SHIPPING <br/> INFORMATION</h1>
            </header>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-error={!!formErrors.firstName}>
                  <input
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange("firstName", e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""))}
                    type="text"
                    placeholder="FIRST NAME *"
                    className={inputClass("firstName")}
                  />
                  <ErrorMsg field="firstName" />
                </div>
                <div>
                  <input
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange("lastName", e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""))}
                    type="text"
                    placeholder="LAST NAME"
                    className="bg-transparent border border-white/20 p-4 text-xs tracking-widest focus:border-white outline-none w-full"
                  />
                </div>
              </div>

              <div data-error={!!formErrors.email}>
                <input
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  type="email"
                  placeholder="EMAIL (FOR RECEIPT) *"
                  className={`${inputClass("email")} bg-[#111]`}
                />
                <ErrorMsg field="email" />
              </div>

              {/* IG / LINE / Both Selector */}
              <div className="space-y-3">
                <div className="flex border border-white/10 overflow-hidden">
                  {(["ig", "line", "both"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setSocialMode(mode);
                        setFormErrors(prev => ({ ...prev, igContact: "", lineContact: "" }));
                      }}
                      className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                        socialMode === mode ? "bg-white text-black" : "bg-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      {mode === "ig" ? "Instagram" : mode === "line" ? "LINE" : "Both"}
                    </button>
                  ))}
                </div>
                {(socialMode === "ig" || socialMode === "both") && (
                  <div data-error={!!formErrors.igContact}>
                    <input
                      value={formData.igContact}
                      onChange={(e) => handleFieldChange("igContact", e.target.value)}
                      type="text"
                      autoComplete="off"
                      placeholder="Instagram ID (e.g. @username) *"
                      className={`${inputClass("igContact")} bg-[#111]`}
                    />
                    <ErrorMsg field="igContact" />
                  </div>
                )}
                {(socialMode === "line" || socialMode === "both") && (
                  <div data-error={!!formErrors.lineContact}>
                    <input
                      value={formData.lineContact}
                      onChange={(e) => handleFieldChange("lineContact", e.target.value)}
                      type="text"
                      autoComplete="off"
                      placeholder="LINE ID *"
                      className={`${inputClass("lineContact")} bg-[#111]`}
                    />
                    <ErrorMsg field="lineContact" />
                  </div>
                )}
              </div>

              <div data-error={!!formErrors.address}>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  placeholder="FULL ADDRESS (HOUSE NO. / STREET / DISTRICT) *"
                  rows={3}
                  className={inputClass("address")}
                />
                <ErrorMsg field="address" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-error={!!formErrors.zipCode}>
                  <input
                    value={formData.zipCode}
                    onChange={(e) => handleFieldChange("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="POSTAL CODE *"
                    className={inputClass("zipCode")}
                  />
                  <ErrorMsg field="zipCode" />
                </div>
                <div data-error={!!formErrors.phone}>
                  <input
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="PHONE NUMBER *"
                    className={inputClass("phone")}
                  />
                  <ErrorMsg field="phone" />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-white/10 space-y-6">
              <div
                ref={paymentSectionRef}
                className="bg-[#111] p-4 sm:p-8 flex flex-col items-center gap-6 border border-white/5 relative overflow-hidden"
              >
                <div className="text-center space-y-2 z-10 w-full">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em]">Transfer Amount</p>
                  <p className="text-4xl sm:text-5xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">฿{displayTotal}</p>
                  {discount > 0 && (
                    <p className="text-green-400 text-xs font-bold tracking-widest">You saved ฿{discount} with Squad Promo! 🎉</p>
                  )}
                </div>

                {/* Bank Account Block */}
                <div className="w-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 p-6 relative overflow-hidden z-10 box-border">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] pointer-events-none" />
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Bank</p>
                        <p className="text-sm font-black text-white tracking-wider">BANGKOK BANK <span className="text-xs font-medium text-gray-300 ml-1">(ธ.กรุงเทพ)</span></p>
                      </div>
                      <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-[0_0_15px_rgba(30,64,175,0.3)]">
                        <img src="/images/BB.png" alt="Bangkok Bank Logo" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Account Name</p>
                      <p className="text-[11px] sm:text-xs font-bold text-gray-200 leading-relaxed uppercase break-words">
                        องค์การนักศึกษามหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต ประจำปีการศึกษา 2568
                      </p>
                    </div>

                    <div className="mt-2 flex flex-col sm:flex-row justify-between items-center bg-black/50 border border-white/10 p-2 sm:pl-4 gap-3 box-border">
                      <span className="font-black text-lg sm:text-2xl tracking-[0.15em] text-white">091-0-79288-6</span>
                      <button
                        onClick={copyToClipboard}
                        className={`w-full sm:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                      >
                        {copied ? "COPIED ✅" : "COPY"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3" data-error={!!formErrors.slipFile}>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex justify-between">
                  <span>Upload Payment Slip <span className="text-red-500">*</span></span>
                  <span className="text-gray-600 font-normal normal-case tracking-normal">Max 5MB (JPG, PNG)</span>
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className={`w-full text-xs text-gray-400 file:bg-white file:text-black file:px-6 file:py-3 file:border-0 file:font-black file:uppercase file:tracking-widest file:mr-4 file:cursor-pointer hover:file:bg-gray-200 transition-all border p-1 ${
                    formErrors.slipFile ? "border-red-500 bg-red-500/5" : "border-white/10"
                  }`}
                />
                <ErrorMsg field="slipFile" />
              </div>

              {/* LINE OA support */}
              <div className="flex items-center gap-3 border border-green-500/20 bg-green-500/5 p-4">
                <span className="text-green-400 text-lg">💬</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  มีปัญหาหรือต้องการความช่วยเหลือ?{" "}
                  <a href="https://lin.ee/19k0kWS" target="_blank" className="text-green-400 underline underline-offset-2 hover:text-green-300 font-bold">
                    ติดต่อ LINE OA ของเราได้เลย
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="bg-[#0a0a0a] p-8 md:p-10 border border-white/10 h-fit space-y-8 sticky top-20 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold tracking-[0.3em] uppercase opacity-30">Your Squad List</h2>
              <span className="bg-white/10 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-white/10">
                {isStaffCheckout ? "STAFF COST MODE" : "PRE-ORDER"}
              </span>
            </div>

            <div className="space-y-5">
              {orderData.items.map((item: OrderData["items"][number], idx: number) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <p className="font-black italic text-base uppercase leading-tight">[PRE-ORDER] TU LUMORA {item.style}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm text-gray-400 shrink-0 ml-4">
                    ฿{item.quantity * (isStaffCheckout ? STAFF_UNIT_PRICE : 329)}
                  </span>
                </div>
              ))}
            </div>

            {!isStaffCheckout && (phase === "normal" || phase === null) && totalQty === 1 && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">โค้ดส่วนลดจากบูธ</label>
                <input
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                  onBlur={() => promoInput.trim() && handleApplyPromo()}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), promoInput.trim() && handleApplyPromo())}
                  placeholder={isApplyingPromo ? "กำลังตรวจสอบ..." : "ใส่โค้ดแล้วกด Enter หรือคลิกออกจากช่อง"}
                  className="w-full bg-transparent border border-white/20 p-3 text-xs tracking-widest focus:outline-none focus:border-white"
                />
                {appliedPromo && (
                  <p className="text-[10px] text-green-400 font-bold">ใช้โค้ดสำเร็จ ลด {appliedPromo.discountPercent}% (จะหักเมื่อจ่ายเงินจริง)</p>
                )}
                {promoError && <p className="text-[10px] text-red-400 font-bold">{promoError}</p>}
              </div>
            )}
            {phase === "normal" && totalQty > 1 && (
              <p className="text-[10px] text-white/40 pt-2">โค้ดส่วนลดจากบูธใช้ได้เมื่อซื้อ 1 ตัวเท่านั้น</p>
            )}

            <div className="pt-6 border-t border-white/10 space-y-3 text-xs font-bold tracking-widest uppercase">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>฿{originalTotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 bg-green-500/10 -mx-8 md:-mx-10 px-8 md:px-10 py-3 border-y border-green-500/10">
                  <span>
                    {appliedPromo
                      ? "ส่วนลดจากโค้ด"
                      : phase === "flash2"
                        ? "Flash Deal Discount"
                        : "Squad Promo Saved 🎉"}
                  </span>
                  <span className="italic font-black text-sm">-฿{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300 items-center">
                <span>Shipping</span>
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-600">฿50</span>
                  <span className="bg-white text-black px-2 py-1 text-[9px] font-black">FREE</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between font-black italic text-4xl tracking-tighter uppercase pt-4 border-t border-white/10">
              <span className="opacity-20">Total</span><span>฿{displayTotal}</span>
            </div>

            {/* PDPA Checkbox 1 */}
            <div>
              <div className={`flex items-start gap-3 cursor-pointer group p-3 rounded transition-colors ${formErrors.pdpa ? 'bg-red-500/5 border border-red-500/40' : ''}`} onClick={() => {
                const next = !pdpaChecked;
                setPdpaChecked(next);
                if (next) setFormErrors(prev => ({ ...prev, pdpa: "" }));
              }}>
                <button
                  type="button"
                  className={`w-4 h-4 mt-0.5 flex items-center justify-center border text-[10px] font-black shrink-0 ${
                    pdpaChecked ? 'bg-white text-black border-white' : 'border-white/40 text-transparent'
                  }`}
                >
                  ✓
                </button>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                  ฉันได้อ่านและยอมรับ{" "}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setShowPdpaModal(true); }} className="underline underline-offset-2 text-white/60 hover:text-white">
                    นโยบายความเป็นส่วนตัว (PDPA)
                  </button>
                  {" "}และยินยอมให้เก็บข้อมูลเพื่อดำเนินการสั่งซื้อ
                </span>
              </div>
              <ErrorMsg field="pdpa" />
            </div>

            {/* PDPA Checkbox 2 — No Refund */}
            <div>
              <div className={`flex items-start gap-3 cursor-pointer group p-3 rounded transition-colors ${formErrors.noRefund ? 'bg-red-500/5 border border-red-500/40' : ''}`} onClick={() => {
                const next = !noRefundChecked;
                setNoRefundChecked(next);
                if (next) setFormErrors(prev => ({ ...prev, noRefund: "" }));
              }}>
                <button
                  type="button"
                  className={`w-4 h-4 mt-0.5 flex items-center justify-center border text-[10px] font-black shrink-0 ${
                    noRefundChecked ? 'bg-white text-black border-white' : 'border-white/40 text-transparent'
                  }`}
                >
                  ✓
                </button>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                  ฉันรับทราบว่าสินค้า Pre-Order ไม่สามารถยกเลิกหรือขอคืนเงินได้หลังชำระเงินแล้ว
                </span>
              </div>
              <ErrorMsg field="noRefund" />
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-full bg-white text-black border border-transparent hover:bg-transparent hover:text-white hover:border-white py-6 font-black uppercase tracking-[0.4em] text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {isSubmitting ? "PROCESSING..." : "CONTINUE AND PAY"}
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}