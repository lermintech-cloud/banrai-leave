// เรียก Cloudflare D1 ผ่าน /api ; ถ้าไม่มี API (ทดลองในเครื่อง) จะใช้ localStorage แทนอัตโนมัติ
const LS=(k,d)=>JSON.parse(localStorage.getItem(k)||d);
async function call(p,o){const r=await fetch('/api/'+p,o);if(!r.ok)throw 0;return r.json()}
const db={
 async leaves(){try{return await call('leaves')}catch{return LS('leaves','[]')}},
 async save(l){try{await call('leaves',{method:'POST',body:JSON.stringify(l)})}catch{const a=LS('leaves','[]'),i=a.findIndex(x=>x.id==l.id);i<0?a.push(l):a[i]=l;localStorage.leaves=JSON.stringify(a)}},
 async del(id){try{await call('leaves/'+id,{method:'DELETE'})}catch{localStorage.leaves=JSON.stringify(LS('leaves','[]').filter(x=>x.id!=id))}},
 async settings(){let s;try{s=await call('settings')}catch{s=LS('settings','{}')}return{...DEFAULTS,...s}},
 async saveSettings(s){try{await call('settings',{method:'PUT',body:JSON.stringify(s)})}catch{localStorage.settings=JSON.stringify(s)}}
};
