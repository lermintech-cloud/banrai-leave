import { requireAuth, json, unauthorized, hashPassword } from '../../_lib/auth.js';

// GET /api/users (admin only)
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session || session.role !== 'admin') return unauthorized();

  const result = await env.DB.prepare('SELECT id, username, role, full_name, created_at FROM users ORDER BY id').all();
  return json(result.results);
}

// POST /api/users (admin only)
export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session || session.role !== 'admin') return unauthorized();

  const { username, password, role, full_name } = await request.json();
  if (!username || !password || !role) return json({ error: 'ข้อมูลไม่ครบ' }, 400);
  if (!['admin', 'teacher'].includes(role)) return json({ error: 'สิทธิ์ผู้ใช้ไม่ถูกต้อง' }, 400);
  if (String(password).length < 8) return json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, 400);

  const hash = await hashPassword(password);
  try {
    const result = await env.DB.prepare(
      'INSERT INTO users (username,password_hash,role,full_name) VALUES (?,?,?,?)'
    ).bind(username, hash, role, full_name || null).run();
    return json({ ok: true, id: result.meta.last_row_id }, 201);
  } catch (e) {
    if (e.message.includes('UNIQUE')) return json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' }, 409);
    return json({ error: e.message }, 500);
  }
}

// PUT /api/users/:id
export async function onRequestPut({ request, env, params }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const id = params.id?.[0];
  if (!id) return json({ error: 'ระบุ id' }, 400);

  // ครูแก้ได้เฉพาะตัวเอง, admin แก้ได้ทุกคน
  if (session.role !== 'admin' && String(session.user_id) !== String(id)) return unauthorized();

  const body = await request.json();
  const { full_name, password } = body;

  if (password) {
    if (String(password).length < 8) return json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, 400);
    const hash = await hashPassword(password);
    await env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(hash, id).run();
  }
  if (full_name !== undefined) {
    await env.DB.prepare('UPDATE users SET full_name=? WHERE id=?').bind(full_name, id).run();
  }

  return json({ ok: true });
}
