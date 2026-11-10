-- Migration 0002: Seed admin user and sample classroom
-- Password: admin1234 (เปลี่ยนหลัง deploy ทันที!)
-- Hash สร้างด้วย PBKDF2-SHA256 ต้องสร้างใหม่ผ่าน /api/setup หรือ wrangler d1 execute

-- NOTE: ใช้ wrangler d1 execute banrai-homeroom-db --command เพื่อสร้าง admin user จริง
-- หรือใช้หน้า /setup.html ครั้งแรกที่ deploy

-- ห้องเรียนตัวอย่าง (ปรับได้ภายหลัง)
INSERT OR IGNORE INTO classrooms (academic_year, level) VALUES (2569, 'ป.2');
