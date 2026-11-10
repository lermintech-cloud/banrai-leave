// icons.js — ชุดไอคอนสไตล์ iOS: เส้นบาง ปลายมน เรียบง่าย
// class="f" = ส่วนที่ระบายสีอ่อนเมื่อเมนูถูกเลือก (เหมือนไอคอน filled ของ iOS)
export const ICONS = {
  home:     '<path class="f" d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15V15H9v5.5H5.5A1.5 1.5 0 0 1 4 19z"/>',
  check:    '<circle class="f" cx="12" cy="12" r="8.5"/><path d="m8.4 12.3 2.6 2.6 4.6-5.2"/>',
  wallet:   '<rect class="f" x="3" y="6.5" width="18" height="11" rx="3.2"/><circle cx="12" cy="12" r="2.4"/><path d="M6.6 12h.01M17.4 12h.01"/>',
  calendar: '<rect class="f" x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M8 3v3.5M16 3v3.5M3.5 10h17"/>',
  scale:    '<rect class="f" x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M8.2 10a5.2 5.2 0 0 1 7.6 0"/><path d="m12 11.2 1.8-1.9"/>',
  heart:    '<path class="f" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  users:    '<circle class="f" cx="9" cy="8.5" r="3.3"/><path d="M3.2 19.5c.5-3.1 2.7-5 5.8-5s5.3 1.9 5.8 5"/><path d="M15.5 5.6a3.1 3.1 0 0 1 0 5.8M17.5 14.9c1.9.5 3.1 2 3.4 4.3"/>',
  chart:    '<rect class="f" x="4" y="11" width="4" height="9" rx="1.3"/><rect class="f" x="10" y="4" width="4" height="16" rx="1.3"/><rect class="f" x="16" y="8" width="4" height="12" rx="1.3"/>',
  sliders:  '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle class="f" cx="15" cy="7" r="2.2"/><circle class="f" cx="9" cy="17" r="2.2"/>',
  logout:   '<path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10"/><path d="m15 8 4 4-4 4M19 12H9.5"/>',
  xcircle:  '<circle class="f" cx="12" cy="12" r="8.5"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
  clock:    '<circle class="f" cx="12" cy="12" r="8.5"/><path d="M12 7.6V12l3 1.9"/>',
  printer: '<path d="M7.5 9V4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V9"/><rect class="f" x="3.5" y="9" width="17" height="8.5" rx="2.6"/><path d="M7.5 14h9v6.5h-9z"/>',
  save: '<path d="M12 4v10.5M7.8 10.8l4.2 4.2 4.2-4.2"/><path d="M5 19.5h14"/>',
  pencil: '<path class="f" d="M4.5 19.5 5.4 15 16 4.5a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L9 18.6z"/><path d="m14.2 6.4 3.4 3.4"/>',
  key: '<circle class="f" cx="8" cy="15.5" r="3.8"/><path d="m10.8 12.7 8.7-8.7M16.2 7.3l2.4 2.4M13.6 9.9l1.9 1.9"/>',
  school: '<path class="f" d="M4 20V9.8L12 4l8 5.8V20z"/><path d="M9.5 20v-5.2h5V20M12 9.2v.01"/>',
  shield: '<path class="f" d="M12 3.2 19 6v5.2c0 4.3-2.9 7.9-7 9.6-4.1-1.7-7-5.3-7-9.6V6z"/><path d="m9 12 2.2 2.2L15.3 10"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  alert: '<path class="f" d="M10.3 4.7 3 17.4a2 2 0 0 0 1.7 3.1h14.6a2 2 0 0 0 1.7-3.1L13.7 4.7a2 2 0 0 0-3.4 0z"/><path d="M12 9.6v4M12 17.2v.01"/>',
  thermo: '<path class="f" d="M10 14.6V5.6a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 10v5.5"/>',
  doc: '<path class="f" d="M7 3.5h7l4.5 4.5v11A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4"/>',
  cup: '<path class="f" d="M7 4h10l-1.2 15.2a1.8 1.8 0 0 1-1.8 1.6h-4a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M7.6 9.5h8.8"/>',
  tooth: '<path class="f" d="M12 6c-1-1-2.2-1.6-3.6-1.6C6.1 4.4 4.5 6.2 4.5 8.6c0 1.7.6 3 1.2 4.4.7 1.6.9 4 1.5 6.2.2.9 1.4.9 1.7 0 .4-1.4.6-3.2 1.2-3.8.5-.5 1.4-.5 1.8 0 .6.6.8 2.4 1.2 3.8.3.9 1.5.9 1.7 0 .6-2.2.8-4.6 1.5-6.2.6-1.4 1.2-2.7 1.2-4.4 0-2.4-1.6-4.2-3.9-4.2C14.200 4.4 13 5 12 6z"/>',
  utensils: '<path d="M6.5 3.5v5.2a2.5 2.5 0 0 0 5 0V3.5M9 3.5v17"/><path d="M17.5 20.5v-17C15.300 4.700 14 7.300 14 10.500h3.500"/>',
  sparkles: '<path class="f" d="m11 3.5 1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8z"/><path d="m18.500 15.500.7 1.800 1.800.7-1.800.7-.7 1.800-.7-1.800-1.800-.7 1.800-.7z"/>',
  menu:     '<path d="M4 7h16M4 12h16M4 17h16"/>',
  clipboard:'<rect class="f" x="5" y="4.5" width="14" height="16.5" rx="3.2"/><path d="M9 4.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v.5M8.8 11h6.4M8.8 15h4"/>',
  list:     '<rect class="f" x="3.5" y="4" width="17" height="16" rx="4"/><path d="M8 9h8M8 12.5h8M8 16h4.5"/>',
  user:     '<circle class="f" cx="12" cy="8.5" r="3.6"/><path d="M5 20c.6-3.6 3.2-5.6 7-5.6s6.4 2 7 5.6"/>',
  book:     '<path class="f" d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15.5H7.5A2.5 2.5 0 0 0 5 21z"/><path d="M5 5.5V21M9 7.5h6"/>',
};

// ใส่ attribute การวาดไว้ใน <svg> เอง จึงแสดงถูกต้องแม้ CSS ยังโหลดไม่เสร็จ
// (สาเหตุของไอคอนรูปคนสีดำที่แวบขึ้นมาแต่ก่อน)
export function icon(name, { size = 22, sw = 1.8, cls = '' } = {}) {
  const body = ICONS[name] || ICONS.home;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
