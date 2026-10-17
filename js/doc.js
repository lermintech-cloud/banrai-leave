const nsg=x=>!x?null:typeof x=='string'?{img:x,s:100,x:0,y:0}:x;
const sgH=x=>{x=nsg(x);return`<div class="sgw">${x&&x.img?`<img src="${x.img}" style="height:${11*x.s/100}mm;left:calc(50% + ${x.x}mm);bottom:${-1-x.y}mm">`:''}</div>`};
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return{d,m:MONTHS[m-1],y:y+543}};
const thS=s=>{if(!s)return'-';const x=pd(s);return`${x.d} ${x.m} ${x.y}`};
const fy=s=>{const [y,m]=s.split('-').map(Number);return m>=10?y+544:y+543};
const ay=s=>{const [y,m]=s.split('-').map(Number);return m>=5?y+543:y+542};
const term=s=>{const m=+s.split('-')[1];return m>=5&&m<=10?1:2};
function stats(l,all){const o={};TYPES.forEach(t=>{const prior=all.filter(x=>x.id!=l.id&&x.name==l.name&&x.type==t&&x.status!='ไม่อนุญาต'&&fy(x.start)==fy(l.start)&&x.start<l.start).reduce((a,x)=>a+ +x.days,0);const now=l.type==t?+l.days:0;o[t]=[prior,now,prior+now]});return o}
function lastLeave(l,all){return all.filter(x=>x.id!=l.id&&x.name==l.name&&x.type==l.type&&x.start<l.start&&x.status!='ไม่อนุญาต').sort((a,b)=>b.start.localeCompare(a.start))[0]}
function docHTML(l,S,all){
 const d=pd(l.date),st=stats(l,all),ll=lastLeave(l,all),sg=sgH;
 const ok=l.status=='อนุญาต',no=l.status=='ไม่อนุญาต',blank='.....................................................';
 return `<div class="page"><img class="logo" src="assets/logo.png">
<div class="t1">แบบใบลาป่วย ลากิจส่วนตัว ลาคลอดบุตร</div>
<div class="r">เขียนที่ ${S.school}<br>วันที่ ${d.d} เดือน ${d.m} พ.ศ. ${d.y}</div>
<p><b>เรื่อง</b> ขอลา${l.type}</p><p><b>เรียน</b> ผู้อำนวยการ${S.school}</p>
<p class="in">ข้าพเจ้า ${l.name} ตำแหน่ง ${l.pos} สังกัด ${S.school} มีความประสงค์ขอลา${l.type} เนื่องจาก ${l.reason} ตั้งแต่วันที่ ${thS(l.start)} ถึงวันที่ ${thS(l.end)} มีกำหนด ${l.days} วัน</p>
<p class="in">ข้าพเจ้าได้ลา${ll?' '+ll.type:''} ครั้งสุดท้ายตั้งแต่วันที่ ${ll?thS(ll.start):'-'} ถึงวันที่ ${ll?thS(ll.end):'-'} มีกำหนด ${ll?ll.days:0} วัน</p>
<p class="in">ในระหว่างลาจะติดต่อข้าพเจ้าได้ที่ โทรศัพท์ ${l.phone||'-'}</p>
<div class="sb">${sg(l.sig)}(ลงชื่อ)............................................<br>(${l.name})</div><hr>
<div class="two"><div><b>๑. สถิติการลาในปีงบประมาณนี้</b>
<table><tr><th>ประเภทการลา</th><th>ลามาแล้ว<br>(วันทำการ)</th><th>ลาครั้งนี้<br>(วันทำการ)</th><th>รวมเป็น<br>(วันทำการ)</th></tr>
${TYPES.map(t=>`<tr><td>${t}</td><td>${st[t][0]}</td><td>${st[t][1]}</td><td>${st[t][2]}</td></tr>`).join('')}</table>
<div class="c" style="margin-top:3mm">${l.checked?sg(S.sigs.clerk):sgH()}(ลงชื่อ)................................ ผู้ตรวจสอบ<br>(${S.clerk})<br>ตำแหน่ง ${S.clerkPos}<br>วันที่ ${l.checked?thS(l.checkDate):'......./......./.......'}</div></div>
<div><b>๒. ความเห็นฝ่ายบุคคล</b><p style="min-height:12mm">${l.pOpinion||blank}</p>
<div class="c">${l.checked?sg(S.sigs.personnel):sgH()}(ลงชื่อ)......................................<br>(${S.personnel})<br>${S.personnelPos}<br>วันที่ ${l.checked?thS(l.checkDate):'....../......./.......'}</div>
<p style="margin-top:4mm">[${ok?'✓':'&nbsp;'}] อนุญาต &nbsp; [${no?'✓':'&nbsp;'}] ไม่อนุญาต</p><p style="min-height:10mm">${l.dComment||blank}</p>
<div class="c">${l.decided?sg(S.sigs.director):sgH()}(ลงชื่อ)......................................<br>(${S.director})<br>ผู้อำนวยการ${S.school}<br>วันที่ ${l.decided?thS(l.decDate):'......./......./.......'}</div></div></div></div>`}
function fname(l,S){return(S.fileFmt||DEFAULTS.fileFmt).replace('{type}',l.type).replace('{name}',l.name).replace('{date}',l.date)+'.pdf'}
async function makePDF(l,S,all){
 await document.fonts.ready;const h=document.createElement('div');h.style.cssText='position:fixed;left:-9999px;top:0';h.innerHTML=docHTML(l,S,all);document.body.appendChild(h);
 const cv=await html2canvas(h.firstChild,{scale:2,useCORS:true,backgroundColor:'#fff'});h.remove();
 const img=cv.toDataURL('image/jpeg',.95),pdf=new jspdf.jsPDF({unit:'mm',format:'a4'});pdf.addImage(img,'JPEG',0,0,210,297);
 return{pdf,pages:[img],name:fname(l,S)}}
