export type PricingPhase = "flash1" | "normal" | "flash2" | "closed";

// ขอบ phase เป็น instant เวลาไทย (Bangkok +07:00) — เปรียบเทียบกับ "เวลาปัจจุบัน" เดียวกันทั้ง server/client
function makeBangkokInstant(iso: string) {
  return new Date(`${iso}+07:00`);
}

const PHASE_BOUNDARIES = {
  flash1End: makeBangkokInstant("2026-03-14T23:59:59"),
  normalEnd: makeBangkokInstant("2026-03-18T23:59:59"),
  flash2End: makeBangkokInstant("2026-03-20T23:59:59"),
};

// ใช้เวลาปัจจุบัน (instant) เปรียบเทียบกับขอบ phase — ไม่เลื่อน timezone เพื่อให้ตรงกับ countdown
export function getCurrentPhase(now: Date = new Date()): PricingPhase {
  if (now <= PHASE_BOUNDARIES.flash1End) return "flash1";
  if (now <= PHASE_BOUNDARIES.normalEnd) return "normal";
  if (now <= PHASE_BOUNDARIES.flash2End) return "flash2";
  return "closed";
}

interface CartItemLike {
  quantity: number;
}

export function calculateTotalForCart(items: CartItemLike[]): {
  phase: PricingPhase;
  total: number;
  originalTotal: number;
} {
  const phase = getCurrentPhase();
  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const BASE_PRICE = 329;
  const FLASH2_PRICE = 299;
  const PROMO_PAIR_PRICE = 590;

  let total = 0;

  if (phase === "flash1") {
    const promoQty = Math.min(totalQty, 6);
    const regularQty = totalQty - promoQty;
    const pairs = Math.floor(promoQty / 2);
    const promoSingles = promoQty % 2;
    total = pairs * PROMO_PAIR_PRICE + (promoSingles + regularQty) * BASE_PRICE;
  } else if (phase === "normal") {
    total = totalQty * BASE_PRICE;
  } else if (phase === "flash2") {
    total = totalQty * FLASH2_PRICE;
  } else {
    total = 0;
  }

  const originalTotal = totalQty * BASE_PRICE;
  return { phase, total, originalTotal };
}

