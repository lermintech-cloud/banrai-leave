const KEY='banrai_leave_v1';
const TYPES={sick:'ลาป่วย',personal:'ลากิจส่วนตัว',maternity:'ลาคลอดบุตร'};
const ROLES={teacher:'ครู/บุคลากร',hr:'ผู้ตรวจสอบ (ธุรการ)',head:'ความเห็นฝ่ายบุคคล',director:'ผู้อำนวยการ'};
const MONTHS=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const today=()=>new Date().toISOString().slice(0,10);
const ymd=d=>d.split('-').map(Number);
const fy=d=>{const[y,m]=ymd(d);return(m>=10?y+1:y)+543};            // ปีงบประมาณ: 1 ต.ค.–30 ก.ย.
const term=d=>{const m=ymd(d)[1];return m>=5&&m<=10?1:2};            // เทอม 1: พ.ค.–ต.ค. / เทอม 2: พ.ย.–เม.ย.
const ay=d=>{const[y,m]=ymd(d);return(m<=4?y-1:y)+543};              // ปีการศึกษา
const thDate=d=>{const[y,m,x]=ymd(d);return `${x} ${MONTHS[m-1]} ${y+543}`};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function workdays(a,b){let n=0,d=new Date(a+'T00:00'),e=new Date(b+'T00:00');for(;d<=e;d.setDate(d.getDate()+1)){const w=d.getDay();if(w&&w<6)n++}return n}
let S={settings:{school:'โรงเรียนบ้านไร่',fname:'ใบลา_{ชื่อ}_{ประเภท}_{วันที่}'},people:[],leaves:[]};
let CAN_EDIT=true;
async function api(method,url,body){
  const r=await fetch('/api/'+url,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(!r.ok){toast(r.status==403?'บัญชีนี้ไม่มีสิทธิ์แก้ไข':'บันทึกไม่สำเร็จ ('+r.status+')');throw new Error(r.status)}return r.json()}
const person=id=>S.people.find(p=>p.id===id);
const byRole=r=>S.people.find(p=>p.role===r);
