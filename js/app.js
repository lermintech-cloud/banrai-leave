const $=s=>document.querySelector(s);
let S={},L=[],role=null,me=null,view='dash',F={mode:'fy',year:fy(new Date().toISOString().slice(0,10)),term:1};
const people=()=>S.teachers.split('\n').filter(Boolean).map(x=>{const [n,p,t]=x.split('|');return{n:n.trim(),p:(p||'').trim(),t:(t||'').trim()}});
const today=()=>new Date().toISOString().slice(0,10);
async function init(){S=await db.settings();L=await db.leaves();render()}
function render(){
 const a=$('#app');
 if(!role){a.innerHTML=`<main class="home"><img src="assets/logo.png"><h1>ระบบลาออนไลน์ ${S.school}</h1><p>${S.area} — เลือกบทบาทเพื่อเข้าใช้งาน</p>
 <div class="roles"><button class="k2" onclick="login('ครู')">👩‍🏫 ครู</button><button class="k3" onclick="login('ธุรการ')">🗂️ ธุรการ</button><button class="k4" onclick="login('ผู้อำนวยการ')">🏫 ผู้อำนวยการ</button></div></main><div class="foot">${CREDIT}</div>`;return}
 const nav=[['dash','แดชบอร์ด'],...(role=='ครู'?[['new','สร้างใบลา']]:[]),['list','รายการลา'],['set','ตั้งค่า']];
 a.innerHTML=`<div class="top"><img src="assets/logo.png"><h1>ระบบลา ${S.school}<br><small style="font-size:15px;font-weight:400">${role}${me?' : '+me.n:''}</small></h1>
 <div class="nav">${nav.map(n=>`<button class="btn ${view==n[0]?'':'l'}" onclick="go('${n[0]}')">${n[1]}</button>`).join('')}<button class="btn r" onclick="role=null;me=null;render()">ออก</button></div></div>
 <main>${{dash,new:newForm,list,set:settings}[view]()}</main><div class="foot">${CREDIT}</div>`;
 if(view=='new')initPad('pad');if(view=='set')['clerk','personnel','director'].forEach(k=>initPad('p_'+k,S.sigs[k]))}
function go(v){view=v;render()}
function login(r){role=r;view='dash';me=null;
 if(r=='ครู'){const p=people();if(!p.length){role=null;return alert('เพิ่มรายชื่อครูในเมนูตั้งค่าก่อน')}me=p[0];
  modal(`<div class="mb"><h3>เลือกชื่อครู</h3><select id="who">${p.map((x,i)=>`<option value="${i}">${x.n}</option>`).join('')}</select><p><button class="btn g" onclick="me=people()[$('#who').value];closeM();render()">เข้าสู่ระบบ</button></p></div>`)}
 render()}
function modal(h){$('#modal').innerHTML=h;$('#modal').classList.add('on')}
function closeM(){$('#modal').classList.remove('on');$('#modal').innerHTML='';$('#printRoot').innerHTML=''}
const pads={};
function initPad(id,img){const c=document.getElementById(id);if(!c)return;c.width=840;c.height=260;const x=c.getContext('2d');x.lineWidth=5;x.lineCap='round';let on=0,dirty=0;
 if(img){const i=new Image();i.onload=()=>x.drawImage(i,0,0,c.width,c.height);i.src=img;dirty=1}
 const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
 c.onpointerdown=e=>{on=1;dirty=1;x.beginPath();x.moveTo(...p(e));c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(on){x.lineTo(...p(e));x.stroke()}};c.onpointerup=()=>on=0;
 pads[id]={get:()=>dirty?c.toDataURL('image/png'):'',clear:()=>{x.clearRect(0,0,c.width,c.height);dirty=0}}}
function newForm(){const saved=localStorage['sig_'+me.n]||'';
 return `<h2>สร้างใบลา</h2><div class="card k1"><div class="row"><div><label>ประเภทการลา</label><select id="f_type">${TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div>
 <div><label>วันที่เขียน</label><input type="date" id="f_date" value="${today()}"></div><div><label>โทรศัพท์</label><input id="f_phone" value="${me.t}"></div></div>
 <div class="row"><div><label>ตั้งแต่วันที่</label><input type="date" id="f_start" value="${today()}" onchange="calcDays()"></div><div><label>ถึงวันที่</label><input type="date" id="f_end" value="${today()}" onchange="calcDays()"></div>
 <div><label>จำนวนวันทำการ</label><input type="number" id="f_days" value="1" min="0.5" step="0.5"></div></div>
 <label>เนื่องจาก (เหตุผล)</label><input id="f_reason" placeholder="เช่น ส่งแม่ไปหาหมอ">
 <label>ลายเซ็น (เซ็นในกรอบ)${saved?' — มีลายเซ็นที่จำไว้ ถ้าไม่เซ็นใหม่จะใช้อันเดิม':''}</label><canvas class="sig" id="pad"></canvas><p><button class="btn s l" onclick="pads.pad.clear()">ล้าง</button> <label style="display:inline"><input type="checkbox" id="f_keep" style="width:auto" ${saved?'checked':''}> จำลายเซ็นไว้ใช้ครั้งหน้า</label></p>
 <button class="btn g" onclick="saveLeave()">ส่งใบลาและดูตัวอย่าง</button></div>`}
function calcDays(){const a=new Date($('#f_start').value),b=new Date($('#f_end').value);let n=0;for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1)){const w=d.getDay();if(w&&w<6)n++}$('#f_days').value=n}
async function saveLeave(){
 const g=i=>$('#'+i).value;if(!g('f_reason'))return alert('กรุณากรอกเหตุผล');
 let sig=pads.pad.get()||localStorage['sig_'+me.n]||'';if(!sig)return alert('กรุณาลงลายเซ็น');
 if($('#f_keep').checked)localStorage['sig_'+me.n]=sig;else delete localStorage['sig_'+me.n];
 const l={id:Date.now(),name:me.n,pos:me.p,type:g('f_type'),date:g('f_date'),start:g('f_start'),end:g('f_end'),days:g('f_days'),reason:g('f_reason'),phone:g('f_phone'),sig,status:'รอตรวจสอบ'};
 await db.save(l);L=await db.leaves();view='list';render();preview(l.id)}
const byId=id=>L.find(x=>x.id==id);
function preview(id){const l=byId(id);modal(`<div class="mb"><div class="mbar"><button class="btn g" onclick="doPrint(${id})">🖨️ พิมพ์</button><button class="btn p" onclick="doPDF(${id})">📄 PDF</button><button class="btn l" onclick="closeM()">ปิด</button></div><div class="pv" id="pv">${docHTML(l,S,L)}</div></div>`);
 const sc=Math.min(1,(innerWidth-50)/794),pv=$('#pv');pv.firstChild.style.transform=`scale(${sc})`;pv.style.height=1123*sc+'px'}
function doPrint(id){$('#printRoot').innerHTML=docHTML(byId(id),S,L);setTimeout(()=>print(),100)}
async function doPDF(id){const l=byId(id);modal('<div class="mb"><p>กำลังสร้าง PDF...</p></div>');
 const r=await makePDF(l,S,L);window._pdf=r;
 modal(`<div class="mb"><div class="mbar"><button class="btn g" onclick="_pdf.pdf.save(_pdf.name)">⬇️ ดาวน์โหลด</button><button class="btn l" onclick="closeM()">ปิด</button></div><p>${r.name}</p>${r.pages.map((p,i)=>`<p>หน้า ${i+1}/${r.pages.length}</p><img class="pdfimg" src="${p}">`).join('')}</div>`)}
const sc={'รอตรวจสอบ':'k3','รอพิจารณา':'k1','อนุญาต':'k2','ไม่อนุญาต':'k5'};
const mine=()=>role=='ครู'?L.filter(x=>x.name==me.n):L;
function list(){const a=[...mine()].sort((x,y)=>y.start.localeCompare(x.start));
 return `<h2>รายการลา</h2><div class="wrap"><table class="t"><tr><th>วันที่ลา</th><th>ชื่อ</th><th>ประเภท</th><th>วัน</th><th>สถานะ</th><th>จัดการ</th></tr>
 ${a.map(l=>`<tr><td>${thS(l.start)}</td><td>${l.name}</td><td>${l.type}</td><td>${l.days}</td><td><span class="tag ${sc[l.status]}">${l.status}</span></td><td>
 <button class="btn s" onclick="preview(${l.id})">ดู/พิมพ์</button> <button class="btn s p" onclick="doPDF(${l.id})">PDF</button>
 ${role=='ธุรการ'&&!l.checked?`<button class="btn s g" onclick="checkM(${l.id})">ตรวจสอบ</button>`:''}${role=='ผู้อำนวยการ'&&l.checked&&!l.decided?`<button class="btn s o" onclick="decM(${l.id})">พิจารณา</button>`:''}
 ${role!='ผู้อำนวยการ'&&!l.decided?`<button class="btn s r" onclick="delL(${l.id})">ลบ</button>`:''}</td></tr>`).join('')||'<tr><td colspan=6>ยังไม่มีใบลา</td></tr>'}</table></div>`}
async function delL(id){if(confirm('ลบใบลานี้?')){await db.del(id);L=await db.leaves();render()}}
function checkM(id){modal(`<div class="mb"><h3>ตรวจสอบสถิติและความเห็นฝ่ายบุคคล</h3><p>ระบบคำนวณสถิติอัตโนมัติ และใช้ลายเซ็นผู้ตรวจสอบ/ฝ่ายบุคคลจากเมนูตั้งค่า</p><label>ความเห็นฝ่ายบุคคล</label><input id="po" value="เห็นควรอนุญาต"><p><button class="btn g" onclick="doCheck(${id})">บันทึก</button> <button class="btn l" onclick="closeM()">ยกเลิก</button></p></div>`)}
async function doCheck(id){const l=byId(id);Object.assign(l,{checked:1,checkDate:today(),pOpinion:$('#po').value,status:'รอพิจารณา'});await db.save(l);closeM();L=await db.leaves();render()}
function decM(id){modal(`<div class="mb"><h3>พิจารณาใบลา</h3><select id="dc"><option>อนุญาต</option><option>ไม่อนุญาต</option></select><label>หมายเหตุ</label><input id="dm"><p><button class="btn g" onclick="doDec(${id})">บันทึก</button> <button class="btn l" onclick="closeM()">ยกเลิก</button></p></div>`)}
async function doDec(id){const l=byId(id);Object.assign(l,{decided:1,decDate:today(),status:$('#dc').value,dComment:$('#dm').value});await db.save(l);closeM();L=await db.leaves();render()}
const filt=a=>a.filter(l=>F.mode=='all'||(F.mode=='fy'&&fy(l.start)==F.year)||(F.mode=='ay'&&ay(l.start)==F.year)||(F.mode=='term'&&ay(l.start)==F.year&&term(l.start)==F.term));
function setF(k,v){F[k]=k=='mode'?v:+v;render()}
function dash(){const a=filt(mine()),days=a.reduce((s,l)=>s+ +l.days,0),sum=t=>a.filter(l=>l.type==t).reduce((s,l)=>s+ +l.days,0),max=Math.max(1,...TYPES.map(sum));
 const ys=[...new Set([F.year,...L.map(l=>F.mode=='ay'||F.mode=='term'?ay(l.start):fy(l.start))])].sort().reverse();
 const names=[...new Set(a.map(l=>l.name))];
 return `<h2>แดชบอร์ด</h2><div class="card"><div class="row"><div><label>สรุปตาม</label><select onchange="setF('mode',this.value)">${[['fy','ปีงบประมาณ'],['ay','ปีการศึกษา'],['term','ภาคเรียน'],['all','ทั้งหมด']].map(x=>`<option value="${x[0]}" ${F.mode==x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></div>
 ${F.mode!='all'?`<div><label>ปี พ.ศ.</label><select onchange="setF('year',this.value)">${ys.map(y=>`<option ${y==F.year?'selected':''}>${y}</option>`).join('')}</select></div>`:''}
 ${F.mode=='term'?`<div><label>ภาคเรียน</label><select onchange="setF('term',this.value)"><option value="1" ${F.term==1?'selected':''}>1 (พ.ค.–ต.ค.)</option><option value="2" ${F.term==2?'selected':''}>2 (พ.ย.–เม.ย.)</option></select></div>`:''}</div></div>
 <div class="grid"><div class="card k1"><div class="big">${a.length}</div>ใบลาทั้งหมด</div><div class="card k2"><div class="big">${days}</div>วันลารวม</div>
 <div class="card k3"><div class="big">${a.filter(l=>!l.decided).length}</div>รอดำเนินการ</div><div class="card k4"><div class="big">${a.filter(l=>l.status=='อนุญาต').length}</div>อนุญาตแล้ว</div></div>
 <div class="card"><b>วันลาแยกประเภท</b>${TYPES.map((t,i)=>`<div>${t} — ${sum(t)} วัน<div class="bar" style="width:${sum(t)/max*100}%;background:var(--c${i+2})"></div></div>`).join('')}</div>
 <h3>สรุปรายบุคคล</h3><div class="wrap"><table class="t"><tr><th>ชื่อ</th>${TYPES.map(t=>`<th>${t}</th>`).join('')}<th>รวม</th></tr>
 ${names.map(n=>{const c=TYPES.map(t=>a.filter(l=>l.name==n&&l.type==t).reduce((s,l)=>s+ +l.days,0));return`<tr><td>${n}</td>${c.map(v=>`<td>${v}</td>`).join('')}<td>${c.reduce((p,q)=>p+q,0)}</td></tr>`}).join('')||'<tr><td colspan=5>ไม่มีข้อมูลในช่วงนี้</td></tr>'}</table></div>`}
function settings(){const f=(k,l)=>`<div><label>${l}</label><input id="s_${k}" value="${S[k]||''}"></div>`;
 return `<h2>ตั้งค่า</h2><div class="card k5"><div class="row">${f('school','ชื่อโรงเรียน')}${f('area','สังกัด')}${f('director','ผู้อำนวยการ')}${f('clerk','ผู้ตรวจสอบ (ธุรการ)')}${f('clerkPos','ตำแหน่งผู้ตรวจสอบ')}${f('personnel','ฝ่ายบุคคล')}${f('personnelPos','ตำแหน่งฝ่ายบุคคล')}${f('fileFmt','ชื่อไฟล์ PDF ({type} {name} {date})')}</div>
 <label>รายชื่อครู (บรรทัดละคน: ชื่อ|ตำแหน่ง|เบอร์โทร)</label><textarea id="s_teachers" rows="5">${S.teachers}</textarea>
 <div class="row">${[['clerk','ลายเซ็นผู้ตรวจสอบ'],['personnel','ลายเซ็นฝ่ายบุคคล'],['director','ลายเซ็นผู้อำนวยการ']].map(x=>`<div><label>${x[1]}</label><canvas class="sig" id="p_${x[0]}"></canvas><button class="btn s l" onclick="pads.p_${x[0]}.clear()">ล้าง</button></div>`).join('')}</div>
 <p><button class="btn g" onclick="saveS()">บันทึกการตั้งค่า</button></p></div>`}
async function saveS(){['school','area','director','clerk','clerkPos','personnel','personnelPos','fileFmt','teachers'].forEach(k=>S[k]=$('#s_'+k).value);
 S.sigs={};['clerk','personnel','director'].forEach(k=>S.sigs[k]=pads['p_'+k].get());await db.saveSettings(S);alert('บันทึกแล้ว');render()}
init();
