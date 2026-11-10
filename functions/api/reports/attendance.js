import { requireAuth, json, unauthorized } from '../../_lib/auth.js';

async function canAccessClassroom(session, classroomId, db) {
  if (session.role === 'admin') return true;
  const c = await db.prepare('SELECT id FROM classrooms WHERE id=? AND teacher_id=?').bind(classroomId, session.user_id).first();
  return !!c;
}

// GET /api/reports/attendance?classroom_id=1&semester=1&academic_year=2569
// GET /api/reports/attendance?classroom_id=1&type=annual&academic_year=2569
export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const url = new URL(request.url);
  const classroomId = url.searchParams.get('classroom_id');
  const semester = url.searchParams.get('semester'); // '1' or '2'
  const type = url.searchParams.get('type'); // 'annual'
  const academicYear = url.searchParams.get('academic_year');

  if (!classroomId || !academicYear) return json({ error: 'ระบุ classroom_id และ academic_year' }, 400);
  if (!await canAccessClassroom(session, classroomId, env.DB)) return unauthorized();

  // ปีการศึกษาไทย 2569 → ค.ศ. 2026
  const ce = parseInt(academicYear) - 543;

  let dateFilter;
  if (type === 'annual') {
    // ทั้งปี: พ.ค. ถึง มี.ค. ปีถัดไป
    dateFilter = `a.date >= '${ce}-05-01' AND a.date <= '${ce+1}-03-31'`;
  } else if (semester === '1') {
    // เทอม 1: พ.ค. - ก.ย.
    dateFilter = `a.date >= '${ce}-05-01' AND a.date <= '${ce}-09-30'`;
  } else if (semester === '2') {
    // เทอม 2: ต.ค. - มี.ค.
    dateFilter = `a.date >= '${ce}-10-01' AND a.date <= '${ce+1}-03-31'`;
  } else {
    return json({ error: 'ระบุ semester หรือ type=annual' }, 400);
  }

  const result = await env.DB.prepare(`
    SELECT
      s.id as student_id, s.student_number, s.prefix, s.first_name, s.last_name,
      strftime('%Y-%m', a.date) as month,
      SUM(CASE WHEN a.status='มา' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status='ป' THEN 1 ELSE 0 END) as sick,
      SUM(CASE WHEN a.status='ล' THEN 1 ELSE 0 END) as leave,
      SUM(CASE WHEN a.status='ข' THEN 1 ELSE 0 END) as absent
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id AND ${dateFilter}
    WHERE s.classroom_id = ? AND s.is_active = 1
    GROUP BY s.id, month
    ORDER BY CAST(s.student_number AS INTEGER), month
  `).bind(classroomId).all();

  // จำนวนวันเรียนต่อเดือน
  const schoolDays = await env.DB.prepare(`
    SELECT strftime('%Y-%m', date) as month, COUNT(*) as days
    FROM school_days WHERE classroom_id=? AND ${dateFilter.replace(/a\./g,'')}
    GROUP BY month
  `).bind(classroomId).all();

  return json({ records: result.results, school_days: schoolDays.results });
}
