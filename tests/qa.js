const puppeteer=require('puppeteer-core');
const URL=process.argv[2]||'http://localhost:8123/';
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu'],headless:'new'});
 let fails=0;
 for(const [name,vp,lang] of [['desk-ar',{width:1300,height:800},'ar'],['desk-en',{width:1300,height:800},'en'],['mob-ar',{width:390,height:780,isMobile:true,hasTouch:true},'ar'],['mob-en',{width:390,height:780,isMobile:true,hasTouch:true},'en']]){
  const p=await b.newPage();await p.setViewport(vp);const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/tile|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
  await p.evaluateOnNewDocument(l=>{localStorage.gk_lang=l;if(!sessionStorage.x){localStorage.removeItem('gk_reqs');localStorage.removeItem('gk_wd');sessionStorage.x=1}},lang);
  const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',name,m)}};
  try{
   await p.goto(URL,{waitUntil:'networkidle2',timeout:30000});
   ok(await p.$$eval('.card',e=>e.length)>=5,'cards render');
   ok(await p.$eval('html',e=>e.dir)===(lang==='ar'?'rtl':'ltr'),'dir');
   // post request
   await p.click('#add');const m=await p.$('#map');const bb=await m.boundingBox();
   await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2-40);
   await new Promise(r=>setTimeout(r,300));
   ok(await p.$eval('#dlg',e=>e.open),'dialog opens after map tap');
   await p.type('#form input[name=title]','QA test request');await p.click('#submit');
   await new Promise(r=>setTimeout(r,500));
   ok((await p.$eval('#list',e=>e.innerText)).includes('QA test request'),'new request listed');
   // accept 3 tasks and finish
   for(let i=0;i<3;i++){const btn=await p.$('[data-a=accept]');if(!btn){ok(false,'no accept btn');break}await btn.click();await new Promise(r=>setTimeout(r,250))}
   await p.evaluate(()=>document.querySelectorAll('.tabs button')[1].click());await new Promise(r=>setTimeout(r,250));
   for(let i=0;i<3;i++){const btn=await p.$('[data-a=done]');if(btn){await btn.click();await new Promise(r=>setTimeout(r,250))}}
   const bal=await p.$eval('#wallet',e=>e.textContent);ok(/[1-9١-٩]/.test(bal),'wallet earns points: '+bal);
   // wallet withdraw
   await p.click('#walletBtn');await new Promise(r=>setTimeout(r,200));ok(await p.$eval('#wdlg',e=>e.open),'wallet opens');
   await p.type('#wn','01012345678');await p.click('#wgo');await new Promise(r=>setTimeout(r,300));
   ok((await p.$eval('#wallet',e=>e.textContent)).replace(/[0٠]/g,'')==='' ,'balance zero after withdraw');
   await p.keyboard.press('Escape');
   // lang toggle
   await p.click('#lang');await new Promise(r=>setTimeout(r,200));ok(await p.$eval('html',e=>e.dir)!==(lang==='ar'?'rtl':'ltr'),'lang toggle flips dir');
   // overflow check
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'no horizontal overflow');
   await p.screenshot({path:`/tmp/qa/${name}.png`});
  }catch(e){fails++;console.log('ERR',name,e.message)}
  if(errs.length){fails++;console.log('JS errors',name,errs.slice(0,3))}
  await p.close();
 }
 await b.close();console.log(fails?'QA FAILS '+fails:'QA ALL PASS');process.exit(fails?1:0);
})();
