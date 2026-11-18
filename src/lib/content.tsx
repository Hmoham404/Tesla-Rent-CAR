import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {defaultContent,type SiteContent,validateContent} from './content-model';
import {api} from './store';
const Context=createContext({content:defaultContent,loading:true,error:'',save:async (_c:SiteContent)=>{}});
export function ContentProvider({children}:{children:ReactNode}){
  const [content,setContent]=useState(defaultContent),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{let live=true;api('content',undefined,'GET').then(r=>{validateContent(r.content);if(live)setContent(r.content)}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
  async function save(next:SiteContent){validateContent(next);await api('admin/content',next,'PUT');setContent(next);setError('');}
  return <Context.Provider value={{content,loading,error,save}}>{children}</Context.Provider>;
}
export const useContent=()=>useContext(Context);
export const useFleet=()=>useContent().content.vehicles.filter(v=>v.active!==false);
export function themeStyle(content:SiteContent,dark:boolean){const color=dark?content.theme.dark:content.theme.light;const hex=color.slice(1);const rgb=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);const l=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];return {'--accent':color,'--accent-hover':color,'--accent-soft':`color-mix(in srgb, ${color} 12%, ${dark?'#101114':'white'})`,'--accent-text':l>.179?'#111111':'#ffffff'} as React.CSSProperties;}
