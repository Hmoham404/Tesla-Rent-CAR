# Mise en ligne Vercel — TESLA Rent Car

## Corriger l’erreur du dashboard

`Unexpected token 'T' ... is not valid JSON` signifie que `/api/admin/login` a renvoyé une page HTML ou un message texte au lieu du JSON attendu. La version corrigée utilise des fichiers de fonctions Vercel explicites dans `api/`. Les liens `/admin`, `/vehicules/...` et `/reservation/...` sont les seuls chemins renvoyés vers l’application React. Il faut **redéployer le nouveau code** : importer de nouveau `.env.local` ne modifie pas les fonctions du déploiement.

Après le redéploiement, ouvrez `https://votre-domaine.vercel.app/api/admin/session` dans le navigateur. Le résultat attendu, sans connexion, est un JSON avec HTTP **401** : `{"error":"Connexion administrateur requise."}`. Si vous voyez du HTML, vérifiez que Vercel a importé **la racine du projet TESLA**, avec le preset Vite, `npm run build`, `dist`, et que les huit fichiers du dossier `api/` sont présents dans le dépôt. Vérifiez aussi l’onglet **Functions** du déploiement Vercel.

## Variables Vercel

Ajoutez ces noms dans **Project → Settings → Environment Variables** pour Production, puis lancez **Redeploy**. Vite lit les variables `VITE_` lors de la compilation. Ne mettez jamais la clé `service_role` dans une variable `VITE_`.

```dotenv
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://ztabtbqtscjfvrautczj.supabase.co
VITE_CONTACT_EMAIL=tesla.rentcar.pro@gmail.com
VITE_WHATSAPP=21621119123
VITE_MAPS_URL=https://maps.app.goo.gl/ckuUGLpHTbmA3gPbA
ADMIN_ACCESS_CODE=<votre code administrateur privé>
ADMIN_SESSION_SECRET=<secret aléatoire de 32 caractères minimum>
SUPABASE_SERVICE_ROLE_KEY=<clé service_role de Supabase>
```

Le fichier local `.env.local` présent dans ce dossier contient `VITE_DATA_MODE`, le code et le secret admin, mais **pas** `VITE_SUPABASE_URL` ni `SUPABASE_SERVICE_ROLE_KEY`. En l’important tel quel, le site n’a donc pas la connexion nécessaire pour enregistrer les réservations et les changements du dashboard. Sa clé publishable ne peut pas remplacer la clé serveur `service_role`. Si vous restez en mode `demo`, les réservations sont enregistrées dans le navigateur de chaque visiteur et ne sont pas partagées.

## Base et images

Exécutez le fichier complet [supabase/SETUP.sql](supabase/SETUP.sql) dans le SQL Editor de Supabase. Il crée les tables `bookings`, `site_content`, le bucket `site-media`, et prépare le catalogue public initial. Il n’écrase pas le catalogue déjà enregistré. Le script peut être relancé.

Si vous ajoutez des véhicules ou des photos **localement** avant la mise en ligne, exécutez `npm run prepare:hosting`, puis incluez le nouveau `supabase/SETUP.sql` et les photos de `public/images/published/` dans le déploiement. Les nouvelles photos ajoutées **sur le dashboard en ligne** vont directement dans Supabase Storage.

## Contrôles

```sh
npm run build
npm test
npm run test:ui
npm run test:server
```

Une fois déployé : vérifiez `/api/content` (JSON), `/api/admin/session` (401 JSON), connectez-vous à `/admin`, ajoutez une photo test, puis consultez-la depuis un autre navigateur. Testez enfin une réservation et son apparition dans le dashboard.
