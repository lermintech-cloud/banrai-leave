import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { MAX_STUDENTS_PER_CLASSROOM } from '../../_lib/db.js';

const FULL_MSG = `ห้องนี้มีนักเรียนครบ ${MAX_STUDENTS_PER_CLASSROOM} คนแล้ว ไม่สามารถเพิ่มได้`;

async function canAccessClassroom(session, classroomId, db) {
  if (session.role === 'admin') return true;
  const classroom = await db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').bind(classroomId, session.user_id).first();
  return !!classroom;
}

// GET /api/students?classroom_id=1
export async function onRequestGet({ request, env, params }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const id = params.id?.[0];
  const url = new URL(request.url);
  const classroomId = url.searchParams.get('classroom_id');

  if (id && id !== 'undefined') {
    const student = await env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(id).first();
    if (!student) return json({ error: 'ไม่พบข้อมูลนักเรียน' }, 404);
    if (!await canAccessClassroom(session, student.classroom_id, env.DB)) return unauthorized();
    return json(student);
  }

  if (!classroomId) return json({ error: 'กรุณาระบุ classroom_id' }, 400);
  if (!await canAccessClassroom(session, classroomId, env.DB)) return unauthorized();

  const result = await env.DB.prepare(
    'SELECT * FROM students WHERE classroom_id = ? AND is_active = 1 ORDER BY CAST(student_number AS INTEGER)'
  ).bind(classroomId).all();
  return json(result.results);
}

// POST /api/students
export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const body = await request.json();
  const { classroom_id, student_number, id_card, prefix, first_name, last_name, gender, birth_date } = body;

  if (!classroom_id || !first_name || !last_name) return json({ error: 'กรุณากรอกข้อมูลที่จำเป็น' }, 400);
  if (!await canAccessClassroom(session, classroom_id, env.DB)) return unauthorized();

  // เช็คจำนวนกับ INSERT ในคำสั่งเดียว กันกรณีสองคนกดเพิ่มพร้อมกันจนเกิน
  const result = await env.DB.prepare(
    `INSERT INTO students (classroom_id,student_number,id_card,prefix,first_name,last_name,gender,birth_date)
     SELECT ?,?,?,?,?,?,?,?
     WHERE (SELECT COUNT(*) FROM students WHERE classroom_id = ? AND is_active = 1) < ?`
  ).bind(classroom_id, student_number || null, id_card || null, prefix || null, first_name, last_name, gender || null, birth_date || null,
    classroom_id, MAX_STUDENTS_PER_CLASSROOM).run();
  if (!result.meta.changes) return json({ error: FULL_MSG }, 409);

  return json({ ok: true, id: result.meta.last_row_id }, 201);
}

// PUT /api/students/:id
export async function onRequestPut({ request, env, params }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const id = params.id?.[0];
  if (!id) return json({ error: 'ระบุ id' }, 400);

  const student = await env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(id).first();
  if (!student) return json({ error: 'ไม่พบข้อมูล' }, 404);
  if (!await canAccessClassroom(session, student.classroom_id, env.DB)) return unauthorized();

  const body = await request.json();
  const { student_number, id_card, prefix, first_name, last_name, gender, birth_date, is_active } = body;

  // กู้นักเรียนที่เคยลบกลับมา (is_active 0 -> 1) ต้องไม่ทำให้ห้องเกินจำนวนสูงสุด
  if (is_active && !student.is_active) {
    const cnt = await env.DB.prepare('SELECT COUNT(*) AS c FROM students WHERE classroom_id = ? AND is_active = 1')
      .bind(student.classroom_id).first();
    if (cnt.c >= MAX_STUDENTS_PER_CLASSROOM) return json({ error: FULL_MSG }, 409);
  }

  await env.DB.prepare(
    'UPDATE students SET student_number=?,id_card=?,prefix=?,first_name=?,last_name=?,gender=?,birth_date=?,is_active=? WHERE id=?'
  ).bind(student_number ?? student.student_number, id_card ?? student.id_card, prefix ?? student.prefix,
    first_name ?? student.first_name, last_name ?? student.last_name, gender ?? student.gender,
    birth_date ?? student.birth_date, is_active ?? student.is_active, id).run();

  return json({ ok: true });
}

// DELETE /api/students/:id  (soft delete)
export async function onRequestDelete({ request, env, params }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  const id = params.id?.[0];
  if (!id) return json({ error: 'ระบุ id' }, 400);

  const student = await env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(id).first();
  if (!student) return json({ error: 'ไม่พบข้อมูล' }, 404);
  if (!await canAccessClassroom(session, student.classroom_id, env.DB)) return unauthorized();

  await env.DB.prepare('UPDATE students SET is_active = 0 WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
