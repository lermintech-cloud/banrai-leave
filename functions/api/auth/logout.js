import { clearCookieHeader, parseCookies, json } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies['session'];
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookieHeader() });
}
