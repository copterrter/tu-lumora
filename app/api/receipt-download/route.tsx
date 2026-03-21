import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ReceiptItem = { style: string; size: string; quantity: number };

function parseOrderItems(order: { product_name?: string; style?: string; size?: string; quantity?: number }): ReceiptItem[] {
  const name = String(order.product_name || "").trim();
  if (!name) {
    const qty = Math.max(1, Number(order.quantity) || 1);
    const styles = (order.style || "regular").toString().split(",").map((s: string) => s.trim() || "regular");
    const sizes = (order.size || "M").toString().split(",").map((s: string) => s.trim() || "M");
    const items: ReceiptItem[] = [];
    for (let i = 0; i < qty; i++) items.push({ style: styles[i % styles.length], size: sizes[i % sizes.length], quantity: 1 });
    return items;
  }
  const items: ReceiptItem[] = [];
  const re = /(\d+)\s*x\s*([^(]+)\(([^)]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(name)) !== null) {
    const qty = parseInt(m[1], 10) || 1;
    const label = (m[2] || "").trim().toUpperCase();
    const size = (m[3] || "").trim() || "M";
    const style = label.includes("CROP") ? "crop" : "regular";
    items.push({ style, size, quantity: qty });
  }
  if (items.length === 0) items.push({ style: "regular", size: "M", quantity: Math.max(1, Number(order.quantity) || 1) });
  return items;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let name = (searchParams.get("name") || "Customer").split(" ")[0];
  let total = searchParams.get("total") || "0";
  let items: ReceiptItem[] = [];

  const orderId = searchParams.get("orderId");
  if (orderId) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: order } = await supabase
        .from("orders")
        .select("firstName,total_amount,product_name,style,size,quantity")
        .eq("id", orderId)
        .single();
      if (order) {
        name = String(order.firstName || name).split(" ")[0];
        total = String(order.total_amount ?? total);
        items = parseOrderItems(order);
      }
    } catch {
      // fallback to query payload
    }
  }

  if (items.length === 0) {
    const itemsRaw = searchParams.get("items") || "";
    items = itemsRaw
      ? itemsRaw.split(",").map((s) => {
          const [style, size, qty] = s.split("|");
          return { style: style || "regular", size: size || "M", quantity: parseInt(qty || "1", 10) || 1 };
        })
      : [];
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const lines = items.length
    ? items.map((i) => `${escapeHtml(String(i.style).toUpperCase())} / Size ${escapeHtml(i.size)} x${i.quantity}`).join("<br/>")
    : "No item detail";

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>TU LUMORA Receipt</title>
</head>
<body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:24px;line-height:1.6;">
  <h1 style="margin:0 0 8px 0;">TU LUMORA RECEIPT</h1>
  <p style="margin:0 0 16px 0;color:#bbb;">Date: ${dateStr}</p>
  <p style="margin:0;"><b>Customer:</b> ${escapeHtml(name)}</p>
  <p style="margin:8px 0;"><b>Total Paid:</b> THB ${escapeHtml(String(total))}</p>
  <div style="margin-top:16px;padding:12px;border:1px solid #2a2a2a;background:#111;">
    <b>Items</b><br/>${lines}
  </div>
  <p style="margin-top:16px;color:#9ca3af;">Need official resend? Contact admin via LINE OA.</p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
