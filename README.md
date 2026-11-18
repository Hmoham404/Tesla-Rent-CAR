# TESLA Rent Car

Site de location à Monastir, réalisé avec **Vite, React, TypeScript, Tailwind CSS, Framer Motion** et composants de style shadcn/ui (Radix Dialog, CVA, clsx, tailwind-merge). Accueil clair, accents or et foncés, photographies réelles de Monastir et logo fourni. Le parcours public est traduit en tunisien (ar-TN, RTL), français, anglais, italien et espagnol, avec drapeaux SVG locaux et choix mémorisé. Le dashboard reste en français. Vite a été retenu conformément à la demande ; Next.js n’est pas utilisé.

## Démarrage

```sh
npm install
npm run dev
```

Ouvrir http://localhost:5173 et http://localhost:5173/admin.

Le fichier `.env.local` est déjà préparé sur ce poste. **Code local de démonstration : `TeslaGold2026!`**. Le remplacer pour la production. Les secrets administrateur ne sont jamais préfixés `VITE_` et ne sont jamais inclus dans le JavaScript client.

```sh
npm run build
npm test
npm run test:ui
```

## Fonctionnalités

- Accueil éditorial, collection filtrable par catégorie, marque/modèle et budget, tri de prix.
- Fiches détaillées, dates et heures, lieux distincts de départ/retour, options, estimation en dinars tunisiens, formulaire de demande et référence. L’estimation utilise des périodes de 24 heures commencées, avec une limite de 90 jours ; la règle est indiquée au client et le serveur recalcule le montant.
- WhatsApp +216 21 119 123 et emplacement exact fourni sur Google Maps : 35.7733196, 10.8352449.
- Carte réelle Google Maps avec modes satellite/plan, chargée à la demande ; lien distinct vers Google Earth centré sur l’agence pour l’exploration 3D. Aucune fausse carte en perspective. Le relief, les bâtiments 3D et Street View dépendent de la couverture locale. La carte intégrée reste une vue 2D.
- Dashboard protégé côté serveur par code : liste, recherche, filtres, changement de statut et export JSON des demandes.
- Adaptation mobile, navigation clavier, dialogs accessibles et respect des préférences de mouvement réduit.
- Recherche utilisable depuis l’accueil ou le catalogue, conservation des données lors du changement de langue, validation des coordonnées, affichage des horaires et du retour dans le dashboard.

## Mode local et Supabase

Par défaut `VITE_DATA_MODE=demo` : réservations conservées dans **le navigateur courant**, sans contacter l’agence ni envoyer d’e-mail. Les demandes d’un autre appareil ne seront pas visibles. Le mode est signalé dans le formulaire et le dashboard. Les dates du moteur servent à préparer une demande, pas à garantir une disponibilité en temps réel.

Pour activer les demandes réelles :

1. Exécuter `supabase/schema.sql` dans le SQL Editor du projet Supabase.
2. Définir `VITE_DATA_MODE=supabase` et conserver `VITE_SUPABASE_URL` avec l’URL racine `https://ztabtbqtscjfvrautczj.supabase.co` (sans `/rest/v1/`).
3. Définir `SUPABASE_SERVICE_ROLE_KEY` **côté serveur uniquement** dans les variables Vercel. La clé publishable fournie n’accorde pas les droits d’administration et ne permet pas de créer le schéma.
4. Définir un `ADMIN_ACCESS_CODE` long et aléatoire, ainsi qu’un `ADMIN_SESSION_SECRET` aléatoire d’au moins 32 caractères.
5. Redéployer le projet et tester une demande, sa référence, sa lecture et son changement de statut depuis l’admin.

La table contient une ligne par demande, un document **JSONB** et une date de création. Le catalogue reste un fichier JSON statique : aucune requête de base de données pour afficher les véhicules. JSONB garde le modèle simple ; il ne garantit pas un gain d’espace par rapport à des colonnes SQL. Les médias restent des fichiers et ne sont jamais enregistrés en base64 dans Postgres.

Les accès publics à la table sont révoqués. L’API serveur valide les champs et recalcule les montants depuis le catalogue. L’accès admin utilise un cookie signé HttpOnly, SameSite=Strict et Secure sur Vercel, valable 8 heures. Les tentatives de connexion sont limitées en mémoire par instance ; pour un service public à fort trafic, utiliser une limite distribuée et une protection anti-bot au niveau de l’hébergement. La clé service_role doit rester exclusivement dans les variables serveur.

## Déployer sur Vercel

Importer ce dossier dans un dépôt Git privé, puis importer le dépôt sur Vercel avec le preset **Vite** : commande `npm run build`, sortie `dist`. Le fichier `vercel.json` configure les liens directs React Router et laisse `/api/*` aux fonctions serveur. Node 24 est recommandé. Ajouter les variables de `.env.example` dans Vercel ; `.env.local` est ignoré par Git. Ne pas publier la clé serveur.

Pour garder une démonstration hébergée, laisser `VITE_DATA_MODE=demo`, mais configurer les deux variables administrateur serveur. En mode réel, les réservations sont partagées entre appareils grâce à Supabase. Aucun compte Vercel n’a été créé ou déployé automatiquement : le projet est prêt à être importé dans votre compte.

## Personnaliser les contenus

- Véhicules, prix et équipements : `src/data/vehicles.json` ; modification suivie d’un redéploiement. Le dashboard présente le catalogue, sans éditeur de flotte en ligne.
- Photos : `public/images/`, WebP. Les sept images automobiles occupent environ 800 Ko ; les deux vues de Monastir ajoutent environ 440 Ko. Remplacer la collection illustrative par les vrais véhicules avant publication commerciale.
- Logo : original fourni `public/2204e69a-ae19-472e-9649-47fb21a955d8.png`, conservé. Le site utilise `public/logo.webp` (environ 91 Ko). Régénérer avec `node scripts/optimize-logo.mjs` ou `node scripts/optimize-logo.mjs public/mon-nouveau-logo.png`.
- Traductions : `src/i18n.tsx` ; parcours public : `src/PublicSite.tsx` ; styles : `src/public.css` ; administration : `src/Admin.tsx`. Les libellés localisés ne modifient jamais les identifiants de véhicules ni les lieux enregistrés côté serveur.
- Coordonnées : `VITE_AGENCY_ADDRESS`, `VITE_WHATSAPP`, `VITE_MAPS_URL`. L’adresse postale n’a pas été inventée ; le lien fourni ouvre la bonne position.
- Facebook : les pages publiques principale, photos et vidéos ont été reconsultées le 18 novembre 2026. Leurs métadonnées ont permis de récupérer la photo de profil réelle dans `public/images/facebook-profile.webp`. Elles n’exposent ni photos de véhicules exploitables ni URLs de vidéos : le site propose des liens vers les onglets photos/vidéos officiels, sans prétendre avoir récupéré ces contenus. Les véhicules et prix du catalogue restent une démonstration explicite, pas un inventaire vérifié.
- Vidéos : aucune vidéo de l’agence disponible. Pour un ajout ultérieur, servir un MP4/WebM compressé depuis un stockage média et le charger à la demande avec une affiche ; ne pas mettre la vidéo dans le JSON.

## Photos d’illustration

Monastir : photos de Habib M’henni (marina, CC BY-SA 3.0) et Jihed M’hamed (Ribat, CC BY-SA 4.0), redimensionnées et converties en WebP. Les liens vers les originaux, les auteurs, les licences et les modifications figurent dans `public/credits.html`, accessible depuis le site. Les adaptations des images restent sous leurs licences respectives.

Fichiers téléchargés depuis Unsplash :

- Hero / Porsche : https://images.unsplash.com/photo-1503376780353-7e6692767b70
- Mercedes : https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8
- SUV : https://images.unsplash.com/photo-1519641471654-76ce0107ad1b
- BMW : https://images.unsplash.com/photo-1555215695-3004980ad54e
- Audi : https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6
- Citadine : https://images.unsplash.com/photo-1441148345475-03a2e82f9719

Les photos sont des illustrations et peuvent représenter une autre configuration ou un autre modèle. Ne pas les utiliser pour garantir un modèle réellement disponible.

## Limites de vérification

Le navigateur d’automatisation de cette session n’est pas disponible : pas de validation visuelle desktop/mobile. Les tests Vitest/JSDOM vérifient les cinq langues, le RTL, la persistance, les filtres, la conservation des dates/lieux, une réservation complète avec changement de langue et le lien cartographique exact. Les tests du calcul de séjour, la compilation TypeScript / Vite et les contrôles HTTP/API sont exécutés séparément. Les opérations Supabase réelles nécessitent le schéma et la clé serveur et n’ont pas été validées contre votre base.

L’audit npm signale une vulnérabilité ReDoS de `picomatch` dans les dépendances de développement de Vite (et ses dépendants). La dernière version disponible dans le registre consulté, 4.0.7, reste signalée ; ne pas appliquer une rétrogradation majeure de Vite à l’aveugle. Le build statique livré n’embarque pas ce scanner de fichiers. Recontrôler les mises à jour avant publication.


Refonte Titanium : composition blanche et corail, Tailwind, ic?nes Lucide, polices DM Serif Display et Plus Jakarta Sans. Le visuel `hero-car.webp` est un d?tourage assist? par IA de la photo Mercedes de d?monstration ; il ne prouve pas la disponibilit? de ce v?hicule dans la flotte.


Destinations: Monastir, Sousse, Hammamet, Sidi Bou Said. Local WebP images; credits and CC BY-SA licenses in public/credits.html. Destination cards open an in-site photo preview and link to Google Maps. The agency gallery only appears when public/media contains files, preventing duplicate destination photos.
Contact: tesla.rentcar.pro@gmail.com (mailto draft, no automatic server delivery) and WhatsApp +21621119123. Theme preference persists in tesla-theme.


## Visual administration
See [ADMIN-GUIDE.md](ADMIN-GUIDE.md) for the vehicle editor, image library, day/night accent colours, local JSON storage and Supabase setup on Vercel. The FAQ is removed. Content API checks: `node tests/content-smoke.mjs` with the local server running.
