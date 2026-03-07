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
        <td style="padding:12px 0;border-bottom:1px solid #222;font-family:'Courier New',monospace;font-size:12px;color:#ddd;font-weight:bold;">
          [PRE-ORDER] ${item.style || item.title}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #222;text-align:center;font-size:12px;color:#888;">
          ${item.size}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #222;text-align:center;font-size:12px;color:#888;">
          x${item.quantity}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #222;text-align:right;font-family:'Courier New',monospace;font-size:13px;color:#fff;">
          ฿${item.quantity * 329}
        </td>
      </tr>
    `).join('');

    const discountHtml = discount > 0 ? `
      <tr>
        <td colspan="3" style="padding:15px 0 5px;font-size:10px;color:#4ade80;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Squad Promo Saved 🎉</td>
        <td style="padding:15px 0 5px;text-align:right;font-family:'Courier New',monospace;color:#4ade80;">-฿${discount}</td>
      </tr>` : '';

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TU LUMORA — E-Receipt</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Courier New', Courier, monospace;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;">
    <tr>
      <td align="center" style="padding:40px 15px;">
        
        <!-- Main Receipt Container -->
        <table width="100%" style="max-width:480px;background:#111;border:2px dashed #333;border-radius:12px;overflow:hidden;">
          
          <!-- Image/Brand Header -->
          <tr>
            <td style="padding:40px 0 10px;text-align:center;">
              <img src="https://www.tulumora.com/images/brand.png" alt="TU LUMORA" style="height:35px;opacity:0.9;" />
            </td>
          </tr>
          
          <!-- Mascot & Greeting -->
          <tr>
            <td style="padding:10px 30px;text-align:center;">
              <img src="https://www.tulumora.com/images/mascot.png" alt="LUMO Mascot" style="height:140px;margin-bottom:20px;filter:drop-shadow(0 0 10px rgba(255,255,255,0.1));" />
              <h1 style="margin:0 0 15px;font-size:26px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #333;padding-bottom:20px;">
                YOOOOO!<br/><span style="color:#fff;">${firstName}</span>
              </h1>
              <p style="margin:0;font-size:13px;color:#aaa;line-height:1.7;">
                LUMO here! 🐾<br/>
                Just dropping by to say <strong style="color:#fff;">THANK YOU</strong> for joining the squad. Your pre-order is safely locked in my data vault!
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="padding:10px;"></td></tr>
          
          <!-- Order Details -->
           <tr>
            <td style="padding:25px 30px;background:#0a0a0a;border-top:2px dashed #222;border-bottom:2px dashed #222;">
              <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.2em;color:#666;text-transform:uppercase;font-weight:bold;text-align:center;">
                [ SECURE FILE: ORDER DATA ]
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                ${discountHtml}
                <tr>
                   <td colspan="3" style="padding:15px 0 5px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;font-weight:bold;">DELIVERY ROUTE</td>
                   <td style="padding:15px 0 5px;text-align:right;color:#fff;font-weight:bold;">FREE</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Total Header -->
          <tr>
             <td style="padding:30px 30px 20px;text-align:center;">
              <p style="margin:0 0 5px;font-size:10px;color:#666;letter-spacing:0.3em;text-transform:uppercase;font-weight:bold;">TOTAL AMOUNT CLEARED</p>
              <h2 style="margin:0;font-size:42px;font-weight:900;letter-spacing:-0.05em;color:#fff;">฿${total}</h2>
            </td>
          </tr>

          <!-- Download E-Slip Button / Action -->
           <tr>
            <td style="padding:0 30px 40px;text-align:center;">
              <div style="background:#000;border:1px solid #333;padding:25px 20px;border-radius:8px;">
                <p style="margin:0 0 20px;font-size:11px;color:#888;letter-spacing:0.05em;line-height:1.6;">
                  "Screenshot this receipt or download your official digital Squad E-Pass right here 👇"
                </p>
                <a href="https://www.tulumora.com" target="_blank" style="display:inline-block;background:#fff;color:#000;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;border-radius:4px;box-shadow: 0 0 20px rgba(255,255,255,0.2);">
                  ⬇ DOWNLOAD E-PASS
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#000000;padding:25px 20px;text-align:center;border-top:1px solid #222;">
              <p style="margin:0;font-size:10px;color:#444;letter-spacing:0.3em;text-transform:uppercase;font-weight:bold;">
                TU LUMORA X TUSU.RANGSIT<br/>
                STAY WEIRD, STAY YOU.
              </p>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe / Meta footer -->
        <p style="margin:20px 0 0;font-size:10px;color:#333;text-align:center;font-family:sans-serif;">
           © 2026 TU LUMORA. Sent securely by LUMO.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'LUMO <orders@tulumora.com>',
      to: [email],
      subject: `✅ YOUR SQUAD PASS IS READY`,
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
