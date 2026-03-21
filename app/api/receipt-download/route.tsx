import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fullName = searchParams.get('name') || 'Customer';
  const name = fullName.split(' ')[0];
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
  const dateStr = (() => {
    try {
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Bangkok",
      }).format(now);
    } catch {
      try {
        return new Intl.DateTimeFormat("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Bangkok",
        }).format(now);
      } catch {
        // Last resort for runtimes with limited Intl locale data
        return now.toISOString().slice(0, 10);
      }
    }
  })();

  const totalNumber = Number(total) || 0;
  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const unitPrice = totalQty > 0 ? Math.round(totalNumber / totalQty) : 0;
  const safeFileName =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "customer";

  return new ImageResponse(
    (
      <div
        style={{
          width: '600px',
          minHeight: '1100px',
          background: '#080808',
          color: '#fff',
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
        }}
      >
        {/* TOP TICKET EDGE */}
        <div style={{ height: '10px', background: 'repeating-linear-gradient(90deg,#000 0,#000 10px,#111 10px,#111 20px)' }} />

        {/* HEADER / SHOP INFO */}
        <div
          style={{
            padding: '24px 32px 18px',
            background: '#000',
            borderBottom: '1px dashed #262626',
          }}
        >
          <div
            style={{
              fontSize: '26px',
              fontWeight: 900,
              fontStyle: 'italic',
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
              color: '#fff',
            }}
          >
            TU LUMORA
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '9px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#666',
            }}
          >
            PRE-ORDER STREET PROJECT
          </div>
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            <span>DATE: {dateStr}</span>
            <span>PAYMENT: SLIP TRANSFER</span>
          </div>
        </div>

        {/* BODY */}
        <div
          style={{
            padding: '18px 32px 24px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {/* CUSTOMER */}
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '8px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#777',
                marginBottom: '4px',
              }}
            >
              CUSTOMER
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                color: '#fff',
                letterSpacing: '-0.03em',
              }}
            >
              {name}
            </div>
          </div>

          {/* ITEMS LIST (VERTICAL RECEIPT STYLE) */}
          <div
            style={{
              paddingTop: '8px',
              borderTop: '1px dashed #262626',
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px dashed #1f1f1f',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#fafafa',
                    }}
                  >
                    TU LUMORA {item.style}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      color: '#f9fafb',
                    }}
                  >
                    ฿{(unitPrice || 0) * (item.quantity || 0)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#9ca3af',
                  }}
                >
                  <span>
                    SIZE:{" "}
                    <span
                      style={{
                        padding: '1px 6px',
                        border: '1px solid #374151',
                        background: '#020617',
                        color: '#e5e7eb',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                      }}
                    >
                      {item.size}
                    </span>
                  </span>
                  <span>QTY: ×{item.quantity}</span>
                  <span>UNIT: ฿{unitPrice || 0}</span>
                </div>
              </div>
            ))}
          </div>

          {/* SHIPPING + TOTAL */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px dashed #374151',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: '#9ca3af',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>Shipping</span>
              <span
                style={{
                  background: '#e5e7eb',
                  color: '#020617',
                  padding: '2px 10px',
                  fontSize: '9px',
                  fontWeight: 900,
                  letterSpacing: '0.25em',
                }}
              >
                FREE
              </span>
            </div>

            <div
              style={{
                marginTop: '6px',
                paddingTop: '10px',
                borderTop: '1px solid #111827',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  fontWeight: 900,
                }}
              >
                Total Paid
              </span>
              <span
                style={{
                  fontSize: '34px',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: '#f9fafb',
                  letterSpacing: '-0.04em',
                }}
              >
                ฿{total}
              </span>
            </div>
          </div>

          {/* FOOTNOTE */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '10px',
              borderTop: '1px dashed #111827',
              fontSize: '8px',
              color: '#4b5563',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              lineHeight: 1.6,
            }}
          >
            <div>THIS RECEIPT IS GENERATED BY TU LUMORA ONLINE SYSTEM.</div>
            <div>PLEASE KEEP THIS SLIP AS A REFERENCE FOR YOUR PRE-ORDER.</div>
          </div>
        </div>

        {/* BOTTOM TICKET EDGE */}
        <div style={{ height: '10px', background: 'repeating-linear-gradient(90deg,#111 0,#111 10px,#000 10px,#000 20px)' }} />
      </div>
    ),
    {
      width: 600,
      headers: {
        'Content-Disposition': `attachment; filename="TU-LUMORA-Receipt-${safeFileName}.png"`,
        'Cache-Control': 'no-store',
      },
    }
  );
}
