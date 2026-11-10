import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { studentsInClassroom } from '../../_lib/db.js';
import { getNutritionStatus } from '../../_lib/db.js';

async function canAccessClassroom(session, classroomId, db) {
  if (session.role === 'admin') return true;
  const c = await db.prepare('SELECT id FROM classrooms WHERE id=? AND teacher_id=?').bind(classroomId, session.user_id).first();
  return !!c;
}

// GET /api/growth?classroom_id=1&year=2026&month=5
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const url = new URL(request.url);
  const classroomId = url.searchParams.get('classroom_id');
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');

  if (!classroomId || !year || !month) return json({ error: 'ระบุ classroom_id, year, month' }, 400);
  if (!await canAccessClassroom(session, classroomId, env.DB)) return unauthorized();

  const result = await env.DB.prepare(`
    SELECT s.id as student_id, s.prefix, s.first_name, s.last_name, s.student_number, s.gender,
      g.weight, g.height, g.note
    FROM students s
    LEFT JOIN growth_records g ON g.student_id = s.id AND g.year = ? AND g.month = ?
    WHERE s.classroom_id = ? AND s.is_active = 1
    ORDER BY CAST(s.student_number AS INTEGER)
  `).bind(year, month, classroomId).all();

  // แนบภาวะโภชนาการ
  const criteria = await env.DB.prepare('SELECT * FROM bmi_criteria').all();
  const rows = result.results.map(r => ({
    ...r,
    nutrition_status: (r.weight && r.height)
      ? getNutritionStatus(r.gender, r.height, r.weight, criteria.results)
      : '-'
  }));

  return json(rows);
}

// POST /api/growth
// body: { classroom_id, year, month, records: [{student_id, weight, height, note}] }
export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const { classroom_id, year, month, records } = await request.json();
  if (!classroom_id || !year || !month || !records) return json({ error: 'ข้อมูลไม่ครบ' }, 400);
  if (!await canAccessClassroom(session, classroom_id, env.DB)) return unauthorized();
  if (!await studentsInClassroom(env.DB, classroom_id, records)) return json({ error: 'พบนักเรียนที่ไม่ได้อยู่ในห้องนี้' }, 400);

  const stmts = records.map(r => (r.weight !== null && r.weight !== undefined && r.weight !== '') || (r.height !== null && r.height !== undefined && r.height !== '') || (r.note && String(r.note).trim())
    ? env.DB.prepare('INSERT INTO growth_records (student_id,year,month,weight,height,note) VALUES (?,?,?,?,?,?) ON CONFLICT(student_id,year,month) DO UPDATE SET weight=excluded.weight,height=excluded.height,note=excluded.note')
        .bind(r.student_id, year, month, r.weight === '' ? null : (r.weight ?? null), r.height === '' ? null : (r.height ?? null), r.note || null)
    : env.DB.prepare('DELETE FROM growth_records WHERE student_id=? AND year=? AND month=?').bind(r.student_id, year, month)
  );
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
}
