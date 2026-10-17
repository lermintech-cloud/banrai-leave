// API ของระบบลา เก็บข้อมูลใน Cloudflare D1 (binding ชื่อ DB)
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}});
const rowL=r=>({id:r.id,pid:r.pid,type:r.type,start:r.start_date,end:r.end_date,days:r.days,reason:r.reason,phone:r.phone,written:r.written,useSig:!!r.use_sig});
const upP=(db,p)=>db.prepare('INSERT INTO people(id,name,pos,role,phone,sig) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,pos=excluded.pos,role=excluded.role,phone=excluded.phone,sig=excluded.sig').bind(p.id,p.name,p.pos||'',p.role,p.phone||'',p.sig||'');
const upL=(db,l)=>db.prepare('INSERT INTO leaves(id,pid,type,start_date,end_date,days,reason,phone,written,use_sig) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET pid=excluded.pid,type=excluded.type,start_date=excluded.start_date,end_date=excluded.end_date,days=excluded.days,reason=excluded.reason,phone=excluded.phone,written=excluded.written,use_sig=excluded.use_sig').bind(l.id,l.pid,l.type,l.start,l.end,+l.days,l.reason||'',l.phone||'',l.written||l.start,l.useSig?1:0);
const upS=(db,k,v)=>db.prepare('INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(k,String(v??''));
export async function onRequest({request,env,params}){
  const db=env.DB,seg=[].concat(params.path||[]),m=request.method;
  if(!db)return J({error:'ยังไม่ได้ผูกฐานข้อมูล D1 (binding ชื่อ DB)'},500);
  const email=(request.headers.get('Cf-Access-Authenticated-User-Email')||'').toLowerCase();
  const admins=(env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  const canEdit=!admins.length||admins.includes(email);          // ไม่ตั้ง ADMIN_EMAILS = ทุกคนที่เข้าได้แก้ไขได้
  try{
    if(m==='GET'&&seg[0]==='data'){
      const [s,p,l]=await Promise.all([db.prepare('SELECT * FROM settings').all(),db.prepare('SELECT * FROM people').all(),db.prepare('SELECT * FROM leaves ORDER BY start_date').all()]);
      return J({settings:Object.fromEntries(s.results.map(r=>[r.k,r.v])),people:p.results,leaves:l.results.map(rowL),canEdit,email});
    }
    if(!canEdit)return J({error:'ไม่มีสิทธิ์แก้ไข'},403);
    const b=['POST','PUT'].includes(m)?await request.json():null;
    if(seg[0]==='people'&&m==='POST'){await upP(db,b).run();return J({ok:1})}
    if(seg[0]==='people'&&m==='DELETE'){await db.prepare('DELETE FROM people WHERE id=?').bind(seg[1]).run();return J({ok:1})}
    if(seg[0]==='leaves'&&m==='POST'){await upL(db,b).run();return J({ok:1})}
    if(seg[0]==='leaves'&&m==='DELETE'){await db.prepare('DELETE FROM leaves WHERE id=?').bind(seg[1]).run();return J({ok:1})}
    if(seg[0]==='settings'&&m==='PUT'){await db.batch(Object.entries(b).map(([k,v])=>upS(db,k,v)));return J({ok:1})}
    if(seg[0]==='import'&&m==='POST'){   // นำเข้าข้อมูลสำรอง (แทนที่ทั้งหมด)
      await db.batch([db.prepare('DELETE FROM leaves'),db.prepare('DELETE FROM people'),...b.people.map(p=>upP(db,p)),...b.leaves.map(l=>upL(db,l)),...Object.entries(b.settings||{}).map(([k,v])=>upS(db,k,v))]);
      return J({ok:1});
    }
    return J({error:'not found'},404);
  }catch(e){return J({error:String(e.message||e)},500)}
}
