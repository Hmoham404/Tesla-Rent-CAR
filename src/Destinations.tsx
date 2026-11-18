import { useState } from 'react';
import { ArrowUpRight, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog } from './components/ui/dialog';
import { useLanguage } from './i18n';
import './destinations.css';

const copy = {
  fr:{label:'LE GOÛT DE L’ÉVASION',title:'Une route. Mille découvertes.',intro:'De Monastir aux ruelles de Sidi Bou Saïd, choisissez votre prochaine escale en Tunisie.',open:'Découvrir',map:'Voir sur la carte',cta:'Trouver ma voiture',note:'Des idées de voyage au départ de Monastir. Livraison dans une autre ville sur demande, à confirmer avec l’agence.',details:['La marina, le Ribat et la Méditerranée pour horizon.','Une escale entre médina, promenades et port animé.','Les toits de la médina, la douceur du littoral.','Le bleu et le blanc, au-dessus du golfe de Tunis.'],tags:['Mer & patrimoine','Ville & culture','Évasion en bord de mer','Panoramas & ruelles']},
  en:{label:'THE ART OF GETTING AWAY',title:'One road. Endless discoveries.',intro:'From Monastir to the lanes of Sidi Bou Saïd, choose your next Tunisian escape.',open:'Explore',map:'View on map',cta:'Find my car',note:'Travel inspiration from Monastir. Delivery to another city is on request and must be confirmed with the agency.',details:['The marina, the Ribat and a Mediterranean horizon.','A stop between the medina, promenades and lively harbour.','Medina rooftops and a gentle coastal escape.','Blue and white above the Gulf of Tunis.'],tags:['Sea & heritage','City & culture','Coastal escape','Views & lanes']},
  it:{label:'IL PIACERE DI PARTIRE',title:'Una strada. Mille scoperte.',intro:'Da Monastir ai vicoli di Sidi Bou Saïd, scegli la tua prossima tappa in Tunisia.',open:'Scopri',map:'Vedi sulla mappa',cta:'Trova la mia auto',note:'Idee di viaggio da Monastir. Consegna in altre città su richiesta, da confermare con l’agenzia.',details:['La marina, il Ribat e l’orizzonte mediterraneo.','Una tappa tra medina, passeggiate e porto vivace.','I tetti della medina e la quiete del litorale.','Il blu e il bianco sopra il golfo di Tunisi.'],tags:['Mare & patrimonio','Città & cultura','Fuga sul mare','Panorami & vicoli']},
  es:{label:'EL PLACER DE ESCAPAR',title:'Una ruta. Mil descubrimientos.',intro:'De Monastir a las calles de Sidi Bou Saïd, elige tu próxima parada en Túnez.',open:'Descubrir',map:'Ver en el mapa',cta:'Encontrar mi coche',note:'Ideas de viaje desde Monastir. Entrega en otras ciudades bajo petición y confirmación de la agencia.',details:['La marina, el Ribat y el horizonte mediterráneo.','Una parada entre medina, paseos y un puerto animado.','Los tejados de la medina y la calma del litoral.','Azul y blanco sobre el golfo de Túnez.'],tags:['Mar & patrimonio','Ciudad & cultura','Escapada costera','Vistas & calles']},
  tn:{label:'اكتشف بلادنا',title:'طريق وحدة، برشا اكتشافات.',intro:'من المنستير لزنقة سيدي بوسعيد، اختار وجهتك الجاية في تونس.',open:'اكتشف',map:'شوف في الخريطة',cta:'اختار كرهبتك',note:'أفكار لسفرتك من المنستير. التوصيل لمدينة أخرى بالطلب وبعد التأكيد مع الوكالة.',details:['المارينا والرباط والبحر قدّامك.','دورة بين المدينة العربي والميناء.','سطوح المدينة العربي وراحة على البحر.','الأزرق والأبيض فوق خليج تونس.'],tags:['بحر وتراث','مدينة وثقافة','راحة على البحر','مناظر وزنق']},
};
const cities=[
  {name:'Monastir',ar:'المنستير',image:'/images/monastir-marina.webp',query:'Marina Monastir Tunisia'},
  {name:'Sousse',ar:'سوسة',image:'/images/sousse.webp',query:'Sousse Tunisia'},
  {name:'Hammamet',ar:'الحمامات',image:'/images/hammamet.webp',query:'Medina Hammamet Tunisia'},
  {name:'Sidi Bou Saïd',ar:'سيدي بوسعيد',image:'/images/sidi-bou-said.webp',query:'Sidi Bou Said Tunisia'},
];
export default function Destinations(){
  const {lang,t}=useLanguage();const c=copy[lang];const [selected,setSelected]=useState<number|null>(null);
  const city=selected===null?null:cities[selected];
  return <section id="monastir" className="t-destinations p-section">
    <div className="p-container">
      <header className="t-destination-heading"><div><p className="p-eyebrow"><span/>{c.label}</p><h2>{c.title}</h2></div><p>{c.intro}</p></header>
      <div className="t-destination-grid">{cities.map((city,index)=><article className="t-destination-card" key={city.name}>
        <button type="button" className="t-destination-photo" onClick={()=>setSelected(index)} aria-label={`${c.open} ${lang==='tn'?city.ar:city.name}`}>
          <img src={city.image} alt={lang==='tn'?city.ar:city.name} width="960" height="640" loading="lazy"/>
          <span className="t-destination-number">0{index+1} / TUNISIA</span><span className="t-destination-expand"><Plus size={20}/></span>
          <span className="t-destination-name"><MapPin size={16}/>{lang==='tn'?city.ar:city.name}</span>
        </button>
        <div className="t-destination-info"><span>{c.tags[index]}</span><p>{c.details[index]}</p><button onClick={()=>setSelected(index)}>{c.open}<ArrowUpRight size={17}/></button></div>
      </article>)}</div>
      <div className="t-destination-bottom"><p>{c.note}</p><Link to="/vehicules" className="p-button">{c.cta}<ArrowUpRight size={17}/></Link></div>
      <a className="t-destination-credit" href="/credits.html" target="_blank" rel="noreferrer">{t.photoCredit} · Wikimedia Commons ↗</a>
    </div>
    <Dialog open={city!==null} onOpenChange={open=>!open&&setSelected(null)} title={city?(lang==='tn'?city.ar:city.name):c.title}>
      {city&&selected!==null&&<div className="t-destination-dialog"><img src={city.image} alt={lang==='tn'?city.ar:city.name}/><p>{c.details[selected]}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.query)}`} target="_blank" rel="noreferrer"><MapPin size={17}/>{c.map}<ArrowUpRight size={17}/></a></div>}
    </Dialog>
  </section>;
}
