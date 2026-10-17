// Cloudflare Pages Function + D1 (binding ชื่อ DB) — แก้ไขตั้งค่าต้องส่งรหัส (x-pin) ที่ถูกต้อง
const DEF='03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'; // รหัสเริ่มต้น 1234
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}});
const getS=async env=>{const r=await env.DB.prepare("SELECT v FROM settings WHERE k='main'").first();return r?JSON.parse(r.v):{}};
export async function onRequest({request,env,params}){
 const p=(params.path||[]).join('/'),m=request.method;
 if(p=='leaves'){
  if(m=='GET'){const r=await env.DB.prepare('SELECT data FROM leaves ORDER BY updated DESC').all();return J(r.results.map(x=>JSON.parse(x.data)))}
  if(m=='POST'){const l=await request.json();await env.DB.prepare('INSERT OR REPLACE INTO leaves(id,data,updated) VALUES(?,?,?)').bind(String(l.id),JSON.stringify(l),Date.now()).run();return J({ok:1})}}
 if(p.startsWith('leaves/')&&m=='DELETE'){const s=await getS(env);if(request.headers.get('x-pin')!==(s.pinHash||DEF))return J({error:'auth'},401);await env.DB.prepare('DELETE FROM leaves WHERE id=?').bind(p.slice(7)).run();return J({ok:1})}
 if(p=='settings'){const s=await getS(env);
  if(m=='GET'){const{pinHash,...o}=s;return J({...o,pinSet:!!pinHash})}
  if(m=='PUT'){if(request.headers.get('x-pin')!==(s.pinHash||DEF))return J({error:'auth'},401);const b=await request.json();delete b.pinSet;if(!b.pinHash)b.pinHash=s.pinHash;
   await env.DB.prepare("INSERT OR REPLACE INTO settings(k,v) VALUES('main',?)").bind(JSON.stringify(b)).run();return J({ok:1})}}
 if(p=='auth'&&m=='POST'){const{h}=await request.json();const s=await getS(env);return J({ok:h===(s.pinHash||DEF)})}
 return J({error:'not found'},404)}
