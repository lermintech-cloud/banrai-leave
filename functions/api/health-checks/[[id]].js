import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { studentsInClassroom } from '../../_lib/db.js';

async function canAccessClassroom(session, classroomId, db) {
  if (session.role === 'admin') return true;
  const c = await db.prepare('SELECT id FROM classrooms WHERE id=? AND teacher_id=?').bind(classroomId, session.user_id).first();
  return !!c;
}

export const HEALTH_ITEMS = ['ผม/ศีรษะ','ตา','ปาก','ฟัน','หู','จมูก','เล็บมือ/เล็บเท้า','ผิวหนัง','ฝ่ามือ/ฝ่าเท้า'];

export const HEALTH_OPTIONS = {
  'ผม/ศีรษะ': ['สะอาด','ไม่สะอาด'],
  'ตา': ['ปกติ','มีขี้ตา','ตาแดง','มีการอักเสบ','อื่น ๆ'],
  'ปาก': ['สะอาด','มีกลิ่นปาก','มีแผลในปาก','มีตุ่มในปาก'],
  'ฟัน': ['สะอาด','ฟันผุ','ไม่สะอาด'],
  'หู': ['สะอาด','ไม่สะอาด'],
  'จมูก': ['ปกติ','มีน้ำมูก','มีการอักเสบ'],
  'เล็บมือ/เล็บเท้า': ['สะอาด','ไม่สะอาด'],
  'ผิวหนัง': ['ปกติ','ผื่น','แผล','อื่น ๆ'],
  'ฝ่ามือ/ฝ่าเท้า': ['ปกติ','แห้งแตก','ผื่น']
};

// GET /api/health-checks?classroom_id=1&year=2026&month=5
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const url = new URL(request.url);
  const classroomId = url.searchParams.get('classroom_id');
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');

  if (!classroomId || !year || !month) return json({ error: 'ระบุ classroom_id, year, month' }, 400);
  if (!await canAccessClassroom(session, classroomId, env.DB)) return unauthorized();

  const students = await env.DB.prepare(
    'SELECT id, prefix, first_name, last_name, student_number FROM students WHERE classroom_id=? AND is_active=1 ORDER BY CAST(student_number AS INTEGER)'
  ).bind(classroomId).all();

  const checks = await env.DB.prepare(
    `SELECT hc.* FROM health_checks hc
     JOIN students s ON s.id = hc.student_id
     WHERE s.classroom_id=? AND hc.year=? AND hc.month=?`
  ).bind(classroomId, year, month).all();

  // จัด index
  const checkMap = {};
  for (const c of checks.results) {
    if (!checkMap[c.student_id]) checkMap[c.student_id] = {};
    checkMap[c.student_id][c.item] = c.result;
  }

  const rows = students.results.map(s => ({
    ...s,
    checks: checkMap[s.id] || {}
  }));

  return json({ students: rows, items: HEALTH_ITEMS, options: HEALTH_OPTIONS });
}

// POST /api/health-checks
// body: { classroom_id, year, month, records: [{student_id, item, result}] }
export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const { classroom_id, year, month, records } = await request.json();
  if (!classroom_id || !year || !month || !records) return json({ error: 'ข้อมูลไม่ครบ' }, 400);
  if (!await canAccessClassroom(session, classroom_id, env.DB)) return unauthorized();
  if (!await studentsInClassroom(env.DB, classroom_id, records)) return json({ error: 'พบนักเรียนที่ไม่ได้อยู่ในห้องนี้' }, 400);

  const stmts = records.map(r => r.result
    ? env.DB.prepare('INSERT INTO health_checks (student_id,year,month,item,result) VALUES (?,?,?,?,?) ON CONFLICT(student_id,year,month,item) DO UPDATE SET result=excluded.result').bind(r.student_id, year, month, r.item, r.result)
    : env.DB.prepare('DELETE FROM health_checks WHERE student_id=? AND year=? AND month=? AND item=?').bind(r.student_id, year, month, r.item)
  );

  if (stmts.length > 0) await env.DB.batch(stmts);
  return json({ ok: true });
}
