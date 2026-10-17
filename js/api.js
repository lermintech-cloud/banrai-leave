// เรียก Cloudflare D1 ผ่าน /api ; ถ้าไม่มี API (ทดลองในเครื่อง) จะใช้ localStorage แทนอัตโนมัติ
const LS=(k,d)=>JSON.parse(localStorage.getItem(k)||d);
let PH=''; // แฮชรหัสผู้ดูแลหลังปลดล็อก
async function call(p,o={}){const r=await fetch('/api/'+p,{...o,headers:{'content-type':'application/json','x-pin':PH}});if(r.status==401)throw'auth';if(!r.ok)throw 0;return r.json()}
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const db={
 async leaves(){try{return await call('leaves')}catch{return LS('leaves','[]')}},
 async save(l){try{await call('leaves',{method:'POST',body:JSON.stringify(l)})}catch{const a=LS('leaves','[]'),i=a.findIndex(x=>x.id==l.id);i<0?a.push(l):a[i]=l;localStorage.leaves=JSON.stringify(a)}},
 async del(id){try{await call('leaves/'+id,{method:'DELETE'})}catch{localStorage.leaves=JSON.stringify(LS('leaves','[]').filter(x=>x.id!=id))}},
 async settings(){let s;try{s=await call('settings')}catch{s=LS('settings','{}')}return{...DEFAULTS,...s}},
 async saveSettings(s){try{await call('settings',{method:'PUT',body:JSON.stringify(s)})}catch(e){if(e==='auth')throw e;localStorage.settings=JSON.stringify(s)}},
 async auth(h){try{return(await call('auth',{method:'POST',body:JSON.stringify({h})})).ok}catch{return h==(LS('settings','{}').pinHash||DEFH)}}
};
