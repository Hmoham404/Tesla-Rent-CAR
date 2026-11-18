import React from 'react';
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import App from '../src/App';
import {defaultContent} from '../src/lib/content-model';
let saved=structuredClone(defaultContent);
beforeEach(()=>{localStorage.clear();saved=structuredClone(defaultContent);vi.stubGlobal('fetch',vi.fn(async (url:string,options?:RequestInit)=>{
 if(url==='/api/content')return new Response(JSON.stringify({content:saved}));
 if(url==='/api/admin/content'){saved=JSON.parse(options!.body as string);return new Response(JSON.stringify({ok:true}));}
 if(url==='/api/admin/session')return new Response(JSON.stringify({ok:true}));
 return new Response('{}');
}));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('adds a vehicle through admin, publishes it and applies custom colours on the public site',async()=>{
 render(<MemoryRouter initialEntries={['/admin']}><App/></MemoryRouter>);
 fireEvent.click(await screen.findByRole('button',{name:'Véhicules'}));
 fireEvent.click(await screen.findByRole('button',{name:'Ajouter une voiture'}));
 fireEvent.change(screen.getByLabelText('Marque'),{target:{value:'Renault'}});
 fireEvent.change(screen.getByLabelText('Modèle'),{target:{value:'Clio Test'}});
 fireEvent.change(screen.getByLabelText('Prix / jour (TND)'),{target:{value:'480'}});
 fireEvent.click(screen.getAllByRole('button',{name:/Photo principale/})[0]);
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer le véhicule'}));
 await waitFor(()=>expect(saved.vehicles.some(v=>v.name==='Clio Test')).toBe(true));
 await screen.findByRole('heading',{name:'Clio Test'});
 fireEvent.click(screen.getByRole('button',{name:'Configuration'}));
 fireEvent.change(screen.getByLabelText('Couleur du mode jour'),{target:{value:'#123456'}});
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer les modifications'}));
 await waitFor(()=>expect(saved.theme.light).toBe('#123456'));
 cleanup();render(<MemoryRouter initialEntries={['/vehicules']}><App/></MemoryRouter>);
 await screen.findByRole('heading',{name:'Clio Test'});
 expect((document.querySelector('.public-site') as HTMLElement).style.getPropertyValue('--accent')).toBe('#123456');
 expect(document.querySelector('.p-faq')).toBeNull();
});
