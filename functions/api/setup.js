// Setup endpoint - สร้าง admin user ครั้งแรก (ใช้ได้เฉพาะเมื่อยังไม่มี user ในระบบ)
import { hashPassword, json } from '../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  // ตรวจสอบว่ายังไม่มี user
  const count = await env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
  if (count.c > 0) {
    return json({ error: 'ระบบมีผู้ใช้งานแล้ว กรุณาล็อกอินด้วยบัญชี admin' }, 403);
  }

  const { username, password, full_name } = await request.json();
  if (!username || !password) return json({ error: 'กรุณาระบุ username และ password' }, 400);
  if (password.length < 8) return json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, 400);

  const hash = await hashPassword(password);
  const result = await env.DB.prepare(
    'INSERT INTO users (username,password_hash,role,full_name) VALUES (?,?,?,?)'
  ).bind(username, hash, 'admin', full_name || 'ผู้ดูแลระบบ').run();

  return json({ ok: true, message: 'สร้างบัญชี admin สำเร็จ กรุณาล็อกอิน', id: result.meta.last_row_id }, 201);
}

export async function onRequestGet({ env }) {
  const count = await env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
  return json({ needs_setup: count.c === 0 });
}
