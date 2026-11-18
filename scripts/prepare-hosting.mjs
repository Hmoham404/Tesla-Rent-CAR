import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
// Export public content only. Never export reservations or .env files.
const root=process.cwd();
let content;
try { content=JSON.parse(await readFile(path.join(root,'data/site-content.json'),'utf8')); }
catch(e) { if(e.code!=='ENOENT')throw e; content={vehicles:JSON.parse(await readFile('src/data/vehicles.json','utf8')),media:[],theme:{light:'#c61f32',dark:'#f04b60',logo:'/logo.webp',hero:'/images/monastir-ribat.webp'}}; }
const images=new Set();
function rewrite(value){
  if(typeof value==='string'&&value.startsWith('/uploads/')){
    if(!/^\/uploads\/[a-f0-9-]{36}\.webp$/.test(value))throw Error('Invalid local image path');
    images.add(value); return value.replace('/uploads/','/images/published/');
  }
  if(Array.isArray(value))return value.map(rewrite);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewrite(v)]));
  return value;
}
const snapshot=rewrite(content);
await mkdir('public/images/published',{recursive:true});
for(const image of images)await copyFile(path.join(root,'public',image.slice(1)),path.join(root,'public/images/published',path.basename(image)));
const schema=await readFile('supabase/setup-template.sql','utf8');
const payload=JSON.stringify(snapshot).replaceAll("'","''");
await writeFile('supabase/SETUP.sql',schema+`\n-- Initial public catalogue; an existing catalogue is preserved.\ninsert into public.site_content (id,payload) values ('main','${payload}'::jsonb)\non conflict (id) do nothing;\ncommit;\n`);
console.log(`SETUP.sql ready: ${snapshot.vehicles.length} vehicles, ${images.size} local images packaged. Existing local data unchanged.`);
