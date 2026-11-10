// report.js — ตัวสร้างเอกสารรายงานขนาด A4 (พรีวิวเต็มหน้า / พิมพ์จริง / บันทึก PDF)
//
// วิธีใช้:
//   import { openReport, getReportContext, esc } from '/js/report.js';
//   const ctx = await getReportContext();
//   openReport({ key, title, subtitle, orientation, fileName, info, table:{...}, after, signatures });
//
// หลักการ: จัดหน้าด้วย JS โดยวัดความสูงจริงของแต่ละแถวบนกระดาษขนาด A4 (210×297 มม.)
// ดังนั้นสิ่งที่เห็นในพรีวิว = สิ่งที่ออกเครื่องพิมพ์ / PDF ทุกประการ

import { api } from './api.js';
import { getCurrentClassroom, getUser } from './auth.js';
import { formatDate, today, escHtml } from './utils.js';

export const esc = escHtml;
export const studentName = (s) => `${esc(s.prefix || '')}${esc(s.first_name)} ${esc(s.last_name)}`;
export const buddhistYear = (ce) => parseInt(ce) + 543;

const MM = 96 / 25.4;                       // px ต่อ มม. (CSS)
const PAPER = { w: 210, h: 297 };           // A4
const MARGINS = {
  gov:    { label: 'ราชการ (ซ้าย 3 ขวา 2 ซม.)', t: 25, r: 20, b: 20, l: 30 },
  mid:    { label: 'ปานกลาง (2 ซม.)',           t: 20, r: 20, b: 20, l: 20 },
  narrow: { label: 'แคบ (1.5 ซม.)',             t: 15, r: 15, b: 15, l: 15 },
};
const PREF_KEY = 'rpt_prefs_v1';
const TH_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

/* ───────────── ข้อมูลโรงเรียน / ห้องเรียน ───────────── */
let _settings = null;
export async function getReportContext() {
  if (!_settings) {
    try { _settings = await api.getSettings(); } catch { _settings = {}; }
  }
  const classroom = getCurrentClassroom();
  const user = getUser() || {};
  const teacherName = (classroom && classroom.teacher_name) || (user.role !== 'admin' ? user.full_name : '') || '';
  return {
    school: {
      name: _settings.school_name || 'โรงเรียนบ้านไร่',
      district: _settings.district || '',
      address: _settings.address || '',
      director: _settings.director_name || '',
    },
    classroom, teacherName,
  };
}

/* ───────────── การตั้งค่าที่จำไว้ ───────────── */
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; }
}
function savePrefs(p) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

/* ───────────── ไอคอน ───────────── */
const IC = {
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V4h10v5"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6H7z"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M12 11v6m0 0-2.5-2.5M12 17l2.5-2.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  portrait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="3" width="12" height="18" rx="1.5"/></svg>',
  landscape: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="1.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
};

/* ───────────── ตัวช่วย ───────────── */
function toThaiDigitsText(s) { return s.replace(/[0-9]/g, d => TH_DIGITS[d]); }
// แปลงเฉพาะ "ข้อความ" ระหว่างแท็ก ไม่แตะ attribute (เช่น class="c1", style="width:8mm")
function convertHtml(html) {
  return ('>' + html + '<').replace(/>([^<]+)</g, (m, t) => '>' + toThaiDigitsText(t) + '<').slice(1, -1);
}
const val = (x, ctx) => (typeof x === 'function' ? x(ctx) : x);

function thaiNow() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `พิมพ์เมื่อ ${formatDate(today())} เวลา ${hh}.${mm} น.`;
}

/* ───────────── ตัวจัดหน้า ───────────── */
function ensureHost() {
  let h = document.getElementById('rptMeasureHost');
  if (!h) {
    h = document.createElement('div');
    h.id = 'rptMeasureHost';
    h.setAttribute('aria-hidden', 'true');
    h.style.cssText = 'position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(h);
  }
  return h;
}

function paginate(doc, ctx, o, D, k = 1) {
  const host = ensureHost();
  host.innerHTML = '';
  const m = MARGINS[o.margin] || MARGINS.gov;
  const pw = o.orient === 'landscape' ? PAPER.h : PAPER.w;
  const ph = o.orient === 'landscape' ? PAPER.w : PAPER.h;
  const cctx = { orient: o.orient, contentW: pw - m.l - m.r, contentH: ph - m.t - m.b };

  const school = ctx.school;
  const title = D(doc.title || '');
  const sub = D(doc.subtitle || '');
  const spec = doc.table ? val(doc.table, cctx) : null;      // table เป็นฟังก์ชันของ ctx ได้ (เลือกรูปแบบตามแนวกระดาษ)
  const T = spec ? { cls: spec.cls || '', colgroup: spec.colgroup || '', head: D(spec.head || '') } : null;
  const rows = spec ? (spec.rows || []).map(D) : [];
  const afterHtml = val(doc.after, cctx) || '';

  const headHtml = `
    <div class="rpt-head">
      <img src="/assets/school-logo.png" alt="">
      <div class="rpt-head-text">
        <div class="t1">${title}</div>
        ${sub ? `<div class="t2">${sub}</div>` : ''}
        <div class="t3">${D(esc(school.name))}${school.district ? ' ' + D(esc(school.district)) : ''}</div>
      </div>
    </div>
    ${doc.info && doc.info.length ? `<div class="rpt-info">${doc.info.map(t => `<span>${D(t)}</span>`).join('')}</div>` : ''}`;
  const contHtml = `<div class="rpt-cont">${title}${sub ? ' — ' + sub : ''} (ต่อ)</div>`;

  const sigs = (doc.signatures || []);
  const tail = `<div class="rpt-tail">${afterHtml ? D(afterHtml) : ''}${sigs.length ? `
    <div class="rpt-sign">${sigs.map(s => `
      <div>
        <div class="line">ลงชื่อ<span class="sig-dots"></span></div>
        <div>(${s.name ? D(esc(s.name)) : '<span class="sig-dots short"></span>'})</div>
        <div>${D(esc(s.role))}</div>
      </div>`).join('')}
    </div>` : ''}</div>`;

  const papers = [];
  const newPaper = (first) => {
    const p = document.createElement('div');
    p.className = 'rpt-paper';
    p.style.cssText = `--k:${k};--pw:${pw}mm;--ph:${ph}mm;--mt:${m.t}mm;--mr:${m.r}mm;--mb:${m.b}mm;--ml:${m.l}mm;`;
    p.innerHTML = '<div class="rpt-body"></div><div class="rpt-pagefoot"><span class="pf-l"></span><span class="pf-r"></span></div>';
    host.appendChild(p);
    papers.push(p);
    const body = p.firstElementChild;
    body.insertAdjacentHTML('beforeend', first ? headHtml : contHtml);
    let tbody = null;
    if (T) {
      body.insertAdjacentHTML('beforeend',
        `<table class="rpt-table ${T.cls}">${T.colgroup}<thead>${T.head}</thead><tbody></tbody></table>`);
      tbody = body.querySelector('tbody');
    }
    return { p, body, tbody };
  };
  const over = (c) => c.body.scrollHeight > c.body.clientHeight + 1;

  let c = newPaper(true);
  for (const r of rows) {
    c.tbody.insertAdjacentHTML('beforeend', r);
    if (over(c) && c.tbody.rows.length > 1) {
      const tr = c.tbody.lastElementChild;
      tr.remove();
      c = newPaper(false);
      c.tbody.appendChild(tr);
    }
  }

  // ส่วนท้าย (หมายเหตุ + ลายมือชื่อ) ต้องไม่ขาดจากกัน และไม่ควรโดดเดี่ยวอยู่หน้าเดียวโดยไม่มีตาราง
  if (tail.length > 40) {
    c.body.insertAdjacentHTML('beforeend', tail);
    if (over(c)) {
      c.body.lastElementChild.remove();
      const moved = [];
      if (c.tbody && c.tbody.rows.length > 3) {
        for (let i = 0; i < 2; i++) moved.unshift(c.tbody.lastElementChild), c.tbody.lastElementChild.remove();
      }
      const n = newPaper(false);
      if (n.tbody) moved.forEach(r => n.tbody.appendChild(r));
      n.body.insertAdjacentHTML('beforeend', tail);
      c = n;
    }
  }

  const total = papers.length;
  const stamp = D(thaiNow());
  papers.forEach((p, i) => {
    p.querySelector('.pf-l').textContent = stamp;
    p.querySelector('.pf-r').textContent = D(`หน้า ${i + 1} / ${total}`);
  });
  return { papers, pw, ph };
}

/* ───────────── หน้าต่างพรีวิว ───────────── */
class Viewer {
  constructor() {
    this.prefs = loadPrefs();
    this.doc = null;
    this.ctx = null;
    this.zoom = this.prefs.zoom || 'fit';
    this.built = false;
    this.token = 0;
  }

  build() {
    if (this.built) return;
    const el = document.createElement('div');
    el.className = 'rpt-overlay';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'ตัวอย่างก่อนพิมพ์');
    el.innerHTML = `
      <div class="rpt-toolbar">
        <div class="rpt-title">${IC.print}<span id="rptTitle">ตัวอย่างก่อนพิมพ์</span></div>
        <div class="rpt-opts">
        <div class="rpt-group">
          <span class="rpt-label">แนวกระดาษ</span>
          <div class="rpt-seg" id="rptOrient">
            <button type="button" data-v="portrait" aria-pressed="false">${IC.portrait}<span>แนวตั้ง</span></button>
            <button type="button" data-v="landscape" aria-pressed="false">${IC.landscape}<span>แนวนอน</span></button>
          </div>
        </div>
        <div class="rpt-group">
          <span class="rpt-label">ขอบ</span>
          <select class="rpt-select" id="rptMargin" aria-label="ระยะขอบกระดาษ">
            ${Object.entries(MARGINS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="rpt-group">
          <span class="rpt-label">ตัวเลข</span>
          <div class="rpt-seg" id="rptDigits">
            <button type="button" data-v="ar" aria-pressed="false">123</button>
            <button type="button" data-v="th" aria-pressed="false">๑๒๓</button>
          </div>
        </div>
        <div class="rpt-group">
          <button type="button" class="rpt-btn icon" id="rptZoomOut" aria-label="ย่อ">${IC.minus}</button>
          <select class="rpt-select" id="rptZoom" aria-label="ขนาดตัวอย่าง">
            <option value="fit">พอดีความกว้าง</option>
            <option value="page">พอดีทั้งหน้า</option>
            <option value="0.5">50%</option><option value="0.75">75%</option>
            <option value="1">100%</option><option value="1.25">125%</option>
            <option value="1.5">150%</option><option value="2">200%</option>
          </select>
          <button type="button" class="rpt-btn icon" id="rptZoomIn" aria-label="ขยาย">${IC.plus}</button>
        </div>
        </div>
        <div class="rpt-group rpt-actions">
          <button type="button" class="rpt-btn" id="rptPdf">${IC.pdf}<span class="txt">บันทึก PDF</span></button>
          <button type="button" class="rpt-btn primary main" id="rptPrint">${IC.print}<span class="txt">พิมพ์</span></button>
          <button type="button" class="rpt-btn icon" id="rptClose" aria-label="ปิดตัวอย่าง">${IC.close}</button>
        </div>
      </div>
      <div class="rpt-hint" id="rptHint" role="status"></div>
      <div class="rpt-stage" id="rptStage"></div>`;
    document.body.appendChild(el);

    let pr = document.getElementById('rptPrintRoot');
    if (!pr) { pr = document.createElement('div'); pr.id = 'rptPrintRoot'; document.body.appendChild(pr); }

    this.el = el;
    this.stage = el.querySelector('#rptStage');
    this.hint = el.querySelector('#rptHint');
    this.printRoot = pr;

    el.querySelector('#rptOrient').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      this.setPref('orient', b.dataset.v, true);
    });
    el.querySelector('#rptDigits').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      this.setPref('digits', b.dataset.v);
    });
    el.querySelector('#rptMargin').addEventListener('change', e => this.setPref('margin', e.target.value));
    el.querySelector('#rptZoom').addEventListener('change', e => this.setZoom(e.target.value));
    el.querySelector('#rptZoomIn').addEventListener('click', () => this.stepZoom(1));
    el.querySelector('#rptZoomOut').addEventListener('click', () => this.stepZoom(-1));
    el.querySelector('#rptPrint').addEventListener('click', () => this.print());
    el.querySelector('#rptPdf').addEventListener('click', () => this.savePdf());
    el.querySelector('#rptClose').addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if (!this.el.hidden && e.key === 'Escape') this.close(); });
    new ResizeObserver(() => { if (!this.el.hidden) this.applyScale(); }).observe(this.stage);
    this.built = true;
  }

  // orient เก็บแยกตามชนิดรายงาน (doc.key) ส่วน margin/digits ใช้ร่วมกัน
  getOpts() {
    const p = this.prefs;
    return {
      orient: (p.orient && p.orient[this.doc.key]) || this.doc.orientation || 'portrait',
      margin: p.margin || 'gov',
      digits: p.digits || 'ar',
    };
  }
  setPref(k, v, perDoc = false) {
    if (perDoc) { this.prefs.orient = this.prefs.orient || {}; this.prefs.orient[this.doc.key] = v; }
    else this.prefs[k] = v;
    savePrefs(this.prefs);
    this.render();
  }

  async open(doc) {
    this.build();
    this.doc = doc;
    this.ctx = await getReportContext();
    this.el.hidden = false;
    document.body.classList.add('rpt-open');
    this.prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.el.querySelector('#rptTitle').textContent = doc.title || 'ตัวอย่างก่อนพิมพ์';
    this.hint.classList.remove('show');
    this.el.querySelector('#rptZoom').value = this.zoom;
    await this.render();
    this.el.querySelector('#rptClose').focus({ preventScroll: true });
  }

  close() {
    this.el.hidden = true;
    document.body.classList.remove('rpt-open');
    document.body.style.overflow = this.prevOverflow || '';
    this.stage.innerHTML = '';
    this.printRoot.innerHTML = '';
    document.getElementById('rptMeasureHost')?.replaceChildren();
    document.getElementById('rptPageStyle')?.remove();
    clearTimeout(this.hintTimer);
  }

  async render() {
    const my = ++this.token;
    const o = this.getOpts();
    // อัปเดตสถานะปุ่ม
    this.el.querySelectorAll('#rptOrient button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === o.orient)));
    this.el.querySelectorAll('#rptDigits button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === o.digits)));
    this.el.querySelector('#rptMargin').value = o.margin;

    // รอฟอนต์โหลดก่อนวัดความสูง ไม่งั้นการแบ่งหน้าเพี้ยน
    try {
      await Promise.all([
        document.fonts.load('16pt "ThaiGov"'), document.fonts.load('700 16pt "ThaiGov"'),
        document.fonts.load('16pt "Sarabun"'), document.fonts.load('700 16pt "Sarabun"'),
      ]);
      await document.fonts.ready;
    } catch { /* ใช้ฟอนต์สำรอง */ }
    if (my !== this.token) return;

    const D = o.digits === 'th' ? convertHtml : (s => s);
    // ถ้าเครื่องไม่มี TH Sarabun (ฟอนต์ราชการ) จะตกไปใช้ Sarabun ของ Google ซึ่งตัวใหญ่กว่า → ย่อให้ขนาดภาพรวมใกล้เคียงกัน
    const hasGov = [...document.fonts].some(f => f.family.replace(/["']/g, '') === 'ThaiGov' && f.status === 'loaded');
    this.fontNote = hasGov;
    const { papers, pw, ph } = paginate(this.doc, this.ctx, o, D, hasGov ? 1 : 0.88);

    // ตารางหลายคอลัมน์: แนะนำแนวนอน
    if (this.doc.orientation === 'landscape' && o.orient === 'portrait') {
      this.hint.textContent = 'ตารางนี้มีหลายคอลัมน์ แนะนำให้ใช้ “แนวนอน” เพื่อให้ตัวเลขอ่านง่ายและไม่เบียดกัน';
      this.hint.classList.add('show'); this.hintKind = 'orient';
    } else if (this.hintKind === 'orient') { this.hint.classList.remove('show'); this.hintKind = ''; }

    // @page ต้องตรงกับแนวกระดาษที่เลือก (margin 0 = ไม่มี header/footer ของเบราว์เซอร์)
    let st = document.getElementById('rptPageStyle');
    if (!st) { st = document.createElement('style'); st.id = 'rptPageStyle'; document.head.appendChild(st); }
    st.textContent = `@page { size: A4 ${o.orient}; margin: 0; }`;

    this.stage.innerHTML = '';
    this.printRoot.innerHTML = '';
    this.dims = { pw, ph };
    this.sheets = papers.map(p => {
      this.printRoot.appendChild(p.cloneNode(true));
      const sheet = document.createElement('div');
      sheet.className = 'rpt-sheet';
      sheet.appendChild(p);              // ย้ายจากพื้นที่วัดมาแสดงจริง
      this.stage.appendChild(sheet);
      return { sheet, paper: p };
    });
    this.el.querySelector('#rptTitle').textContent =
      `${this.doc.title || 'ตัวอย่างก่อนพิมพ์'} · ${papers.length} หน้า`;
    this.applyScale();
  }

  scale() {
    const { pw, ph } = this.dims;
    const cs = getComputedStyle(this.stage);
    const availW = this.stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = this.stage.clientHeight - parseFloat(cs.paddingTop) - 24;
    if (this.zoom === 'fit') return Math.min(availW / (pw * MM), 1.3);
    if (this.zoom === 'page') return Math.min(availW / (pw * MM), availH / (ph * MM), 1.3);
    return parseFloat(this.zoom) || 1;
  }
  applyScale() {
    if (!this.sheets || !this.sheets.length) return;
    const s = Math.max(0.2, this.scale());
    const { pw, ph } = this.dims;
    this.sheets.forEach(({ sheet, paper }) => {
      sheet.style.width = pw * MM * s + 'px';
      sheet.style.height = ph * MM * s + 'px';
      paper.style.transform = `scale(${s})`;
    });
  }
  setZoom(z) {
    this.zoom = z;
    this.prefs.zoom = z; savePrefs(this.prefs);
    this.el.querySelector('#rptZoom').value = z;
    this.applyScale();
  }
  stepZoom(dir) {
    const steps = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const cur = this.scale();
    let next;
    if (dir > 0) next = steps.find(x => x > cur + 0.01) || 2;
    else next = [...steps].reverse().find(x => x < cur - 0.01) || 0.5;
    this.setZoom(String(next));
    // ถ้าค่าไม่มีในตัวเลือก ให้ select แสดงค่าใกล้เคียง
    const sel = this.el.querySelector('#rptZoom');
    if (sel.value !== String(next)) sel.value = '';
  }

  print() {
    if (!this.sheets || !this.sheets.length) return;
    const prev = document.title;
    if (this.doc.fileName) document.title = this.doc.fileName;   // ชื่อไฟล์ตั้งต้นตอนบันทึกเป็น PDF
    const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    setTimeout(restore, 60000);
    window.print();
  }

  savePdf() {
    const o = this.getOpts();
    const msg = `ในหน้าต่างพิมพ์ ให้เลือกปลายทางเป็น “บันทึกเป็น PDF” (Save as PDF) — ` +
      `กระดาษ A4 ${o.orient === 'landscape' ? 'แนวนอน' : 'แนวตั้ง'}, ขอบ “ไม่มี/ค่าเริ่มต้น”, ขนาด 100%. ` +
      `ตัวอักษรใน PDF จะเป็นข้อความจริง ค้นหา/คัดลอกได้`;
    this.hint.textContent = msg; this.hintKind = 'pdf';
    this.hint.classList.add('show');
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => this.hint.classList.remove('show'), 15000);
    setTimeout(() => this.print(), 80);
  }
}

const viewer = new Viewer();
export function openReport(doc) { return viewer.open(doc); }
export function closeReport() { viewer.close(); }
