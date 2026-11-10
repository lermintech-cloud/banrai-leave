// auth.js — Authentication helpers for banrai-homeroom
import { api } from './api.js';

/**
 * Verify session with the server.
 * On success, caches user & classrooms in sessionStorage.
 * @param {boolean} redirectIfNotAuth  If true, redirect to '/' on failure.
 * @returns {Promise<{user, classrooms}|null>}
 */
export async function checkAuth(redirectIfNotAuth = true) {
  try {
    const data = await api.me();
    if (!data) {
      if (redirectIfNotAuth) window.location.href = '/';
      return null;
    }
    sessionStorage.setItem('user',       JSON.stringify(data.user));
    sessionStorage.setItem('classrooms', JSON.stringify(data.classrooms || []));
    return data;
  } catch (e) {
    if (redirectIfNotAuth) window.location.href = '/';
    return null;
  }
}

/**
 * Returns the cached user object from sessionStorage.
 * @returns {object|null}
 */
export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}

/**
 * Returns the cached classrooms array.
 * @returns {Array}
 */
export function getClassrooms() {
  try {
    return JSON.parse(sessionStorage.getItem('classrooms')) || [];
  } catch {
    return [];
  }
}

/**
 * Returns the currently-selected classroom object.
 * Falls back to the first classroom in the list.
 */
export function getCurrentClassroom() {
  const classrooms = getClassrooms();
  if (classrooms.length === 0) return null;

  const savedId = sessionStorage.getItem('current_classroom_id');
  if (savedId) {
    const found = classrooms.find(c => String(c.id) === String(savedId));
    if (found) return found;
  }
  return classrooms[0];
}

/**
 * Persist the selected classroom id.
 * @param {string|number} id
 */
export function setCurrentClassroom(id) {
  sessionStorage.setItem('current_classroom_id', String(id));
}

/**
 * Returns true if the logged-in user has role 'admin'.
 */
export function isAdmin() {
  const user = getUser();
  return user?.role === 'admin';
}

/**
 * Returns the display name: prefix + first name, e.g. "ครูสมหมาย"
 */
export function getUserDisplayName() {
  const user = getUser();
  if (!user) return '';
  const prefix = user.role === 'admin' ? 'ผู้ดูแล' : 'ครู';
  return `${prefix}${user.full_name || user.username}`;
}

/**
 * Log out: call API, clear storage, redirect.
 */
export async function logout() {
  try {
    await api.logout();
  } catch (_) { /* ignore */ }
  sessionStorage.clear();
  window.location.href = '/';
}

/**
 * Utility: set up the logout button (if present) on a page.
 */
export function setupLogoutButton(selector = '#btnLogout') {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    await logout();
  });
}

/**
 * Populate a <select> element with the classrooms the user has access to.
 * Marks the current classroom as selected.
 * @param {HTMLSelectElement} sel
 * @param {Function} onChange  Called with the new classroom object when changed.
 */
export function populateClassroomSelector(sel, onChange) {
  const classrooms = getClassrooms();
  const current = getCurrentClassroom();
  sel.innerHTML = classrooms.map(c =>
    `<option value="${c.id}" ${c.id === current?.id ? 'selected' : ''}>${c.name}</option>`
  ).join('');

  sel.addEventListener('change', () => {
    const chosen = classrooms.find(c => String(c.id) === sel.value);
    if (chosen) {
      setCurrentClassroom(chosen.id);
      if (onChange) onChange(chosen);
    }
  });
}
