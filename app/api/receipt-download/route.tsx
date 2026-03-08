import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fullName = searchParams.get('name') || 'Customer';
  const name = fullName.split(' ')[0]; // Use first name only
  const total = searchParams.get('total') || '0';
  const itemsRaw = searchParams.get('items') || '';

  const items = itemsRaw
    ? itemsRaw.split(',').map((s) => {
        const [style, size, qty] = s.split('|');
        return {
          style: style || '',
          size: size || '',
          quantity: parseInt(qty || '1'),
        };
      })
    : [];

  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Bangkok',
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '800px',
          minHeight: '900px',
          background: '#080808',
          color: '#fff',
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
        }}
      >
        {/* TOP RED STRIPE */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg,#dc2626,#ef4444,#dc2626)', display: 'flex' }} />

        {/* HEADER */}
        <div style={{
          background: '#000',
          padding: '40px 56px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid #1c1c1c',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.6em', textTransform: 'uppercase', color: '#777', marginBottom: '10px', display: 'flex' }}>
            ESTABLISHED 2026
          </div>
          <div style={{ fontSize: '48px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#fff', display: 'flex' }}>
            TU LUMORA
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#555', marginTop: '0px', display: 'flex' }}>
            AN OFFICIAL PROJECT BY TUSU.RANGSIT
          </div>
        </div>

        {/* CONFIRMED BANNER */}
        <div style={{
          background: '#fff',
          padding: '16px 56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#000', fontWeight: 900, display: 'flex' }}>
            ORDER RECEIPT
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#777', display: 'flex' }}>
            {dateStr}
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: '40px 56px', display: 'flex', flexDirection: 'column', flex: 1, gap: '0px' }}>

          {/* CUSTOMER */}
          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#777', marginBottom: '6px', display: 'flex' }}>
              Customer
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.02em', display: 'flex' }}>
              {name}
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ height: '1px', background: '#1c1c1c', marginBottom: '28px', display: 'flex' }} />

          {/* ORDER HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#666', fontWeight: 900, display: 'flex', flex: 3 }}>Item</div>
            <div style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#666', fontWeight: 900, display: 'flex', flex: 1, justifyContent: 'center' }}>Size</div>
            <div style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#666', fontWeight: 900, display: 'flex', flex: 1, justifyContent: 'center' }}>Qty</div>
            <div style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#666', fontWeight: 900, display: 'flex', flex: 1, justifyContent: 'flex-end' }}>Price</div>
          </div>

          {/* ITEMS */}
          {items.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderTop: '1px solid #141414',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 3 }}>
                <div style={{ fontSize: '10px', color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex' }}>[PRE-ORDER]</div>
                <div style={{ fontSize: '14px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.03em', display: 'flex' }}>
                  TU LUMORA {item.style}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', fontSize: '10px', fontWeight: 900, padding: '3px 10px', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex' }}>
                  {item.size}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', fontSize: '12px', color: '#aaa', fontWeight: 900 }}>
                ×{item.quantity}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', fontSize: '14px', fontWeight: 900, color: '#fff', fontStyle: 'italic' }}>
                ฿{item.quantity * 329}
              </div>
            </div>
          ))}

          {/* SHIPPING */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid #141414' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#777', fontWeight: 900, display: 'flex', flex: 3 }}>Shipping</div>
            <div style={{ display: 'flex' }}>
              <div style={{ background: '#fff', color: '#000', fontSize: '9px', fontWeight: 900, padding: '3px 10px', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'flex' }}>FREE</div>
            </div>
          </div>

          {/* TOTAL */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0 0', borderTop: '1px solid #333', marginTop: '8px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#888', fontWeight: 900, display: 'flex' }}>Total Paid</div>
            <div style={{ fontSize: '42px', fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '-0.04em', fontFamily: 'sans-serif', display: 'flex' }}>฿{total}</div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ height: '3px', background: '#1a1a1a', display: 'flex' }} />
        <div style={{
          padding: '24px 56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#000',
        }}>
          <div style={{ fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#555', display: 'flex' }}>
            tulumora.com
          </div>
          <div style={{ fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#444', display: 'flex' }}>
            © 2026 ALL RIGHTS RESERVED
          </div>
        </div>

        {/* BOTTOM RED STRIPE */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg,#dc2626,#ef4444,#dc2626)', display: 'flex' }} />
      </div>
    ),
    {
      width: 800,
      headers: {
        'Content-Disposition': `attachment; filename="TU-LUMORA-Receipt-${name.replace(/\s+/g, '-')}.png"`,
        'Cache-Control': 'no-store',
      },
    }
  );
}
