import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, items, total, discount } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'No email provided' });
    }

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;font-family:monospace;font-size:13px;color:#aaa;">
          [PRE-ORDER] ${item.style || item.title}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;text-align:center;font-size:12px;color:#666;">
          ${item.size}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;text-align:center;font-size:12px;color:#666;">
          x${item.quantity}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;text-align:right;font-family:monospace;font-size:13px;color:#fff;">
          ฿${item.quantity * 329}
        </td>
      </tr>
    `).join('');

    const discountHtml = discount > 0 ? `
      <tr>
        <td colspan="3" style="padding:10px 0;font-size:11px;color:#4ade80;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Squad Promo Saved 🎉</td>
        <td style="padding:10px 0;text-align:right;font-family:monospace;color:#4ade80;">-฿${discount}</td>
      </tr>` : '';

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TU LUMORA — Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#fff;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table width="100%" style="max-width:560px;background:#0d0d0d;border:1px solid #1f1f1f;">
          
          <!-- Header -->
          <tr>
            <td style="background:#000;padding:40px 40px 32px;border-bottom:1px solid #1f1f1f;text-align:center;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#444;">Established 2026</p>
              <h1 style="margin:0;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-0.04em;text-transform:uppercase;color:#fff;">TU LUMORA</h1>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="background:#fff;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#000;font-weight:900;">ORDER CONFIRMED</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;font-size:14px;color:#aaa;line-height:1.8;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#555;">LUMO says welcome to the squad,</p>
              <p style="margin:0;font-size:22px;font-weight:900;font-style:italic;letter-spacing:-0.02em;color:#fff;text-transform:uppercase;">
                ${firstName} ${lastName}
              </p>
            </td>
          </tr>

          <!-- Body Text -->
          <tr>
            <td style="padding:16px 40px 32px;font-size:12px;color:#555;line-height:1.8;letter-spacing:0.05em;text-transform:uppercase;">
              Your pre-order has been safely received by LUMO.<br/>
              We will contact you via the info provided once your order ships.
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding:0 40px;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#444;font-weight:900;border-top:1px solid #1f1f1f;padding-top:24px;">
                Order Summary
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:9px;letter-spacing:0.3em;color:#333;text-transform:uppercase;padding-bottom:10px;font-weight:900;">Item</th>
                    <th style="text-align:center;font-size:9px;letter-spacing:0.3em;color:#333;text-transform:uppercase;padding-bottom:10px;font-weight:900;">Size</th>
                    <th style="text-align:center;font-size:9px;letter-spacing:0.3em;color:#333;text-transform:uppercase;padding-bottom:10px;font-weight:900;">Qty</th>
                    <th style="text-align:right;font-size:9px;letter-spacing:0.3em;color:#333;text-transform:uppercase;padding-bottom:10px;font-weight:900;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  ${discountHtml}
                  <tr>
                    <td colspan="3" style="padding:16px 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#444;font-weight:900;">Shipping</td>
                    <td style="padding:16px 0 4px;text-align:right;">
                      <span style="background:#fff;color:#000;font-size:9px;font-weight:900;padding:2px 8px;letter-spacing:0.2em;text-transform:uppercase;">FREE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1a1a1a;margin-top:16px;">
              <table width="100%">
                <tr>
                  <td style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#444;font-weight:900;">Total Paid</td>
                  <td style="text-align:right;font-size:28px;font-weight:900;font-style:italic;color:#fff;letter-spacing:-0.02em;">฿${total}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info box -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#111;border:1px solid #1f1f1f;padding:20px 24px;">
                <p style="margin:0 0 8px;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:#444;font-weight:900;">What's Next?</p>
                <p style="margin:0;font-size:11px;color:#555;line-height:1.8;letter-spacing:0.03em;text-transform:uppercase;">
                  — Your order is now in our system<br/>
                  — Tracking info will be sent via LINE / IG<br/>
                  — Estimated delivery: 3-5 business days after dispatch
                </p>
              </div>
            </td>
          </tr>

          <!-- LINE OA CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://lin.ee/19k0kWS" 
                style="display:inline-block;background:#06C755;color:#fff;padding:14px 32px;font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;">
                💬 Contact LINE OA
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #111;text-align:center;">
              <p style="margin:0 0 10px;font-size:9px;color:#444;letter-spacing:0.3em;text-transform:uppercase;">Sent by LUMO 🐾</p>
              <p style="margin:0;font-size:9px;color:#2a2a2a;letter-spacing:0.3em;text-transform:uppercase;">
                TU LUMORA — An Official Project by TUSU.RANGSIT<br/>
                © 2026 All Rights Reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'LUMO <orders@tulumora.com>',
      to: [email],
      subject: `✅ Order Confirmed — TU LUMORA PRE-ORDER`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
