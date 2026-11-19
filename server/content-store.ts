import { mkdir,readFile,writeFile,rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {defaultContent,validateContent,type SiteContent} from '../src/lib/content-model.js';
const file=()=>path.join(process.cwd(),'data','site-content.json');
async function remote(resource:string,init:RequestInit={}){
  const url=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw Error('Stockage non configuré : ajoutez VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Vercel, puis exécutez supabase/SETUP.sql.');
  const response=await fetch(`${url}/${resource}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,...init.headers}});
  if(!response.ok)throw Error('Stockage Supabase indisponible. Vérifiez la configuration et supabase/SETUP.sql.');
  return response;
}
export async function readContent():Promise<SiteContent>{
  if(process.env.VERCEL){
    if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.VITE_SUPABASE_URL){
      if(process.env.VITE_DATA_MODE==='supabase')throw Error('Supabase non configuré : ajoutez VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Vercel.');
      return defaultContent;
    }
    const res=await remote('rest/v1/site_content?id=eq.main&select=payload');const rows=await res.json();
    if(!rows.length)return defaultContent;validateContent(rows[0].payload);return rows[0].payload;
  }
  try{const c=JSON.parse(await readFile(file(),'utf8'));validateContent(c);return c;}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return defaultContent;throw e;}
}
export async function writeContent(value:unknown){
  validateContent(value);
  if(process.env.VERCEL){await remote('rest/v1/site_content?on_conflict=id',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:'main',payload:value})});return;}
  await mkdir(path.dirname(file()),{recursive:true});const tmp=file()+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(value));await rename(tmp,file());
}
export async function uploadImage(data:unknown){
  if(typeof data!=='string'||!/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(data))throw Error('Image WebP requise.');
  const bytes=Buffer.from(data.split(',')[1],'base64');
  if(bytes.length>2*1024*1024||bytes.length<12||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Image invalide ou supérieure à 2 Mo.');
  const name=randomUUID()+'.webp';
  if(process.env.VERCEL){await remote(`storage/v1/object/site-media/${name}`,{method:'POST',headers:{'Content-Type':'image/webp'},body:bytes});return `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/site-media/${name}`;}
  const dir=path.join(process.cwd(),'public','uploads');await mkdir(dir,{recursive:true});await writeFile(path.join(dir,name),bytes);return '/uploads/'+name;
}
