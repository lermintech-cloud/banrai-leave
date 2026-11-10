// nav.js — sidebar + bottom navigation (ไอคอนสไตล์ iOS จาก icons.js)
import { icon } from './icons.js';
export function renderNav(activePage = '') {
  const navGroups = [
    {
      label: 'ภาพรวม',
      items: [
        { href: '/dashboard.html', icon: 'home', label: 'หน้าหลัก', key: 'dashboard' },
      ]
    },
    {
      label: 'ประจำวัน',
      items: [
        { href: '/attendance.html',  icon: 'check', label: 'เช็คชื่อ', key: 'attendance' },
        { href: '/savings.html',     icon: 'wallet', label: 'ออมเงิน', key: 'savings' },
        { href: '/activities.html',  icon: 'list', label: 'กิจกรรมประจำวัน', key: 'activities' },
      ]
    },
    {
      label: 'สุขภาพ',
      items: [
        { href: '/growth.html',      icon: 'scale', label: 'น้ำหนัก-ส่วนสูง', key: 'growth' },
        { href: '/health-check.html',icon: 'heart', label: 'ตรวจสุขภาพ', key: 'health-check' },
      ]
    },
    {
      label: 'รายงาน',
      items: [
        { href: '/students.html',         icon: 'users', label: 'ข้อมูลนักเรียน', key: 'students' },
        { href: '/attendance-report.html', icon: 'chart', label: 'สรุปเวลาเรียน', key: 'attendance-report' },
      ]
    },
    {
      label: 'ระบบ',
      items: [
        { href: '/settings.html', icon: 'sliders', label: 'ตั้งค่า', key: 'settings' },
      ]
    }
  ];

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const classroom = JSON.parse(sessionStorage.getItem('current_classroom') || 'null');
  const avatarChar = (user.full_name || user.username || '?').charAt(0).toUpperCase();

  const sidebarNav = navGroups.map(group => {
    const items = group.items.map(item => `
      <a href="${item.href}" class="nav-item ${activePage === item.key ? 'active' : ''}">
        <span class="nav-icon">${icon(item.icon, { size: 22 })}</span>
        <span class="nav-label">${item.label}</span>
      </a>`).join('');
    return `
      <div class="sidebar-section-label">${group.label}</div>
      ${items}`;
  }).join('');

  const bottomNavItems = [
    { href: '/dashboard.html',  icon: 'home', label: 'หน้าหลัก', key: 'dashboard' },
    { href: '/attendance.html', icon: 'check', label: 'เช็คชื่อ', key: 'attendance' },
    { href: '/students.html',   icon: 'users', label: 'นักเรียน', key: 'students' },
    { href: '/growth.html',     icon: 'heart', label: 'สุขภาพ', key: 'growth' },
    { href: '/settings.html',   icon: 'sliders', label: 'ตั้งค่า', key: 'settings' },
  ];

  const bottomNav = bottomNavItems.map(item => `
    <a href="${item.href}" class="bottom-nav-item ${activePage === item.key ? 'active' : ''}">
      <span class="bottom-nav-icon">${icon(item.icon, { size: 24 })}</span>
      <span>${item.label}</span>
    </a>`).join('');

  const classroomBadge = classroom
    ? `<div class="sidebar-classroom-badge show">${icon('book', { size: 14, sw: 2 })} ชั้น ${classroom.level} · ปี ${classroom.academic_year}</div>`
    : `<div class="sidebar-classroom-badge"></div>`;

  return `
    <header class="app-header">
      <button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="เมนู">
        ${icon('menu', { size: 22, sw: 2 })}
      </button>
      <div class="header-title">
        <div class="header-page-title" id="headerPageTitle">ระบบธุรการชั้นเรียน</div>
        <div class="header-breadcrumb">โรงเรียนบ้านไร่</div>
      </div>
      <div class="header-right">
        ${classroom ? `<div class="header-classroom-pill">${icon('book', { size: 14, sw: 2 })} ${classroom.level}</div>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="doLogout()" style="font-size:13px">
          ออกจากระบบ
        </button>
      </div>
    </header>

    <nav class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon"><img src="/assets/school-logo.png" alt="ตราสัญลักษณ์โรงเรียนบ้านไร่"></div>
        <div class="sidebar-brand-text">
          <div class="sidebar-brand-name">โรงเรียนบ้านไร่</div>
          <div class="sidebar-brand-sub">สพป.เชียงใหม่ เขต 5</div>
        </div>
      </div>
      ${classroomBadge}
      <div class="sidebar-nav">
        ${sidebarNav}
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar">${avatarChar}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user.full_name || user.username || '-'}</div>
            <div class="sidebar-user-role">${user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ครูประจำชั้น'}</div>
          </div>
          <button class="sidebar-logout" onclick="doLogout()" title="ออกจากระบบ" aria-label="ออกจากระบบ">${icon('logout', { size: 20 })}</button>
        </div>
      </div>
    </nav>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <nav class="bottom-nav">
      ${bottomNav}
    </nav>
  `;
}

export function initNav(activePage) {
  document.getElementById('app-nav').innerHTML = renderNav(activePage);
  // Update header page title
  const titles = {
    dashboard: 'หน้าหลัก',
    attendance: 'เช็คชื่อนักเรียน',
    students: 'ข้อมูลนักเรียน',
    'attendance-report': 'สรุปเวลาเรียน',
    activities: 'กิจกรรมประจำวัน',
    savings: 'ออมเงิน',
    growth: 'น้ำหนัก-ส่วนสูง',
    'health-check': 'ตรวจสุขภาพ',
    settings: 'ตั้งค่า',
  };
  const el = document.getElementById('headerPageTitle');
  if (el && titles[activePage]) el.textContent = titles[activePage];
}

window.toggleSidebar = function() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
};

window.doLogout = async function() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  sessionStorage.clear();
  window.location.href = '/';
};
