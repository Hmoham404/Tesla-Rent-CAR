import seed from '../data/vehicles.json';
export type Vehicle = typeof seed[number] & { images?: string[]; active?: boolean };
export type Media = {id:string;url:string;alt:string};
export type SiteContent = {vehicles:Vehicle[];media:Media[];theme:{light:string;dark:string;logo:string;hero:string}};
export const defaultContent:SiteContent={vehicles:seed,media:[],theme:{light:'#c61f32',dark:'#f04b60',logo:'/logo.webp',hero:'/images/monastir-ribat.webp'}};
export function validImage(value:unknown):value is string{return typeof value==='string' && value.length<1500 && (/^\/(images|media|uploads)\/[a-zA-Z0-9_.%/-]+$/.test(value)||value==='/logo.webp'||/^https:\/\/[^\s<>"']+$/.test(value));}
export function validateContent(value:unknown):asserts value is SiteContent {
  const c=value as SiteContent;
  const text=(v:unknown,n:number)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
  if(!c||!Array.isArray(c.vehicles)||c.vehicles.length>200||!Array.isArray(c.media)||c.media.length>300||!c.theme||!/^#[a-f0-9]{6}$/i.test(c.theme.light)||!/^#[a-f0-9]{6}$/i.test(c.theme.dark)||!validImage(c.theme.logo)||!validImage(c.theme.hero))throw Error('Contenu ou couleurs invalides.');
  const ids=new Set<string>();
  for(const v of c.vehicles){
    if(!v||!text(v.id,80)||!/^[a-z0-9-]+$/.test(v.id)||ids.has(v.id)||!text(v.brand,80)||!text(v.name,100)||!text(v.category,50)||!Number.isFinite(v.price)||v.price<1||v.price>10000||!Number.isInteger(v.seats)||v.seats<1||v.seats>12||!validImage(v.image)||!['Automatique','Manuelle'].includes(v.transmission)||!['Essence','Diesel','Électrique','Hybride'].includes(v.fuel)||typeof v.description!=='string'||v.description.length>3000||typeof v.tag!=='string'||v.tag.length>150||typeof v.featured!=='boolean'||(v.active!==undefined&&typeof v.active!=='boolean')||!Array.isArray(v.features)||v.features.length>30||v.features.some(f=>!text(f,100))||(v.images!==undefined&&(!Array.isArray(v.images)||v.images.length>12||v.images.some(f=>!validImage(f)))))throw Error('Fiche véhicule invalide : vérifiez les champs, le prix et les images.');
    ids.add(v.id);
  }
  for(const m of c.media)if(!m||!text(m.id,80)||!validImage(m.url)||!text(m.alt,200))throw Error('Image de médiathèque invalide.');
}
