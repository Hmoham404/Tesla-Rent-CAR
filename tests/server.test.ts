import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {Readable} from 'node:stream';
import type {IncomingMessage,ServerResponse} from 'node:http';
import handler from '../api/[...route]';
import {defaultContent} from '../src/lib/content-model';

async function request(url:string,method='GET',body?:unknown,cookie='',origin='https://tesla.test'){
  const req=Object.assign(Readable.from(body?[JSON.stringify(body)]:[]),{url,method,headers:{host:'tesla.test',origin,cookie},socket:{remoteAddress:'test'}});
  const headers:Record<string,string>={};
  let result:any;
  const res={statusCode:200,setHeader:(key:string,value:string)=>{headers[key]=value},end:(value:string)=>{result=JSON.parse(value)}};
  await handler(req as unknown as IncomingMessage,res as unknown as ServerResponse);
  return {status:res.statusCode,headers,body:result};
}
beforeEach(()=>{
  vi.stubEnv('VERCEL','1');vi.stubEnv('ADMIN_ACCESS_CODE','test-only-access');
  vi.stubEnv('ADMIN_SESSION_SECRET','test-only-secret-at-least-32-characters');
  vi.stubEnv('VITE_SUPABASE_URL','https://database.test');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test-only-service-key');
});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()});
async function login(){const r=await request('/api/admin/login','POST',{code:'test-only-access'});return r.headers['Set-Cookie'].split(';')[0]}

it('protects admin mutations and issues secure server cookies',async()=>{
  expect((await request('/api/admin/content','PUT',defaultContent)).status).toBe(401);
  const r=await request('/api/admin/login','POST',{code:'test-only-access'});
  expect(r.status).toBe(200);expect(r.headers['Set-Cookie']).toMatch(/HttpOnly; SameSite=Strict/);expect(r.headers['Set-Cookie']).toContain('; Secure');
  expect((await request('/api/admin/content','PUT',defaultContent,await login(),'https://foreign.test')).status).toBe(403);
});
it('saves content to Supabase and rejects invalid prices before writing',async()=>{
  const upstream=vi.fn().mockResolvedValue(new Response(null,{status:204}));vi.stubGlobal('fetch',upstream);
  const cookie=await login();
  expect((await request('/api/admin/content','PUT',defaultContent,cookie)).status).toBe(200);
  expect(upstream.mock.calls[0][0]).toContain('/rest/v1/site_content?on_conflict=id');
  const invalid=structuredClone(defaultContent);invalid.vehicles[0].price=-10;
  expect((await request('/api/admin/content','PUT',invalid,cookie)).status).toBe(400);expect(upstream).toHaveBeenCalledTimes(1);
});
it('recalculates booking totals from the stored catalogue, ignoring client prices',async()=>{
  let stored:any;
  vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{
    if(url.includes('site_content'))return Response.json([{payload:defaultContent}]);
    stored=JSON.parse(String(init.body));return new Response(null,{status:204});
  }));
  const start=new Date(Date.now()+86400000*5).toISOString().slice(0,10),end=new Date(Date.now()+86400000*7).toISOString().slice(0,10);
  const r=await request('/api/bookings','POST',{vehicleId:defaultContent.vehicles[0].id,start,end,location:'Agence TESLA',name:'Test client',email:'test@example.com',phone:'+21621119123',insurance:false,total:1});
  expect(r.status).toBe(201);expect(stored.payload.total).toBe(defaultContent.vehicles[0].price*2);
  expect(stored.payload.status).toBe('En attente');expect(r.body.id).toBe(stored.id);
});
it('uploads WebP media to the public bucket through the server',async()=>{
  const upstream=vi.fn().mockResolvedValue(new Response(null,{status:200}));vi.stubGlobal('fetch',upstream);
  const cookie=await login();
  expect((await request('/api/admin/media','POST',{data:'data:image/png;base64,AAAA'},cookie)).status).toBe(503);
  const bytes=await import('sharp').then(({default:sharp})=>sharp({create:{width:2,height:2,channels:3,background:'#ffffff'}}).webp().toBuffer());
  const r=await request('/api/admin/media','POST',{data:'data:image/webp;base64,'+bytes.toString('base64')},cookie);
  expect(r.status).toBe(201);expect(r.body.url).toMatch(/^https:\/\/database.test\/storage\/v1\/object\/public\/site-media\/.+\.webp$/);expect(upstream).toHaveBeenCalledTimes(1);
});
