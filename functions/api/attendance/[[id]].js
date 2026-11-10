import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { studentsInClassroom } from '../../_lib/db.js';

async function canAccessClassroom(session, classroomId, db) {
  if (session.role === 'admin') return true;
  const c = await db.prepare('SELECT id FROM classrooms WHERE id=? AND teacher_id=?').bind(classroomId, session.user_id).first();
  return !!c;
}

// GET /api/attendance?classroom_id=1&date=2026-05-01
// GET /api/attendance?classroom_id=1&year=2026&month=5
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const url = new URL(request.url);
  const classroomId = url.searchParams.get('classroom_id');
  const date = url.searchParams.get('date');
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');

  if (!classroomId) return json({ error: 'ระบุ classroom_id' }, 400);
  if (!await canAccessClassroom(session, classroomId, env.DB)) return unauthorized();

  if (date) {
    // เช็คชื่อรายวัน
    const result = await env.DB.prepare(`
      SELECT s.id AS student_id, a.id AS attendance_id, a.status, a.note, a.date, s.prefix, s.first_name, s.last_name, s.student_number
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
      WHERE s.classroom_id = ? AND s.is_active = 1
      ORDER BY CAST(s.student_number AS INTEGER)
    `).bind(date, classroomId).all();
    return json(result.results);
  }

  if (year && month) {
    // สรุปรายเดือน
    const ym = `${year}-${String(month).padStart(2,'0')}`;
    const result = await env.DB.prepare(`
      SELECT s.id as student_id, s.prefix, s.first_name, s.last_name, s.student_number,
        SUM(CASE WHEN a.status='มา' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.status='ป' THEN 1 ELSE 0 END) as sick,
        SUM(CASE WHEN a.status='ล' THEN 1 ELSE 0 END) as leave,
        SUM(CASE WHEN a.status='ข' THEN 1 ELSE 0 END) as absent
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND strftime('%Y-%m', a.date) = ?
      WHERE s.classroom_id = ? AND s.is_active = 1
      GROUP BY s.id
      ORDER BY CAST(s.student_number AS INTEGER)
    `).bind(ym, classroomId).all();
    return json(result.results);
  }

  return json({ error: 'ระบุ date หรือ year และ month' }, 400);
}

// POST /api/attendance  - บันทึกทีละวัน (upsert)
// body: { classroom_id, date, records: [{student_id, status, note}] }
export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const { classroom_id, date, records } = await request.json();
  if (!classroom_id || !date || !records) return json({ error: 'ข้อมูลไม่ครบ' }, 400);
  if (!await canAccessClassroom(session, classroom_id, env.DB)) return unauthorized();
  if (!await studentsInClassroom(env.DB, classroom_id, records)) return json({ error: 'พบนักเรียนที่ไม่ได้อยู่ในห้องนี้' }, 400);

  const stmts = records.map(r => r.status
    ? env.DB.prepare('INSERT INTO attendance (student_id,date,status,note) VALUES (?,?,?,?) ON CONFLICT(student_id,date) DO UPDATE SET status=excluded.status,note=excluded.note').bind(r.student_id, date, r.status, r.note || null)
    : env.DB.prepare('DELETE FROM attendance WHERE student_id=? AND date=?').bind(r.student_id, date)
  );
  if (stmts.length) await env.DB.batch(stmts);

  // อัปเดต school_days ด้วย
  await env.DB.prepare('INSERT OR IGNORE INTO school_days (classroom_id,date) VALUES (?,?)').bind(classroom_id, date).run();

  return json({ ok: true });
}

// DELETE /api/attendance/:id  (ลบรายการเดียว)
export async function onRequestDelete({ request, env, params }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const id = params.id?.[0];
  if (!id) return json({ error: 'ระบุ id' }, 400);

  // ต้องรู้ก่อนว่ารายการนี้อยู่ห้องไหน แล้วค่อยเช็คสิทธิ์
  const row = await env.DB.prepare(
    'SELECT s.classroom_id FROM attendance a JOIN students s ON s.id = a.student_id WHERE a.id = ?'
  ).bind(id).first();
  if (!row) return json({ error: 'ไม่พบรายการ' }, 404);
  if (!await canAccessClassroom(session, row.classroom_id, env.DB)) return unauthorized();

  await env.DB.prepare('DELETE FROM attendance WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
