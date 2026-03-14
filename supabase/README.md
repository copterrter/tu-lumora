# Supabase migrations

## รัน migration ด้วย Supabase CLI

### 1. ติดตั้ง dependencies (ครั้งเดียว)

```bash
npm install
```

(Supabase CLI อยู่ใน devDependency แล้ว)

### 2. Link โปรเจกต์ (ทำครั้งเดียว หรือเมื่อเปลี่ยนโปรเจกต์)

**ขั้นที่ 1:** Login Supabase (ครั้งเดียว — เปิด browser)

```bash
npx supabase login
```

**ขั้นที่ 2:** Link โปรเจกต์ (project ref ใส่ไว้ในสคริปต์แล้ว)

```bash
npm run db:link-project
```

- เมื่อถูกถาม **Database password** ให้ใส่รหัส DB ของโปรเจกต์
- หรือใช้ `npx supabase link --project-ref vxuhegefuqjlikzopxwy --password "รหัสของคุณ"` แทน

### 3. Push migrations ขึ้น remote

```bash
npm run db:push
```

จะรันไฟล์ใน `supabase/migrations/` ตามลำดับ (promo_codes → orders.promo_code_used → atomic quota + rate limit)

---

ถ้าไม่ใช้ CLI สามารถ copy SQL ใน `migrations/*.sql` ไปรันใน **Supabase Dashboard → SQL Editor** ได้เลย
