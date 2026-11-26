// Gaarak backend: zero-dependency Node server. Run: node server/server.js
const http=require('http'),fs=require('fs'),path=require('path');
const DB=path.join(__dirname,'db.json'),PUB=path.join(__dirname,'..','public'),PORT=process.env.PORT||3000;
const load=()=>fs.existsSync(DB)?JSON.parse(fs.readFileSync(DB)):[];
const save=d=>fs.writeFileSync(DB,JSON.stringify(d,null,1));
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const json=(res,c,o)=>{res.writeHead(c,{'content-type':'application/json'});res.end(JSON.stringify(o))};
const body=req=>new Promise(r=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>{try{r(JSON.parse(s||'{}'))}catch{r({})}})});
http.createServer(async(req,res)=>{
 const u=req.url.split('?')[0];
 if(u==='/api/requests'&&req.method==='GET')return json(res,200,load());
 if(u==='/api/requests'&&req.method==='POST'){const b=await body(req);
  if(!b.title||typeof b.lat!=='number'||typeof b.lng!=='number')return json(res,400,{error:'title, lat, lng required'});
  const d=load(),r={id:'r'+Date.now(),title:String(b.title).slice(0,80),cat:b.cat||'other',reward:Math.min(500,Math.max(5,+b.reward||20)),urgent:!!b.urgent,lat:b.lat,lng:b.lng,by:b.by||'me',status:'open',at:Date.now()};
  d.unshift(r);save(d);return json(res,201,r)}
 const m=u.match(/^\/api\/requests\/([\w-]+)\/(accept|done)$/);
 if(m&&req.method==='POST'){const b=await body(req),d=load(),r=d.find(x=>x.id===m[1]);if(!r)return json(res,404,{error:'not found'});
  if(m[2]==='accept'){if(r.status!=='open')return json(res,409,{error:'taken'});r.status='taken';r.helper=b.user||'me'}
  else{if(r.status!=='taken')return json(res,409,{error:'not in progress'});r.status='done'}
  save(d);return json(res,200,r)}
 let f=path.join(PUB,u==='/'?'index.html':u);if(!f.startsWith(PUB)||!fs.existsSync(f))f=path.join(PUB,'index.html');
 res.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(res);
}).listen(PORT,()=>console.log('Gaarak on http://localhost:'+PORT));
