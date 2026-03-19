import { NextResponse } from "next/server";

const ADMIN_PIN = process.env.ADMIN_DASHBOARD_PIN || "LUMORA2026";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const pin = typeof body?.pin === "string" ? body.pin.trim().toUpperCase() : "";
    const expected = ADMIN_PIN.trim().toUpperCase();

    if (!pin || pin !== expected) {
      return NextResponse.json({ success: false, message: "ACCESS DENIED: รหัสผ่านไม่ถูกต้อง" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
