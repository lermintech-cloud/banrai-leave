# ระบบลาออนไลน์ โรงเรียนบ้านไร่ (สพป.ชม.5)

## โครงสร้างไฟล์
index.html · css/style.css · js/{config,api,doc,app}.js · functions/api/[[path]].js (API) · schema.sql (ฐานข้อมูล D1) · assets/logo.png · fonts/

## 1) ฟอนต์ TH Sarabun New (ฝังในระบบ)
ดาวน์โหลดฟอนต์ (ฟรีจาก SIPA) แล้ววางในโฟลเดอร์ fonts/ ชื่อ
`THSarabunNew.ttf` และ `THSarabunNew-Bold.ttf` — ระบบจะใช้ฟอนต์นี้ทั้งบนจอ มือถือ และ PDF

## 2) อัปโหลดขึ้น GitHub
สร้าง repo ใหม่ → อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ (หรือ git init / add / commit / push)

## 3) Cloudflare
1. Dashboard → Storage & Databases → D1 → Create database ชื่อ `leave-db`
2. เปิด Console ของฐานข้อมูล วางคำสั่งใน schema.sql แล้วกด Execute
3. Workers & Pages → Create → Pages → Connect to Git → เลือก repo
   Framework: None, Build command: ว่าง, Output directory: `/`
4. หลัง Deploy: Settings → Bindings → Add → D1 database → Variable name `DB` → เลือก `leave-db` → Redeploy
5. เปิดเว็บ (xxx.pages.dev) ใช้งานได้ทันที เข้าตั้งค่าเพื่อใส่ชื่อ/ลายเซ็นผู้ตรวจสอบ ฝ่ายบุคคล ผู้อำนวยการ และรายชื่อครู

ทดลองในเครื่อง: เปิด index.html ผ่าน local server จะเก็บข้อมูลใน localStorage ของเบราว์เซอร์ (ไม่ใช้ D1)
