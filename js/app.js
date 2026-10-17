let ME=(()=>{try{return JSON.parse(localStorage.getItem('banrai_me'))}catch(e){return null}})();
const vis=l=>!ME||ME.role!=='teacher'||l.pid===ME.pid;
const vp=()=>ME&&ME.role==='teacher'?S.people.filter(p=>p.id===ME.pid):S.people.filter(p=>p.role==='teacher');
const leavePeople=()=>ME.role==='teacher'?S.people.filter(p=>p.id===ME.pid):S.people;
const can=()=>ME.role!=='director';
let view='dash',F={mode:'fy',year:fy(today()),term:1};
const inF=l=>F.mode==='fy'?fy(l.start)==F.year:F.mode==='ay'?ay(l.start)==F.year:ay(l.start)==F.year&&term(l.start)==F.term;
const fLabel=()=>({fy:`ปีงบประมาณ ${F.year}`,ay:`ปีการศึกษา ${F.year}`,tm:`ภาคเรียนที่ ${F.term} ปีการศึกษา ${F.year}`})[F.mode==='term'?'tm':F.mode];
const fl=()=>S.leaves.filter(l=>vis(l)&&(F.mode==='term'?inF(l):F.mode==='fy'?fy(l.start)==F.year:ay(l.start)==F.year));
const years=()=>{const s=new Set([F.year,fy(today()),ay(today())]);S.leaves.forEach(l=>s.add(F.mode==='fy'?fy(l.start):ay(l.start)));return[...s].sort((a,b)=>b-a)};
const sum=(a,t)=>a.filter(l=>!t||l.type===t).reduce((s,l)=>s+ +l.days,0);
function filterBar(t){return `<div class="bar"><h2>${t}</h2>
<select onchange="F.mode=this.value;F.year=this.value==='fy'?fy(today()):ay(today());render()"><option value="fy" ${F.mode=='fy'?'selected':''}>ปีงบประมาณ</option><option value="term" ${F.mode=='term'?'selected':''}>ภาคเรียน</option><option value="ay" ${F.mode=='ay'?'selected':''}>ปีการศึกษา</option></select>
<select onchange="F.year=+this.value;render()">${years().map(y=>`<option ${y==F.year?'selected':''}>${y}</option>`).join('')}</select>
${F.mode=='term'?`<select onchange="F.term=+this.value;render()"><option value="1" ${F.term==1?'selected':''}>เทอม 1</option><option value="2" ${F.term==2?'selected':''}>เทอม 2</option></select>`:''}</div>`}
function dash(){
  const a=fl(),tc=['sick','personal','maternity'],cl={sick:'c1',personal:'c2',maternity:'c4'};
  const mx=Math.max(1,...vp().map(p=>sum(a.filter(l=>l.pid===p.id))));
  const mo=Array(12).fill(0);a.forEach(l=>mo[ymd(l.start)[1]-1]+=+l.days);const mm=Math.max(1,...mo);
  const ord=[9,10,11,0,1,2,3,4,5,6,7,8];
  return filterBar('แดชบอร์ด')+`<div class="grid"><div class="card c3"><small>การลาทั้งหมด (ครั้ง)</small><div class="n">${a.length}</div><small>${fLabel()}</small></div>
${tc.map(t=>`<div class="card ${cl[t]}"><small>${TYPES[t]} (วัน)</small><div class="n">${sum(a,t)}</div></div>`).join('')}</div>
<div class="two"><div class="card"><h3>รายบุคคล (วัน)</h3>${vp().map(p=>{const v=sum(a.filter(l=>l.pid===p.id));return `<div class="row-b"><span>${esc(p.name)}</span><span class="bb" style="width:${v/mx*55}%"></span><b>${v}</b></div>`}).join('')||'—'}</div>
<div class="card"><h3>รายเดือน (วัน)</h3>${ord.map(i=>`<div class="row-b"><span>${MONTHS[i]}</span><span class="bb t" style="width:${mo[i]/mm*55}%"></span><b>${mo[i]}</b></div>`).join('')}</div></div>
<div class="acts" style="justify-content:flex-start"><button class="btn a" onclick="report()">รายงานสรุป ${fLabel()} (พรีวิว / พิมพ์ / PDF)</button></div>`}
function report(){preview({html:reportDoc(l=>fl().includes(l),fLabel()),name:'รายงานสรุปการลา_'+fLabel()})}
function table(){
  const a=fl().sort((x,y)=>y.start.localeCompare(x.start));
  return filterBar('ตารางการลา')+`${can()?`<div class="acts" style="margin:0 0 10px"><button class="btn" onclick="editLeave()">+ บันทึกการลา</button></div>`:''}<div class="card tw"><table><tr><th>วันที่ลา</th><th>ชื่อ</th><th>ประเภท</th><th>วัน</th><th>เหตุผล</th><th></th></tr>
${a.map(l=>`<tr><td>${thDate(l.start)}${l.end!=l.start?' – '+thDate(l.end):''}</td><td>${esc(person(l.pid)?.name)}</td><td><span class="tag ${l.type}">${TYPES[l.type]}</span></td><td>${l.days}</td><td>${esc(l.reason)}</td>
<td><button class="btn sm s" onclick="pv('${l.id}')">ดู/พิมพ์</button> <button class="btn sm a" onclick="pdfOf('${l.id}')">PDF</button> ${can()?`<button class="btn sm g" onclick="editLeave('${l.id}')">แก้ไข</button> <button class="btn sm r" onclick="delLeave('${l.id}')">ลบ</button>`:''}</td></tr>`).join('')||'<tr><td colspan=6>ยังไม่มีข้อมูลในช่วงนี้ กด “+ บันทึกการลา”</td></tr>'}</table></div>`}
const mk=id=>{const l=S.leaves.find(x=>x.id==id);return{html:leaveDoc(l),leave:l}};
const pv=id=>preview(mk(id)),pdfOf=id=>doPdf(mk(id));
function editLeave(id){
  const l=S.leaves.find(x=>x.id==id)||{type:'personal',start:today(),end:today(),days:1,written:today(),useSig:true,pid:ME.role==='teacher'?ME.pid:(S.people.find(p=>p.role=='teacher')||{}).id};
  modal(`<div class="box"><h3>${id?'แก้ไข':'บันทึก'}การลา</h3>
<label>ผู้ลา</label><select id="f_p">${leavePeople().map(p=>`<option value="${p.id}" ${p.id==l.pid?'selected':''}>${esc(p.name)}</option>`).join('')}</select>
<label>ประเภท</label><select id="f_t">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${k==l.type?'selected':''}>${v}</option>`).join('')}</select>
<label>ตั้งแต่วันที่</label><input type="date" id="f_s" value="${l.start}" onchange="calc()"><label>ถึงวันที่</label><input type="date" id="f_e" value="${l.end}" onchange="calc()">
<label>จำนวนวันทำการ (คำนวณอัตโนมัติ แก้ไขได้)</label><input type="number" step="0.5" id="f_d" value="${l.days}">
<label>เหตุผล</label><input id="f_r" value="${esc(l.reason||'')}"><label>เบอร์ติดต่อระหว่างลา</label><input id="f_ph" value="${esc(l.phone||'')}">
<label>วันที่เขียนใบลา</label><input type="date" id="f_w" value="${l.written}"><label><input type="checkbox" id="f_g" style="width:auto" ${l.useSig?'checked':''}> ใส่ลายเซ็นในเอกสาร</label>
<div class="acts"><button class="btn s" onclick="saveLeave('${id||''}')">บันทึก</button><button class="btn g" onclick="closeModal()">ยกเลิก</button></div></div>`)}
function calc(){const s=$('#f_s').value,e=$('#f_e').value;if(s&&e&&e>=s)$('#f_d').value=workdays(s,e)}
async function saveLeave(id){
  const o={id:id||'l'+Date.now(),pid:$('#f_p').value,type:$('#f_t').value,start:$('#f_s').value,end:$('#f_e').value,days:+$('#f_d').value,reason:$('#f_r').value.trim(),phone:$('#f_ph').value.trim(),written:$('#f_w').value,useSig:$('#f_g').checked};
  if(!o.start||!o.end||o.end<o.start||!o.reason)return toast('กรอกวันที่และเหตุผลให้ครบ');
  await api('POST','leaves',o);const i=S.leaves.findIndex(x=>x.id==id);i<0?S.leaves.push(o):S.leaves[i]=o;closeModal();render()}
async function delLeave(id){if(confirm('ลบรายการลานี้?')){await api('DELETE','leaves/'+id);S.leaves=S.leaves.filter(l=>l.id!=id);render()}}
function staff(){
  const mine=ME.role==='teacher',list=mine?S.people.filter(p=>p.id===ME.pid):S.people;
  const card=p=>`<div class="card"><b>${esc(p.name)}</b><div style="color:var(--mut)">${esc(p.pos)}<br>${ROLES[p.role]}${p.role==='teacher'?' · ลา '+S.leaves.filter(l=>l.pid===p.id).length+' ครั้ง':''}</div>${p.sig?`<img src="${p.sig}" style="background:#fff;height:50px;border-radius:6px;margin-top:8px">`:'<div style="margin-top:8px;color:var(--mut)">ยังไม่มีลายเซ็น</div>'}
<div class="acts" style="justify-content:flex-start"><button class="btn sm" onclick="editP('${p.id}')">แก้ไข / ลายเซ็น</button></div></div>`;
  const T=list.filter(p=>p.role==='teacher'),O=list.filter(p=>p.role!=='teacher');
  return `<div class="bar"><h2>${mine?'ข้อมูลและลายเซ็นของฉัน':'ครูและผู้ลงนาม'}</h2>${mine?'':'<button class="btn" onclick="editP()">+ เพิ่มครู/บุคลากร</button>'}</div>
${mine?'':`<h3>ครู/บุคลากร (${T.length} คน)</h3>`}<div class="grid">${T.map(card).join('')||'<div class="card">ยังไม่มีครู กด “+ เพิ่มครู/บุคลากร”</div>'}</div>
${O.length?`<h3>ผู้ลงนามในเอกสาร (ใช้คนแรกของแต่ละบทบาท)</h3><div class="grid">${O.map(card).join('')}</div>`:''}`}
let drawn=false,newSig=null;
function editP(id){
  const p=S.people.find(x=>x.id==id)||{name:'',pos:'',role:'teacher',phone:'',sig:''};newSig=null;drawn=false;
  modal(`<div class="box"><h3>${id?'แก้ไข':'เพิ่ม'}บุคลากร</h3><label>ชื่อ-สกุล</label><input id="p_n" value="${esc(p.name)}"><label>ตำแหน่ง</label><input id="p_p" value="${esc(p.pos)}">
${ME.role==='teacher'?'':`<label>บทบาทในเอกสาร</label><select id="p_r">${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${k==p.role?'selected':''}>${v}</option>`).join('')}</select>`}
<label>เบอร์โทร</label><input id="p_ph" value="${esc(p.phone||'')}">
<label>ลายเซ็น — เซ็นในกรอบ หรืออัปโหลดรูป (PNG พื้นใส/ขาวดีที่สุด)</label><canvas id="cv" class="sg" width="320" height="120"></canvas>
<div class="acts" style="justify-content:flex-start"><button class="btn sm g" onclick="clr()">ล้างกรอบ</button><input type="file" accept="image/*" id="p_f" style="width:auto" onchange="upSig(this)">${p.sig?'<button class="btn sm r" onclick="newSig=\'\';drawn=false;toast(\'จะลบลายเซ็นเมื่อกดบันทึก\')">ลบลายเซ็นเดิม</button>':''}</div>
<div class="acts"><button class="btn s" onclick="saveP('${id||''}')">บันทึก</button>${id&&ME.role!=='teacher'?`<button class="btn r" onclick="delP('${id}')">ลบ</button>`:''}<button class="btn g" onclick="closeModal()">ปิด</button></div></div>`);
  const c=$('#cv'),x=c.getContext('2d');x.lineWidth=2.5;x.lineCap='round';x.strokeStyle='#111';let d=false;
  const pos=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
  c.onpointerdown=e=>{d=true;drawn=true;x.beginPath();x.moveTo(...pos(e));c.setPointerCapture(e.pointerId)};
  c.onpointermove=e=>{if(d){x.lineTo(...pos(e));x.stroke()}};c.onpointerup=()=>d=false}
const clr=()=>{const c=$('#cv');c.getContext('2d').clearRect(0,0,c.width,c.height);drawn=false};
function upSig(i){const f=i.files[0];if(!f)return;const im=new Image();im.onload=()=>{const k=Math.min(1,500/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);newSig=c.toDataURL('image/png');drawn=false;toast('แนบรูปลายเซ็นแล้ว')};im.src=URL.createObjectURL(f)}
async function saveP(id){
  const o=S.people.find(x=>x.id==id)||{id:'p'+Date.now(),sig:''};
  Object.assign(o,{name:$('#p_n').value.trim(),pos:$('#p_p').value.trim(),role:$('#p_r')?$('#p_r').value:(o.role||'teacher'),phone:$('#p_ph').value.trim()});
  if(drawn)o.sig=$('#cv').toDataURL('image/png');else if(newSig!==null)o.sig=newSig;
  if(!o.name)return toast('กรอกชื่อ');await api('POST','people',o);if(!id)S.people.push(o);closeModal();render()}
async function delP(id){if(confirm('ลบบุคลากรนี้ พร้อมรายการลาทั้งหมดของเขา?')){await api('DELETE','people/'+id);S.people=S.people.filter(p=>p.id!=id);S.leaves=S.leaves.filter(l=>l.pid!=id);closeModal();render()}}
function settings(){const s=S.settings;return `<div class="bar"><h2>ตั้งค่าและสำรองข้อมูล</h2></div><div class="card" style="max-width:640px">
<label>ชื่อโรงเรียน</label><input value="${esc(s.school)}" onchange="S.settings.school=this.value;api('PUT','settings',S.settings)">
<label>รูปแบบชื่อไฟล์ PDF/พิมพ์ (ใช้ {ชื่อ} {ประเภท} {วันที่})</label><input value="${esc(s.fname)}" onchange="S.settings.fname=this.value;api('PUT','settings',S.settings)">
<div class="acts" style="justify-content:flex-start"><button class="btn s" onclick="backup()">ดาวน์โหลดข้อมูลสำรอง (JSON)</button><label class="btn a" style="margin:0">นำเข้าข้อมูล<input type="file" accept=".json" hidden onchange="restore(this)"></label></div>
<p style="color:var(--mut)">ข้อมูลเก็บใน Cloudflare D1 ใช้ร่วมกันทุกเครื่อง แนะนำให้ดาวน์โหลดสำรองเป็นประจำ${CAN_EDIT?'':' (บัญชีนี้ดูได้อย่างเดียว)'}</p></div>`}
function backup(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='banrai_leave_backup_'+today()+'.json';a.click()}
function restore(i){const r=new FileReader();r.onload=async()=>{try{const d=JSON.parse(r.result);if(!d.people||!d.leaves)throw 0;if(!confirm('นำเข้าจะแทนที่ข้อมูลทั้งหมดในฐานข้อมูล ยืนยัน?'))return;await api('POST','import',d);S=d;render();toast('นำเข้าสำเร็จ')}catch(e){toast('ไฟล์ไม่ถูกต้องหรือนำเข้าไม่สำเร็จ')}};r.readAsText(i.files[0])}
const V={dash:['แดชบอร์ด',dash],table:['ตารางการลา',table],staff:['ครู/ลายเซ็น',staff],set:['ตั้งค่า',settings]};
const ACC={teacher:['dash','table','staff'],hr:['dash','table','staff','set'],director:['dash','table']};
const ROLE_N={teacher:'ครู',hr:'ธุรการ',director:'ผู้อำนวยการ'};
function enter(role,pid){ME={role,pid};localStorage.setItem('banrai_me',JSON.stringify(ME));view='dash';render()}
function logout(){ME=null;localStorage.removeItem('banrai_me');render()}
function gate(pick){
  $('#nav').innerHTML='';
  const head=`<div class="gate"><img src="assets/logo.png"><h1>ระบบลาข้าราชการครู</h1><div style="color:var(--mut)">โรงเรียนบ้านไร่ สพป.เชียงใหม่ เขต 5</div>`;
  if(pick==='teacher'){const t=S.people.filter(p=>p.role==='teacher');
    $('#main').innerHTML=head+`<h3>เลือกชื่อของท่าน</h3><div class="roles">${t.map(p=>`<button class="role c2" onclick="enter('teacher','${p.id}')"><b>${esc(p.name)}</b>${esc(p.pos)}</button>`).join('')||'<div class="card">ยังไม่มีรายชื่อครู ให้ธุรการเพิ่มก่อน</div>'}</div><p><button class="btn g" onclick="gate()">ย้อนกลับ</button></p></div>`;return}
  $('#main').innerHTML=head+`<h3>เข้าใช้งานในฐานะ</h3><div class="roles">
<button class="role c2" onclick="gate('teacher')"><b>ครู</b>เลือกชื่อตนเอง ดูและบันทึกเฉพาะการลาของตน</button>
<button class="role c4" onclick="enter('hr')"><b>ธุรการ</b>จัดการครู บันทึกการลา รายงาน ตั้งค่า</button>
<button class="role c3" onclick="enter('director')"><b>ผู้อำนวยการ</b>ดูแดชบอร์ด ตาราง รายงาน และพิมพ์</button></div></div>`}
function render(){
  if(!ME)return gate();
  if(!ACC[ME.role].includes(view))view='dash';
  const who=ME.role==='teacher'?(person(ME.pid)?.name||'ครู'):ROLE_N[ME.role];
  $('#nav').innerHTML=ACC[ME.role].map(k=>`<button class="${k==view?'on':''}" onclick="view='${k}';render()">${k=='staff'&&ME.role=='teacher'?'ลายเซ็นของฉัน':V[k][0]}</button>`).join('')+`<button onclick="logout()" style="border:1px solid var(--line)">สลับผู้ใช้ · ${esc(who)}</button>`;
  $('#main').innerHTML=V[view][1]()}
(async()=>{try{const r=await fetch('/api/data');const d=await r.json();if(!r.ok)throw new Error(d.error||r.status);CAN_EDIT=d.canEdit;S={settings:d.settings,people:d.people,leaves:d.leaves};if(ME&&ME.role==='teacher'&&!person(ME.pid))ME=null}catch(e){$('#main').innerHTML='<div class="card"><h3>เชื่อมต่อฐานข้อมูลไม่ได้</h3><p>'+esc(e.message)+'</p><p>ตรวจว่าผูก D1 (ชื่อ DB) และรัน schema.sql แล้ว</p></div>';return}render()})();
