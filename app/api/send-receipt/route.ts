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
        <td style="padding:16px 0;border-bottom:1px solid #333;font-family:'Courier New',monospace;font-size:12px;color:#fff;font-weight:bold;letter-spacing:1px;">
          ${item.style || item.title}
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #333;text-align:center;font-size:12px;color:#888;">
          ${item.size}
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #333;text-align:center;font-size:12px;color:#888;">
          ${item.quantity}
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #333;text-align:right;font-family:'Courier New',monospace;font-size:13px;color:#fff;letter-spacing:1px;">
          ฿${item.quantity * 329}
        </td>
      </tr>
    `).join('');

    const discountHtml = discount > 0 ? `
      <tr>
        <td colspan="3" style="padding:15px 0 5px;font-size:10px;color:#4ade80;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">PROMO APPLIED</td>
        <td style="padding:15px 0 5px;text-align:right;font-family:'Courier New',monospace;color:#4ade80;letter-spacing:1px;">-฿${discount}</td>
      </tr>` : '';

    const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>TU LUMORA — E-Receipt</title>
  <style>
    :root { color-scheme: dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #000000 !important; color: #ffffff !important; }
    .email-container { width: 100% !important; max-width: 600px !important; margin: 0 auto !important; }
    [data-ogsc] body { background-color: #000000 !important; color: #ffffff !important; }
    @media screen and (max-width: 600px) {
      .mobile-padding { padding: 20px !important; }
      .header-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#000000;color:#ffffff;font-family:'Courier New', Courier, monospace;-webkit-font-smoothing:antialiased;">
  <!-- Fallback table wrapper to force dark background in Gmail -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#000000;" bgcolor="#000000">
    <tr>
      <td align="center" valign="top" style="background-color:#000000;padding:40px 15px;" class="mobile-padding">
        
        <table border="0" cellpadding="0" cellspacing="0" class="email-container" style="max-width:500px;width:100%;background-color:#000000;border:1px solid #333333;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding:30px 20px 20px;border-bottom:1px solid #333333;">
              <h1 style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:bold;letter-spacing:10px;text-transform:uppercase;color:#ffffff;">
                TU LUMORA
              </h1>
              <p style="margin:10px 0 0;font-size:9px;letter-spacing:5px;color:#666666;text-transform:uppercase;">
                EST. 2026
              </p>
            </td>
          </tr>
          
          <!-- AUTHORIZATION STATUS -->
          <tr>
            <td align="center" style="padding:40px 30px 20px;">
              <p style="margin:0 0 10px;font-size:11px;color:#888888;letter-spacing:2px;text-transform:uppercase;">
                STATUS: <span style="color:#ffffff;">AUTHORIZED</span>
              </p>
              <h2 class="header-title" style="margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#ffffff;border-bottom:1px solid #222;padding-bottom:15px;">
                SQUAD ENROLLMENT
              </h2>
            </td>
          </tr>

          <!-- MESSAGE -->
          <tr>
            <td style="padding:10px 30px 30px;font-size:13px;color:#aaaaaa;line-height:1.8;letter-spacing:1px;text-align:justify;">
              ID: ${firstName.toUpperCase()} ${lastName.toUpperCase()}<br/><br/>
              YOUR PRE-ORDER HAS BEEN SUCCESSFULLY PROCESSED AND LOGGED INTO THE SYSTEM. THIS TRANSMISSION SERVES AS YOUR OFFICIAL PROOF OF ENROLLMENT.
            </td>
          </tr>
          
          <!-- DATALOG / ORDER DETAILS -->
           <tr>
            <td style="padding:30px;background-color:#050505;border-top:1px solid #222222;border-bottom:1px solid #222222;">
              <p style="margin:0 0 20px;font-size:10px;letter-spacing:3px;color:#555555;text-transform:uppercase;font-weight:bold;">
                // SECURE LOG: DATAFILE
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                   <td style="padding-bottom:10px;font-size:9px;color:#444;letter-spacing:2px;border-bottom:1px solid #222;">ITEM</td>
                   <td style="padding-bottom:10px;font-size:9px;color:#444;letter-spacing:2px;border-bottom:1px solid #222;text-align:center;">SIZE</td>
                   <td style="padding-bottom:10px;font-size:9px;color:#444;letter-spacing:2px;border-bottom:1px solid #222;text-align:center;">QTY</td>
                   <td style="padding-bottom:10px;font-size:9px;color:#444;letter-spacing:2px;border-bottom:1px solid #222;text-align:right;">PRICE</td>
                </tr>
                ${itemsHtml}
                ${discountHtml}
                <tr>
                   <td colspan="3" style="padding:15px 0 5px;font-size:9px;color:#666666;text-transform:uppercase;letter-spacing:2px;font-weight:bold;">DELIVERY</td>
                   <td style="padding:15px 0 5px;text-align:right;color:#ffffff;font-family:'Courier New',monospace;letter-spacing:1px;">FREE</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TOTAL AMOUNT -->
          <tr>
             <td align="right" style="padding:30px;background-color:#000000;">
              <p style="margin:0 0 10px;font-size:10px;color:#666666;letter-spacing:3px;text-transform:uppercase;">TOTAL AMOUNT CLEARED</p>
              <h2 style="margin:0;font-size:36px;font-weight:bold;letter-spacing:-1px;color:#ffffff;font-family:'Courier New',monospace;">฿${total}</h2>
            </td>
          </tr>

          <!-- DOWNLOAD E-PASS -->
           <tr>
            <td align="center" style="padding:10px 30px 40px;">
              <a href="https://www.tulumora.com" target="_blank" style="display:inline-block;background-color:#ffffff;color:#000000;text-decoration:none;padding:16px 32px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;border:1px solid #ffffff;">
                ACCESS E-TICKET
              </a>
              <p style="margin:20px 0 0;font-size:10px;color:#555555;letter-spacing:1px;line-height:1.5;">
                SAVE THIS TRANSMISSION FOR YOUR RECORDS.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:#050505;padding:30px 20px;border-top:1px solid #111111;">
              <p style="margin:0;font-size:9px;color:#444444;letter-spacing:4px;text-transform:uppercase;line-height:2;">
                TU LUMORA X TUSU.RANGSIT<br/>
                STAY WEIRD, STAY YOU.
              </p>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe / Details -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px;">
          <tr>
            <td align="center" style="padding:20px 0;font-size:9px;color:#333333;font-family:Helvetica,Arial,sans-serif;letter-spacing:1px;">
               © 2026 TU LUMORA. ALL RIGHTS RESERVED.
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
      from: 'TU LUMORA <orders@tulumora.com>',
      to: [email],
      subject: `[SECURE] SQUAD ENROLLMENT CONFIRMED`,
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
