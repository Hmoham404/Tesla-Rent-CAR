import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { useLanguage } from './i18n';
import WhatsAppIcon, { whatsappHref } from './components/WhatsAppIcon';

export const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL || 'tesla.rentcar.pro@gmail.com').trim();
export function emailHref(body = '') {
  return contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent('TESLA Rent Car — Contact')}&body=${encodeURIComponent(body)}` : '/#contact';
}
export const interfaceCopy = {
  fr: {night:'Mode nuit',day:'Mode jour',title:'Parlons de votre voyage.',text:'Une demande, une date, une envie particulière ? Écrivez à notre agence.',name:'Votre nom',message:'Votre message',send:'Ouvrir ma messagerie',hint:'Votre messagerie s’ouvre avec le message préparé. Vous confirmez ensuite son envoi.',missing:'L’adresse e-mail de l’agence sera ajoutée prochainement. Pour le moment, contactez-nous par téléphone.'},
  en: {night:'Dark mode',day:'Light mode',title:'Let’s plan your trip.',text:'A question, a date or a special request? Write to our agency.',name:'Your name',message:'Your message',send:'Open my email app',hint:'Your email app opens with a draft. You confirm sending it there.',missing:'The agency email address will be added soon. Please contact us by phone for now.'},
  it: {night:'Modalità notte',day:'Modalità giorno',title:'Parliamo del tuo viaggio.',text:'Una domanda, una data o una richiesta speciale? Scrivici.',name:'Il tuo nome',message:'Il tuo messaggio',send:'Apri la posta',hint:'La tua app di posta si apre con una bozza. Confermi tu l’invio.',missing:'L’indirizzo email sarà aggiunto a breve. Per ora contattaci per telefono.'},
  es: {night:'Modo noche',day:'Modo día',title:'Hablemos de tu viaje.',text:'¿Una pregunta, una fecha o una petición especial? Escríbenos.',name:'Tu nombre',message:'Tu mensaje',send:'Abrir mi correo',hint:'Se abre tu correo con un borrador. Tú confirmas el envío.',missing:'La dirección de correo se añadirá pronto. Por ahora, llámanos.'},
  tn: {night:'الوضع الليلي',day:'الوضع النهاري',title:'نحضّروا سفرتك مع بعضنا.',text:'عندك سؤال ولا طلب خاص؟ ابعثلنا إيميل.',name:'اسمك',message:'رسالتك',send:'حلّ تطبيق الإيميل',hint:'يتحلّ تطبيق الإيميل بالرسالة واجدة. إنت تأكّد الإرسال.',missing:'عنوان الإيميل يتزاد قريب. توّا تنجّم تتصل بينا بالتليفون.'},
};
export default function Contact() {
  const {lang,t}=useLanguage(); const c=interfaceCopy[lang];
  const [name,setName]=useState(''); const [message,setMessage]=useState('');
  function submit(event:FormEvent){event.preventDefault();if(contactEmail)window.location.href=emailHref(`${name}\n\n${message}`);}
  return <section id="contact" className="p-container t-contact p-section">
    <div><p className="p-eyebrow"><Mail size={18}/> {t.contact}</p><h2>{c.title}</h2><p>{c.text}</p>
      <div className="t-contact-methods">
        {contactEmail&&<a className="t-contact-email" href={emailHref()}><Mail size={20}/>{contactEmail}<ArrowUpRight size={18}/></a>}
        <a className="t-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer"><WhatsAppIcon/>WhatsApp</a>
      </div>
      <a className="t-contact-phone" href="tel:+21621119123"><Phone size={18}/><bdi>+216 21 119 123</bdi></a>
    </div>
    <form onSubmit={submit} className="t-contact-form">
      <label>{c.name}<input required maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>{c.message}<textarea required maxLength={3000} rows={4} value={message} onChange={e=>setMessage(e.target.value)}/></label>
      <p role={!contactEmail?'status':undefined}>{contactEmail?c.hint:c.missing}</p>
      <button className="p-button" disabled={!contactEmail} type="submit">{c.send}<ArrowUpRight size={18}/></button>
    </form>
  </section>;
}
