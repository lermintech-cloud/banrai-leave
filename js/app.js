const $=s=>document.querySelector(s);
const IC={
layout:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
plus:'<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
settings:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
check:'<path d="M20 6 9 17l-5-5"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',
printer:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
pen:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
eye:'<path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
eraser:'<path d="m7 21-4-4a2 2 0 0 1 0-3L14 3a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3L11 21zM22 21H7M5 11l9 9"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24">${IC[n]}</svg>`;
const uid=()=>Math.random().toString(36).slice(2,9);
const today=()=>new Date().toISOString().slice(0,10);
const init=n=>(n.replace(/^(นางสาว|นาง|นาย)\s*/,'')[0]||'?');
const SM=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],TC=['#fb7185','#60a5fa','#34d399'];
let sel=null,S={},L=[],role=null,me=null,view='dash',lf='all',unlocked=false,stab='school',F={mode:'fy',year:fy(today()),term:1};
const SG={};
function normS(){if(typeof S.teachers=='string')S.teachers=S.teachers.split('\n').filter(Boolean).map(x=>{const[n,p,t]=x.split('|');return{id:uid(),n:n.trim(),p:(p||'').trim(),t:(t||'').trim()}});
 S.teachers.forEach(t=>t.id=t.id||uid());S.sigs=S.sigs||{};Object.keys(S.sigs).forEach(k=>S.sigs[k]=nsg(S.sigs[k]))}
async function init0(){S=await db.settings();normS();L=await db.leaves();render()}
function toast(m){const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}
/* ---------- โครงหน้า ---------- */
function navFor(){const n=[];
 if(role!='ครู')n.push(['inbox',role=='ธุรการ'?'งานรอตรวจสอบ':'งานรอพิจารณา','inbox','k5',role=='ธุรการ'?'ตรวจสอบสถิติและส่งต่อผู้อำนวยการ':'ตรวจเอกสารและอนุญาตได้ในคลิกเดียว']);
 n.push(['dash','แดชบอร์ด','layout','k1','ภาพรวมการลาตามปีงบประมาณ ปีการศึกษา และภาคเรียน']);
 if(role=='ครู')n.push(['new','สร้างใบลา','plus','k2','กรอกข้อมูล เซ็นชื่อ แล้วตรวจตัวอย่างก่อนพิมพ์']);
 n.push(['list',role=='ครู'?'ใบลาของฉัน':'รายการลาทั้งหมด','file','k3','ดูตัวอย่าง พิมพ์ หรือบันทึก PDF ย้อนหลังได้']);
 if(role!='ครู')n.push(['set','ตั้งค่า','settings','k4','จัดการโรงเรียน รายชื่อครู และลายเซ็น (ต้องใช้รหัสผู้ดูแล)']);
 return n}
const pendingN=()=>role=='ผู้อำนวยการ'?L.filter(l=>l.checked&&!l.decided).length:L.filter(l=>!l.checked).length;
function render(){
 const a=$('#app');
 if(!role){a.innerHTML=`<div class="hero"><img src="assets/logo.png"><h1>ระบบลาออนไลน์</h1><p>${S.school} · ${S.area}</p><div class="roles">${[['ครู','user','เขียนใบลา เซ็นชื่อ ติดตามสถานะ','k2'],['ธุรการ','briefcase','ตรวจสอบสถิติ จัดการเอกสาร','k3'],['ผู้อำนวยการ','building','พิจารณาและอนุญาตใบลา','k4']].map(r=>`<button class="${r[3]}" onclick="login('${r[0]}')">${ic(r[1])}<b>${r[0]}</b><small>${r[2]}</small></button>`).join('')}</div></div><div class="foot">${CREDIT}</div>`;return}
 const nav=navFor(),cur=nav.find(n=>n[0]==view)||nav[0];view=cur[0];
 a.innerHTML=`<div class="shell"><aside class="side"><div class="brand"><img src="assets/logo.png"><div><b>ระบบลาออนไลน์</b><small>${S.school}</small></div></div>
 <nav>${nav.map(n=>`<button class="ni ${view==n[0]?'on':''}" onclick="go('${n[0]}')"><i class="${n[3]}">${ic(n[2])}</i>${n[1]}${n[0]=='inbox'&&pendingN()?`<em>${pendingN()}</em>`:''}</button>`).join('')}</nav>
 <div class="sfoot"><div class="me"><span class="av">${init(me?me.n:role)}</span><small><b>${role}</b>${me?'<br>'+me.n:''}</small></div><button class="btn l" onclick="role=null;me=null;unlocked=false;PH='';render()">${ic('logout')} ออกจากระบบ</button></div></aside>
 <section class="content"><main><h2>${cur[1]}</h2><p class="sub">${cur[4]}</p>${{inbox,dash,new:newForm,list,set:settings}[view]()}<div class="foot">${CREDIT}</div></main></section></div>`;
 fitPv();Object.keys(SG).forEach(sgR)}
function go(v){view=v;sel=null;render()}
function fitPv(){const pv=$('#pv');if(!pv)return;const sc=Math.min(1,pv.clientWidth/794);pv.firstChild.style.transform=`scale(${sc})`;pv.style.height=1123*sc+'px'}
addEventListener('resize',fitPv);
function modal(h){$('#modal').innerHTML=h;$('#modal').classList.add('on')}
function closeM(){$('#modal').classList.remove('on');$('#modal').innerHTML='';$('#printRoot').innerHTML=''}
/* ---------- เข้าสู่ระบบ / เลือกครู ---------- */
function login(r){if(r!='ครู'){role=r;me=null;unlocked=false;view=r=='ครู'?'dash':'inbox';return render()}
 if(!S.teachers.length)return alert('ยังไม่มีรายชื่อครู ให้ธุรการหรือผู้อำนวยการเพิ่มในเมนูตั้งค่าก่อน');pickT()}
function pickT(q=''){const p=S.teachers.filter(t=>t.n.includes(q));
 modal(`<div class="mb"><h3>ฉันคือใคร?</h3><div class="srch">${ic('search')}<input id="tq" value="${q}" placeholder="พิมพ์ค้นหาชื่อ" oninput="pickT(this.value)"></div><div class="tl">${p.map(t=>`<button class="tp" onclick="chooseT('${t.id}')"><span class="av">${init(t.n)}</span><span><b>${t.n}</b><small>${t.p}</small></span></button>`).join('')||'<p>ไม่พบรายชื่อ</p>'}</div><p><button class="btn l" onclick="closeM()">ยกเลิก</button></p></div>`);
 const e=$('#tq');e.focus();e.setSelectionRange(q.length,q.length)}
function chooseT(id){me=S.teachers.find(t=>t.id==id);role='ครู';view='dash';closeM();render()}
/* ---------- ลายเซ็น: อัปโหลด PNG / เซ็นมือ / ปรับขนาดและตำแหน่ง ---------- */
function sgBox(id,v){SG[id]=nsg(v)?{...nsg(v)}:{img:'',s:100,x:0,y:0};
 return `<div class="sged"><div class="sgp" id="sgp_${id}"></div><div class="sgc"><label class="btn s l">${ic('upload')} อัปโหลด PNG<input type="file" accept="image/*" hidden onchange="sgUp('${id}',this)"></label><button class="btn s l" onclick="sgDraw('${id}')">${ic('pen')} เซ็นด้วยมือ</button><button class="btn s l" onclick="sgWhite('${id}')">${ic('eraser')} ลบพื้นหลังขาว</button><button class="btn s r" onclick="SG['${id}'].img='';sgR('${id}')">${ic('trash')}</button></div>
 ${[['s','ขนาด',30,300,5],['x','ซ้าย–ขวา',-30,30,1],['y','บน–ล่าง',-15,15,1]].map(r=>`<label class="rg"><span>${r[1]}</span><input type="range" min="${r[2]}" max="${r[3]}" step="${r[4]}" value="${SG[id][r[0]]}" oninput="SG['${id}'].${r[0]}=+this.value;sgR('${id}')"></label>`).join('')}</div>`}
function sgR(id){const e=$('#sgp_'+id);if(e)e.innerHTML=sgH(SG[id])+'<span>(ลงชื่อ).............................</span>'}
function loadImg(src,cb){const i=new Image();i.onload=()=>cb(i);i.src=src}
function sgUp(id,inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>loadImg(r.result,i=>{const k=Math.min(1,700/i.width),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);SG[id].img=c.toDataURL('image/png');sgR(id)});r.readAsDataURL(f)}
function sgWhite(id){if(!SG[id].img)return;loadImg(SG[id].img,i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);const d=x.getImageData(0,0,c.width,c.height),p=d.data;for(let k=0;k<p.length;k+=4){const m=Math.min(p[k],p[k+1],p[k+2]);if(m>225)p[k+3]=0;else if(m>170)p[k+3]=Math.round(p[k+3]*(225-m)/55)}x.putImageData(d,0,0);SG[id].img=c.toDataURL('image/png');sgR(id);toast('ลบพื้นหลังขาวแล้ว')})}
const pads={};
function initPad(id){const c=$('#'+id);c.width=840;c.height=260;const x=c.getContext('2d');x.lineWidth=5;x.lineCap='round';let on=0,dirty=0;
 const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
 c.onpointerdown=e=>{on=1;dirty=1;x.beginPath();x.moveTo(...p(e));c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(on){x.lineTo(...p(e));x.stroke()}};c.onpointerup=()=>on=0;
 pads[id]={get:()=>dirty?c.toDataURL('image/png'):'',clear:()=>{x.clearRect(0,0,c.width,c.height);dirty=0}}}
function sgDraw(id){modal(`<div class="mb"><h3>เซ็นชื่อในกรอบ</h3><canvas class="sig" id="dpad"></canvas><p><button class="btn g" onclick="sgSave('${id}')">${ic('check')} ใช้ลายเซ็นนี้</button> <button class="btn l" onclick="pads.dpad.clear()">ล้าง</button> <button class="btn l" onclick="closeM()">ยกเลิก</button></p></div>`);initPad('dpad')}
function sgSave(id){const d=pads.dpad.get();closeM();if(d){SG[id].img=d;sgR(id)}}
/* ---------- สร้างใบลา ---------- */
function newForm(){const saved=localStorage['sig_'+me.n];
 return `<div class="card"><div class="row"><div><label>ประเภทการลา</label><select id="f_type">${TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div>
 <div><label>วันที่เขียน</label><input type="date" id="f_date" value="${today()}"></div><div><label>โทรศัพท์</label><input id="f_phone" value="${me.t}"></div></div>
 <div class="row"><div><label>ตั้งแต่วันที่</label><input type="date" id="f_start" value="${today()}" onchange="calcDays()"></div><div><label>ถึงวันที่</label><input type="date" id="f_end" value="${today()}" onchange="calcDays()"></div>
 <div><label>จำนวนวันทำการ</label><input type="number" id="f_days" value="1" min="0.5" step="0.5"></div></div>
 <label>เนื่องจาก (เหตุผล)</label><input id="f_reason" placeholder="เช่น ส่งแม่ไปหาหมอ">
 <label>ลายเซ็นของฉัน</label>${sgBox('me',saved?JSON.parse(saved):null)}
 <p><label class="chk"><input type="checkbox" id="f_keep" ${saved?'checked':''}> จำลายเซ็นและตำแหน่งไว้ในเครื่องนี้</label></p>
 <button class="btn g big2" onclick="saveLeave()">${ic('check')} ส่งใบลาและดูตัวอย่าง</button></div>`}
function calcDays(){const a=new Date($('#f_start').value),b=new Date($('#f_end').value);let n=0;for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1)){const w=d.getDay();if(w&&w<6)n++}$('#f_days').value=n}
async function saveLeave(){const g=i=>$('#'+i).value;if(!g('f_reason'))return alert('กรุณากรอกเหตุผล');if(!SG.me.img)return alert('กรุณาเพิ่มลายเซ็น (อัปโหลดหรือเซ็นด้วยมือ)');
 if($('#f_keep').checked)localStorage['sig_'+me.n]=JSON.stringify(SG.me);else delete localStorage['sig_'+me.n];
 const l={id:Date.now(),name:me.n,pos:me.p,type:g('f_type'),date:g('f_date'),start:g('f_start'),end:g('f_end'),days:g('f_days'),reason:g('f_reason'),phone:g('f_phone'),sig:{...SG.me},status:'รอตรวจสอบ'};
 await db.save(l);L=await db.leaves();preview(l.id)}
/* ---------- รายการลา + ตัวอย่างในหน้า ---------- */
const byId=id=>L.find(x=>x.id==id),mine=()=>role=='ครู'?L.filter(x=>x.name==me.n):L;
const pill=l=>`<span class="pill t${TYPES.indexOf(l.type)}">${l.type}</span>`;
const ST={'รอตรวจสอบ':'k3','รอพิจารณา':'k1','อนุญาต':'k2','ไม่อนุญาต':'k5'};
function preview(id){sel=id;view='list';render();const c=$('#pvCard');if(c)c.scrollIntoView({behavior:'smooth'})}
function list(){let a=[...mine()].sort((x,y)=>y.start.localeCompare(x.start));const n=s=>s=='all'?a.length:a.filter(l=>l.status==s).length;a=lf=='all'?a:a.filter(l=>l.status==lf);
 return `<div class="chips">${['all','รอตรวจสอบ','รอพิจารณา','อนุญาต','ไม่อนุญาต'].map(s=>`<button class="chip ${lf==s?'on':''}" onclick="lf='${s}';render()">${s=='all'?'ทั้งหมด':s} <em>${n(s)}</em></button>`).join('')}</div>
 <div class="wrap"><table class="t"><tr><th>วันที่ลา</th><th>ชื่อ</th><th>ประเภท</th><th>วัน</th><th>สถานะ</th><th></th></tr>
 ${a.map(l=>`<tr><td>${thS(l.start)}</td><td>${l.name}</td><td>${pill(l)}</td><td>${l.days}</td><td><span class="tag ${ST[l.status]}">${l.status}</span></td><td class="act"><button class="btn s" title="ดู/พิมพ์" onclick="preview(${l.id})">${ic('eye')}</button><button class="btn s p" title="PDF" onclick="doPDF(${l.id})">${ic('download')}</button>${!l.decided?`<button class="btn s r" title="ลบ" onclick="delL(${l.id})">${ic('trash')}</button>`:''}</td></tr>`).join('')||'<tr><td colspan=6>ยังไม่มีใบลา</td></tr>'}</table></div>
 ${sel&&byId(sel)?`<div class="card" id="pvCard" style="margin-top:18px"><div class="mbar"><b style="flex:1;align-self:center">ตัวอย่างเอกสาร — ${byId(sel).name}</b><button class="btn o" onclick="doPrint(${sel})">${ic('printer')} พิมพ์</button><button class="btn p" onclick="doPDF(${sel})">${ic('download')} PDF</button><button class="btn l" onclick="sel=null;render()">${ic('x')} ปิด</button></div><p class="sub" style="margin:0 0 10px">ปุ่มพิมพ์: เลือก A4 และไม่ต้องติ๊ก “ส่วนหัวและส่วนท้าย” · ปุ่ม PDF: สร้างไฟล์ให้ดูตัวอย่างก่อน (ใช้บนมือถือได้) แล้วกดดาวน์โหลด</p><div class="pv" id="pv" style="background:#fff;box-shadow:var(--shadow)">${docHTML(byId(sel),S,L)}</div></div>`:''}`}
async function delL(id){if(confirm('ลบใบลานี้?')){await db.del(id);if(sel==id)sel=null;L=await db.leaves();render()}}
function doPrint(id){$('#printRoot').innerHTML=docHTML(byId(id),S,L);setTimeout(()=>print(),100)}
async function doPDF(id){const l=byId(id);modal('<div class="mb"><p>กำลังสร้าง PDF...</p></div>');
 const r=await makePDF(l,S,L);window._pdf=r;
 modal(`<div class="mb"><div class="mbar"><button class="btn g" onclick="_pdf.pdf.save(_pdf.name)">${ic('download')} ดาวน์โหลด</button><button class="btn l" onclick="closeM()">${ic('x')} ปิด</button></div><p>${r.name}</p>${r.pages.map((p,i)=>`<p>หน้า ${i+1}/${r.pages.length}</p><img class="pdfimg" src="${p}">`).join('')}</div>`)}
/* ---------- งานรอดำเนินการ (ธุรการ / ผู้อำนวยการ) ---------- */
function inbox(){const dir=role=='ผู้อำนวยการ',a=L.filter(l=>dir?(l.checked&&!l.decided):!l.checked).sort((x,y)=>x.id-y.id);
 if(!a.length)return `<div class="card empty">${ic('check')}<h3>ไม่มีงานค้าง</h3><p>เมื่อมีใบลาใหม่ จะแสดงที่นี่ทันที</p></div>`;
 return `<div class="bulk"><label class="chk"><input type="checkbox" onchange="document.querySelectorAll('.sk').forEach(x=>x.checked=this.checked)"> เลือกทั้งหมด (${a.length})</label><button class="btn g" onclick="bulk()">${ic('check')} ${dir?'อนุญาต':'ตรวจสอบ'}ที่เลือก</button></div>
 <div class="ib">${a.map(l=>{const st=stats(l,L)[l.type];return `<div class="ic2"><div class="ch"><input type="checkbox" class="sk" value="${l.id}"><span class="av">${init(l.name)}</span><div><b>${l.name}</b><small>${l.pos}</small></div>${pill(l)}</div>
 <div class="cm">${ic('calendar')} ${thS(l.start)} – ${thS(l.end)} · <b>${l.days} วัน</b></div><p>${l.reason}</p><div class="cs">ปีงบนี้ลา${l.type}มาแล้ว ${st[0]} วัน → รวมครั้งนี้ ${st[2]} วัน</div>
 <div class="ca"><button class="btn s l" onclick="preview(${l.id})">${ic('eye')} ดูเอกสาร</button>${dir?`<button class="btn s r" onclick="decM(${l.id})">${ic('x')} ไม่อนุญาต</button><button class="btn s g" onclick="quick(${l.id})">${ic('check')} อนุญาต</button>`:`<button class="btn s g" onclick="checkM(${l.id})">${ic('check')} ตรวจสอบ</button>`}</div></div>`}).join('')}</div>`}
const apply=(l,dir)=>dir?Object.assign(l,{decided:1,decDate:today(),status:'อนุญาต',dComment:''}):Object.assign(l,{checked:1,checkDate:today(),pOpinion:'เห็นควรอนุญาต',status:'รอพิจารณา'});
async function bulk(){const ids=[...document.querySelectorAll('.sk:checked')].map(x=>+x.value);if(!ids.length)return alert('กรุณาเลือกใบลาก่อน');if(!confirm(`ดำเนินการ ${ids.length} รายการ?`))return;
 for(const id of ids){const l=byId(id);apply(l,role=='ผู้อำนวยการ');await db.save(l)}L=await db.leaves();render();toast('ดำเนินการแล้ว')}
async function quick(id){const l=byId(id);apply(l,true);await db.save(l);L=await db.leaves();render();toast('อนุญาตแล้ว')}
function checkM(id){modal(`<div class="mb"><h3>ตรวจสอบสถิติและความเห็นฝ่ายบุคคล</h3><p class="sub">ระบบคำนวณสถิติให้อัตโนมัติ และใช้ลายเซ็นผู้ตรวจสอบ/ฝ่ายบุคคลจากเมนูตั้งค่า</p><label>ความเห็นฝ่ายบุคคล</label><input id="po" value="เห็นควรอนุญาต"><p><button class="btn g" onclick="doCheck(${id})">บันทึก</button> <button class="btn l" onclick="closeM()">ยกเลิก</button></p></div>`)}
async function doCheck(id){const l=byId(id);Object.assign(l,{checked:1,checkDate:today(),pOpinion:$('#po').value,status:'รอพิจารณา'});await db.save(l);closeM();L=await db.leaves();render()}
function decM(id){modal(`<div class="mb"><h3>พิจารณาใบลา</h3><select id="dc"><option>อนุญาต</option><option>ไม่อนุญาต</option></select><label>หมายเหตุ</label><input id="dm"><p><button class="btn g" onclick="doDec(${id})">บันทึก</button> <button class="btn l" onclick="closeM()">ยกเลิก</button></p></div>`)}
async function doDec(id){const l=byId(id);Object.assign(l,{decided:1,decDate:today(),status:$('#dc').value,dComment:$('#dm').value});await db.save(l);closeM();L=await db.leaves();render()}
/* ---------- แดชบอร์ด ---------- */
const filt=a=>a.filter(l=>F.mode=='all'||(F.mode=='fy'&&fy(l.start)==F.year)||(F.mode=='ay'&&ay(l.start)==F.year)||(F.mode=='term'&&ay(l.start)==F.year&&term(l.start)==F.term));
function setF(k,v){F[k]=k=='mode'?v:+v;render()}
function dash(){const all=mine(),a=filt(all),sum=(t)=>a.filter(l=>l.type==t).reduce((s,l)=>s+ +l.days,0),tot=a.reduce((s,l)=>s+ +l.days,0),T=today(),in7=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
 const ok=l=>l.status!='ไม่อนุญาต',now=all.filter(l=>l.start<=T&&l.end>=T&&ok(l)),soon=all.filter(l=>l.start>T&&l.start<=in7&&ok(l));
 const ms=F.mode=='fy'?[10,11,12,1,2,3,4,5,6,7,8,9]:F.mode=='ay'?[5,6,7,8,9,10,11,12,1,2,3,4]:F.mode=='term'?(F.term==1?[5,6,7,8,9,10]:[11,12,1,2,3,4]):[1,2,3,4,5,6,7,8,9,10,11,12];
 const md=ms.map(m=>a.filter(l=>+l.start.split('-')[1]==m).reduce((s,l)=>s+ +l.days,0)),mx=Math.max(1,...md);
 const rank=[...new Set(a.map(l=>l.name))].map(n=>[n,a.filter(l=>l.name==n).reduce((s,l)=>s+ +l.days,0)]).sort((x,y)=>y[1]-x[1]).slice(0,8),rm=Math.max(1,...rank.map(r=>r[1]));
 const ys=[...new Set([F.year,...L.map(l=>F.mode=='ay'||F.mode=='term'?ay(l.start):fy(l.start))])].sort().reverse();
 const kp=[['file','k1',a.length,'ใบลาทั้งหมด'],['calendar','k2',tot,'วันลารวม'],['inbox','k3',a.filter(l=>!l.decided).length,'รอดำเนินการ'],['check','k4',a.filter(l=>l.status=='อนุญาต').length,'อนุญาตแล้ว']];
 const who=x=>`<div class="wl"><span class="av">${init(x.name)}</span><div><b>${x.name}</b><small>${thS(x.start)}${x.end!=x.start?' – '+thS(x.end):''}</small></div>${pill(x)}</div>`;
 return `<div class="card"><div class="row"><div><label>สรุปตาม</label><select onchange="setF('mode',this.value)">${[['fy','ปีงบประมาณ'],['ay','ปีการศึกษา'],['term','ภาคเรียน'],['all','ทั้งหมด']].map(x=>`<option value="${x[0]}" ${F.mode==x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></div>
 ${F.mode!='all'?`<div><label>ปี พ.ศ.</label><select onchange="setF('year',this.value)">${ys.map(y=>`<option ${y==F.year?'selected':''}>${y}</option>`).join('')}</select></div>`:''}
 ${F.mode=='term'?`<div><label>ภาคเรียน</label><select onchange="setF('term',this.value)"><option value="1" ${F.term==1?'selected':''}>1 (พ.ค.–ต.ค.)</option><option value="2" ${F.term==2?'selected':''}>2 (พ.ย.–เม.ย.)</option></select></div>`:''}</div></div>
 <div class="grid">${kp.map(k=>`<div class="card kpi ${k[1]}"><i>${ic(k[0])}</i><div><div class="big">${k[2]}</div>${k[3]}</div></div>`).join('')}</div>
 <div class="g2"><div class="card"><h3>วันลารายเดือน</h3><div class="mc">${ms.map((m,i)=>`<div class="mcol"><span>${md[i]||''}</span><div class="mbr" style="height:${md[i]/mx*100}%"></div><small>${SM[m-1]}</small></div>`).join('')}</div></div>
 <div class="card"><h3>${role=='ครู'?'ลาของฉัน':'ใครลาบ้าง'}</h3><b class="lab">วันนี้ (${now.length})</b>${now.map(who).join('')||'<p class="mut">วันนี้ไม่มีการลา</p>'}<b class="lab">ภายใน 7 วัน (${soon.length})</b>${soon.map(who).join('')||'<p class="mut">ไม่มีการลาล่วงหน้า</p>'}</div></div>
 <div class="g2"><div class="card"><h3>สัดส่วนประเภทการลา</h3><div class="stk">${TYPES.map((t,i)=>`<span style="width:${tot?sum(t)/tot*100:0}%;background:${TC[i]}"></span>`).join('')}</div><div class="lg">${TYPES.map((t,i)=>`<div><i style="background:${TC[i]}"></i>${t}<b>${sum(t)} วัน</b></div>`).join('')}</div></div>
 ${role!='ครู'?`<div class="card"><h3>ครูที่ลามากที่สุด</h3>${rank.map(r=>`<div class="rk"><span>${r[0]}</span><div class="bar" style="width:${r[1]/rm*100}%"></div><b>${r[1]}</b></div>`).join('')||'<p class="mut">ยังไม่มีข้อมูล</p>'}</div>`:''}</div>
 <div class="card"><h3>ใบลาล่าสุด</h3><div class="wrap"><table class="t"><tr><th>ชื่อ</th><th>ประเภท</th><th>วันที่ลา</th><th>วัน</th><th>สถานะ</th></tr>${[...all].sort((x,y)=>y.id-x.id).slice(0,5).map(l=>`<tr><td>${l.name}</td><td>${pill(l)}</td><td>${thS(l.start)}</td><td>${l.days}</td><td><span class="tag ${ST[l.status]}">${l.status}</span></td></tr>`).join('')||'<tr><td colspan=5>ยังไม่มีใบลา</td></tr>'}</table></div></div>`}
/* ---------- ตั้งค่า (ต้องใช้รหัส) ---------- */
function settings(){if(!unlocked)return `<div class="card lockc">${ic('lock')}<h3>ส่วนนี้สำหรับผู้ดูแลระบบ</h3><p class="sub">กรอกรหัสผู้ดูแลเพื่อเข้าตั้งค่า${S.pinSet?'':'<br>รหัสเริ่มต้นคือ <b>1234</b> — เปลี่ยนทันทีหลังเข้าใช้'}</p><input id="pin" type="password" inputmode="numeric" placeholder="รหัสผู้ดูแล" onkeydown="if(event.key=='Enter')unlock()"><p><button class="btn g" onclick="unlock()">${ic('lock')} ปลดล็อก</button></p></div>`;
 const tabs=[['school','โรงเรียน','building'],['teachers','รายชื่อครู','users'],['staff','ผู้ลงนามและลายเซ็น','pen'],['sec','รหัสผ่าน','shield']];
 return `<div class="chips">${tabs.map(t=>`<button class="chip ${stab==t[0]?'on':''}" onclick="stab='${t[0]}';render()">${ic(t[2])} ${t[1]}</button>`).join('')}</div>${{school:tSchool,teachers:tTeachers,staff:tStaff,sec:tSec}[stab]()}`}
async function unlock(){const h=await sha($('#pin').value);if(await db.auth(h)){PH=h;unlocked=true;render()}else alert('รหัสไม่ถูกต้อง')}
async function persist(m){try{await db.saveSettings(S);toast(m||'บันทึกแล้ว')}catch{alert('บันทึกไม่สำเร็จ กรุณาปลดล็อกใหม่');unlocked=false;render()}}
const fld=(k,l)=>`<div><label>${l}</label><input id="s_${k}" value="${S[k]||''}"></div>`;
const rd=ks=>ks.forEach(k=>S[k]=$('#s_'+k).value);
function tSchool(){return `<div class="card k1"><div class="row">${fld('school','ชื่อโรงเรียน')}${fld('area','สังกัด')}${fld('fileFmt','ชื่อไฟล์ PDF ({type} {name} {date})')}</div><p><button class="btn g" onclick="rd(['school','area','fileFmt']);persist()">${ic('check')} บันทึก</button></p></div>`}
function tStaff(){const g=(k,l,extra)=>`<div class="card"><h3>${l}</h3><div class="row">${extra}</div>${sgBox(k,S.sigs[k])}</div>`;
 return `${g('director','ผู้อำนวยการ',fld('director','ชื่อ-สกุล'))}${g('clerk','ผู้ตรวจสอบ (ธุรการ)',fld('clerk','ชื่อ-สกุล')+fld('clerkPos','ตำแหน่ง'))}${g('personnel','ฝ่ายบุคคล',fld('personnel','ชื่อ-สกุล')+fld('personnelPos','ตำแหน่ง'))}
 <p class="sub">ลายเซ็นใช้ไฟล์ PNG พื้นโปร่งใสได้ ปรับขนาด/ตำแหน่งแล้วดูผลได้ทันทีในกรอบ</p><button class="btn g" onclick="saveStaff()">${ic('check')} บันทึกทั้งหมด</button>`}
function saveStaff(){rd(['director','clerk','clerkPos','personnel','personnelPos']);['director','clerk','personnel'].forEach(k=>S.sigs[k]={...SG[k]});persist()}
function tTeachers(){return `<div class="card k2"><h3>เพิ่มครูทีละคน</h3><div class="row"><div><label>ชื่อ-สกุล</label><input id="nt_n"></div><div><label>ตำแหน่ง</label><input id="nt_p" placeholder="ครู / ครูชำนาญการ"></div><div><label>โทรศัพท์</label><input id="nt_t"></div></div><p><button class="btn g" onclick="addT()">${ic('plus')} เพิ่มครู</button></p></div>
 <div class="card k4" style="margin-top:14px"><h3>เพิ่มทีละหลายคน</h3><p class="sub">วางรายชื่อบรรทัดละคน รูปแบบ <b>ชื่อ|ตำแหน่ง|เบอร์โทร</b> (เว้นตำแหน่งหรือเบอร์ได้) วางจาก Excel ได้เลย</p><textarea id="nt_bulk" rows="5" placeholder="นายสมชาย ใจดี|ครู|0812345678"></textarea><p><button class="btn p" onclick="addBulk()">${ic('users')} เพิ่มทั้งหมด</button></p></div>
 <h3 style="margin-top:18px">รายชื่อครู (${S.teachers.length} คน)</h3><div class="wrap"><table class="t"><tr><th>#</th><th>ชื่อ-สกุล</th><th>ตำแหน่ง</th><th>โทรศัพท์</th><th></th></tr>${S.teachers.map((t,i)=>`<tr><td>${i+1}</td><td><input value="${t.n}" onchange="editT(${i},'n',this.value)"></td><td><input value="${t.p}" onchange="editT(${i},'p',this.value)"></td><td><input value="${t.t}" onchange="editT(${i},'t',this.value)"></td><td><button class="btn s r" onclick="delT(${i})">${ic('trash')}</button></td></tr>`).join('')}</table></div>`}
async function addT(){const n=$('#nt_n').value.trim();if(!n)return alert('กรุณากรอกชื่อ');S.teachers.push({id:uid(),n,p:$('#nt_p').value.trim(),t:$('#nt_t').value.trim()});await persist('เพิ่มครูแล้ว');render()}
async function addBulk(){const rows=$('#nt_bulk').value.split('\n').map(x=>x.trim()).filter(Boolean);if(!rows.length)return;rows.forEach(r=>{const[n,p,t]=r.split(/\||\t/);S.teachers.push({id:uid(),n:n.trim(),p:(p||'').trim(),t:(t||'').trim()})});await persist(`เพิ่ม ${rows.length} คนแล้ว`);render()}
function editT(i,k,v){S.teachers[i][k]=v.trim();persist('แก้ไขแล้ว')}
async function delT(i){if(confirm('ลบ '+S.teachers[i].n+' ?')){S.teachers.splice(i,1);await persist('ลบแล้ว');render()}}
function tSec(){return `<div class="card k5"><h3>เปลี่ยนรหัสผู้ดูแล</h3><div class="row"><div><label>รหัสใหม่ (อย่างน้อย 4 ตัว)</label><input id="np1" type="password"></div><div><label>ยืนยันรหัสใหม่</label><input id="np2" type="password"></div></div><p><button class="btn g" onclick="chPin()">${ic('shield')} เปลี่ยนรหัส</button></p><p class="sub">รหัสเก็บแบบเข้ารหัส (SHA-256) และเซิร์ฟเวอร์จะไม่ยอมให้แก้ตั้งค่าหากรหัสไม่ถูกต้อง</p></div>`}
async function chPin(){const a=$('#np1').value;if(a.length<4)return alert('รหัสต้องมีอย่างน้อย 4 ตัว');if(a!=$('#np2').value)return alert('รหัสยืนยันไม่ตรงกัน');S.pinHash=await sha(a);await persist('เปลี่ยนรหัสแล้ว');PH=S.pinHash;S.pinSet=true}
init0();
