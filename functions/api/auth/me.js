import { requireAuth, json, unauthorized } from '../../_lib/auth.js';
import { getClassroomByTeacher, getAllClassrooms } from '../../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const session = await requireAuth(request, env);
  if (!session) return unauthorized();

  let classrooms;
  if (session.role === 'admin') {
    const result = await getAllClassrooms(env.DB);
    classrooms = result.results;
  } else {
    const result = await getClassroomByTeacher(env.DB, session.user_id);
    classrooms = result.results;
  }

  return json({
    user: { id: session.user_id, username: session.username, role: session.role, full_name: session.full_name },
    classrooms
  });
}
