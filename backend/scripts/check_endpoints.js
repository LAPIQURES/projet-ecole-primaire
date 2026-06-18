const http = require('http');
const host = 'localhost';
const port = 5000;
const paths = ['/auth/me','/messages','/bus','/stats','/stats/dashboard'];

function get(path){
  return new Promise(resolve=>{
    const req = http.get({host,port,path,timeout:5000}, res=>{
      let body='';
      res.on('data',c=>body+=c);
      res.on('end',()=>resolve({path,status:res.statusCode,body:body.toString()}));
    });
    req.on('error',e=>resolve({path,error:e.message}));
    req.on('timeout',()=>{req.abort(); resolve({path,error:'timeout'});});
  });
}

(async()=>{
  for(const p of paths){
    console.log('\n===',p);
    const r = await get(p);
    if(r.error) console.log('ERROR:', r.error);
    else {
      console.log('STATUS:', r.status);
      const out = r.body && r.body.length>1000 ? r.body.slice(0,1000)+"... (truncated)" : (r.body||'<no-body>');
      console.log('BODY:', out);
    }
  }
})();
