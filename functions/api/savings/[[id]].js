import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { studentsInClassroom } from '../../_lib/db.js';

async function canAccessClassroom(session, classroomId, db) {
  if (session.role === 'admin') return true;
  const c = await db.prepare('SELECT id FROM classrooms WHERE id=? AND teacher_id=?').bind(classroomId, session.user_id).first();
  return !!c;
}

// GET /api/savings?classroom_id=1&year=2026&month=5
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const url = new URL(request.url);
  const classroomId = url.searchParams.get('classroom_id');
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');
  const date = url.searchParams.get('date');

  if (!classroomId) return json({ error: 'ระบุ classroom_id' }, 400);
  if (!await canAccessClassroom(session, classroomId, env.DB)) return unauthorized();

  if (date) {
    const result = await env.DB.prepare(`
      SELECT sv.*, s.prefix, s.first_name, s.last_name, s.student_number
      FROM students s
      LEFT JOIN savings sv ON sv.student_id = s.id AND sv.date = ?
      WHERE s.classroom_id = ? AND s.is_active = 1
      ORDER BY CAST(s.student_number AS INTEGER)
    `).bind(date, classroomId).all();
    return json(result.results);
  }

  if (year && month) {
    const ym = `${year}-${String(month).padStart(2,'0')}`;
    const result = await env.DB.prepare(`
      SELECT s.id as student_id, s.prefix, s.first_name, s.last_name, s.student_number,
        sv.date, sv.amount
      FROM students s
      LEFT JOIN savings sv ON sv.student_id = s.id AND strftime('%Y-%m', sv.date) = ?
      WHERE s.classroom_id = ? AND s.is_active = 1
      ORDER BY CAST(s.student_number AS INTEGER), sv.date
    `).bind(ym, classroomId).all();
    return json(result.results);
  }

  return json({ error: 'ระบุ date หรือ year และ month' }, 400);
}

// POST /api/savings
// body: { classroom_id, date, records: [{student_id, amount}] }
export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const { classroom_id, date, records } = await request.json();
  if (!classroom_id || !date || !records) return json({ error: 'ข้อมูลไม่ครบ' }, 400);
  if (!await canAccessClassroom(session, classroom_id, env.DB)) return unauthorized();
  if (!await studentsInClassroom(env.DB, classroom_id, records)) return json({ error: 'พบนักเรียนที่ไม่ได้อยู่ในห้องนี้' }, 400);

  const stmts = records.map(r => r.amount !== null && r.amount !== undefined && r.amount !== ''
    ? env.DB.prepare('INSERT INTO savings (student_id,date,amount) VALUES (?,?,?) ON CONFLICT(student_id,date) DO UPDATE SET amount=excluded.amount').bind(r.student_id, date, parseFloat(r.amount) || 0)
    : env.DB.prepare('DELETE FROM savings WHERE student_id=? AND date=?').bind(r.student_id, date)
  );
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
}
