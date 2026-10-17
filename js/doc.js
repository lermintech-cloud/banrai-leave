// สร้าง HTML ของเอกสาร A4 (ตามแบบฟอร์มใบลา และรายงานสรุป)
const LOGO='assets/logo.png';
const sigBox=(p,use,cls)=>`<div class="gap">${use&&p&&p.sig?`<img src="${p.sig}">`:''}</div>`;
function leaveStats(l){
  const f=fy(l.start),r={};
  Object.keys(TYPES).forEach(t=>{
    const before=S.leaves.filter(x=>x.pid===l.pid&&x.type===t&&x.id!==l.id&&fy(x.start)===f&&x.start<l.start).reduce((a,x)=>a+ +x.days,0);
    const now=l.type===t?+l.days:0;r[t]=[before,now,before+now]});
  return r}
function leaveDoc(l){
  const p=person(l.pid)||{},hr=byRole('hr'),hd=byRole('head'),dr=byRole('director'),T=TYPES[l.type],st=leaveStats(l);
  const prev=S.leaves.filter(x=>x.pid===l.pid&&x.type===l.type&&x.id!==l.id&&x.start<l.start).sort((a,b)=>b.start.localeCompare(a.start))[0];
  const[wy,wm,wd]=ymd(l.written||l.start);
  const rows=Object.keys(TYPES).map(t=>`<tr><td>${TYPES[t].replace('ลา','')}</td>${st[t].map(v=>`<td>${v}</td>`).join('')}</tr>`).join('');
  const sm=(x,extra='')=>`<div class="sm">${sigBox(x,l.useSig)}<div>(ลงชื่อ)............................................</div><div>(${esc(x?.name||'..........')})</div>${extra}</div>`;
  return `<div class="sheet"><div class="lg"><img src="${LOGO}"></div>
<div class="ti">แบบใบลาป่วย ลากิจส่วนตัว ลาคลอดบุตร</div>
<div class="rt">เขียนที่ ${esc(S.settings.school)}</div>
<div class="rt" style="margin-right:2cm">วันที่ ${wd} เดือน ${MONTHS[wm-1]} พ.ศ. ${wy+543}</div>
<div class="sp"><b>เรื่อง</b> ขอ${T}</div>
<div class="sp"><b>เรียน</b> ผู้อำนวยการ${esc(S.settings.school)}</div>
<p>ข้าพเจ้า ${esc(p.name)} ตำแหน่ง ${esc(p.pos)} สังกัด ${esc(S.settings.school)} มีความประสงค์ขอ${T} เนื่องจาก ${esc(l.reason)} ตั้งแต่วันที่ ${thDate(l.start)} ถึงวันที่ ${thDate(l.end)} มีกำหนด ${l.days} วัน ข้าพเจ้าได้ลา${prev?`ครั้งสุดท้ายตั้งแต่วันที่ ${thDate(prev.start)} ถึงวันที่ ${thDate(prev.end)} มีกำหนด ${prev.days} วัน`:' - ครั้งสุดท้ายตั้งแต่วันที่ - ถึงวันที่ - มีกำหนด 0 วัน'}</p>
<p>ในระหว่างลาจะติดต่อข้าพเจ้าได้ที่ โทรศัพท์ ${esc(l.phone||p.phone||'')}</p>
<div class="sb">${sigBox(p,l.useSig)}<div>(ลงชื่อ)............................................</div><div>(${esc(p.name)})</div></div>
<hr>
<div class="cols"><div><b>๑. สถิติการลาในปีงบประมาณนี้ (${fy(l.start)})</b>
<table style="margin-top:4pt"><tr><th>ประเภทการลา</th><th>ลามาแล้ว<br>(วันทำการ)</th><th>ลาครั้งนี้<br>(วันทำการ)</th><th>รวมเป็น<br>(วันทำการ)</th></tr>${rows}</table>
${sm(hr,'<div>ตำแหน่ง '+esc(hr?.pos||'')+' (ผู้ตรวจสอบ)</div><div>วันที่ ........./........./..........</div>')}</div>
<div><b>๒. ความเห็นฝ่ายบุคคล</b><div>.............................................................</div><div>.............................................................</div>
${sm(hd,'<div>'+esc(hd?.pos||'')+'</div><div>วันที่....../........./........</div>')}
<div style="margin-top:8pt">[&nbsp;&nbsp;] อนุญาต &nbsp;&nbsp; [&nbsp;&nbsp;] ไม่อนุญาต</div>
${sm(dr,'<div>'+esc(dr?.pos||'')+'</div><div>วันที่ ........./........./..........</div>')}</div></div></div>`}
function reportDoc(f,label){
  const ls=S.leaves.filter(f).sort((a,b)=>a.start.localeCompare(b.start));
  const ppl=S.people.filter(p=>p.role==='teacher');
  const rows=ppl.map(p=>{const m=ls.filter(l=>l.pid===p.id);const d=t=>m.filter(l=>l.type===t).reduce((a,l)=>a+ +l.days,0);const c=m.length;
    return `<tr><td>${esc(p.name)}</td><td>${c}</td><td>${d('sick')}</td><td>${d('personal')}</td><td>${d('maternity')}</td><td>${d('sick')+d('personal')+d('maternity')}</td></tr>`}).join('');
  const det=ls.map(l=>`<tr><td>${thDate(l.start)}</td><td>${esc(person(l.pid)?.name)}</td><td>${TYPES[l.type]}</td><td>${l.days}</td><td>${esc(l.reason)}</td></tr>`).join('')||'<tr><td colspan=5>ไม่มีข้อมูล</td></tr>';
  return `<div class="sheet"><div class="lg"><img src="${LOGO}"></div><div class="ti">รายงานสรุปการลา ${esc(S.settings.school)}</div><div class="ti" style="margin-top:0">${esc(label)}</div>
<table style="font-size:14pt;margin-top:8pt"><tr><th>ชื่อ-สกุล</th><th>ครั้ง</th><th>ป่วย</th><th>กิจ</th><th>คลอด</th><th>รวม (วัน)</th></tr>${rows}</table>
<div class="sp" style="margin-top:12pt"><b>รายการลา</b></div><table style="font-size:14pt;margin-top:4pt"><tr><th>วันที่</th><th>ชื่อ</th><th>ประเภท</th><th>วัน</th><th>เหตุผล</th></tr>${det}</table></div>`}
