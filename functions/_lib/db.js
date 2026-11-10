// D1 database helpers

// จำนวนนักเรียนสูงสุดต่อห้อง (นับเฉพาะที่ยังไม่ถูกลบ/ปิดใช้งาน)
// ถ้าเปลี่ยนเลขนี้ ให้เปลี่ยน MAX_STUDENTS ใน public/js/utils.js ให้ตรงกัน
export const MAX_STUDENTS_PER_CLASSROOM = 25;

// ระดับชั้นที่โรงเรียนเปิดสอน เรียงจากเล็กไปใหญ่ (อยากเพิ่มอนุบาล 1 ก็เติมที่หัวรายการนี้)
export const CLASS_LEVELS = ['อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

// ORDER BY ตามระดับชั้นจริง (ภาษาไทยเรียงตามตัวอักษรจะได้ อนุบาล ไปอยู่หลัง ป.6)
const levelOrderSql = (col = 'level') =>
  `CASE ${col} ${CLASS_LEVELS.map((l, i) => `WHEN '${l}' THEN ${i}`).join(' ')} ELSE 99 END`;

export async function getStudentsByClassroom(db, classroomId) {
  return db.prepare(
    'SELECT * FROM students WHERE classroom_id = ? AND is_active = 1 ORDER BY student_number'
  ).bind(classroomId).all();
}

export async function getClassroomByTeacher(db, userId) {
  return db.prepare(
    'SELECT * FROM classrooms WHERE teacher_id = ? ORDER BY academic_year DESC, ' + levelOrderSql() + ', level'
  ).bind(userId).all();
}

export async function getAllClassrooms(db) {
  return db.prepare(
    `SELECT c.*, u.full_name as teacher_name, 
     (SELECT COUNT(*) FROM students s WHERE s.classroom_id = c.id AND s.is_active=1) as student_count
     FROM classrooms c LEFT JOIN users u ON c.teacher_id = u.id 
     ORDER BY c.academic_year DESC, ${levelOrderSql('c.level')}, c.level`
  ).all();
}

export function getNutritionStatus(gender, heightCm, weightKg, criteria) {
  const row = criteria.find(r => r.gender === gender && r.height_cm === Math.round(heightCm));
  if (!row) return '-';
  if (weightKg < row.lean) return 'ผอม';
  if (weightKg < row.somewhat_lean) return 'ค่อนข้างผอม';
  if (weightKg < row.normal) return 'สมส่วน';
  if (weightKg < row.chubby) return 'ท้วม';
  if (weightKg < row.overweight) return 'เริ่มอ้วน';
  return 'อ้วน';
}

export function calcAge(birthDate, refDate) {
  const b = new Date(birthDate);
  const r = refDate ? new Date(refDate) : new Date();
  let years = r.getFullYear() - b.getFullYear();
  let months = r.getMonth() - b.getMonth();
  let days = r.getDate() - b.getDate();
  if (days < 0) { months--; days += new Date(r.getFullYear(), r.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days, text: `${years} ปี ${months} เดือน ${days} วัน` };
}

// ตรวจว่า student_id ทุกคนใน records อยู่ในห้อง classroomId จริง (กันครูเขียนข้อมูลข้ามห้อง)
export async function studentsInClassroom(db, classroomId, records) {
  if (!Array.isArray(records)) return false;
  const ids = [...new Set(records.map(r => Number(r.student_id)))];
  if (ids.some(id => !Number.isInteger(id))) return false;
  if (ids.length === 0) return true;
  const marks = ids.map(() => '?').join(',');
  const row = await db.prepare(
    `SELECT COUNT(*) AS c FROM students WHERE classroom_id = ? AND id IN (${marks})`
  ).bind(classroomId, ...ids).first();
  return row.c === ids.length;
}

// สิทธิ์เข้าถึงห้อง: admin ทุกห้อง, ครูเฉพาะห้องที่ตัวเองเป็นครูประจำชั้น
export async function canAccessClassroom(session, classroomId, db) {
  if (session.role === 'admin') return true;
  const c = await db.prepare('SELECT id FROM classrooms WHERE id = ? AND teacher_id = ?')
    .bind(classroomId, session.user_id).first();
  return !!c;
}
