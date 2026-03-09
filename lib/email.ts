import { Resend } from 'resend';

interface SendEmailParams {
  email: string;
  firstName: string;
  lastName: string;
  items: any[];
  total: number;
  discount: number;
}

export async function sendOrderReceipt({
  email,
  firstName,
  lastName,
  items,
  total,
  discount
}: SendEmailParams) {
  if (!email) return { success: false, message: 'No email provided' };
  
  // Initialize resend inside the function to ensure process.env is ready in all runtimes
  const resend = new Resend(process.env.RESEND_API_KEY);

  const BASE_URL = 'https://www.tulumora.com';
  
  const itemsParam = (items || []).map((i: any) => `${i.style || 'regular'}|${i.size || 'M'}|${i.quantity || 1}`).join(',');
  const downloadUrl = `${BASE_URL}/api/receipt-download?name=${encodeURIComponent(firstName || 'Customer')}&total=${total}&items=${encodeURIComponent(itemsParam)}`;

  const itemsHtml = (items || []).map((item: any) => {
    const title = item.style || item.title || 'T-SHIRT';
    const size = item.size || '-';
    const qty = item.quantity || 1;
    const price = qty * 329;
    
    return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #141414;vertical-align:middle;">
          <div style="font-family:monospace;font-size:9px;color:#666;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:4px;">[PRE-ORDER]</div>
          <div style="font-size:14px;font-weight:900;font-style:italic;color:#fff;text-transform:uppercase;letter-spacing:0.03em;">TU LUMORA ${title}</div>
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #141414;text-align:center;vertical-align:middle;">
          <span style="display:inline-block;background:#1a1a1a;border:1px solid #333;color:#ccc;font-size:9px;font-weight:900;padding:4px 10px;letter-spacing:0.2em;text-transform:uppercase;">${size}</span>
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #141414;text-align:center;font-size:12px;color:#aaa;font-weight:900;letter-spacing:0.1em;vertical-align:middle;">
          &times;${qty}
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #141414;text-align:right;font-size:15px;font-weight:900;font-style:italic;color:#fff;vertical-align:middle;">
          &#3647;${price}
        </td>
      </tr>
    `;
  }).join('');

  const discountHtml = discount > 0 ? `
    <tr>
      <td colspan="3" style="padding:10px 0;font-size:9px;color:#4ade80;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;">Squad Promo</td>
      <td style="padding:10px 0;text-align:right;font-weight:900;color:#4ade80;font-size:14px;">-&#3647;${discount}</td>
    </tr>` : '';

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TU LUMORA — Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#fff;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <table width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0">

        <!-- TEXT HEADER (REPLACES LOGO) -->
        <tr>
          <td style="background:#000;border:1px solid #1a1a1a;overflow:hidden;">
            <div style="height:4px;background:linear-gradient(90deg,#dc2626,#ef4444,#dc2626);font-size:0;">&nbsp;</div>
            <div style="background:#000;padding:36px 40px 24px;text-align:center;border-bottom:1px solid #0f0f0f;">
              <p style="margin:0 0 6px;font-size:36px;font-weight:900;font-style:italic;letter-spacing:-0.04em;text-transform:uppercase;color:#fff;">
                TU LUMORA
              </p>
              <p style="margin:0;font-size:8px;letter-spacing:0.5em;text-transform:uppercase;color:#555;">
                AN OFFICIAL PROJECT BY TUSU.RANGSIT
              </p>
            </div>

            <!-- CONFIRMED STRIPE -->
            <div style="background:#fff;padding:13px 40px;text-align:center;">
              <span style="font-size:9px;letter-spacing:0.7em;text-transform:uppercase;color:#000;font-weight:900;">
                ORDER CONFIRMED
              </span>
            </div>

            <!-- HERO IMAGE -->
            <div style="overflow:hidden;font-size:0;line-height:0;border-bottom:1px solid #0f0f0f;">
              <img src="${BASE_URL}/images/squad-email.jpg" alt="" width="580"
                style="display:block;width:100%;max-width:580px;height:auto;opacity:0.7;" />
            </div>

            <!-- GREETING -->
            <div style="padding:36px 40px 0;">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:#888;">
                You're officially part of the squad,
              </p>
              <p style="margin:0;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-0.02em;color:#fff;text-transform:uppercase;">
                ${firstName || 'CAPTAIN'}
              </p>
            </div>
            <div style="padding:14px 40px 28px;">
              <p style="margin:0;font-size:11px;color:#888;line-height:2;letter-spacing:0.07em;text-transform:uppercase;">
                Your pre-order is secured &amp; verified.<br/>
                We will reach out via LINE / IG once your order ships.
              </p>
            </div>

            <div style="padding:0 40px;margin-bottom:28px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#2a2a2a,transparent);font-size:0;">&nbsp;</div>
            </div>

            <div style="padding:0 40px 16px;">
              <p style="margin:0;font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:#2d2d2d;font-weight:900;">
                &#9656; ORDER SUMMARY
              </p>
            </div>

            <div style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #141414;">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:8px;letter-spacing:0.4em;color:#777;text-transform:uppercase;padding:10px 0;font-weight:900;">Item</th>
                    <th style="text-align:center;font-size:8px;letter-spacing:0.4em;color:#777;text-transform:uppercase;padding:10px 0;font-weight:900;">Size</th>
                    <th style="text-align:center;font-size:8px;letter-spacing:0.4em;color:#777;text-transform:uppercase;padding:10px 0;font-weight:900;">Qty</th>
                    <th style="text-align:right;font-size:8px;letter-spacing:0.4em;color:#777;text-transform:uppercase;padding:10px 0;font-weight:900;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  ${discountHtml}
                  <tr>
                    <td colspan="3" style="padding:12px 0 4px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#777;font-weight:900;">Shipping</td>
                    <td style="padding:12px 0 4px;text-align:right;">
                      <span style="display:inline-block;background:#fff;color:#000;font-size:8px;font-weight:900;padding:3px 8px;letter-spacing:0.25em;text-transform:uppercase;">FREE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="padding:20px 40px 28px;border-top:1px solid #1a1a1a;margin-top:12px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:#777;font-weight:900;vertical-align:middle;">Total Paid</td>
                  <td style="text-align:right;font-size:38px;font-weight:900;font-style:italic;color:#fff;letter-spacing:-0.04em;">&#3647;${total}</td>
                </tr>
              </table>
            </div>

            <div style="padding:0 40px 36px;text-align:center;">
              <a href="${downloadUrl}"
                style="display:inline-block;background:#fff;color:#000;padding:16px 44px;font-size:10px;font-weight:900;letter-spacing:0.5em;text-transform:uppercase;text-decoration:none;">
                DOWNLOAD RECEIPT
              </a>
            </div>

            <div style="padding:0 40px 40px;text-align:center;">
              <img src="${BASE_URL}/images/mascot-email.png" alt="LUMO" width="52"
                style="display:block;margin:0 auto 18px;width:52px;height:auto;opacity:0.5;" />
              <a href="https://lin.ee/19k0kWS"
                style="display:inline-block;background:#06C755;color:#fff;padding:14px 36px;font-size:10px;font-weight:900;letter-spacing:0.45em;text-transform:uppercase;text-decoration:none;">
                CONTACT LINE OA
              </a>
            </div>

            <div style="height:4px;background:linear-gradient(90deg,#dc2626,#ef4444,#dc2626);font-size:0;">&nbsp;</div>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="margin:0 0 4px;font-size:8px;color:#1f1f1f;letter-spacing:0.4em;text-transform:uppercase;">
              TU LUMORA &nbsp;&middot;&nbsp; TUSU.RANGSIT &nbsp;&middot;&nbsp; 2026
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

  try {
    const { data, error } = await resend.emails.send({
      from: 'LUMO <orders@tulumora.com>',
      to: email, // Changed to string instead of array for compatibility
      replyTo: 'support@tulumora.com',
      subject: `ORDER CONFIRMED — TU LUMORA PRE-ORDER`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, message: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Email service error:', err);
    return { success: false, message: err.message };
  }
}

export async function sendTrackingEmail({
  email,
  firstName,
  trackingNumber,
  courier = 'FLASH EXPRESS'
}: {
  email: string;
  firstName: string;
  trackingNumber: string;
  courier?: string;
}) {
  if (!email) return { success: false, message: 'No email provided' };
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  const BASE_URL = 'https://www.tulumora.com';
  
  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TU LUMORA — Order Shipped</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#fff;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <table width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#000;border:1px solid #1a1a1a;overflow:hidden;">
            <div style="height:4px;background:linear-gradient(90deg,#00ffcc,#3b82f6,#00ffcc);font-size:0;">&nbsp;</div>
            <div style="background:#000;padding:36px 40px 24px;text-align:center;border-bottom:1px solid #0f0f0f;">
              <p style="margin:0 0 6px;font-size:36px;font-weight:900;font-style:italic;letter-spacing:-0.04em;text-transform:uppercase;color:#fff;">
                TU LUMORA
              </p>
            </div>

            <!-- SHIPPED STRIPE -->
            <div style="background:#00ffcc;padding:13px 40px;text-align:center;">
              <span style="font-size:9px;letter-spacing:0.7em;text-transform:uppercase;color:#000;font-weight:900;">
                ORDER SHIPPED
              </span>
            </div>

            <div style="padding:36px 40px 0;">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:#888;">
                It's on the way,
              </p>
              <p style="margin:0;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-0.02em;color:#fff;text-transform:uppercase;">
                ${firstName || 'CAPTAIN'}
              </p>
            </div>
            
            <div style="padding:14px 40px 28px;">
              <p style="margin:0;font-size:11px;color:#888;line-height:2;letter-spacing:0.07em;text-transform:uppercase;">
                Your TU LUMORA package has been handed over to the courier.<br/>
                Get ready to wear your soul.
              </p>
            </div>

            <div style="padding:0 40px;margin-bottom:28px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#2a2a2a,transparent);font-size:0;">&nbsp;</div>
            </div>

            <div style="padding:0 40px 16px;text-align:center;">
              <p style="margin:0 0 8px;font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:#777;font-weight:900;">
                COURIER: ${courier}
              </p>
              <div style="background:#111;border:1px dashed #333;padding:24px;display:inline-block;">
                <p style="margin:0 0 8px;font-size:10px;color:#00ffcc;letter-spacing:0.4em;text-transform:uppercase;font-weight:bold;">TRACKING NUMBER</p>
                <p style="margin:0;font-size:24px;font-family:monospace;letter-spacing:0.1em;color:#fff;">${trackingNumber}</p>
              </div>
            </div>

            <div style="padding:20px 40px 40px;text-align:center;">
              <a href="https://lin.ee/19k0kWS"
                style="display:inline-block;background:#06C755;color:#fff;padding:14px 36px;font-size:10px;font-weight:900;letter-spacing:0.45em;text-transform:uppercase;text-decoration:none;">
                CONTACT LINE OA
              </a>
            </div>

            <div style="height:4px;background:linear-gradient(90deg,#00ffcc,#3b82f6,#00ffcc);font-size:0;">&nbsp;</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'LUMO <orders@tulumora.com>',
      to: email,
      replyTo: 'support@tulumora.com',
      subject: `ORDER SHIPPED — TU LUMORA`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, message: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Email service error:', err);
    return { success: false, message: err.message };
  }
}
