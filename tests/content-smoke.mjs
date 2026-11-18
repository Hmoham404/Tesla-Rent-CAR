import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const origin='http://localhost:5173';
const request=(route,options={})=>fetch(origin+route,{...options,signal:AbortSignal.timeout(15000)});
const json=(body,method='POST',headers={})=>({method,headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const original=await request('/api/content');assert.equal(original.status,200);const {content}=await original.json();
const hadFile=fs.existsSync('data/site-content.json');
assert.equal((await request('/api/admin/content',json(content,'PUT'))).status,401);
assert.equal((await request('/api/admin/media',json({data:'bad'}))).status,401);
const code=fs.readFileSync('.env.local','utf8').match(/^ADMIN_ACCESS_CODE=(.+)$/m)[1].trim();
const login=await request('/api/admin/login',json({code}));assert.equal(login.status,200);const headers={Cookie:login.headers.get('set-cookie').split(';')[0]};
let uploaded;
try{
 const next=structuredClone(content);next.theme.light='#b02344';next.vehicles.push({...next.vehicles[0],id:'test-admin-vehicle',brand:'Test',name:'Admin smoke',price:480,active:true});
 assert.equal((await request('/api/admin/content',json(next,'PUT',headers))).status,200);
 const published=await (await request('/api/content')).json();assert.equal(published.content.theme.light,'#b02344');assert.equal(published.content.vehicles.at(-1).price,480);
 const disk=JSON.parse(fs.readFileSync('data/site-content.json','utf8'));assert.equal(disk.vehicles.at(-1).id,'test-admin-vehicle');
 const invalid=structuredClone(next);invalid.vehicles.at(-1).image='javascript:alert(1)';assert.equal((await request('/api/admin/content',json(invalid,'PUT',headers))).status,400);
 assert.equal((await request('/api/admin/content',json(next,'PUT',{...headers,Origin:'https://invalid.example'}))).status,403);
 const bytes=await sharp({create:{width:16,height:16,channels:3,background:'#b02344'}}).webp().toBuffer();
 const upload=await request('/api/admin/media',json({data:'data:image/webp;base64,'+bytes.toString('base64')},'POST',headers));assert.equal(upload.status,201);uploaded=(await upload.json()).url;assert.match(uploaded,/^\/uploads\/[a-f0-9-]+\.webp$/);
 const image=await request(uploaded);assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/webp/);
 next.media.push({id:'test-media',url:uploaded,alt:'Test image'});assert.equal((await request('/api/admin/content',json(next,'PUT',headers))).status,200);
 assert.equal((await (await request('/api/content')).json()).content.media.at(-1).url,uploaded);
 console.log('Content API checks passed: auth, CSRF, validation, persistent JSON, fleet, theme, WebP upload and gallery.');
}finally{
 const restored=await request('/api/admin/content',json(content,'PUT',headers));assert.equal(restored.status,200,'restore original content');
 if(!hadFile)fs.unlinkSync(path.resolve('data/site-content.json'));
 if(uploaded&&/^\/uploads\/[a-f0-9-]+\.webp$/.test(uploaded))fs.unlinkSync(path.resolve('public'+uploaded));
}
