import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { getAllClassrooms, getClassroomByTeacher, CLASS_LEVELS } from '../../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  if (session.role === 'admin') {
    const result = await getAllClassrooms(env.DB);
    return json(result.results);
  } else {
    const result = await getClassroomByTeacher(env.DB, session.user_id);
    return json(result.results);
  }
}

export async function onRequestPost({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session || session.role !== 'admin') return unauthorized();

  const { academic_year, level, teacher_id } = await request.json();
  if (!academic_year || !level) return json({ error: 'ข้อมูลไม่ครบ' }, 400);
  if (!CLASS_LEVELS.includes(level)) return json({ error: 'ระดับชั้นไม่ถูกต้อง (เลือกได้: ' + CLASS_LEVELS.join(', ') + ')' }, 400);

  const result = await env.DB.prepare(
    'INSERT INTO classrooms (academic_year,level,teacher_id) VALUES (?,?,?)'
  ).bind(academic_year, level, teacher_id || null).run();

  return json({ ok: true, id: result.meta.last_row_id }, 201);
}

export async function onRequestPut({ request, env, params }) {
  const session = await requireAuth(request, env);
  if (!session || session.role !== 'admin') return unauthorized();

  const id = params.id?.[0];
  if (!id) return json({ error: 'ระบุ id' }, 400);

  const { academic_year, level, teacher_id } = await request.json();
  // ห้องเก่าที่ใช้ชื่อชั้นนอกรายการ (ข้อมูลเดิม) ยังแก้อย่างอื่นได้ ถ้าไม่ได้เปลี่ยนชื่อชั้น
  const existing = await env.DB.prepare('SELECT level FROM classrooms WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'ไม่พบห้องเรียน' }, 404);
  if (level !== existing.level && !CLASS_LEVELS.includes(level)) {
    return json({ error: 'ระดับชั้นไม่ถูกต้อง (เลือกได้: ' + CLASS_LEVELS.join(', ') + ')' }, 400);
  }
  await env.DB.prepare('UPDATE classrooms SET academic_year=?,level=?,teacher_id=? WHERE id=?')
    .bind(academic_year, level, teacher_id || null, id).run();

  return json({ ok: true });
}
