const T={ar:{pts:'نقطة',addBtn:'+ اطلب مساعدة',hero:'محتاج حاجة؟ جارك قريب منك.',sub:'انزل مهمة صغيرة على الخريطة، أقرب جار يساعدك ويكسب نقاط تتحول لفلوس.',near:'حواليك',mine:'مهامي',board:'الأبطال',newTitle:'طلب مساعدة جديد',pick:'اضغط على الخريطة لتحديد المكان',what:'محتاج إيه؟',cat:'النوع',reward:'المكافأة (نقاط)',urgent:'مستعجل',cancel:'إلغاء',post:'انشر الطلب',all:'الكل',accept:'أنا هساعد',done:'تمت المساعدة',open:'مفتوح',taken:'جاري التنفيذ',finished:'خلصت',away:'بعد',empty:'مفيش مهام هنا دلوقتي',posted:'اتنشر طلبك',pickfirst:'حدد المكان على الخريطة الأول',got:'كسبت',egp:'جنيه تقريباً',you:'أنت',noMine:'لسه ماعملتش أو ماقبلتش مهام',cats:{groc:'مشتريات',tech:'تقنية',car:'عربية',care:'رعاية',move:'نقل',other:'حاجة تانية'}},
en:{pts:'pts',addBtn:'+ Ask for help',hero:'Need a hand? Your neighbor is close.',sub:'Drop a small task on the map. The nearest neighbor helps and earns points that turn into cash.',near:'Nearby',mine:'My tasks',board:'Heroes',newTitle:'New help request',pick:'Tap the map to set the place',what:'What do you need?',cat:'Type',reward:'Reward (points)',urgent:'Urgent',cancel:'Cancel',post:'Post request',all:'All',accept:"I'll help",done:'Mark done',open:'Open',taken:'In progress',finished:'Done',away:'away',empty:'Nothing here right now',posted:'Request posted',pickfirst:'Pick a place on the map first',got:'You earned',egp:'EGP approx.',you:'You',noMine:'No tasks yet',cats:{groc:'Errands',tech:'Tech',car:'Car',care:'Care',move:'Moving',other:'Other'}}};
const ICON={groc:'🛒',tech:'💻',car:'🚗',care:'🧓',move:'📦',other:'✨'};
let lang=localStorage.gk_lang||'ar',tab='near',filter='all',pos={lat:31.2001,lng:29.9187},picked=null,picking=false,reqs=[];
const ME='me',RATE=0.5; // 1 point = 0.5 EGP (demo rate)
const t=k=>T[lang][k];
// data layer: real backend when /api exists, else localStorage demo store
const store={
 async init(){try{const r=await fetch('api/requests');if(!r.ok||!(r.headers.get('content-type')||'').includes('json'))throw 0;this.api=true}catch(e){this.api=false}},
 async list(){if(this.api)return (await fetch('api/requests')).json();let d=JSON.parse(localStorage.gk_reqs||'null');if(!d){d=seed();localStorage.gk_reqs=JSON.stringify(d)}return d},
 async save(d){localStorage.gk_reqs=JSON.stringify(d)},
 async add(r){if(this.api)return fetch('api/requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(r)});const d=await this.list();d.unshift({...r,id:'r'+Date.now(),status:'open',by:ME,at:Date.now()});await this.save(d)},
 async act(id,a){if(this.api)return fetch(`api/requests/${id}/${a}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user:ME})});const d=await this.list();const r=d.find(x=>x.id===id);if(a==='accept'){r.status='taken';r.helper=ME}else{r.status='done'}await this.save(d)}
};
function seed(){const B=[[31.2156,29.9553,'أحتاج حد يجيبلي أدوية من الصيدلية','care',40,1,'Mona'],[31.2001,29.9187,'مشكلة في الواي فاي ومحتاج حد فاهم','tech',60,0,'Karim'],[31.2300,29.9400,'بطارية العربية فاصلة','car',80,1,'Omar'],[31.1910,29.9000,'محتاج مساعدة في نقل كرتونتين','move',35,0,'Salma'],[31.2090,29.9420,'جيبلي خبز وجرجير من السوق','groc',15,0,'Hana'],[31.2210,29.9700,'تعليم جدتي تستخدم واتساب','tech',45,0,'Youssef']];
 return B.map((b,i)=>({id:'s'+i,lat:b[0],lng:b[1],title:b[2],cat:b[3],reward:b[4],urgent:!!b[5],by:b[6],status:'open',at:Date.now()-i*600000}))}
const dist=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(b.lat-a.lat),dn=r(b.lng-a.lng);const h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const fmt=d=>d<1?Math.round(d*1000)+' m':d.toFixed(1)+' km';
const map=L.map('map',{zoomControl:false}).setView([pos.lat,pos.lng],13);L.control.zoom({position:'topleft'}).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
let layer=L.layerGroup().addTo(map),meMark=null,pickMark=null;
const toast=m=>{const e=document.getElementById('toast');e.textContent=m;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2200)};
function wallet(){return reqs.filter(r=>r.status==='done'&&r.helper===ME).reduce((s,r)=>s+r.reward,0)}
async function load(){reqs=await store.list();render()}
function render(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-t]').forEach(e=>e.textContent=t(e.dataset.t));
 document.getElementById('lang').textContent=lang==='ar'?'EN':'ع';document.getElementById('wallet').textContent=wallet();
 document.getElementById('catsel').innerHTML=Object.keys(ICON).map(k=>`<option value="${k}">${ICON[k]} ${T[lang].cats[k]}</option>`).join('');
 document.getElementById('chips').innerHTML=['all',...Object.keys(ICON)].map(k=>`<span class="chip ${filter===k?'on':''}" data-f="${k}">${k==='all'?t('all'):ICON[k]+' '+T[lang].cats[k]}</span>`).join('');
 layer.clearLayers();
 let list=reqs.map(r=>({...r,d:dist(pos,r)}));
 list.filter(r=>r.status!=='done').forEach(r=>L.marker([r.lat,r.lng],{icon:L.divIcon({className:'',html:`<div class="pin">${ICON[r.cat]}</div>`,iconSize:[30,30]})}).addTo(layer).bindPopup(`<b>${esc(r.title)}</b><br>${r.reward} ${t('pts')}`).on('click',()=>{}));
 const el=document.getElementById('list');
 if(tab==='board'){const sc={};reqs.filter(r=>r.status==='done'&&r.helper).forEach(r=>sc[r.helper]=(sc[r.helper]||0)+r.reward);const base={Omar:420,Hana:310,Karim:260,Salma:190};for(const k in base)sc[k]=(sc[k]||0)+base[k];
  el.innerHTML=Object.entries(sc).sort((a,b)=>b[1]-a[1]).map(([n,p],i)=>`<div class="lb"><span>${['🥇','🥈','🥉'][i]||i+1+'.'} ${n===ME?t('you'):n}</span><b>${p} ${t('pts')}</b></div>`).join('');return}
 if(tab==='near')list=list.filter(r=>r.status!=='done'&&(filter==='all'||r.cat===filter)).sort((a,b)=>(b.urgent-a.urgent)||a.d-b.d);
 else list=list.filter(r=>r.by===ME||r.helper===ME);
 el.innerHTML=list.length?list.map(card).join(''):`<p class="hint">${tab==='mine'?t('noMine'):t('empty')}</p>`;
}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function card(r){const st={open:t('open'),taken:t('taken'),done:t('finished')}[r.status];
 let btn='';if(r.status==='open'&&r.by!==ME)btn=`<button class="primary" data-a="accept" data-id="${r.id}">${t('accept')}</button>`;
 if(r.status==='taken'&&r.helper===ME)btn=`<button class="primary" data-a="done" data-id="${r.id}">${t('done')}</button>`;
 return `<div class="card ${r.urgent?'urgent':''}" data-focus="${r.id}"><span class="pts">${r.reward} ${t('pts')}</span><h4>${ICON[r.cat]} ${esc(r.title)}</h4><div class="meta"><span>${r.by===ME?t('you'):esc(r.by)}</span><span>${fmt(r.d)} ${t('away')}</span><span class="st">${st}</span></div>${btn?`<div class="row">${btn}</div>`:''}</div>`}
document.addEventListener('click',async e=>{
 const c=e.target.closest('.chip');if(c){filter=c.dataset.f;return render()}
 const tb=e.target.closest('[data-tab]');if(tb){tab=tb.dataset.tab;document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b===tb));return render()}
 const a=e.target.closest('[data-a]');if(a){await store.act(a.dataset.id,a.dataset.a);if(a.dataset.a==='done'){const r=reqs.find(x=>x.id===a.dataset.id);toast(`${t('got')} ${r.reward} ${t('pts')} ≈ ${Math.round(r.reward*RATE)} ${t('egp')}`)}return load()}
 const f=e.target.closest('[data-focus]');if(f){const r=reqs.find(x=>x.id===f.dataset.focus);map.flyTo([r.lat,r.lng],15)}
});
document.getElementById('lang').onclick=()=>{lang=lang==='ar'?'en':'ar';localStorage.gk_lang=lang;render()};
document.getElementById('locate').onclick=()=>navigator.geolocation&&navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};map.flyTo([pos.lat,pos.lng],14);if(meMark)meMark.remove();meMark=L.circleMarker([pos.lat,pos.lng],{radius:9,color:'#fff',fillColor:'#1f77ff',fillOpacity:1,weight:3}).addTo(map);render()},()=>toast('GPS off'));
const dlg=document.getElementById('dlg');
document.getElementById('add').onclick=()=>{picking=true;picked=null;toast(t('pick'))};
map.on('click',e=>{if(!picking)return;picked=e.latlng;if(pickMark)pickMark.remove();pickMark=L.marker(e.latlng).addTo(map);if(!dlg.open)dlg.showModal();document.getElementById('pickhint').textContent='✓ '+e.latlng.lat.toFixed(4)+', '+e.latlng.lng.toFixed(4)});
dlg.addEventListener('close',async()=>{picking=false;if(pickMark){pickMark.remove();pickMark=null}
 if(dlg.returnValue!=='ok')return;const f=new FormData(document.getElementById('form'));const at=picked||{lat:pos.lat+(Math.random()-.5)*.01,lng:pos.lng+(Math.random()-.5)*.01};
 await store.add({title:f.get('title'),cat:f.get('cat'),reward:+f.get('reward')||20,urgent:!!f.get('urgent'),lat:at.lat,lng:at.lng});document.getElementById('form').reset();toast(t('posted'));load()});
dlg.addEventListener('click',e=>{/* allow map interaction while open */});
(async()=>{await store.init();await load()})();
