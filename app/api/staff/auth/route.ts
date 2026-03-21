import { NextResponse } from "next/server";
import { isStaffOrderingEnabled } from "@/lib/staff-ordering";

const STAFF_PURCHASE_PASSWORD = (process.env.STAFF_PURCHASE_PASSWORD || "makesomenoise").trim();

export async function POST(request: Request) {
  try {
    if (!isStaffOrderingEnabled()) {
      return NextResponse.json(
        { success: false, message: "ระบบรับสั่งซื้อ staff ปิดแล้ว" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password.trim() : "";

    if (!password || password !== STAFF_PURCHASE_PASSWORD) {
      return NextResponse.json({ success: false, message: "รหัส staff ไม่ถูกต้อง" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
