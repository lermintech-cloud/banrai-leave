import { icon } from './icons.js';
// utils.js — Shared utility functions for banrai-homeroom

/**
 * Calculate age from birth date.
 * @param {string} birthDateStr  ISO date string
 * @param {string|null} refDateStr  Reference date (defaults to today)
 * @returns {{ years, months, days, text }}
 */
export function calcAge(birthDateStr, refDateStr = null) {
  const b = new Date(birthDateStr);
  const r = refDateStr ? new Date(refDateStr) : new Date();
  let years  = r.getFullYear() - b.getFullYear();
  let months = r.getMonth()    - b.getMonth();
  let days   = r.getDate()     - b.getDate();

  if (days   < 0) {
    months--;
    days += new Date(r.getFullYear(), r.getMonth(), 0).getDate();
  }
  if (months < 0) { years--; months += 12; }

  return { years, months, days, text: `${years} ปี ${months} เดือน ${days} วัน` };
}

/** Thai month name (full) from 1-indexed month number. */
export function thaiMonth(month) {
  const months = [
    '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  return months[parseInt(month)] || '';
}

/** Thai month abbreviation from 1-indexed month number. */
export function thaiMonthShort(month) {
  const months = [
    '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];
  return months[parseInt(month)] || '';
}

/**
 * Format ISO date to Thai readable: "12 มกราคม 2567"
 * @param {string} dateStr
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00'); // avoid timezone shift
  return `${d.getDate()} ${thaiMonth(d.getMonth() + 1)} ${d.getFullYear() + 543}`;
}

/**
 * Format ISO date to short Thai: "12 ม.ค. 67"
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  const year = String(d.getFullYear() + 543).slice(-2);
  return `${d.getDate()} ${thaiMonthShort(d.getMonth() + 1)} ${year}`;
}

/**
 * Returns today's date as ISO string "YYYY-MM-DD" in local time.
 */
export function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns current year (CE) and month (1-indexed).
 */
export function currentYearMonth() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/**
 * Number of days in a given month.
 * @param {number} year  CE year
 * @param {number} month 1-indexed
 */
export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Returns true if the given ISO date string falls on a Saturday or Sunday.
 */
export function isWeekend(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay() === 0 || d.getDay() === 6;
}

/**
 * Convert Thai academic year (พ.ศ.) to CE year.
 * Example: 2567 → 2024
 */
export function academicYearToCE(ay) {
  return parseInt(ay) - 543;
}

/**
 * Returns the CE months belonging to a given semester.
 * Semester 1 = พ.ค.–ก.ย. (5–9)
 * Semester 2 = ต.ค.–มี.ค. (10–3)
 * Both       = all months
 */
export function getSemesterMonths(semester) {
  if (semester === 1 || semester === '1') return [5, 6, 7, 8, 9];
  if (semester === 2 || semester === '2') return [10, 11, 12, 1, 2, 3];
  return [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
}

/**
 * Append a dismissible alert element to `container`.
 * @param {HTMLElement} container
 * @param {string} msg
 * @param {'success'|'danger'|'warning'|'info'} type
 * @param {number} duration  ms before auto-remove (0 = never)
 */
export function showAlert(container, msg, type = 'success', duration = 3000) {
  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  const kind = { success: 'check', danger: 'xcircle', warning: 'alert', info: 'alert' }[type] || 'check';
  el.innerHTML = icon(kind, { size: 18, sw: 2 });
  const txt = document.createElement('span');
  txt.textContent = msg;               // ข้อความเข้า textContent เสมอ ไม่ใช้ innerHTML
  el.appendChild(txt);
  container.prepend(el);
  if (duration > 0) setTimeout(() => el.remove(), duration);
  return el;
}

/**
 * Set a button into loading / normal state.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 */
export function setLoading(btn, loading) {
  if (loading) {
    btn.disabled    = true;
    btn._savedText  = btn.innerHTML;
    btn.innerHTML   = '<span class="spinner-sm"></span> กำลังบันทึก...';
  } else {
    btn.disabled  = false;
    btn.innerHTML = btn._savedText || 'บันทึก';
  }
}

/**
 * Returns badge class name for an attendance status.
 * @param {string} status  'มา' | 'ป' | 'ล' | 'ข'
 */
export function statusColor(status) {
  const map = { 'มา': 'success', 'ป': 'warning', 'ล': 'info', 'ข': 'danger' };
  return map[status] || 'secondary';
}

/**
 * Returns badge class name for a nutrition status (ภาวะโภชนาการ).
 */
export function nutritionColor(status) {
  const map = {
    'สมส่วน':     'success',
    'ค่อนข้างผอม': 'warning',
    'ผอม':        'danger',
    'ท้วม':       'info',
    'เริ่มอ้วน':  'warning',
    'อ้วน':       'danger',
  };
  return map[status] || 'secondary';
}

/**
 * Returns nutrition CSS class for the nut-badge span.
 */
export function nutritionClass(status) {
  const map = {
    'สมส่วน':     'nut-normal',
    'ค่อนข้างผอม': 'nut-thin',
    'ผอม':        'nut-xthin',
    'ท้วม':       'nut-chubby',
    'เริ่มอ้วน':  'nut-chubby',
    'อ้วน':       'nut-fat',
  };
  return map[status] || '';
}

/**
 * Build an array of day descriptor objects for the given month.
 * @param {number} year  CE year
 * @param {number} month 1-indexed
 * @returns {{ day: number, dateStr: string, isWeekend: boolean }[]}
 */
export function getDaysArray(year, month) {
  const n = daysInMonth(year, month);
  return Array.from({ length: n }, (_, i) => {
    const day     = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, dateStr, isWeekend: isWeekend(dateStr) };
  });
}

/**
 * Returns the Thai academic year (พ.ศ.) and semester for a given CE date.
 */
export function getAcademicPeriod(dateStr = null) {
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  const month = d.getMonth() + 1; // 1-indexed
  const ceYear = d.getFullYear();
  // Thai academic year starts in May
  // May–Sep   = semester 1 of that year
  // Oct–Dec   = semester 2 of that year
  // Jan–Mar   = semester 2 of PREVIOUS academic year
  let academicYear, semester;
  if (month >= 5) {
    academicYear = ceYear + 543;
    semester = month <= 9 ? 1 : 2;
  } else {
    academicYear = ceYear - 1 + 543; // previous academic year
    semester = 2;
  }
  return { academicYear, semester };
}

/**
 * Zero-pad a number to 2 digits.
 */
export function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Parse a "YYYY-MM-DD" string safely (avoids UTC/local offset issues).
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns the day-of-week label (อา/จ/อ/พ/พฤ/ศ/ส) for an ISO date string.
 */
export function thaiDayOfWeek(dateStr) {
  const labels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const d = parseDate(dateStr);
  return d ? labels[d.getDay()] : '';
}

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ต้องตรงกับ MAX_STUDENTS_PER_CLASSROOM / CLASS_LEVELS ใน functions/_lib/db.js
// (เซิร์ฟเวอร์เป็นตัวบังคับจริง ค่าชุดนี้ใช้แสดงผลในหน้าเว็บเท่านั้น)
export const MAX_STUDENTS = 25;
export const CLASS_LEVELS = ['อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
