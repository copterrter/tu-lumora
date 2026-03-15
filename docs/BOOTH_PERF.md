# Booth หน้า Speed / Performance

## สิ่งที่ทำแล้ว (ช่วยให้เร็วขึ้น)

1. **loading.tsx** — หน้า `/booth` มี `app/booth/loading.tsx` ให้ Next แสดง skeleton ทันทีระหว่างโหลด ช่วย **First Contentful Paint** และความรู้สึกว่าโหลดเร็ว
2. **รูปโลโก้ (LCP)** — `<Image priority fetchPriority="high" />` ให้เบราว์เซอร์โหลดรูป LCP ก่อน
3. **willChange เฉพาะตอนหมุน** — ใช้ `willChange: "transform"` แค่ตอน `loading === true` (กำลังหมุน) ตอน idle ไม่ตั้ง จะได้ไม่กิน memory/compositor ตลอดเวลา

## โครงสร้างที่กระทบ Speed

| ส่วน | ผลต่อ Speed | หมายเหตุ |
|------|----------------|----------|
| **Next/Image** (icon.png) | ดี | มี priority, sizes ถูก ใช้ได้ต่อ |
| **framer-motion** | โหลดทั้งหน้า | ใช้แค่ useMotionValue + animate + motion.div ถ้าอยากลด bundle ต่อ อาจแยก BoothWheel เป็น dynamic import |
| **getCurrentPhase()** | เล็กมาก | sync ใน client ไม่มี network |
| **API /api/booth/spin** | เรียกเมื่อกดสุ่ม | ไม่กระทบ LCP |

## แนวทางเพิ่มเติม (ถ้าต้องการเร็วขึ้นอีก)

- **Lazy load วงล้อ (framer-motion)** — แยก component วงล้อออกมา แล้วใช้ `dynamic(import('./BoothWheel'), { loading: () => <WheelSkeleton /> })` เพื่อให้ JS ชุดวงล้อโหลดหลัง first paint (ต้องย้าย state/ref การหมุนให้สอดคล้องกัน)
- **Prefetch ลิงก์ที่ใช้บ่อย** — เช่น `<Link href="/product" prefetch>` เพื่อให้หน้า product โหลดเร็วเมื่อกดจาก booth
- **ตรวจด้วย Lighthouse** — รันในโหมด incognito หรือ throttling เพื่อดู LCP, TBT, CLS จริง
