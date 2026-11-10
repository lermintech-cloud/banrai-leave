import { verifyPassword, generateToken, setCookieHeader, json } from '../../_lib/auth.js';

const MAX_FAILS = 5;          // พลาดได้กี่ครั้ง
const WINDOW_MIN = 15;        // ภายในกี่นาที (ถูกล็อกเท่ากับช่วงนี้)

// ถ้ายังไม่ได้รัน migration 0003 ฟังก์ชันเหล่านี้จะข้ามไปเงียบ ๆ (login ยังใช้ได้ตามปกติ)
async function isLocked(db, key) {
  try {
    const r = await db.prepare(
      "SELECT COUNT(*) AS c FROM login_attempts WHERE key = ? AND created_at > datetime('now', ?)"
    ).bind(key, `-${WINDOW_MIN} minutes`).first();
    return r.c >= MAX_FAILS;
  } catch { return false; }
}
async function recordFail(db, key) {
  try { await db.prepare('INSERT INTO login_attempts (key) VALUES (?)').bind(key).run(); } catch {}
}
async function clearFails(db, key) {
  try { await db.prepare('DELETE FROM login_attempts WHERE key = ?').bind(key).run(); } catch {}
}
async function cleanup(db) {
  try {
    await db.batch([
      db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')"),
      db.prepare("DELETE FROM login_attempts WHERE created_at < datetime('now', '-1 day')"),
    ]);
  } catch {}
}

export async function onRequestPost({ request, env }) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }, 400);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = `${String(username).toLowerCase()}|${ip}`;
    if (await isLocked(env.DB, key)) {
      return json({ error: `ลองผิดหลายครั้งเกินไป กรุณารอ ${WINDOW_MIN} นาทีแล้วลองใหม่` }, 429);
    }

    const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    const valid = user ? await verifyPassword(password, user.password_hash) : false;
    if (!valid) {
      await recordFail(env.DB, key);
      return json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, 401);
    }
    await clearFails(env.DB, key);
    await cleanup(env.DB);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expiresAt).run();

    return json(
      { ok: true, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } },
      200,
      { 'Set-Cookie': setCookieHeader(token) }
    );
  } catch (e) {
    return json({ error: 'เกิดข้อผิดพลาด: ' + e.message }, 500);
  }
}
