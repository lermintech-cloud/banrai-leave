// Cloudflare Pages Function + D1 (binding ชื่อ DB)
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}});
export async function onRequest({request,env,params}){
 const p=(params.path||[]).join('/'),m=request.method;
 if(p=='leaves'){
  if(m=='GET'){const r=await env.DB.prepare('SELECT data FROM leaves ORDER BY updated DESC').all();return J(r.results.map(x=>JSON.parse(x.data)))}
  if(m=='POST'){const l=await request.json();await env.DB.prepare('INSERT OR REPLACE INTO leaves(id,data,updated) VALUES(?,?,?)').bind(String(l.id),JSON.stringify(l),Date.now()).run();return J({ok:1})}}
 if(p.startsWith('leaves/')&&m=='DELETE'){await env.DB.prepare('DELETE FROM leaves WHERE id=?').bind(p.slice(7)).run();return J({ok:1})}
 if(p=='settings'){
  if(m=='GET'){const r=await env.DB.prepare("SELECT v FROM settings WHERE k='main'").first();return J(r?JSON.parse(r.v):{})}
  if(m=='PUT'){await env.DB.prepare("INSERT OR REPLACE INTO settings(k,v) VALUES('main',?)").bind(JSON.stringify(await request.json())).run();return J({ok:1})}}
 return J({error:'not found'},404)}
