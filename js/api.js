// เรียก Cloudflare D1 ผ่าน /api
// - บนเว็บจริง: ใช้ D1 เท่านั้น ถ้าเชื่อมต่อไม่ได้จะลองใหม่อัตโนมัติ แล้วแจ้งเตือน (ไม่สลับไปใช้ข้อมูลในเครื่องเงียบ ๆ อีก)
// - ทดลองในเครื่อง (localhost / เปิดไฟล์ตรง): ใช้ localStorage ของเบราว์เซอร์แทน
const LS=(k,d)=>JSON.parse(localStorage.getItem(k)||d);
const LOCAL=location.protocol=='file:'||/^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(location.hostname);
let PH=''; // แฮชรหัสผู้ดูแลหลังปลดล็อก
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function call(p,o={},tries=3){
 let last;
 for(let i=0;i<tries;i++){
  const ac=new AbortController(),t=setTimeout(()=>ac.abort(),20000);
  try{
   const r=await fetch('/api/'+p,{...o,cache:'no-store',signal:ac.signal,headers:{'content-type':'application/json','x-pin':PH}});
   if(r.status==401)throw'auth';
   if(!r.ok){let m='';try{m=(await r.json()).error||''}catch{}throw new Error('HTTP '+r.status+(m?' — '+m:''))}
   return await r.json();
  }catch(e){if(e==='auth')throw e;last=e;if(i<tries-1)await wait(800*(i+1))}
  finally{clearTimeout(t)}
 }
 throw last;
}
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const dbErr=e=>'เชื่อมต่อฐานข้อมูลไม่สำเร็จ'+(e&&e.message?' ('+e.message+')':'')+'\nกรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ — ข้อมูลยังไม่ถูกบันทึก';
const db={
 async leaves(){if(LOCAL)return LS('leaves','[]');return call('leaves')},
 async save(l){if(LOCAL){const a=LS('leaves','[]'),i=a.findIndex(x=>x.id==l.id);i<0?a.push(l):a[i]=l;localStorage.leaves=JSON.stringify(a);return}
  try{await call('leaves',{method:'POST',body:JSON.stringify(l)})}catch(e){alert(dbErr(e));e&&typeof e=='object'&&(e.shown=1);throw e}},
 async del(id){if(LOCAL){localStorage.leaves=JSON.stringify(LS('leaves','[]').filter(x=>x.id!=id));return}return call('leaves/'+id,{method:'DELETE'},1)},
 async settings(){const s=LOCAL?LS('settings','{}'):await call('settings');return{...DEFAULTS,...s}},
 async saveSettings(s){if(LOCAL){localStorage.settings=JSON.stringify(s);return}return call('settings',{method:'PUT',body:JSON.stringify(s)},2)},
 async auth(h){if(LOCAL)return h==(LS('settings','{}').pinHash||DEFH);return(await call('auth',{method:'POST',body:JSON.stringify({h})})).ok},
 // ใบลาที่เคยถูกบันทึกค้างไว้ในเครื่อง (ตอนเชื่อมต่อฐานข้อมูลไม่ได้ในเวอร์ชันก่อน) → ส่งขึ้น D1 ให้อัตโนมัติ
 async syncLocal(server){if(LOCAL)return 0;const loc=LS('leaves','[]');if(!loc.length)return 0;
  const have=new Set(server.map(x=>String(x.id))),todo=loc.filter(x=>!have.has(String(x.id)));
  for(const l of todo)await call('leaves',{method:'POST',body:JSON.stringify(l)});
  localStorage.leaves_backup=localStorage.leaves;localStorage.removeItem('leaves');return todo.length}
};
addEventListener('unhandledrejection',e=>{const r=e.reason;if(r&&r.shown)e.preventDefault()});
