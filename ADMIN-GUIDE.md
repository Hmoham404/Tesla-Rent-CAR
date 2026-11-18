# Administration TESLA Rent Car

Ouvrez http://localhost:5173/admin et utilisez le code administrateur déjà configuré dans `.env.local` (`ADMIN_ACCESS_CODE`). Le code est vérifié par le serveur et la session expire après huit heures.

## Véhicules

- « Ajouter une voiture » ouvre la fiche : marque, modèle, catégorie, prix journalier, boîte, carburant, places, description et équipements.
- Choisissez une photo principale et jusqu’à douze photos supplémentaires. Vous pouvez importer des photos depuis cette fiche ou depuis la médiathèque.
- « Enregistrer le véhicule » publie la fiche et les images importées. Les véhicules « À la une » sont prioritaires sur l’accueil.
- « Masquer » retire la voiture du catalogue sans effacer ses informations. « Afficher » la remet en ligne.
- Les prix du formulaire de réservation et les calculs serveur utilisent ce catalogue.

## Médiathèque

Importez des JPG, PNG ou WebP (20 Mo maximum à l’entrée). Le navigateur les redimensionne à 1 600 pixels maximum et les convertit en WebP. Le serveur refuse les fichiers supérieurs à 2 Mo après compression.

Ajoutez une description et cliquez sur « Enregistrer les modifications ». Les photos publiées deviennent disponibles dans la galerie et pour les véhicules. « Retirer de la galerie » n’efface pas le fichier, afin de préserver les photos encore utilisées par une voiture ou le logo. Les images retirées occupent donc toujours de l’espace de stockage.

## Apparence

Dans « Configuration », choisissez les couleurs d’accent des modes jour et nuit, le logo et l’image de fond de l’accueil. Les deux aperçus montrent les couleurs avant publication. Enregistrez pour appliquer les changements au site. Le choix jour/nuit du visiteur reste mémorisé dans son navigateur.

## Stockage local et Vercel

En local, les données sont enregistrées dans `data/site-content.json` et les images dans `public/uploads/`. Sauvegardez ces deux emplacements ensemble. Ils sont exclus de Git. Les fichiers survivent au redémarrage de Vite. Les réservations restent dans le mode de stockage choisi précédemment ; en démonstration, elles sont toujours propres au navigateur.

Sur Vercel, le disque des fonctions n’est pas persistant. Le code utilise donc une ligne JSONB `site_content` dans Supabase et le bucket public `site-media` pour les images :

1. Exécutez `supabase/content.sql` dans votre projet Supabase.
2. Configurez `VITE_SUPABASE_URL` et **`SUPABASE_SERVICE_ROLE_KEY`** sur Vercel. La clé serveur ne doit jamais porter le préfixe `VITE_`.
3. Conservez `ADMIN_ACCESS_CODE` et `ADMIN_SESSION_SECRET` dans les variables serveur.
4. Déployez, puis connectez-vous à `/admin` pour publier votre catalogue et vos images.

Les données locales ne sont pas migrées automatiquement vers Supabase. Sans clé serveur, le site Vercel affiche le catalogue initial et refuse les enregistrements avec une explication. Le stockage Supabase n’a pas été testé sur le projet distant : la clé serveur n’est pas disponible dans cet espace.

La FAQ a été retirée du site. Les images et vidéos déposées directement dans `public/media` restent prises en charge par la galerie existante.
