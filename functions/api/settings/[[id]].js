import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { hashPassword } from '../../_lib/auth.js';

// GET /api/settings
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const result = await env.DB.prepare('SELECT key, value FROM school_settings').all();
  const settings = Object.fromEntries(result.results.map(r => [r.key, r.value]));
  return json(settings);
}

// POST /api/settings  (admin only)
export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();
  if (session.role !== 'admin') return json({ error: 'เฉพาะผู้ดูแลระบบเท่านั้น' }, 403);

  const body = await request.json();
  const stmts = Object.entries(body).map(([key, value]) =>
    env.DB.prepare('INSERT INTO school_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
      .bind(key, value)
  );
  if (stmts.length > 0) await env.DB.batch(stmts);
  return json({ ok: true });
}
