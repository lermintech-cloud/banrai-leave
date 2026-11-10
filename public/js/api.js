// api.js — API client for banrai-homeroom
// All requests go through this single module.

const API_BASE = '/api';

/**
 * Core fetch wrapper. Handles 401 redirect and JSON error unwrapping.
 * @param {string} method  HTTP verb
 * @param {string} path    Path under /api
 * @param {object|null} body  JSON body
 * @returns {Promise<any>}
 */
async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (body !== null) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);

  if (res.status === 401) {
    window.location.href = '/';
    return null;
  }

  // Handle 204 No Content
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────
  login:  (username, password) => request('POST', '/auth/login',  { username, password }),
  logout: ()                   => request('POST', '/auth/logout'),
  me:     ()                   => request('GET',  '/auth/me'),

  // ── Students ──────────────────────────────────────────────
  getStudents:   (classroomId) =>
    request('GET', `/students?classroom_id=${classroomId}`),
  getStudent:    (id) =>
    request('GET', `/students/${id}`),
  createStudent: (data) =>
    request('POST', '/students', data),
  updateStudent: (id, data) =>
    request('PUT', `/students/${id}`, data),
  deleteStudent: (id) =>
    request('DELETE', `/students/${id}`),

  // ── Attendance ────────────────────────────────────────────
  getAttendanceByDate: (classroomId, date) =>
    request('GET', `/attendance?classroom_id=${classroomId}&date=${date}`),
  getAttendanceByMonth: (classroomId, year, month) =>
    request('GET', `/attendance?classroom_id=${classroomId}&year=${year}&month=${month}`),
  saveAttendance: (classroomId, date, records) =>
    request('POST', '/attendance', { classroom_id: classroomId, date, records }),

  // ── Reports ───────────────────────────────────────────────
  getAttendanceReport: (classroomId, semester, academicYear) =>
    request('GET', `/reports/attendance?classroom_id=${classroomId}&semester=${semester}&academic_year=${academicYear}`),
  getAnnualReport: (classroomId, academicYear) =>
    request('GET', `/reports/attendance?classroom_id=${classroomId}&type=annual&academic_year=${academicYear}`),

  // ── Savings ───────────────────────────────────────────────
  getSavingsByDate: (classroomId, date) =>
    request('GET', `/savings?classroom_id=${classroomId}&date=${date}`),
  getSavingsByMonth: (classroomId, year, month) =>
    request('GET', `/savings?classroom_id=${classroomId}&year=${year}&month=${month}`),
  saveSavings: (classroomId, date, records) =>
    request('POST', '/savings', { classroom_id: classroomId, date, records }),

  // ── Growth (weight / height) ──────────────────────────────
  getGrowth: (classroomId, year, month) =>
    request('GET', `/growth?classroom_id=${classroomId}&year=${year}&month=${month}`),
  saveGrowth: (classroomId, year, month, records) =>
    request('POST', '/growth', { classroom_id: classroomId, year, month, records }),

  // ── Health Checks ─────────────────────────────────────────
  getHealthChecks: (classroomId, year, month) =>
    request('GET', `/health-checks?classroom_id=${classroomId}&year=${year}&month=${month}`),
  saveHealthChecks: (classroomId, year, month, records) =>
    request('POST', '/health-checks', { classroom_id: classroomId, year, month, records }),

  // ── Settings ──────────────────────────────────────────────
  getSettings:  ()     => request('GET',  '/settings'),
  saveSettings: (data) => request('POST', '/settings', data),

  // ── Classrooms ────────────────────────────────────────────
  getClassrooms:   ()         => request('GET',  '/classrooms'),
  createClassroom: (data)     => request('POST', '/classrooms', data),
  updateClassroom: (id, data) => request('PUT',  `/classrooms/${id}`, data),
  deleteClassroom: (id)       => request('DELETE', `/classrooms/${id}`),

  // ── Users ─────────────────────────────────────────────────
  getUsers:   ()         => request('GET',  '/users'),
  createUser: (data)     => request('POST', '/users', data),
  updateUser: (id, data) => request('PUT',  `/users/${id}`, data),
  changePassword: (id, passwords) => request('PUT', `/users/${id}/password`, passwords),
};
