import {useEffect,useState,type FormEvent} from 'react';
import {CarFront,ImagePlus,Palette,Plus,Save,Upload,Eye,Archive,RotateCcw,Check} from 'lucide-react';
import {useContent,themeStyle} from './lib/content';
import {defaultContent,type Vehicle,type SiteContent} from './lib/content-model';
import {api} from './lib/store';

async function compress(file:File):Promise<string>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('Choisissez un JPG, PNG ou WebP de moins de 20 Mo.');
  const bitmap=await createImageBitmap(file);try{
    const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);
    const context=canvas.getContext('2d');if(!context)throw Error('Conversion image indisponible.');context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const data=canvas.toDataURL('image/webp',.82);if(!data.startsWith('data:image/webp;')||data.length>2800000)throw Error('Image trop lourde après compression. Choisissez une image plus petite.');return data;
  }finally{bitmap.close();}
}
const emptyCar=():Vehicle=>({id:crypto.randomUUID(),brand:'',name:'',category:'Citadine',price:90,image:'',images:[],fuel:'Essence',transmission:'Automatique',seats:5,tag:'',featured:false,active:true,description:'',features:[]});
export default function ContentEditor({section,onDirty}:{section:string;onDirty:(dirty:boolean)=>void}){
  const {content,save,loading,error:loadError}=useContent();
  const [draft,setDraft]=useState<SiteContent>(content),[editing,setEditing]=useState<Vehicle|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[dirty,setDirty]=useState(false);
  useEffect(()=>{setDraft(content);setDirty(false);onDirty(false)},[content,onDirty]);
  useEffect(()=>{const before=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before)},[dirty]);
  function change(next:SiteContent){setDraft(next);setDirty(true);onDirty(true);setNotice('');}
  async function publish(next=draft){setBusy(true);setError('');setNotice('');try{await save(next);setNotice('Modifications enregistrées. Le site est à jour.');return true}catch(e){setError((e as Error).message);return false}finally{setBusy(false)}}
  async function upload(files:FileList|null){if(!files?.length)return;setBusy(true);setError('');setNotice('');const added=[];try{for(const file of Array.from(files).slice(0,12)){const result=await api('admin/media',{data:await compress(file)});added.push({id:crypto.randomUUID(),url:result.url,alt:file.name.replace(/\.[^.]+$/,'').slice(0,200)||'TESLA Rent Car'});}change({...draft,media:[...draft.media,...added]});setNotice('Images importées. Enregistrez les modifications pour les publier.');}catch(e){if(added.length)change({...draft,media:[...draft.media,...added]});setError((e as Error).message)}finally{setBusy(false)}}
  const images=Array.from(new Set([...draft.media.map(m=>m.url),...draft.vehicles.flatMap(v=>[v.image,...v.images||[]]),defaultContent.theme.logo,defaultContent.theme.hero])).filter(Boolean);
  async function submitCar(event:FormEvent){event.preventDefault();if(!editing)return;if(!editing.image){setError('Choisissez une photo principale.');return;}const clean={...editing,brand:editing.brand.trim(),name:editing.name.trim(),features:editing.features.map(f=>f.trim()).filter(Boolean)};const next={...draft,vehicles:draft.vehicles.some(v=>v.id===clean.id)?draft.vehicles.map(v=>v.id===clean.id?clean:v):[...draft.vehicles,clean]};if(await publish(next))setEditing(null);}
  function field<K extends keyof Vehicle>(key:K,value:Vehicle[K]){setEditing(v=>v?{...v,[key]:value}:null);setDirty(true);onDirty(true);}
  if(loading)return <p>Chargement du contenu…</p>;
  if(loadError)return <p role="alert" className="cms-alert">Le contenu n’a pas pu être chargé : {loadError}. Rechargez la page avant de modifier le site.</p>;
  return <section className="cms-editor">
    <div className="cms-toolbar"><div><span className="cms-dot"/>{dirty?'Modifications non enregistrées':'Contenu synchronisé'}<small>Catalogue, images et identité du site</small></div><button className="cms-primary" disabled={busy||!!editing} onClick={()=>publish()}><Save size={17}/>{busy?'Enregistrement…':'Enregistrer les modifications'}</button></div>
    {error&&<p role="alert" className="cms-alert">{error}</p>}{notice&&<p role="status" className="cms-success"><Check size={17}/>{notice}</p>}
    {section==='Véhicules'&&<>
      <div className="cms-section-title"><div><h2>Votre flotte</h2><p>{draft.vehicles.length} véhicules · Gérez vos photos, tarifs et disponibilités.</p></div><button className="cms-primary" disabled={busy} onClick={()=>{setEditing(emptyCar());setError('')}}><Plus size={18}/>Ajouter une voiture</button></div>
      {editing&&<form className="cms-car-form" onSubmit={submitCar}>
        <h2>{draft.vehicles.some(v=>v.id===editing.id)?'Modifier le véhicule':'Nouveau véhicule'}</h2>
        <div className="cms-fields">
          <label>Marque<input required maxLength={80} value={editing.brand} onChange={e=>field('brand',e.target.value)}/></label>
          <label>Modèle<input required maxLength={100} value={editing.name} onChange={e=>field('name',e.target.value)}/></label>
          <label>Catégorie<select value={editing.category} onChange={e=>field('category',e.target.value)}>{['Citadine','Berline','SUV','Sport','Break','Monospace','Utilitaire'].map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Prix / jour (TND)<input required type="number" min="1" max="10000" step="0.01" value={editing.price} onChange={e=>field('price',Number(e.target.value))}/></label>
          <label>Boîte<select value={editing.transmission} onChange={e=>field('transmission',e.target.value)}><option>Automatique</option><option>Manuelle</option></select></label>
          <label>Carburant<select value={editing.fuel} onChange={e=>field('fuel',e.target.value)}>{['Essence','Diesel','Hybride','Électrique'].map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Places<input required type="number" min="1" max="12" value={editing.seats} onChange={e=>field('seats',Number(e.target.value))}/></label>
          <label>Accroche<input maxLength={150} value={editing.tag} onChange={e=>field('tag',e.target.value)}/></label>
        </div>
        <label>Description<textarea rows={3} maxLength={3000} value={editing.description} onChange={e=>field('description',e.target.value)}/></label>
        <label>Équipements (un par ligne)<textarea rows={3} value={editing.features.join('\n')} onChange={e=>field('features',e.target.value.split('\n'))}/></label>
        <fieldset><legend>Photo principale</legend><div className="cms-image-picker">{images.map(url=><button key={url} type="button" aria-label={'Photo principale '+url} aria-pressed={editing.image===url} onClick={()=>field('image',url)}><img src={url} alt=""/>{editing.image===url&&<Check size={18}/>}</button>)}</div></fieldset>
        <fieldset><legend>Photos supplémentaires (12 maximum)</legend><div className="cms-image-picker">{images.filter(url=>url!==editing.image).map(url=><button key={url} type="button" aria-label={'Photo supplémentaire '+url} aria-pressed={editing.images?.includes(url)||false} onClick={()=>{const current=editing.images||[];if(current.includes(url))field('images',current.filter(v=>v!==url));else if(current.length<12)field('images',[...current,url]);}}><img src={url} alt=""/>{editing.images?.includes(url)&&<Check size={18}/>}</button>)}</div></fieldset>
        <label className="cms-upload"><ImagePlus size={20}/>Importer des photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>{void upload(e.target.files);e.target.value=''}}/></label>
        <div className="cms-checks"><label><input type="checkbox" checked={editing.active!==false} onChange={e=>field('active',e.target.checked)}/>Visible dans le catalogue</label><label><input type="checkbox" checked={editing.featured} onChange={e=>field('featured',e.target.checked)}/>À la une</label></div>
        <div className="cms-actions"><button className="cms-primary" disabled={busy} type="submit"><Save size={17}/>Enregistrer le véhicule</button><button type="button" disabled={busy} onClick={()=>{setEditing(null);setDirty(JSON.stringify(draft)!==JSON.stringify(content));onDirty(JSON.stringify(draft)!==JSON.stringify(content));}}>Annuler</button></div>
      </form>}
      <div className="cms-vehicle-grid">{draft.vehicles.map(v=><article key={v.id}><div className="cms-vehicle-photo"><img src={v.image} alt={`${v.brand} ${v.name}`}/><span>{v.active===false?'Masqué':'Publié'}</span></div><div><small>{v.brand}</small><h3>{v.name}</h3><p>{v.category} · {v.transmission} · {v.seats} places</p><strong>{v.price} <small>TND / jour</small></strong><div className="cms-actions"><button disabled={busy} onClick={()=>setEditing({...v})}><CarFront size={16}/>Modifier</button><button disabled={busy} onClick={()=>publish({...draft,vehicles:draft.vehicles.map(c=>c.id===v.id?{...c,active:c.active===false}:c)})}>{v.active===false?<Eye size={16}/>:<Archive size={16}/>} {v.active===false?'Afficher':'Masquer'}</button></div></div></article>)}</div>
    </>}
    {section==='Médiathèque'&&<>
      <div className="cms-section-title"><div><h2>Vos images, au même endroit.</h2><p>Import JPG, PNG ou WebP · Compression automatique · 1 600 px maximum.</p></div></div>
      <label className="cms-upload cms-upload-large"><Upload size={28}/><strong>Ajouter des images</strong><span>Les images publiées apparaissent aussi dans la galerie du site.</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>{void upload(e.target.files);e.target.value=''}}/></label>
      <div className="cms-media-grid">{draft.media.map(m=><article key={m.id}><img src={m.url} alt={m.alt}/><label>Description de l’image<input maxLength={200} value={m.alt} onChange={e=>change({...draft,media:draft.media.map(x=>x.id===m.id?{...x,alt:e.target.value}:x)})}/></label><button disabled={busy} onClick={()=>change({...draft,media:draft.media.filter(x=>x.id!==m.id)})}>Retirer de la galerie</button></article>)}</div>
      {!draft.media.length&&<p className="cms-empty">Importez vos premières photos. Elles seront disponibles pour vos véhicules et la galerie.</p>}
    </>}
    {section==='Configuration'&&<>
      <div className="cms-section-title"><div><h2>Une identité à votre image.</h2><p>Choisissez vos couleurs et vos visuels. Enregistrez pour les appliquer au site.</p></div><Palette size={28}/></div>
      <div className="cms-design-grid"><div className="cms-settings">
        {(['light','dark'] as const).map(mode=><label key={mode}>{mode==='light'?'Couleur du mode jour':'Couleur du mode nuit'}<div className="cms-color"><input type="color" aria-label={mode==='light'?'Couleur du mode jour':'Couleur du mode nuit'} value={draft.theme[mode]} onChange={e=>change({...draft,theme:{...draft.theme,[mode]:e.target.value}})}/><code>{draft.theme[mode]}</code></div></label>)}
        <label>Logo<select value={draft.theme.logo} onChange={e=>change({...draft,theme:{...draft.theme,logo:e.target.value}})}>{images.map(url=><option key={url} value={url}>{draft.media.find(m=>m.url===url)?.alt||url.split('/').pop()}</option>)}</select></label>
        <label>Image de fond à l’accueil<select value={draft.theme.hero} onChange={e=>change({...draft,theme:{...draft.theme,hero:e.target.value}})}>{images.map(url=><option key={url} value={url}>{draft.media.find(m=>m.url===url)?.alt||url.split('/').pop()}</option>)}</select></label>
        <button onClick={()=>change({...draft,theme:{...defaultContent.theme}})}><RotateCcw size={16}/>Rétablir l’identité rouge</button>
      </div><div className="cms-previews">{(['light','dark'] as const).map(mode=><div key={mode} className={'cms-preview '+mode} style={themeStyle(draft,mode==='dark')}><small>APERÇU · {mode==='light'?'JOUR':'NUIT'}</small><h3>Votre prochain voyage<br/><em style={{color:draft.theme[mode]}}>commence ici.</em></h3><span style={{background:draft.theme[mode],color:'var(--accent-text)'}}>Réserver une voiture →</span></div>)}</div></div>
    </>}
  </section>;
}
