import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { sendTrackingEmail } from "@/lib/email";

// Helper to clean phone numbers (e.g. "+66 81 234 5678" -> "0812345678", "081-234-5678" -> "0812345678")
function cleanPhone(phone: string | number): string {
  if (!phone) return "";
  let p = String(phone).replace(/\D/g, "");
  if (p.startsWith("66")) {
    p = "0" + p.slice(2);
  }
  return p;
}

// Helper to clean names for fuzzy matching (lowercase, remove extra spaces)
function cleanName(name: string): string {
  if (!name) return "";
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read Excel File
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Parse to JSON (array of arrays to handle dynamic column names)
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (rawData.length < 2) {
      return NextResponse.json({ error: "Excel file is empty or missing headers" }, { status: 400 });
    }

    // Identify Columns (Scan first 10 rows for headers - couriers often have summary rows at top)
    let headerRowIdx = -1;
    let phoneIdx = -1;
    let nameIdx = -1;
    let trackIdx = -1;

    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i].map((h: any) => String(h).toLowerCase().trim());
      phoneIdx = row.findIndex(h => h.includes("โทร") || h.includes("phone") || h.includes("tel"));
      nameIdx = row.findIndex(h => h.includes("ชื่อ") || h.includes("name") || h.includes("ผู้รับ"));
      trackIdx = row.findIndex(h => h.includes("track") || h.includes("เลข") || h.includes("พัสดุ"));

      if (trackIdx !== -1 && (phoneIdx !== -1 || nameIdx !== -1)) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) {
      return NextResponse.json({ error: "Cannot find valid headers (Tracking + Name/Phone) in the first 10 rows of the Excel file" }, { status: 400 });
    }

    // Extract Tracking Data from Excel
    const updates = [];
    for (let i = headerRowIdx + 1; i < rawData.length; i++) {
      const row = rawData[i];
      const phone = phoneIdx !== -1 ? cleanPhone(row[phoneIdx]) : "";
      const name = nameIdx !== -1 ? cleanName(row[nameIdx]) : "";
      const track = trackIdx !== -1 ? String(row[trackIdx]).trim() : "";

      if (track && (phone || name)) {
        updates.push({ phone, name, trackingNumber: track });
      }
    }

    // Fetch all pending/processing orders from Supabase to match
    // We only fetch orders that haven't been shipped yet (or we can just fetch all and filter)
    const { data: dbOrders, error: dbError } = await supabase
      .from("orders")
      .select("id, firstName, lastName, phone, email, status")
      .neq("status", "SHIPPED");

    if (dbError) throw dbError;

    let matchCount = 0;
    let emailCount = 0;
    const errors = [];

    // Mapping and Updating
    for (const item of updates) {
      // Fuzzy Match by Phone OR Name (with minimum length safeguards against false positives)
      const matchedOrder = dbOrders?.find(o => {
        const dbPhone = cleanPhone(o.phone);
        const dbName1 = cleanName(`${o.firstName} ${o.lastName}`);
        const dbName2 = cleanName(`${o.firstName}${o.lastName}`);
        const cleanFirstName = cleanName(o.firstName);
        
        // phone must be at least 8 digits to match
        const phoneMatch = item.phone && item.phone.length >= 8 && dbPhone && dbPhone.includes(item.phone);
        
        // name must be at least 3 chars to prevent single letter matches
        const firstNameMatch = cleanFirstName.length >= 3 && item.name.includes(cleanFirstName);
        const nameMatch = item.name && item.name.length >= 3 && (
          dbName1.includes(item.name) || 
          dbName2.includes(item.name) || 
          firstNameMatch
        );
        
        return phoneMatch || nameMatch;
      });

      if (matchedOrder) {
        // Update Supabase Status & Tracking Number
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            status: "SHIPPED", 
            tracking_number: item.trackingNumber 
          })
          .eq("id", matchedOrder.id);

        if (!updateError) {
          matchCount++;
          // Send Tracking Email
          if (matchedOrder.email) {
            const emailResult = await sendTrackingEmail({
              email: matchedOrder.email,
              firstName: matchedOrder.firstName,
              trackingNumber: item.trackingNumber
            });
            if (emailResult.success) emailCount++;
            else errors.push(`Email failed for ${matchedOrder.email}: ${emailResult.message}`);
          }
          
          // Remove from local array so we don't double match
          const idx = dbOrders.indexOf(matchedOrder);
          if (idx > -1) dbOrders.splice(idx, 1);
        } else {
          errors.push(`DB Update failed for ID ${matchedOrder.id}: ${updateError.message}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed. Matched ${matchCount} orders and sent ${emailCount} emails.`,
      details: { totalRows: updates.length, matchCount, emailCount, errors }
    });

  } catch (error: any) {
    console.error("Upload tracking error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
