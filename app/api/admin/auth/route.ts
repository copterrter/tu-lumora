import { NextResponse } from "next/server";

const ADMIN_PIN = process.env.ADMIN_DASHBOARD_PIN?.trim();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const pin = typeof body?.pin === "string" ? body.pin.trim().toUpperCase() : "";
    if (!ADMIN_PIN) {
      return NextResponse.json({ success: false, message: "Server env missing: ADMIN_DASHBOARD_PIN" }, { status: 500 });
    }
    const expected = ADMIN_PIN.toUpperCase();

    if (!pin || pin !== expected) {
      return NextResponse.json({ success: false, message: "ACCESS DENIED: รหัสผ่านไม่ถูกต้อง" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
