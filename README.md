# ระบบลา โรงเรียนบ้านไร่ (สพป.ชม.5) — เวอร์ชัน Cloudflare D1

โครงสร้าง: `index.html` · `css/` · `js/` (data, doc, output, app) · `functions/api/[[path]].js` (API เชื่อม D1) · `schema.sql` · `wrangler.toml` · `assets/logo.png` · `fonts/`

## ติดตั้ง (ทำผ่านเว็บ Cloudflare ทั้งหมด)
1. **ฟอนต์**: วาง THSarabunNew / THSarabunNew-Bold (.woff2 หรือ .ttf) ใน `fonts/`
2. **GitHub**: อัปโหลดทุกไฟล์ขึ้น repo (ให้ index.html อยู่ชั้นนอกสุด)
3. **สร้างฐานข้อมูล**: Cloudflare → Storage & Databases → D1 → Create database ชื่อ `banrai-leave-db`
4. เปิดฐานข้อมูล → แท็บ **Console** → วางเนื้อหาไฟล์ `schema.sql` ทั้งหมด → Execute
5. **สร้าง Pages**: Workers & Pages → Create → Pages → Connect to Git → เลือก repo (Build command ว่าง, Output directory `/`) → Deploy
6. **ผูกฐานข้อมูล**: โปรเจกต์ Pages → Settings → Bindings → Add → D1 database → Variable name = `DB` → เลือก `banrai-leave-db` → Save แล้ว **Redeploy**
7. **สิทธิ์แก้ไข**: ไม่ต้องตั้ง `ADMIN_EMAILS` (ถ้าตั้ง คนที่ไม่อยู่ในรายชื่อจะบันทึกไม่ได้ แม้เป็นครู) ผู้ใช้ทุกคนที่ผ่านด่านล็อกอินข้อ 8 จะบันทึกได้ ส่วนปุ่มเลือกบทบาทหน้าแรกเป็นตัวกรองการแสดงผล ไม่ใช่รหัสผ่าน
8. **ล็อกอิน**: Zero Trust → Access → Applications → Add → Self-hosted → ใส่โดเมน `xxx.pages.dev` → Policy: Allow เฉพาะอีเมลครูในโรงเรียน (One-time PIN ใช้ได้ ไม่ต้องมี Google Workspace)

ถ้าไม่ทำข้อ 8 ทุกคนที่มีลิงก์จะเห็นและแก้ข้อมูลได้
