# SamaSons

Bibliothèque musicale publique en lecture seule pour les visiteurs, administrable par un seul compte.

## Fonctions
- Recherche par titre, chanteur et catégorie
- Fiches artistes déduites du catalogue
- Lecteur audio web
- Ajout et suppression de morceaux réservés à l'administrateur
- Interface mobile et base PWA
- Firestore pour le catalogue, Firebase Storage pour les fichiers audio

## 1. Installer
```bash
npm install
npm run dev
```

## 2. Configuration Firebase
Le dépôt est relié au projet Firebase `project-35f36130-8190-4717-af1`. La configuration de son application Web est dans `src/firebase.js`, et l'UID administrateur est déjà renseigné dans `firestore.rules` et `storage.rules`.

Dans la console Firebase :
1. Active Authentication > Sign-in method > Email/Password et crée le compte administrateur.
2. Active Firebase Storage depuis https://console.firebase.google.com/project/project-35f36130-8190-4717-af1/storage en cliquant sur « Get started ».
3. Vérifie que l'UID du compte administrateur correspond à celui indiqué dans les deux fichiers de règles.

Le catalogue Firestore est en lecture publique ; seuls les utilisateurs associés à l'UID administrateur peuvent le modifier. Les fichiers audio sont lisibles publiquement et leur écriture est réservée à l'administrateur.

## 3. Lancer et déployer
```bash
npm install
npm run dev
npm run build
firebase login
firebase deploy --only hosting,firestore:rules,storage
```
Le site est publié sur https://project-35f36130-8190-4717-af1.web.app. Le projet est configuré dans `.firebaserc` et `firebase.json`. Active Storage dans la console avant le premier déploiement de ses règles.

## 4. Installer sur Android
Une fois publié en HTTPS, ouvre le site dans Chrome puis menu ⋮ > Ajouter à l'écran d'accueil / Installer l'application.

## Notes
- Les sons ajoutés sont visibles par tous les visiteurs.
- Les fichiers audio sont publics en lecture : n'ajoute que des fichiers que tu as le droit de partager.
- Les exemples d'accueil sont uniquement un aperçu et ne sont pas stockés dans Firebase.
- Le service worker offre une mise en cache basique de l'interface ; la lecture des fichiers audio nécessite une connexion internet.
