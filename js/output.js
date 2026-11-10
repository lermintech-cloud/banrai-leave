// พรีวิว / พิมพ์ / PDF
const $=s=>document.querySelector(s);
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,2500)}
function modal(h){const m=$('#modal');m.innerHTML=h;m.hidden=false}
function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML=''}
function fileName(d){
  const l=d.leave,p=l&&person(l.pid);
  const n=l?S.settings.fname.replace('{ชื่อ}',p?.name||'').replace('{ประเภท}',TYPES[l.type]).replace('{วันที่}',l.start):d.name;
  return n.replace(/[\\/:*?"<>|\s]+/g,'_')}
// 1) หน้าตัวอย่างก่อนพิมพ์/PDF
function preview(d){
  window.CUR=d;
  modal(`<div class="box w"><h3>ตัวอย่างเอกสาร — ตรวจก่อนพิมพ์</h3><div class="pv" id="pvw"><div id="pvi" style="transform-origin:0 0">${d.html}</div></div>
  <div class="acts"><button class="btn s" onclick="doPrint()">พิมพ์</button><button class="btn a" onclick="doPdf()">PDF</button><button class="btn g" onclick="closeModal()">ปิด</button></div></div>`);
  const w=$('#pvw'),sc=Math.min(1,(w.clientWidth||innerWidth-60)/794);
  $('#pvi').style.transform=`scale(${sc})`;w.style.height=(1123*sc)+'px'}
// 2) พิมพ์: เปิดหน้าต่างพิมพ์ A4 (ซ่อนทุกอย่างยกเว้นกระดาษ, @page margin 0 ตัดวันที่/ลิงก์ของเบราว์เซอร์)
function doPrint(){$('#pa').innerHTML=CUR.html;document.title=fileName(CUR);setTimeout(()=>{window.print();document.title='ระบบลา โรงเรียนบ้านไร่'},200)}
// 3) PDF: สร้าง A4 แล้วแสดงทีละหน้า + ดาวน์โหลด/ปิด
async function doPdf(d){
  d=d||CUR;toast('กำลังสร้าง PDF...');
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0';host.innerHTML=d.html;document.body.appendChild(host);
  try{
    await document.fonts.ready;await Promise.all([...host.querySelectorAll('img')].map(i=>i.complete?1:new Promise(r=>i.onload=i.onerror=r)));
    const cv=await html2canvas(host.firstChild,{scale:2,useCORS:true,backgroundColor:'#fff'});
    const pdf=new jspdf.jsPDF('p','mm','a4'),ph=Math.round(cv.width*297/210),imgs=[];
    for(let y=0,n=0;y<cv.height;y+=ph,n++){
      const c=document.createElement('canvas');c.width=cv.width;c.height=ph;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,ph);x.drawImage(cv,0,y,cv.width,ph,0,0,cv.width,ph);
      if(n)pdf.addPage();const u=c.toDataURL('image/jpeg',.92);pdf.addImage(u,'JPEG',0,0,210,297);
      if(n){pdf.setFontSize(16);pdf.text(String(n+1),105,10,{align:'center'})}   // เลขหน้ากลางบน ตั้งแต่หน้า 2
      imgs.push(u)}
    const url=URL.createObjectURL(pdf.output('blob')),name=fileName(d)+'.pdf';
    modal(`<div class="box w"><h3>ตัวอย่าง PDF (${imgs.length} หน้า)</h3><div class="pgs">${imgs.map((u,i)=>`<img src="${u}" alt="หน้า ${i+1}">`).join('')}</div>
    <div class="acts"><a class="btn s" href="${url}" download="${esc(name)}" style="text-decoration:none">ดาวน์โหลด</a><button class="btn g" onclick="closeModal()">ปิด</button></div></div>`);
  }catch(e){toast('สร้าง PDF ไม่สำเร็จ: '+e.message)}finally{host.remove()}}
